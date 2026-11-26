import { Injectable, computed, inject, signal } from '@angular/core';
import { SiteContent } from '../core/content/content.model';
import { ContentService } from '../core/content/content.service';
import { validateContent } from '../core/content/content.validate';
import { AdminApi, ApiError } from './admin-api.service';
import { Path, clone, getIn, setIn } from './path.util';

const DRAFT_KEY = 'vpv.admin.draft.v1';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Holds the admin's working copy of the content. Edits change only the draft;
 * nothing reaches the live site until `publish()` succeeds.
 */
@Injectable({ providedIn: 'root' })
export class AdminStore {
  private readonly api = inject(AdminApi);
  private readonly content = inject(ContentService);

  /** What the live site shows. */
  readonly published = signal<SiteContent | null>(null);
  /** What the admin is editing. */
  readonly draft = signal<SiteContent | null>(null);

  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveState = signal<SaveState>('idle');
  readonly errors = signal<string[]>([]);
  readonly message = signal<string | null>(null);
  /** Set when the session lapsed during a save; the draft is kept for after sign-in. */
  readonly sessionExpired = signal(false);

  private readonly publishedJson = computed(() => JSON.stringify(this.published()));
  readonly dirty = computed(() => {
    const draft = this.draft();
    return !!draft && JSON.stringify(draft) !== this.publishedJson();
  });

  /** Load the live content; restore a draft kept from an interrupted session. */
  async load(): Promise<void> {
    if (this.published() || this.loading()) return;
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const live = await this.api.content();
      this.published.set(live);
      this.draft.set(this.restoreDraft() ?? clone(live));
    } catch (error) {
      this.loadError.set(error instanceof ApiError ? error.message : 'Could not load the content.');
    } finally {
      this.loading.set(false);
    }
  }

  get(path: Path): unknown {
    return getIn(this.draft(), path);
  }

  set(path: Path, value: unknown): void {
    const draft = this.draft();
    if (!draft) return;
    this.draft.set(setIn(draft, path, value));
    if (this.saveState() !== 'saving') this.saveState.set('idle');
    this.message.set(null);
  }

  discard(): void {
    const live = this.published();
    if (live) this.draft.set(clone(live));
    this.errors.set([]);
    this.saveState.set('idle');
    this.forgetDraft();
  }

  /** Validate, then send the draft to the server and make it live. */
  async publish(): Promise<boolean> {
    const draft = this.draft();
    if (!draft || this.saveState() === 'saving') return false;

    const check = validateContent(draft);
    if (!check.ok) {
      this.errors.set(check.errors);
      this.saveState.set('error');
      return false;
    }

    this.saveState.set('saving');
    this.errors.set([]);
    try {
      const saved = await this.api.save(draft);
      this.published.set(saved);
      this.draft.set(clone(saved));
      this.content.replace(saved);
      this.saveState.set('saved');
      this.message.set('Published. The live site now shows these changes.');
      this.forgetDraft();
      return true;
    } catch (error) {
      this.saveState.set('error');
      if (error instanceof ApiError) {
        if (error.status === 401) {
          this.keepDraft();
          this.sessionExpired.set(true);
        }
        this.errors.set(error.details.length ? error.details : [error.message]);
      } else {
        this.errors.set(['Something went wrong while publishing.']);
      }
      return false;
    }
  }

  /** Replace the draft with a whole document, e.g. one loaded from history. */
  replaceDraft(content: SiteContent): void {
    this.draft.set(clone(content));
  }

  /** After a restore on the server, both copies become the restored version. */
  adopt(content: SiteContent): void {
    this.published.set(content);
    this.draft.set(clone(content));
    this.content.replace(content);
    this.forgetDraft();
  }

  /** Called on sign-out, so the next admin starts from the live content. */
  reset(): void {
    this.published.set(null);
    this.draft.set(null);
    this.errors.set([]);
    this.saveState.set('idle');
    this.sessionExpired.set(false);
  }

  keepDraft(): void {
    try {
      const draft = this.draft();
      if (draft && this.dirty()) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* storage unavailable: the draft lives only in memory */
    }
  }

  private restoreDraft(): SiteContent | null {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      this.message.set('Your unpublished changes from before signing in were kept.');
      return JSON.parse(raw) as SiteContent;
    } catch {
      return null;
    }
  }

  private forgetDraft(): void {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }
}
