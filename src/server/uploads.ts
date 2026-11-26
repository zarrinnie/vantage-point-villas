/* ============================================================================
 * PHOTO UPLOADS
 * ----------------------------------------------------------------------------
 * The admin sends the raw file as the request body. The type is decided from
 * the file's own first bytes (never from its name or the browser's claim), and
 * only raster image formats are accepted: no SVG, which can carry scripts.
 *
 * Names are random, so a photo is never replaced and its URL never changes.
 * ========================================================================== */

import { randomBytes } from 'node:crypto';
import type { Storage } from './storage';

/**
 * 15 MB on a real server. A Vercel Function cannot receive a request body
 * larger than 4.5 MB, so the limit drops there and the admin is told about it
 * through /api/admin/session.
 */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOAD_BYTES_SERVERLESS = 4 * 1024 * 1024;

const FILE_NAME = /^[a-z0-9-]+\.(jpg|png|gif|webp|avif)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

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
    private readonly storage: Storage,
    /** Key prefix in the store, and the URL prefix when this server serves them. */
    private readonly prefix = 'uploads',
  ) {}

  /** The largest body this deployment can accept. */
  get maxBytes(): number {
    return this.storage.servesPublicUrls ? MAX_UPLOAD_BYTES_SERVERLESS : MAX_UPLOAD_BYTES;
  }

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

    const stored = await this.storage.write(this.key(name), body, CONTENT_TYPES[type]);
    return {
      name,
      url: stored.url ?? `/${this.prefix}/${name}`,
      size: body.length,
      uploadedAt: stored.modifiedAt,
    };
  }

  async list(): Promise<UploadInfo[]> {
    const found = await this.storage.list(`${this.prefix}/`);
    return found
      .filter((entry) => FILE_NAME.test(nameOf(entry.key)))
      .map((entry) => {
        const name = nameOf(entry.key);
        return {
          name,
          url: entry.url ?? `/${this.prefix}/${name}`,
          size: entry.size,
          uploadedAt: entry.modifiedAt,
        };
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  async remove(name: string): Promise<void> {
    if (!FILE_NAME.test(name)) throw new UploadError('That file does not exist.');
    await this.storage.remove(this.key(name));
  }

  private key(name: string): string {
    return `${this.prefix}/${name}`;
  }
}

function nameOf(key: string): string {
  return key.slice(key.lastIndexOf('/') + 1);
}
