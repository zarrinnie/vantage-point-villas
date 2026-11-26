/* ============================================================================
 * CONTENT & ADMIN API
 * ----------------------------------------------------------------------------
 *   GET    /api/content                       public: the live content
 *   GET    /api/admin/session                 { signedIn, configured, maxUploadBytes }
 *   POST   /api/admin/login   { password }    sets the session cookie
 *   POST   /api/admin/logout
 *   PUT    /api/admin/content                 publish a new document
 *   GET    /api/admin/backups                 previous versions
 *   GET    /api/admin/backups/:id             one previous version
 *   POST   /api/admin/backups/:id/restore     make it live again
 *   GET    /api/admin/uploads                 the photo library
 *   POST   /api/admin/uploads                 raw image body, X-File-Name header
 *   DELETE /api/admin/uploads/:name
 * ========================================================================== */

import express, { Router, type NextFunction, type Request, type Response } from 'express';
import { AdminAuth, isSecure } from './auth';
import { ContentStore, ContentValidationError } from './content-store';
import { UploadError, UploadStore } from './uploads';

export function createApi(store: ContentStore, uploads: UploadStore, auth: AdminAuth): Router {
  const api = Router();

  // Nothing here is cacheable: it is either live content or private.
  api.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  api.get('/content', async (_req, res) => {
    res.json(await store.get());
  });

  // ---- Session ------------------------------------------------------------
  api.get('/admin/session', (req, res) => {
    res.json({
      signedIn: auth.isSignedIn(req),
      configured: auth.configured,
      // How large a photo this deployment can accept; the admin checks it
      // before uploading so the guest gets a readable message, not a 413.
      maxUploadBytes: uploads.maxBytes,
    });
  });

  api.post('/admin/login', express.json({ limit: '10kb' }), (req, res) => {
    if (!auth.configured) {
      res.status(503).json({
        error: 'The admin password is not set. Start the server with ADMIN_PASSWORD=… and try again.',
      });
      return;
    }
    const who = req.ip ?? 'unknown';
    if (!auth.allowAttempt(who)) {
      res.status(429).json({ error: 'Too many attempts. Wait fifteen minutes and try again.' });
      return;
    }
    if (!auth.checkPassword((req.body as { password?: unknown } | undefined)?.password)) {
      res.status(401).json({ error: 'That password is not right.' });
      return;
    }
    auth.clearAttempts(who);
    auth.issue(res, isSecure(req));
    res.json({ signedIn: true });
  });

  api.post('/admin/logout', (req, res) => {
    auth.clear(res, isSecure(req));
    res.json({ signedIn: false });
  });

  // ---- Everything below needs a session -----------------------------------
  api.use('/admin', auth.require);

  api.put('/admin/content', express.json({ limit: '5mb' }), async (req, res) => {
    res.json(await store.save(req.body));
  });

  api.get('/admin/backups', async (_req, res) => {
    res.json(await store.listBackups());
  });

  api.get('/admin/backups/:id', async (req, res) => {
    res.json(await store.readBackup(String(req.params['id'])));
  });

  api.post('/admin/backups/:id/restore', async (req, res) => {
    res.json(await store.restore(String(req.params['id'])));
  });

  api.get('/admin/uploads', async (_req, res) => {
    res.json(await uploads.list());
  });

  api.post(
    '/admin/uploads',
    express.raw({ type: () => true, limit: uploads.maxBytes }),
    async (req, res) => {
      const name = req.get('x-file-name');
      res.status(201).json(await uploads.save(req.body, name ? decodeURIComponent(name) : undefined));
    },
  );

  api.delete('/admin/uploads/:name', async (req, res) => {
    await uploads.remove(String(req.params['name']));
    res.status(204).end();
  });

  api.use((_req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  // Turn known failures into readable messages for the admin.
  api.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    void _next;
    if (error instanceof ContentValidationError) {
      res.status(422).json({ error: 'Some fields need attention.', details: error.errors });
      return;
    }
    if (error instanceof UploadError) {
      res.status(400).json({ error: error.message });
      return;
    }
    const status = (error as { status?: number; type?: string }).status;
    if (status === 413) {
      const mb = Math.floor(uploads.maxBytes / (1024 * 1024));
      res.status(413).json({ error: `That file is too large (${mb} MB at most).` });
      return;
    }
    if (status === 400) {
      res.status(400).json({ error: 'The request could not be read.' });
      return;
    }
    console.error('[api]', error);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  return api;
}
