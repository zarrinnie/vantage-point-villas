/* ============================================================================
 * PHOTO UPLOADS
 * ----------------------------------------------------------------------------
 * The admin sends the raw file as the request body. The type is decided from
 * the file's own first bytes (never from its name or the browser's claim), and
 * only raster image formats are accepted: no SVG, which can carry scripts.
 * ========================================================================== */

import { randomBytes } from 'node:crypto';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const FILE_NAME = /^[a-z0-9-]+\.(jpg|png|gif|webp|avif)$/;

export interface UploadInfo {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export class UploadError extends Error {}

/** Recognise an image by its magic number. */
export function detectImageType(bytes: Buffer): 'jpg' | 'png' | 'gif' | 'webp' | 'avif' | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'png';
  }
  if (bytes.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
  if (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  if (bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = bytes.subarray(8, 12).toString('ascii');
    if (brand === 'avif' || brand === 'avis') return 'avif';
  }
  return null;
}

export class UploadStore {
  constructor(
    readonly dir: string,
    /** Public URL prefix the files are served under. */
    private readonly prefix = '/uploads',
  ) {}

  async save(body: unknown, originalName: string | undefined): Promise<UploadInfo> {
    if (!Buffer.isBuffer(body) || body.length === 0) {
      throw new UploadError('No file was received.');
    }
    const type = detectImageType(body);
    if (!type) {
      throw new UploadError('That file is not a JPEG, PNG, WebP, AVIF or GIF image.');
    }

    // Keep a readable hint of the original name, then make it unique.
    const hint = (originalName ?? '')
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const name = `${hint ? `${hint}-` : ''}${randomBytes(5).toString('hex')}.${type}`;

    await mkdir(this.dir, { recursive: true });
    await writeFile(join(this.dir, name), body, { flag: 'wx' });
    return {
      name,
      url: `${this.prefix}/${name}`,
      size: body.length,
      uploadedAt: new Date().toISOString(),
    };
  }

  async list(): Promise<UploadInfo[]> {
    let names: string[];
    try {
      names = await readdir(this.dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    const files = await Promise.all(
      names
        .filter((n) => FILE_NAME.test(n))
        .map(async (name) => {
          const s = await stat(join(this.dir, name));
          return {
            name,
            url: `${this.prefix}/${name}`,
            size: s.size,
            uploadedAt: s.mtime.toISOString(),
          };
        }),
    );
    return files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  async remove(name: string): Promise<void> {
    if (!FILE_NAME.test(name)) throw new UploadError('That file does not exist.');
    try {
      await unlink(join(this.dir, name));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new UploadError('That file does not exist.');
      }
      throw error;
    }
  }
}
