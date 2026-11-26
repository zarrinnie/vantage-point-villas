import { LongStayTier, PricingRules } from '../content/content.model';
import { IsoDate, isPeakNight } from './date.util';

export interface StayPrice {
  readonly accommodation: number;
  readonly peakNights: number;
  readonly peakSupplement: number;
  /** The long-stay tier that applies, if any. */
  readonly tier: LongStayTier | null;
  /** Long-stay reduction, as a negative number (0 when none applies). */
  readonly discount: number;
}

/** The best long-stay tier the stay qualifies for. */
export function tierFor(nights: number, tiers: readonly LongStayTier[]): LongStayTier | null {
  return (
    [...tiers]
      .filter((t) => t.minNights > 0 && nights >= t.minNights)
      .sort((a, b) => b.minNights - a.minNights)[0] ?? null
  );
}

/** Villa rate × nights, plus peak supplement, less any long-stay reduction. */
export function priceStay(
  nightlyRate: number,
  stayNights: readonly IsoDate[],
  pricing: PricingRules,
): StayPrice {
  const nights = stayNights.length;
  const peakNights = stayNights.filter((n) => isPeakNight(n, pricing.peakSeasons)).length;

  const accommodation = nightlyRate * nights;
  const peakSupplement = nightlyRate * (pricing.peakSupplementPercent / 100) * peakNights;
  const tier = tierFor(nights, pricing.longStayTiers);
  const discount = tier ? -((accommodation + peakSupplement) * (tier.discountPercent / 100)) : 0;

  return { accommodation, peakNights, peakSupplement, tier, discount };
}

export function taxRate(pricing: PricingRules): number {
  return pricing.taxPercent / 100;
}
