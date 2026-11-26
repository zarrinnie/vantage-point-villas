/* ============================================================================
 * CONTENT STORE — the site's content as a series of JSON versions.
 * ----------------------------------------------------------------------------
 *   content/content-<timestamp>.json    one per publish; the newest is live
 *
 * Nothing is ever overwritten. The newest key is the live document and the
 * ones before it are the history shown in Admin → History, so a publish is a
 * single write and a read can never land on a stale cached copy.
 * ========================================================================== */

import { SiteContent } from '../app/core/content/content.model';
import { withDefaults } from '../app/core/content/default-content';
import { validateContent } from '../app/core/content/content.validate';
import type { Storage, StoredObject } from './storage';

/** Versions kept behind the live one. */
const MAX_BACKUPS = 30;
const PREFIX = 'content/';
const BACKUP_ID = /^content-[0-9TZ-]+\.json$/;

/**
 * How long a loaded document is reused before the store looks for a newer
 * version. On a single server this only saves a read. On Vercel each function
 * instance has its own cache, so this is also how long an instance can go on
 * serving the previous version after another instance published — short
 * enough not to be noticed, long enough that SSR stays fast.
 */
const CACHE_MS = 15_000;

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
  private cacheUntil = 0;
  /** Serialises writes so two quick saves cannot interleave. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly storage: Storage) {}

  get describe(): string {
    return this.storage.describe;
  }

  /** The live document, with defaults filled in for anything it lacks. */
  async get(): Promise<SiteContent> {
    if (this.cache && Date.now() < this.cacheUntil) return this.cache;

    let stored: unknown = undefined;
    try {
      const versions = await this.versions();
      const live = versions.at(-1);
      if (live) {
        const bytes = await this.storage.read(live.key);
        if (bytes) stored = JSON.parse(bytes.toString('utf8'));
      }
    } catch (error) {
      console.error(`[content] Could not read the content from ${this.storage.describe}.`, error);
      // Keep serving whatever was loaded last rather than falling back to the
      // defaults and making the site look empty for a moment.
      if (this.cache) return this.cache;
    }

    return this.hold(withDefaults(stored));
  }

  /** Validate and publish a new document as the newest version. */
  save(next: unknown): Promise<SiteContent> {
    const run = this.queue.then(() => this.write(next));
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** The versions behind the live one, newest first. */
  async listBackups(): Promise<BackupInfo[]> {
    const versions = await this.versions();
    return versions
      .slice(0, -1)
      .reverse()
      .map((version) => ({
        id: idOf(version.key),
        savedAt: version.modifiedAt,
        size: version.size,
      }));
  }

  async readBackup(id: string): Promise<unknown> {
    if (!BACKUP_ID.test(id)) throw new ContentValidationError(['That version does not exist.']);
    const bytes = await this.storage.read(PREFIX + id);
    if (!bytes) throw new ContentValidationError(['That version does not exist.']);
    return JSON.parse(bytes.toString('utf8'));
  }

  /** Publish an earlier version again (as a new version, so nothing is lost). */
  async restore(id: string): Promise<SiteContent> {
    return this.save(withDefaults(await this.readBackup(id)));
  }

  private async write(next: unknown): Promise<SiteContent> {
    const result = validateContent(next);
    if (!result.ok) throw new ContentValidationError(result.errors);

    const content = withDefaults(next);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.storage.write(
      `${PREFIX}content-${stamp}.json`,
      Buffer.from(JSON.stringify(content, null, 2), 'utf8'),
      'application/json',
    );
    this.hold(content);

    await this.prune();
    return content;
  }

  /** Every version, oldest first. */
  private async versions(): Promise<StoredObject[]> {
    const found = await this.storage.list(PREFIX);
    // Timestamps are ISO-8601, so sorting the keys sorts them by date.
    return found.filter((entry) => BACKUP_ID.test(idOf(entry.key)));
  }

  /** Drop the versions past the live one plus MAX_BACKUPS. */
  private async prune(): Promise<void> {
    const versions = await this.versions();
    const stale = versions.slice(0, Math.max(0, versions.length - (MAX_BACKUPS + 1)));
    for (const version of stale) {
      await this.storage.remove(version.key);
    }
  }

  private hold(content: SiteContent): SiteContent {
    this.cache = content;
    this.cacheUntil = Date.now() + CACHE_MS;
    return content;
  }
}

function idOf(key: string): string {
  return key.slice(key.lastIndexOf('/') + 1);
}
