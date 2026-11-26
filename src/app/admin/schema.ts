/* ============================================================================
 * ADMIN SCHEMA
 * ----------------------------------------------------------------------------
 * The editors are generic: they walk the content document and pick a control
 * for each value. This file only says how the document is split into sections
 * and where a field needs something other than the obvious control.
 * ========================================================================== */

import { DEFAULT_PAGES } from '../core/content/default-pages';
import { createDefaultContent } from '../core/content/default-content';
import { Path, blankLike, getIn, humanize } from './path.util';

export interface SectionBlock {
  path: Path;
  title: string;
  help?: string;
}

export interface Section {
  id: string;
  label: string;
  icon: string;
  intro: string;
  blocks: SectionBlock[];
  /** Sections with their own screen rather than the generic editor. */
  special?: 'pages' | 'availability' | 'media' | 'history';
}

export const SECTIONS: readonly Section[] = [
  {
    id: 'general',
    label: 'General & contact',
    icon: 'pin',
    intro: 'The property’s name, address, contact details and the facts used across every page.',
    blocks: [{ path: ['site'], title: 'Property details' }],
  },
  {
    id: 'pages',
    label: 'Page text',
    icon: 'info',
    intro: 'Every heading, paragraph, button and hero picture, page by page.',
    blocks: [],
    special: 'pages',
  },
  {
    id: 'villas',
    label: 'Villas',
    icon: 'bed',
    intro: 'Each villa’s description, sizes, rate, photographs and amenities.',
    blocks: [{ path: ['villas'], title: 'Villas' }],
  },
  {
    id: 'pricing',
    label: 'Prices & seasons',
    icon: 'sparkle',
    intro: 'Tax, peak-season dates and supplement, and long-stay discounts. Nightly rates are set on each villa.',
    blocks: [
      { path: ['pricing'], title: 'Pricing rules' },
    ],
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: 'calendar',
    intro: 'Close dates for one villa or the whole property. Closed nights cannot be booked.',
    blocks: [],
    special: 'availability',
  },
  {
    id: 'offers',
    label: 'Offers',
    icon: 'leaf',
    intro: 'Packages shown on the Offers page and the home page.',
    blocks: [{ path: ['offers'], title: 'Offers & packages' }],
  },
  {
    id: 'services',
    label: 'Services & extras',
    icon: 'bell',
    intro: 'Services listed on the Services page, and the paid extras guests can add while booking.',
    blocks: [
      { path: ['services'], title: 'Services' },
      {
        path: ['extras'],
        title: 'Booking extras',
        help: 'These appear in step three of the booking form and are added to the price.',
      },
    ],
  },
  {
    id: 'amenities',
    label: 'Amenities',
    icon: 'pool',
    intro: 'Facilities shown on the home, services and villa pages. Tick them per villa under Villas.',
    blocks: [{ path: ['amenities'], title: 'Amenities' }],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    icon: 'area',
    intro: 'Photographs on the Gallery page and the filter categories above them.',
    blocks: [
      { path: ['gallery'], title: 'Photographs' },
      { path: ['galleryCategories'], title: 'Filter categories' },
    ],
  },
  {
    id: 'faqs',
    label: 'FAQs',
    icon: 'info',
    intro: 'Questions and answers, grouped under headings on the FAQ page.',
    blocks: [
      { path: ['faqs'], title: 'Questions' },
      { path: ['faqGroups'], title: 'Groups', help: 'The headings questions are grouped under, in this order.' },
    ],
  },
  {
    id: 'reviews',
    label: 'Guest reviews',
    icon: 'guests',
    intro: 'Quotes shown on the home and about pages.',
    blocks: [{ path: ['testimonials'], title: 'Reviews' }],
  },
  {
    id: 'area',
    label: 'Area & highlights',
    icon: 'surf',
    intro: 'Nearby places with distances, things to do, and the reasons to stay here.',
    blocks: [
      { path: ['nearby'], title: 'Nearby places' },
      { path: ['experiences'], title: 'Things to do (home page)' },
      { path: ['benefits'], title: 'Why stay here' },
    ],
  },
  {
    id: 'navigation',
    label: 'Menus',
    icon: 'menu',
    intro: 'The links in the top menu and in the footer.',
    blocks: [
      { path: ['mainNav'], title: 'Top menu' },
      { path: ['footerNav'], title: 'Footer columns' },
    ],
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: 'warning',
    intro: 'The privacy policy and the terms & conditions.',
    blocks: [
      { path: ['policies', 'privacy'], title: 'Privacy policy' },
      { path: ['policies', 'terms'], title: 'Terms & conditions' },
    ],
  },
  {
    id: 'media',
    label: 'Photo library',
    icon: 'area',
    intro: 'Every photograph you have uploaded. Upload here, then pick them anywhere a picture is used.',
    blocks: [],
    special: 'media',
  },
  {
    id: 'history',
    label: 'History',
    icon: 'clock',
    intro: 'Every time you publish, the previous version is kept. Restore one to undo a change.',
    blocks: [],
    special: 'history',
  },
];

/** Tabs of the Page text section, in site order. */
export const PAGE_TABS: readonly { key: keyof typeof DEFAULT_PAGES; label: string; link?: string }[] = [
  { key: 'shared', label: 'Header, footer & shared' },
  { key: 'home', label: 'Home', link: '/' },
  { key: 'villas', label: 'Villas list', link: '/villas' },
  { key: 'villaDetail', label: 'Villa page' },
  { key: 'booking', label: 'Booking', link: '/book' },
  { key: 'gallery', label: 'Gallery', link: '/gallery' },
  { key: 'services', label: 'Services', link: '/services' },
  { key: 'offers', label: 'Offers', link: '/offers' },
  { key: 'about', label: 'About', link: '/about' },
  { key: 'faq', label: 'FAQ', link: '/faq' },
  { key: 'contact', label: 'Contact', link: '/contact' },
  { key: 'policy', label: 'Policy pages', link: '/privacy' },
  { key: 'notFound', label: 'Page not found' },
];

// ---------------------------------------------------------------------------
// Field kinds
// ---------------------------------------------------------------------------

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'percent'
  | 'money'
  | 'boolean'
  | 'date'
  | 'image'
  | 'link'
  | 'icon'
  | 'select'
  | 'amenities'
  | 'list'
  | 'group';

/** Friendlier names than the raw keys. */
const LABELS: Record<string, string> = {
  eyebrow: 'Small heading',
  lede: 'Introduction',
  seo: 'Search engines & browser tab',
  cta: 'Closing banner',
  meta: 'Facts under the heading',
  slug: 'Web address (slug)',
  alt: 'Picture description',
  imageAlt: 'Picture description',
  url: 'Picture',
  href: 'Link',
  path: 'Link to page',
  mapQuery: 'Map search',
  bookingComUrl: 'Booking.com page',
  maxGuests: 'Sleeps (guests)',
  landSize: 'Plot size (m²)',
  livingSize: 'Interior size (m²)',
  nightlyRate: 'Nightly rate (USD)',
  minNights: 'Minimum nights',
  amenityIds: 'Amenities',
  isFeatured: 'Show “Most asked for” badge',
  story: 'Story paragraphs',
  bedConfiguration: 'Beds',
  taxPercent: 'Tax & service',
  peakSupplementPercent: 'Peak-season supplement',
  discountPercent: 'Discount',
  repeatsYearly: 'Repeats every year',
  peakSeasons: 'Peak seasons',
  longStayTiers: 'Long-stay discounts',
  verified: 'Distance confirmed (hide “approx.”)',
  pricing: 'Charged',
  price: 'Price',
  socials: 'Social media links',
  stats: 'Numbers strip',
  updated: 'Last updated',
  sections: 'Sections',
  body: 'Text',
  inclusions: 'What’s included',
  kicker: 'Small heading',
  badge: 'Badge',
  validity: 'Valid',
  origin: 'From',
  author: 'Name',
  quote: 'Quote',
  start: 'From',
  end: 'To (inclusive)',
  villa: 'Villa',
  note: 'Note',
  count: 'How many to show',
  intro: 'Introduction',
  whatsapp: 'WhatsApp number',
  phone: 'Telephone',
  reservationsEmail: 'Reservations e-mail',
};

/** Keys whose text is usually long enough to need a text box. */
const LONG_TEXT = /^(body|description|summary|intro|lede|answer|quote|detail|note|notes|disclaimer|demoNote|rateNote|estimateNote|warning|sentBody|whatsappNote|bookDirectNote|paragraphs|story)$/;

export function labelFor(path: Path): string {
  const key = path[path.length - 1];
  if (key === 'stay' && path[0] === 'testimonials') return 'Villa stayed in';
  if (typeof key === 'string' && key in LABELS) return LABELS[key];
  return humanize(key);
}

/** Fields kept in the document but not worth showing (picture pixel sizes). */
export function isHidden(path: Path): boolean {
  const key = path[path.length - 1];
  return key === 'width' || key === 'height';
}

/** Choose the control for a value at `path`. */
export function kindFor(path: Path, value: unknown): FieldKind {
  const key = path[path.length - 1];
  const parent = path[path.length - 2];
  const at = path.join('.');

  if (Array.isArray(value)) return key === 'amenityIds' ? 'amenities' : 'list';
  if (value !== null && typeof value === 'object') return 'group';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    if (typeof key === 'string' && /Percent$/.test(key)) return 'percent';
    if (key === 'nightlyRate' || (key === 'price' && path[0] === 'extras')) return 'money';
    return 'number';
  }

  if (typeof key === 'string') {
    if (key === 'icon') return 'icon';
    if (key === 'start' || key === 'end') return 'date';
    if (key === 'pricing' || key === 'category' || key === 'group' || (key === 'villa' && at.startsWith('availability'))) {
      return 'select';
    }
    if (key === 'url' || key === 'image' || /Image$/.test(key)) return 'image';
    if (key === 'href' || key === 'bookingComUrl' || key === 'path') return 'link';
    if (LONG_TEXT.test(key)) return 'textarea';
  }
  // Items of a list of paragraphs (story, body, paragraphs).
  if (typeof key === 'number' && typeof parent === 'string' && LONG_TEXT.test(parent)) return 'textarea';
  if (typeof value === 'string' && value.length > 90) return 'textarea';
  return 'text';
}

/** Help shown under a field. */
export function helpFor(path: Path, value: unknown): string | null {
  const key = path[path.length - 1];
  const at = path.filter((p) => typeof p === 'string').join('.');
  if (key === 'slug') return 'Used in the page address. Lower-case letters, numbers and dashes only.';
  if (key === 'mapQuery') return 'What Google Maps searches for on the contact page and in “Get directions”.';
  if (key === 'phone' || key === 'whatsapp') return 'Write it as guests should see it; the dialling link is made from it.';
  if (key === 'repeatsYearly') return 'When on, only the day and month matter, so the season comes back every year.';
  if (key === 'count') return 'How many items from the list to show here.';
  if (key === 'path') return 'A page on this site, such as /villas or /contact.';
  if (at === 'pricing.taxLabel') return 'The percentage is added automatically, e.g. “Tax & service (21%)”.';
  if (at.endsWith('seo.title')) return 'Shown in the browser tab and in search results.';
  if (at.endsWith('seo.description')) return 'Shown under the title in search results. About 150 characters.';
  if (at === 'pages.home.gallery.mosaic') return 'Four pictures: tall left, small top, tall right, wide bottom.';
  if (typeof value === 'string') {
    const hints: string[] = [];
    if (/\{\w+\}/.test(value)) hints.push('Words in {braces} are filled in automatically — keep them as they are.');
    if (/\*[^*]+\*/.test(value)) hints.push('Words between *asterisks* are shown in italics.');
    if (hints.length) return hints.join(' ');
  }
  return null;
}

// ---------------------------------------------------------------------------
// New list items
// ---------------------------------------------------------------------------

const DEFAULTS = createDefaultContent();

/** Lists whose defaults are empty, so the shape of a new item is given here. */
const TEMPLATES: Record<string, unknown> = {
  'availability.blocked': { villa: '', start: '', end: '', note: '' },
  'pricing.peakSeasons': { label: '', start: '', end: '', repeatsYearly: false },
};

/** A blank item for the list at `path`, shaped like the items it already has. */
export function newItemFor(path: Path, existing: readonly unknown[]): unknown {
  const named = TEMPLATES[path.filter((p) => typeof p === 'string').join('.')];
  if (named) return structuredClone(named);

  const defaultList = getIn(DEFAULTS, path.map((p) => (typeof p === 'number' ? 0 : p)));
  const sample = Array.isArray(defaultList) && defaultList.length ? defaultList[0] : existing[0];
  if (sample === undefined) return '';

  const item = blankLike(sample) as Record<string, unknown> | string;
  if (item && typeof item === 'object') {
    // Sensible starting values instead of zeros.
    if ('maxGuests' in item) Object.assign(item, { maxGuests: 2, bedrooms: 1, bathrooms: 1, minNights: 2 });
    if ('minNights' in item && !('maxGuests' in item)) item['minNights'] = 1;
    if ('pricing' in item && path[0] === 'extras') item['pricing'] = 'per-stay';
    if ('width' in item) Object.assign(item, { width: 1600, height: 1067 });
    if ('icon' in item) item['icon'] = 'sparkle';
    if ('verified' in item) item['verified'] = true;
  }
  return item;
}

/** A short title for a list item, used on its collapsed row. */
export function itemTitle(item: unknown, index: number): string {
  if (typeof item === 'string') return item || `Item ${index + 1}`;
  if (item && typeof item === 'object') {
    const o = item as Record<string, unknown>;
    for (const key of ['name', 'title', 'label', 'question', 'heading', 'note', 'quote', 'alt', 'value', 'slug']) {
      const v = o[key];
      if (typeof v === 'string' && v.trim()) return v.length > 80 ? `${v.slice(0, 77)}…` : v;
    }
    if (typeof o['start'] === 'string' && o['start']) return `${o['start']} – ${o['end'] || '…'}`;
  }
  return `Item ${index + 1}`;
}

/** The picture to show beside a collapsed list item, if it has one. */
export function itemThumb(item: unknown): string | null {
  if (!item || typeof item !== 'object') return null;
  const o = item as Record<string, unknown>;
  if (typeof o['image'] === 'string') return o['image'];
  if (typeof o['url'] === 'string' && !('label' in o)) return o['url'];
  const images = o['images'];
  if (Array.isArray(images) && images[0] && typeof images[0].url === 'string') return images[0].url;
  return null;
}
