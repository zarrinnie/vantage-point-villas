import { Injectable, inject, signal } from '@angular/core';
import { AdminApi, ApiError, UploadInfo } from './admin-api.service';

/** The uploaded-photo library, shared by the picker and the library screen. */
@Injectable({ providedIn: 'root' })
export class AdminMedia {
  private readonly api = inject(AdminApi);

  readonly items = signal<UploadInfo[]>([]);
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * The largest photo the server will accept. The server tells us through
   * /api/admin/session, because it depends on where the site is deployed:
   * 15 MB on a server with a disk, 4 MB on Vercel, whose functions cannot
   * receive a larger request body.
   */
  readonly maxBytes = signal(15 * 1024 * 1024);

  async refresh(): Promise<void> {
    try {
      this.items.set(await this.api.uploads());
      this.loaded.set(true);
      this.error.set(null);
    } catch (error) {
      this.error.set(messageOf(error));
    }
  }

  async ensureLoaded(): Promise<void> {
    if (!this.loaded()) await this.refresh();
  }

  /** Upload one file; resolves to its URL. Throws a readable Error on failure. */
  async upload(file: File): Promise<string> {
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) {
      throw new Error(`“${file.name}” is not a JPEG, PNG, WebP, AVIF or GIF image.`);
    }
    const limit = this.maxBytes();
    if (file.size > limit) {
      const mb = Math.floor(limit / (1024 * 1024));
      throw new Error(`“${file.name}” is larger than ${mb} MB. Resize it and try again.`);
    }
    try {
      const saved = await this.api.upload(file);
      this.items.update((list) => [saved, ...list.filter((i) => i.name !== saved.name)]);
      return saved.url;
    } catch (error) {
      throw new Error(messageOf(error));
    }
  }

  async remove(name: string): Promise<void> {
    await this.api.deleteUpload(name);
    this.items.update((list) => list.filter((i) => i.name !== name));
  }
}

export function messageOf(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Something went wrong.';
}
