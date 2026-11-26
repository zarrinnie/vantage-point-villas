import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join, resolve } from 'node:path';
import { ContentStore } from './server/content-store';
import { UploadStore } from './server/uploads';
import { AdminAuth } from './server/auth';
import { createApi } from './server/api';
import { createStorage, DiskStorage } from './server/storage';
import type { ContentRequestContext } from './app/core/content/content.service';

const browserDistFolder = join(import.meta.dirname, '../browser');

/**
 * Where the editable content lives. On a server with a disk that is CONTENT_DIR
 * (`./data` by default). On Vercel, whose filesystem is read-only, setting
 * BLOB_READ_WRITE_TOKEN switches the stores over to Vercel Blob and this path
 * is never touched.
 */
const contentDir = resolve(process.env['CONTENT_DIR'] ?? 'data');

const storage = createStorage(contentDir);
const store = new ContentStore(storage);
const uploads = new UploadStore(storage);
const auth = new AdminAuth(process.env['ADMIN_PASSWORD'], process.env['ADMIN_SECRET']);

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');

/** Content and admin API. */
app.use('/api', createApi(store, uploads, auth));

/**
 * Photos uploaded through the admin. Names are unique, so they never change.
 * Only needed when they are on this server's disk: Vercel Blob serves its own
 * public URLs and the photos never pass through here.
 */
if (storage instanceof DiskStorage) {
  app.use(
    '/uploads',
    express.static(storage.path('uploads'), {
      maxAge: '1y',
      immutable: true,
      index: false,
      redirect: false,
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }),
  );
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application, handing it
 * the live content so the page is rendered with the latest saved version.
 */
app.use((req, res, next) => {
  store
    .get()
    .then((content) => {
      const context: ContentRequestContext = { content };
      return angularApp.handle(req, context);
    })
    .then((response) => {
      if (!response) return next();
      // The admin must never be cached by a proxy or the browser.
      if (req.path.startsWith('/admin')) response.headers.set('Cache-Control', 'no-store');
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
    console.log(`Content is stored in ${store.describe}`);
    if (!auth.configured) {
      console.warn('[admin] ADMIN_PASSWORD is not set — nobody can sign in to /admin.');
    }
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
