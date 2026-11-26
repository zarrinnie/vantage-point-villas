/* ============================================================================
 * STORAGE — where the content versions and the uploaded photos are kept.
 * ----------------------------------------------------------------------------
 * Two backends behind one small interface:
 *
 *   DiskStorage   a directory on a local disk (CONTENT_DIR). The real-server
 *                 deployment and `npm start` both use this.
 *   BlobStorage   Vercel Blob. Used when BLOB_READ_WRITE_TOKEN is set, because
 *                 a Vercel Function's filesystem is read-only apart from /tmp,
 *                 which is per-instance and wiped on every cold start.
 *
 * Keys are POSIX-style paths such as `content/content-2026-01-01T00-00-00-000Z.json`
 * or `uploads/beach-1a2b3c4d5e.jpg`. Objects are never overwritten: every save
 * writes a new key. That keeps reads honest on Vercel, whose CDN caches blobs
 * for a month and refuses a `cacheControlMaxAge` below a minute — a fresh key
 * can never be a stale cache hit.
 * ========================================================================== */

import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';

export interface StoredObject {
  /** The key it was stored under. */
  key: string;
  /** A public URL, when the backend serves one itself; otherwise null. */
  url: string | null;
  size: number;
  /** ISO-8601. */
  modifiedAt: string;
}

export interface Storage {
  /** The bytes, or null when there is nothing under that key. */
  read(key: string): Promise<Buffer | null>;
  write(key: string, body: Buffer, contentType: string): Promise<StoredObject>;
  /** Everything under a prefix, ordered by key, ascending. */
  list(prefix: string): Promise<StoredObject[]>;
  /** Removes the key. Succeeds when there was nothing there. */
  remove(key: string): Promise<void>;
  /** Whether the backend serves its objects over its own public URLs. */
  readonly servesPublicUrls: boolean;
  /** For error messages and the start-up log. */
  readonly describe: string;
}

/** Keys are built by this server, never taken from a request — but be sure. */
function safeKey(key: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(key) || key.includes('..') || key.includes('//')) {
    throw new Error(`Refusing to use the storage key "${key}".`);
  }
  return key;
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}

/* -------------------------------------------------------------------------- */
/* A directory on disk                                                        */
/* -------------------------------------------------------------------------- */

export class DiskStorage implements Storage {
  readonly servesPublicUrls = false;
  readonly describe: string;

  constructor(readonly dir: string) {
    this.describe = `the directory ${dir}`;
  }

  /** The absolute path a key lives at. */
  path(key: string): string {
    return join(this.dir, ...safeKey(key).split('/'));
  }

  async read(key: string): Promise<Buffer | null> {
    try {
      return await readFile(this.path(key));
    } catch (error) {
      if (isMissing(error)) return null;
      throw error;
    }
  }

  async write(key: string, body: Buffer, _contentType: string): Promise<StoredObject> {
    void _contentType;
    const file = this.path(key);
    await mkdir(dirname(file), { recursive: true });
    // Write beside the target and rename into place, so a crash mid-write can
    // never leave a half-written file behind.
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, body);
    await rename(temp, file);
    return { key, url: null, size: body.length, modifiedAt: new Date().toISOString() };
  }

  async list(prefix: string): Promise<StoredObject[]> {
    const slash = prefix.lastIndexOf('/');
    const folder = slash === -1 ? '' : prefix.slice(0, slash);
    const starts = prefix.slice(slash + 1);
    const dir = folder ? this.path(folder) : this.dir;

    let names: string[];
    try {
      names = await readdir(dir);
    } catch (error) {
      if (isMissing(error)) return [];
      throw error;
    }

    const found = await Promise.all(
      names
        .filter((name) => name.startsWith(starts) && !name.endsWith('.tmp'))
        .map(async (name): Promise<StoredObject | null> => {
          const info = await stat(join(dir, name));
          if (!info.isFile()) return null;
          return {
            key: folder ? posix.join(folder, name) : name,
            url: null,
            size: info.size,
            modifiedAt: info.mtime.toISOString(),
          };
        }),
    );
    return found
      .filter((entry): entry is StoredObject => entry !== null)
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  async remove(key: string): Promise<void> {
    try {
      await unlink(this.path(key));
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Vercel Blob                                                               */
/* -------------------------------------------------------------------------- */

/** The smallest value Vercel Blob accepts. Keys are unique, so this only
 *  matters for the photos, which never change once written. */
const CACHE_SECONDS = 60;

export class BlobStorage implements Storage {
  readonly servesPublicUrls = true;
  readonly describe = 'Vercel Blob';

  async read(key: string): Promise<Buffer | null> {
    const { get, BlobNotFoundError } = await import('@vercel/blob');
    try {
      const result = await get(safeKey(key), { access: 'public', useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return Buffer.from(await new Response(result.stream).arrayBuffer());
    } catch (error) {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    }
  }

  async write(key: string, body: Buffer, contentType: string): Promise<StoredObject> {
    const { put } = await import('@vercel/blob');
    const blob = await put(safeKey(key), body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      cacheControlMaxAge: CACHE_SECONDS,
    });
    return {
      key: blob.pathname,
      url: blob.url,
      size: body.length,
      modifiedAt: new Date().toISOString(),
    };
  }

  async list(prefix: string): Promise<StoredObject[]> {
    const { list } = await import('@vercel/blob');
    const all: StoredObject[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      for (const blob of page.blobs) {
        all.push({
          key: blob.pathname,
          url: blob.url,
          size: blob.size,
          modifiedAt: blob.uploadedAt.toISOString(),
        });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return all.sort((a, b) => a.key.localeCompare(b.key));
  }

  async remove(key: string): Promise<void> {
    const { del } = await import('@vercel/blob');
    await del(safeKey(key));
  }
}

/* -------------------------------------------------------------------------- */

/** True when the app is running against Vercel Blob rather than a local disk. */
export function usingBlob(): boolean {
  return !!process.env['BLOB_READ_WRITE_TOKEN'];
}

/** Blob when a token is configured, the given directory otherwise. */
export function createStorage(dir: string): Storage {
  return usingBlob() ? new BlobStorage() : new DiskStorage(dir);
}
