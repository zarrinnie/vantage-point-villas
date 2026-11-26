import { Injectable } from '@angular/core';
import { SiteContent } from '../core/content/content.model';

export interface Session {
  signedIn: boolean;
  configured: boolean;
  /** The largest photo this deployment accepts, in bytes. */
  maxUploadBytes?: number;
}

export interface UploadInfo {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface BackupInfo {
  id: string;
  savedAt: string;
  size: number;
}

/** A failed API call, with the server's message and any per-field details. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}

/** Thin wrapper over the server's `/api` routes (see `src/server/api.ts`). */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  session(): Promise<Session> {
    return this.call<Session>('GET', '/api/admin/session');
  }

  login(password: string): Promise<Session> {
    return this.call<Session>('POST', '/api/admin/login', { password });
  }

  logout(): Promise<Session> {
    return this.call<Session>('POST', '/api/admin/logout');
  }

  content(): Promise<SiteContent> {
    return this.call<SiteContent>('GET', '/api/content');
  }

  save(content: SiteContent): Promise<SiteContent> {
    return this.call<SiteContent>('PUT', '/api/admin/content', content);
  }

  backups(): Promise<BackupInfo[]> {
    return this.call<BackupInfo[]>('GET', '/api/admin/backups');
  }

  backup(id: string): Promise<SiteContent> {
    return this.call<SiteContent>('GET', `/api/admin/backups/${encodeURIComponent(id)}`);
  }

  restore(id: string): Promise<SiteContent> {
    return this.call<SiteContent>('POST', `/api/admin/backups/${encodeURIComponent(id)}/restore`);
  }

  uploads(): Promise<UploadInfo[]> {
    return this.call<UploadInfo[]>('GET', '/api/admin/uploads');
  }

  async upload(file: File): Promise<UploadInfo> {
    const response = await fetch('/api/admin/uploads', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'content-type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name),
      },
      body: file,
    });
    return this.read<UploadInfo>(response);
  }

  deleteUpload(name: string): Promise<void> {
    return this.call<void>('DELETE', `/api/admin/uploads/${encodeURIComponent(name)}`);
  }

  private async call<T>(method: string, url: string, body?: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
    }
    return this.read<T>(response);
  }

  private async read<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T;
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      /* not JSON */
    }
    if (!response.ok) {
      const { error, details } = (data ?? {}) as { error?: string; details?: string[] };
      throw new ApiError(response.status, error ?? `The server answered ${response.status}.`, details ?? []);
    }
    return data as T;
  }
}
