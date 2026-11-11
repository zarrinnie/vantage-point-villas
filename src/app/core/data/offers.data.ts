/* ============================================================================
 * OFFERS & PACKAGES — PLACEHOLDER. The property does advertise seasonal deals
 * publicly, but the terms below are invented. Replace before publishing.
 * ========================================================================== */
import { Offer } from '../models/content.model';
import { cardImg } from './images.data';

export const OFFERS: readonly Offer[] = [
  {
    slug: 'stay-longer',
    name: 'Stay Longer, Pay Less',
    kicker: 'Long-stay rate',
    description:
      'Seven nights or more in any villa and the nightly rate drops. The longer the stay, the bigger the reduction — the way Ungasan is best experienced anyway.',
    inclusions: [
      '15% off the nightly rate from 7 nights',
      '20% off from 14 nights',
      'Twice-weekly laundry included',
      'One airport transfer on arrival',
    ],
    badge: 'Save up to 20%',
    minNights: 7,
    validity: 'Year round, excluding 20 Dec – 5 Jan',
    image: cardImg('offer-stay-longer'),
  },
  {
    slug: 'early-bird',
    name: 'Early Bird',
    kicker: 'Book ahead',
    description:
      'Confirm your villa more than 60 days before arrival and hold today’s rate, with a deposit you can move once at no cost.',
    inclusions: [
      '12% off the nightly rate',
      'Free date change, once, up to 14 days before arrival',
      'Guaranteed villa allocation, not just a villa type',
    ],
    badge: 'Save 12%',
    minNights: 3,
    validity: 'Bookings made 60+ days before arrival',
    image: cardImg('offer-early-bird'),
  },
  {
    slug: 'honeymoon',
    name: 'Two of You',
    kicker: 'Honeymoon & anniversaries',
    description:
      'For couples in the one-bedroom villas: the terrace set for dinner, a massage on your own patio, and a late last morning.',
    inclusions: [
      'In-villa Balinese massage for two',
      'Private dinner for two on your terrace, once',
      'Daily breakfast included',
      'Late check-out at 16:00',
    ],
    badge: 'Inclusions worth $180',
    minNights: 4,
    validity: 'Year round, in one-bedroom villas',
    image: cardImg('offer-honeymoon'),
  },
  {
    slug: 'surf-week',
    name: 'Bukit Surf Week',
    kicker: 'For surfers',
    description:
      'Uluwatu, Padang Padang, Bingin and Balangan are all within a short drive. This package handles the logistics and leaves you the water.',
    inclusions: [
      'Board storage and a rinse station',
      'Scooter for the week',
      'Two guided dawn-patrol drives',
      'Breakfast from 06:00 instead of 07:30',
    ],
    badge: '3rd night free',
    minNights: 5,
    validity: 'April – October, subject to swell',
    image: cardImg('offer-surf-week'),
  },
];
