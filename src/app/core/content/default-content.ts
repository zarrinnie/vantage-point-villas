/* ============================================================================
 * DEFAULT CONTENT — the seed document.
 * ----------------------------------------------------------------------------
 * Built from the original `core/data/*.data.ts` files. It is what the site
 * shows until the admin saves for the first time, and it fills in any key a
 * stored document is missing (see `mergeContent`).
 * ========================================================================== */

import { SITE, MAIN_NAV, FOOTER_NAV } from '../data/site.data';
import { VILLAS } from '../data/villas.data';
import { AMENITIES } from '../data/amenities.data';
import { OFFERS } from '../data/offers.data';
import { SERVICES } from '../data/services.data';
import { EXTRAS } from '../data/extras.data';
import { GALLERY, GALLERY_FILTERS } from '../data/gallery.data';
import { FAQS, FAQ_GROUPS } from '../data/faqs.data';
import { TESTIMONIALS } from '../data/testimonials.data';
import { NEARBY } from '../data/nearby.data';
import { EXPERIENCES } from '../data/experiences.data';
import { BENEFITS } from '../data/benefits.data';
import { PRIVACY_POLICY, TERMS } from '../data/policies.data';
import { DEFAULT_PAGES } from './default-pages';
import { SiteContent } from './content.model';

/** Deep, mutable copy, so nobody can mutate the frozen-by-convention seeds. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDefaultContent(): SiteContent {
  return clone<SiteContent>({
    site: {
      name: SITE.name,
      shortName: SITE.shortName,
      tagline: SITE.tagline,
      intro: SITE.intro,
      address: { ...SITE.address },
      mapQuery: SITE.mapQuery,
      phone: SITE.phoneDisplay,
      whatsapp: SITE.whatsappDisplay,
      email: SITE.email,
      reservationsEmail: SITE.reservationsEmail,
      checkIn: SITE.checkIn,
      checkOut: SITE.checkOut,
      languages: [...SITE.languages],
      bookingComUrl: SITE.bookingComUrl,
      socials: SITE.socials.map((s) => ({ ...s })),
      stats: SITE.stats.map((s) => ({ ...s })),
    },
    mainNav: MAIN_NAV.map((n) => ({ ...n })),
    footerNav: FOOTER_NAV.map((c) => ({ title: c.title, items: c.items.map((i) => ({ ...i })) })),
    pages: DEFAULT_PAGES,
    villas: [...VILLAS],
    amenities: [...AMENITIES],
    offers: [...OFFERS],
    services: [...SERVICES],
    extras: [...EXTRAS],
    gallery: [...GALLERY],
    galleryCategories: GALLERY_FILTERS.filter((f) => f.id !== 'all').map((f) => ({ ...f })),
    faqs: [...FAQS],
    faqGroups: [...FAQ_GROUPS],
    testimonials: [...TESTIMONIALS],
    nearby: [...NEARBY],
    experiences: [...EXPERIENCES],
    benefits: [...BENEFITS],
    policies: { privacy: PRIVACY_POLICY, terms: TERMS },
    pricing: {
      taxPercent: Math.round(SITE.taxRate * 100),
      taxLabel: 'Tax & service',
      peakSupplementPercent: 25,
      peakSupplementLabel: 'Peak season supplement',
      peakSeasons: [
        { label: 'Summer holidays', start: '2026-07-01', end: '2026-08-31', repeatsYearly: true },
        { label: 'Christmas & New Year', start: '2026-12-20', end: '2027-01-05', repeatsYearly: true },
      ],
      longStayTiers: [
        { minNights: 14, discountPercent: 20, label: 'Stay Longer, Pay Less' },
        { minNights: 7, discountPercent: 15, label: 'Stay Longer, Pay Less' },
      ],
    },
    availability: { blocked: [] },
  });
}

/**
 * Lay a stored (possibly older, possibly partial) document over the defaults.
 *
 * - objects merge key by key, so keys added to the code later get defaults;
 * - arrays are taken whole from the stored document (the admin owns lists);
 * - a stored value of the wrong type is ignored in favour of the default.
 */
export function mergeContent(defaults: unknown, stored: unknown): unknown {
  if (stored === undefined || stored === null) return defaults;
  if (Array.isArray(defaults)) return Array.isArray(stored) ? stored : defaults;
  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      out[key] = mergeContent(defaults[key], stored[key]);
    }
    // Keep keys the defaults do not know about (e.g. optional fields like `notes`).
    for (const key of Object.keys(stored)) {
      if (!(key in out)) out[key] = stored[key];
    }
    return out;
  }
  if (defaults === undefined) return stored;
  return typeof stored === typeof defaults ? stored : defaults;
}

export function withDefaults(stored: unknown): SiteContent {
  return mergeContent(createDefaultContent(), stored) as SiteContent;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
