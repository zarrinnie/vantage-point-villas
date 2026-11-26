/* ============================================================================
 * AVAILABILITY
 * ----------------------------------------------------------------------------
 * Nights are closed by the admin (Admin → Availability) as date ranges, either
 * for one villa or, with an empty `villa`, for the whole property. There is no
 * reservations back end, so these ranges are the whole truth.
 *
 * To connect a channel manager later, replace `isVillaBooked` with a call to
 * it; everything else derives from that one predicate.
 * ========================================================================== */

import { IsoDate, nightsOfStay } from './date.util';

/** The fields of a blocked range that the predicates need (both ends inclusive). */
export interface BlockRule {
  readonly villa: string;
  readonly start: IsoDate;
  readonly end: IsoDate;
}

function covers(rule: BlockRule, date: IsoDate): boolean {
  return date >= rule.start && date <= rule.end;
}

/** A property-wide closure covers this night. */
export function isPropertyClosed(date: IsoDate, rules: readonly BlockRule[]): boolean {
  return rules.some((rule) => !rule.villa && covers(rule, date));
}

/** This villa cannot be booked for that night. */
export function isVillaBooked(
  villaSlug: string,
  date: IsoDate,
  rules: readonly BlockRule[],
): boolean {
  return rules.some((rule) => (!rule.villa || rule.villa === villaSlug) && covers(rule, date));
}

/** Every night of the stay must be free for the villa to be bookable. */
export function isVillaAvailable(
  villaSlug: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
  rules: readonly BlockRule[],
): boolean {
  const nights = nightsOfStay(checkIn, checkOut);
  if (nights.length === 0) return false;
  return nights.every((night) => !isVillaBooked(villaSlug, night, rules));
}

/** The nights that block a stay, so the UI can say which ones. */
export function unavailableNights(
  villaSlug: string,
  checkIn: IsoDate,
  checkOut: IsoDate,
  rules: readonly BlockRule[],
): IsoDate[] {
  return nightsOfStay(checkIn, checkOut).filter((night) =>
    isVillaBooked(villaSlug, night, rules),
  );
}
