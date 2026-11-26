/* ============================================================================
 * CONTENT STORE — the site's content as a JSON file on disk.
 * ----------------------------------------------------------------------------
 *   <dir>/content.json        the live document
 *   <dir>/backups/*.json      the previous versions, newest kept
 *
 * Writes go to a temporary file first and are renamed into place, so a crash
 * mid-write can never leave a half-written document behind.
 * ========================================================================== */

import { mkdir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SiteContent } from '../app/core/content/content.model';
import { withDefaults } from '../app/core/content/default-content';
import { validateContent } from '../app/core/content/content.validate';

const MAX_BACKUPS = 30;
const BACKUP_ID = /^content-[0-9TZ-]+\.json$/;

export interface BackupInfo {
  id: string;
  savedAt: string;
  size: number;
}

export class ContentValidationError extends Error {
  constructor(readonly errors: string[]) {
    super(errors.join(' '));
  }
}

export class ContentStore {
  private cache: SiteContent | null = null;
  private readonly file: string;
  private readonly backups: string;
  /** Serialises writes so two quick saves cannot interleave. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(readonly dir: string) {
    this.file = join(dir, 'content.json');
    this.backups = join(dir, 'backups');
  }

  /** The live document, with defaults filled in for anything it lacks. */
  async get(): Promise<SiteContent> {
    if (this.cache) return this.cache;
    let stored: unknown = undefined;
    try {
      stored = JSON.parse(await readFile(this.file, 'utf8'));
    } catch (error) {
      if (!isMissing(error)) {
        console.error(`[content] Could not read ${this.file}; showing defaults.`, error);
      }
    }
    this.cache = withDefaults(stored);
    return this.cache;
  }

  /** Validate and publish a new document, keeping the old one as a backup. */
  save(next: unknown): Promise<SiteContent> {
    const run = this.queue.then(() => this.write(next));
    this.queue = run.catch(() => undefined);
    return run;
  }

  async listBackups(): Promise<BackupInfo[]> {
    let names: string[] = [];
    try {
      names = await readdir(this.backups);
    } catch (error) {
      if (isMissing(error)) return [];
      throw error;
    }
    const infos = await Promise.all(
      names
        .filter((n) => BACKUP_ID.test(n))
        .map(async (id) => {
          const s = await stat(join(this.backups, id));
          return { id, savedAt: s.mtime.toISOString(), size: s.size };
        }),
    );
    return infos.sort((a, b) => b.id.localeCompare(a.id));
  }

  async readBackup(id: string): Promise<unknown> {
    if (!BACKUP_ID.test(id)) throw new ContentValidationError(['That backup does not exist.']);
    try {
      return JSON.parse(await readFile(join(this.backups, id), 'utf8'));
    } catch (error) {
      if (isMissing(error)) throw new ContentValidationError(['That backup does not exist.']);
      throw error;
    }
  }

  /** Make a backup the live document again (the current one is backed up first). */
  async restore(id: string): Promise<SiteContent> {
    return this.save(withDefaults(await this.readBackup(id)));
  }

  private async write(next: unknown): Promise<SiteContent> {
    const result = validateContent(next);
    if (!result.ok) throw new ContentValidationError(result.errors);

    const content = withDefaults(next);
    await mkdir(this.backups, { recursive: true });

    // Keep what is live now before replacing it.
    try {
      const current = await readFile(this.file, 'utf8');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await writeFile(join(this.backups, `content-${stamp}.json`), current, 'utf8');
    } catch (error) {
      if (!isMissing(error)) throw error;
    }

    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(content, null, 2), 'utf8');
    await rename(temp, this.file);
    this.cache = content;

    await this.pruneBackups();
    return content;
  }

  private async pruneBackups(): Promise<void> {
    const all = await this.listBackups();
    await Promise.all(all.slice(MAX_BACKUPS).map((b) => unlink(join(this.backups, b.id))));
  }
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT';
}
