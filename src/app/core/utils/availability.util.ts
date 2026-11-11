/* ============================================================================
 * MOCK AVAILABILITY
 * ----------------------------------------------------------------------------
 * There is no reservations back end behind this site, so availability is
 * derived from a deterministic hash of the villa slug and the date. The same
 * dates are therefore always unavailable, on the server and in the browser,
 * which keeps server-rendered markup and hydrated markup identical.
 *
 * Replace the two predicates below with calls to the real availability API —
 * nothing else in the app needs to change.
 * ========================================================================== */

import { IsoDate, nightsOfStay } from './date.util';

/** FNV-1a. Small, fast, and stable across runtimes. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A property-wide closure — roughly one night in forty. */
export function isPropertyClosed(date: IsoDate): boolean {
  return hash(`vpv-property|${date}`) % 41 === 0;
}

/** This villa is already taken that night — roughly one night in twenty-nine. */
export function isVillaBooked(villaSlug: string, date: IsoDate): boolean {
  return isPropertyClosed(date) || hash(`${villaSlug}|${date}`) % 29 === 0;
}

/** Every night of the stay must be free for the villa to be bookable. */
export function isVillaAvailable(
  villaSlug: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
): boolean {
  const nights = nightsOfStay(checkIn, checkOut);
  if (nights.length === 0) return false;
  return nights.every((night) => !isVillaBooked(villaSlug, night));
}

/** The nights that block a stay, so the UI can say which ones. */
export function unavailableNights(
  villaSlug: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
): IsoDate[] {
  return nightsOfStay(checkIn, checkOut).filter((night) => isVillaBooked(villaSlug, night));
}
