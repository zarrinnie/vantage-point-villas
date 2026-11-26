import {
  Injectable,
  PLATFORM_ID,
  REQUEST_CONTEXT,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { SiteContent } from './content.model';
import { createDefaultContent, withDefaults } from './default-content';
import { mapsEmbedUrl, mapsSearchHref, siteVars, telHref, whatsappHref } from './content.util';

const CONTENT_KEY = makeStateKey<SiteContent>('vpv.content');

/** What `server.ts` passes to `AngularNodeAppEngine.handle()` for every request. */
export interface ContentRequestContext {
  content?: unknown;
}

/**
 * The single source of everything the site shows.
 *
 * On the server the document arrives with the request (see `src/server.ts`)
 * and is copied into TransferState, so the browser hydrates with exactly the
 * same content. Client-only routes (booking, admin) have no server render, so
 * there the document is fetched from `/api/content` during app start-up.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly transferState = inject(TransferState);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly requestContext = inject(REQUEST_CONTEXT, { optional: true }) as
    | ContentRequestContext
    | null;

  // Declared before `state`: `initial()` sets it while `state` initialises.
  private loaded = false;
  private readonly state = signal<SiteContent>(this.initial());

  readonly content = this.state.asReadonly();

  readonly site = computed(() => this.state().site);
  readonly pages = computed(() => this.state().pages);
  readonly villas = computed(() => this.state().villas);
  readonly amenities = computed(() => this.state().amenities);
  readonly extras = computed(() => this.state().extras);
  readonly pricing = computed(() => this.state().pricing);
  readonly blocked = computed(() => this.state().availability.blocked);

  /** Derived contact links, so the admin only ever types a number once. */
  readonly links = computed(() => {
    const site = this.site();
    return {
      phone: telHref(site.phone),
      whatsapp: whatsappHref(site.whatsapp),
      email: `mailto:${site.email}`,
      reservationsEmail: `mailto:${site.reservationsEmail}`,
      maps: mapsSearchHref(site),
      mapsEmbed: mapsEmbedUrl(site),
    };
  });

  /** Tokens available to every piece of copy: {name}, {checkIn}, {languages}, … */
  readonly vars = computed(() => {
    const pricing = this.pricing();
    return {
      ...siteVars(this.site()),
      taxPercent: pricing.taxPercent,
      peakPercent: pricing.peakSupplementPercent,
    };
  });

  /** Called once from the app initializer. */
  async load(): Promise<void> {
    if (this.loaded || this.isServer) return;
    try {
      const response = await fetch('/api/content', { headers: { accept: 'application/json' } });
      if (response.ok) this.state.set(withDefaults(await response.json()));
    } catch {
      /* offline or no API: keep the defaults so the site still renders */
    }
    this.loaded = true;
  }

  /** Swap in a freshly saved document (used by the admin after publishing). */
  replace(content: SiteContent): void {
    this.state.set(content);
  }

  private initial(): SiteContent {
    if (this.isServer) {
      const content = withDefaults(this.requestContext?.content);
      this.transferState.set(CONTENT_KEY, content);
      this.loaded = true;
      return content;
    }

    const transferred = this.transferState.get(CONTENT_KEY, null);
    if (transferred) {
      this.transferState.remove(CONTENT_KEY);
      this.loaded = true;
      return transferred;
    }
    return createDefaultContent();
  }
}
