/* ============================================================================
 * CONTENT VALIDATION
 * ----------------------------------------------------------------------------
 * Run by the server before anything is written, and by the admin before it
 * asks to publish, so mistakes are reported in plain words next to the save
 * button rather than as a broken page.
 * ========================================================================== */

import { createDefaultContent } from './default-content';
import { SiteContent } from './content.model';
import { isValidIso } from '../utils/date.util';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Fields that some list items legitimately do not have. */
const OPTIONAL_KEYS = new Set(['notes', 'description', 'category']);
/** Only plain web addresses or paths on this site: no javascript:, data: and the like. */
const SAFE_URL = /^(https?:\/\/|\/(?!\/)|mailto:|tel:|#)/i;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateContent(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) {
    return { ok: false, errors: ['The content must be a JSON object.'] };
  }

  checkShape(createDefaultContent(), value, '', errors);
  if (errors.length) return { ok: false, errors: errors.slice(0, 25) };

  const content = value as unknown as SiteContent;
  checkVillas(content, errors);
  checkUnique(content.offers.map((o) => o.slug), 'Offer web address (slug)', errors);
  checkUnique(content.extras.map((e) => e.id), 'Booking extra id', errors);
  checkUnique(content.amenities.map((a) => a.id), 'Amenity id', errors);
  checkDates(content, errors);
  checkNumbers(content, errors);
  checkUrls(value, '', errors);

  return { ok: errors.length === 0, errors: errors.slice(0, 25) };
}

/** Every key the defaults define must exist with the same kind of value. */
function checkShape(expected: unknown, actual: unknown, path: string, errors: string[]): void {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      errors.push(`${label(path)} should be a list.`);
      return;
    }
    const template = expected[0];
    if (template === undefined) return;
    actual.forEach((item, i) => checkShape(template, item, `${path}[${i}]`, errors));
    return;
  }
  if (isObject(expected)) {
    if (!isObject(actual)) {
      errors.push(`${label(path)} is missing or is not a group of fields.`);
      return;
    }
    for (const key of Object.keys(expected)) {
      const child = path ? `${path}.${key}` : key;
      // Optional fields (absent from some items in the original data) may be left out.
      if (!(key in actual) && OPTIONAL_KEYS.has(key)) continue;
      checkShape(expected[key], actual[key], child, errors);
    }
    return;
  }
  if (expected === undefined || expected === null) return;
  if (typeof actual !== typeof expected) {
    errors.push(`${label(path)} should be ${kind(expected)}.`);
  } else if (typeof actual === 'number' && !Number.isFinite(actual)) {
    errors.push(`${label(path)} should be a number.`);
  }
}

function checkVillas(content: SiteContent, errors: string[]): void {
  if (content.villas.length === 0) errors.push('Add at least one villa.');
  checkUnique(content.villas.map((v) => v.slug), 'Villa web address (slug)', errors);
  for (const villa of content.villas) {
    const name = villa.name || villa.slug || 'A villa';
    if (!SLUG.test(villa.slug)) {
      errors.push(`${name}: the web address may only use lower-case letters, numbers and dashes.`);
    }
    if (!villa.images.length) errors.push(`${name}: add at least one photograph.`);
    if (villa.maxGuests < 1) errors.push(`${name}: it must sleep at least one guest.`);
    if (villa.minNights < 1) errors.push(`${name}: the minimum stay must be at least one night.`);
  }
  for (const offer of content.offers) {
    if (!SLUG.test(offer.slug)) {
      errors.push(`Offer “${offer.name}”: the web address may only use lower-case letters, numbers and dashes.`);
    }
  }
}

function checkDates(content: SiteContent, errors: string[]): void {
  const ranges = [
    ...content.pricing.peakSeasons.map((s) => ({ ...s, what: `Peak season “${s.label}”` })),
    ...content.availability.blocked.map((b) => ({
      ...b,
      what: `Closed dates ${b.note ? `“${b.note}”` : `${b.start} – ${b.end}`}`,
    })),
  ];
  const villaSlugs = new Set(content.villas.map((v) => v.slug));
  for (const range of ranges) {
    if (!isValidIso(range.start) || !isValidIso(range.end)) {
      errors.push(`${range.what}: choose both a start and an end date.`);
      continue;
    }
    const repeats = 'repeatsYearly' in range && range.repeatsYearly;
    if (!repeats && range.end < range.start) {
      errors.push(`${range.what}: the end date is before the start date.`);
    }
  }
  for (const block of content.availability.blocked) {
    if (block.villa && !villaSlugs.has(block.villa)) {
      errors.push(`Closed dates ${block.start} – ${block.end}: the villa “${block.villa}” no longer exists.`);
    }
  }
}

function checkNumbers(content: SiteContent, errors: string[]): void {
  const { pricing } = content;
  if (pricing.taxPercent < 0 || pricing.taxPercent > 100) errors.push('Tax must be between 0% and 100%.');
  if (pricing.peakSupplementPercent < 0 || pricing.peakSupplementPercent > 500) {
    errors.push('The peak supplement must be between 0% and 500%.');
  }
  for (const tier of pricing.longStayTiers) {
    if (tier.discountPercent < 0 || tier.discountPercent > 100) {
      errors.push(`Long-stay discount from ${tier.minNights} nights must be between 0% and 100%.`);
    }
  }
  for (const villa of content.villas) {
    if (villa.nightlyRate < 0) errors.push(`${villa.name}: the nightly rate cannot be negative.`);
  }
  for (const extra of content.extras) {
    if (extra.price < 0) errors.push(`Extra “${extra.label}”: the price cannot be negative.`);
  }
}

/** Any field that holds a link or picture must be a plain web address. */
function checkUrls(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => checkUrls(item, `${path}[${i}]`, errors));
    return;
  }
  if (!isObject(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (typeof child === 'string' && isLinkKey(key) && child && !SAFE_URL.test(child.trim())) {
      errors.push(`${label(childPath)} must start with https://, http:// or /.`);
    } else {
      checkUrls(child, childPath, errors);
    }
  }
}

export function isLinkKey(key: string): boolean {
  return /^(url|href|image|bookingComUrl)$|Image$/.test(key);
}

function checkUnique(values: string[], what: string, errors: string[]): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${what} “${value}” is used twice.`);
    seen.add(value);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function kind(value: unknown): string {
  if (typeof value === 'number') return 'a number';
  if (typeof value === 'boolean') return 'yes or no';
  return 'text';
}

/** `villas[2].images[0].url` → `villas › 3 › images › 1 › url` */
function label(path: string): string {
  return (path || 'The content')
    .replace(/\[(\d+)\]/g, (_, n: string) => ` › ${Number(n) + 1}`)
    .replace(/\./g, ' › ');
}
