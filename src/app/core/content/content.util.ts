import { SiteInfo } from './content.model';
import { GalleryImage, Villa } from '../models/villa.model';

/**
 * Fill `{token}` placeholders. Unknown tokens are left as written, so a typo in
 * the admin shows up on the page instead of silently disappearing.
 */
export function fill(text: string | null | undefined, vars: Record<string, string | number>): string {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

function digits(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

/** `+62 361 000 0000` → `tel:+623610000000` */
export function telHref(phone: string): string {
  return `tel:${digits(phone)}`;
}

/** `+62 812 0000 0000` → `https://wa.me/6281200000000` */
export function whatsappHref(number: string): string {
  return `https://wa.me/${digits(number).replace(/^\+/, '')}`;
}

export function mapsSearchHref(site: SiteInfo): string {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(site.mapQuery);
}

export function mapsEmbedUrl(site: SiteInfo): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&output=embed`;
}

/** Tokens every page may use for the site's basic facts. */
export function siteVars(site: SiteInfo): Record<string, string> {
  return {
    name: site.name,
    checkIn: site.checkIn,
    checkOut: site.checkOut,
    languages: site.languages.join(' and '),
    phone: site.phone,
    email: site.email,
  };
}

/**
 * Escape HTML, then turn `*word*` into `<em>word</em>`. Safe to bind with
 * `[innerHTML]` because nothing the admin types survives as markup.
 */
export function emphasise(text: string | null | undefined): string {
  const escaped = (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** A villa's first picture, or an empty frame when the admin removed them all. */
export function coverOf(villa: Villa): GalleryImage {
  return villa.images[0] ?? { url: '', alt: villa.name, width: 1600, height: 1067 };
}
