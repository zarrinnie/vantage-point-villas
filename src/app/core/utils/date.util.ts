/* ============================================================================
 * Date helpers.
 * Dates move through the app as `YYYY-MM-DD` strings so that server-rendered
 * and client-rendered output never disagree because of a timezone.
 * ========================================================================== */

export type IsoDate = string;

const MS_PER_DAY = 86_400_000;

/** Today, in the local timezone, as `YYYY-MM-DD`. */
export function today(): IsoDate {
  return toIso(new Date());
}

export function toIso(date: Date): IsoDate {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse `YYYY-MM-DD` into a local-midnight Date. */
export function fromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isValidIso(value: unknown): value is IsoDate {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(fromIso(value).getTime());
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const d = fromIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

export function addMonths(iso: IsoDate, months: number): IsoDate {
  const d = fromIso(iso);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return toIso(d);
}

/** Whole nights between two dates. Negative or zero when the order is wrong. */
export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  if (!isValidIso(checkIn) || !isValidIso(checkOut)) return 0;
  const diff = fromIso(checkOut).getTime() - fromIso(checkIn).getTime();
  return Math.max(0, Math.round(diff / MS_PER_DAY));
}

/** Every night of a stay: check-in night up to, but excluding, check-out day. */
export function nightsOfStay(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const total = nightsBetween(checkIn, checkOut);
  return Array.from({ length: total }, (_, i) => addDays(checkIn, i));
}

export function isBefore(a: IsoDate, b: IsoDate): boolean {
  return a < b;
}

export function isSameOrAfter(a: IsoDate, b: IsoDate): boolean {
  return a >= b;
}

/** "Fri 12 Jun 2026" */
export function formatLong(iso: IsoDate, locale = 'en-GB'): string {
  if (!isValidIso(iso)) return '';
  return fromIso(iso).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** "12 Jun" */
export function formatShort(iso: IsoDate, locale = 'en-GB'): string {
  if (!isValidIso(iso)) return '';
  return fromIso(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

/** "June 2026" */
export function formatMonthYear(iso: IsoDate, locale = 'en-GB'): string {
  return fromIso(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/** The fields of a peak-season window that `isPeakNight` needs. */
export interface SeasonWindow {
  readonly start: IsoDate;
  readonly end: IsoDate;
  readonly repeatsYearly: boolean;
}

/**
 * True when the night falls inside any of the peak-season windows (both ends
 * inclusive). A yearly window compares month and day only, and may wrap over
 * New Year (e.g. 20 December – 5 January).
 */
export function isPeakNight(iso: IsoDate, seasons: readonly SeasonWindow[]): boolean {
  return seasons.some((season) => inWindow(iso, season));
}

function inWindow(iso: IsoDate, { start, end, repeatsYearly }: SeasonWindow): boolean {
  if (!isValidIso(start) || !isValidIso(end)) return false;
  if (!repeatsYearly) return iso >= start && iso <= end;

  const day = iso.slice(5);
  const from = start.slice(5);
  const to = end.slice(5);
  // A window whose end month-day comes before its start wraps over New Year.
  return from <= to ? day >= from && day <= to : day >= from || day <= to;
}

/** Monday-first weekday index (0 = Monday) for the calendar grid. */
export function mondayFirstWeekday(iso: IsoDate): number {
  return (fromIso(iso).getDay() + 6) % 7;
}

export function daysInMonth(iso: IsoDate): number {
  const d = fromIso(iso);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** First day of the month containing `iso`. */
export function startOfMonth(iso: IsoDate): IsoDate {
  return `${iso.slice(0, 7)}-01`;
}
