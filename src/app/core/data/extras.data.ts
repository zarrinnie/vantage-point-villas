/* ============================================================================
 * BOOKING EXTRAS — PLACEHOLDER prices. The services themselves (airport
 * transfer, breakfast, laundry, late check-out) are offered by the property;
 * the amounts below are indicative and should be replaced with the real ones.
 * ========================================================================== */
import { Extra } from '../models/booking.model';

export const EXTRAS: readonly Extra[] = [
  {
    id: 'airport-transfer',
    label: 'Airport transfer',
    description:
      'Private car from Ngurah Rai International Airport — about 20 minutes, one way.',
    price: 22,
    pricing: 'per-stay',
    icon: 'car',
  },
  {
    id: 'breakfast',
    label: 'Daily breakfast in the villa',
    description:
      'Tropical fruit, eggs any way, bread and coffee, brought to your terrace each morning.',
    price: 11,
    pricing: 'per-guest-night',
    icon: 'breakfast',
  },
  {
    id: 'spa',
    label: 'In-villa Balinese massage',
    description: 'A 90-minute massage for two, on your own patio, once during the stay.',
    price: 48,
    pricing: 'per-stay',
    icon: 'spa',
  },
  {
    id: 'late-checkout',
    label: 'Guaranteed late check-out',
    description: 'Keep the villa until 16:00 on your last day instead of 11:00.',
    price: 35,
    pricing: 'per-stay',
    icon: 'clock',
  },
  {
    id: 'daily-housekeeping',
    label: 'Twice-daily housekeeping',
    description: 'A second turndown each afternoon in addition to the morning service.',
    price: 9,
    pricing: 'per-night',
    icon: 'bell',
  },
];

const BY_ID = new Map(EXTRAS.map((e) => [e.id, e]));

export function extraById(id: string): Extra | undefined {
  return BY_ID.get(id);
}
