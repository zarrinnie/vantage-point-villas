/* ============================================================================
 * THE VILLAS
 * ----------------------------------------------------------------------------
 * VERIFIED: plot sizes of 200–300 sqm, private pool, tropical garden, patio,
 * living room and kitchen in every villa; one extra bed may be added.
 *
 * PLACEHOLDER: villa names, the number of each type, bed configurations, room
 * counts, nightly rates and all copy. Observed public rates for the property
 * ranged from roughly USD 68 to USD 143 per night, so the rates below are
 * indicative only — replace them with the real rate card.
 * ========================================================================== */

import { GalleryImage, Villa } from '../models/villa.model';
import { img } from './images.data';

/** Build the image set for a villa from a seed prefix. */
function villaImages(seed: string, alt: string, captions: readonly string[]): GalleryImage[] {
  return captions.map((caption, i) => ({
    url: img(`${seed}-${i + 1}`, 1600, 1067),
    alt: `${alt} — ${caption}`,
    width: 1600,
    height: 1067,
  }));
}

const COMMON_AMENITIES = [
  'private-pool',
  'wifi',
  'parking',
  'air',
  'kitchen',
  'fridge',
  'tv',
  'sofa',
  'terrace',
  'garden',
  'breakfast',
  'airport-transfer',
  'laundry',
  'room-service',
  'express-checkin',
];

export const VILLAS: readonly Villa[] = [
  {
    slug: 'one-bedroom-pool-villa',
    name: 'One-Bedroom Pool Villa',
    tagline: 'The original Vantage Point villa',
    summary:
      'A walled garden, a private pool and an open-sided living pavilion — the simplest and most complete expression of the property.',
    story: [
      'The One-Bedroom Pool Villa is where most stays at Vantage Point begin. Behind its own gate, the plan is unhurried: a living pavilion that opens on two sides, a kitchen set along the back wall, and a bedroom that looks straight out over the water.',
      'The pool runs the length of the garden, edged in stone that stays cool underfoot. Frangipani and heliconia screen the boundary walls, so by the second morning you stop noticing there are neighbours at all.',
      'It suits couples, and it suits one person travelling alone who wants somewhere to work in the shade and swim between calls. A single extra bed can be added for a child.',
    ],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    bedConfiguration: '1 king bed · 1 extra bed on request',
    landSize: 200,
    livingSize: 72,
    nightlyRate: 120,
    minNights: 2,
    amenityIds: [...COMMON_AMENITIES, 'family'],
    highlights: [
      'Private 8-metre pool with a shaded shallow ledge',
      'Living pavilion that opens on two sides to the garden',
      'Outdoor rain shower in a planted courtyard',
      'Kitchen with full cookware, fridge and dining table',
    ],
    images: villaImages('villa-one-bedroom', 'One-Bedroom Pool Villa', [
      'the pool at first light',
      'the living pavilion',
      'the bedroom looking onto the water',
      'the kitchen and dining table',
      'the outdoor rain shower',
      'the garden at dusk',
    ]),
    isFeatured: true,
  },
  {
    slug: 'two-bedroom-garden-pool-villa',
    name: 'Two-Bedroom Garden Pool Villa',
    tagline: 'Two bedrooms either side of the water',
    summary:
      'The garden villa sets two equal bedrooms on opposite sides of the pool, with the living and dining space between them.',
    story: [
      'Two bedrooms, each with its own bathroom, sit at either end of a 280 sqm plot. Between them is the part of the villa nobody wants to leave: a long covered terrace, a dining table for six, and the pool a step beyond.',
      'Because the bedrooms do not share a wall, it works as well for two couples as it does for a family. Both rooms are air-conditioned and both look onto planting rather than onto each other.',
      'The kitchen is a proper one — gas, fridge, cookware, enough counter to cook for the whole villa after a day on the Bukit.',
    ],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 5,
    bedConfiguration: '1 king bed · 2 single beds · 1 extra bed on request',
    landSize: 280,
    livingSize: 110,
    nightlyRate: 185,
    minNights: 2,
    amenityIds: [...COMMON_AMENITIES, 'family'],
    highlights: [
      'Two en-suite bedrooms on opposite sides of the pool',
      'Covered terrace with a dining table for six',
      'Deep tropical planting on all four boundaries',
      'Second bathroom with an outdoor shower',
    ],
    images: villaImages('villa-two-bedroom', 'Two-Bedroom Garden Pool Villa', [
      'the pool between the two bedroom wings',
      'the covered terrace and dining table',
      'the main bedroom',
      'the second bedroom',
      'the kitchen',
      'the garden path to the gate',
      'evening on the terrace',
    ]),
    isFeatured: true,
  },
  {
    slug: 'ocean-breeze-villa',
    name: 'Ocean Breeze Villa',
    tagline: 'The highest plot on the property',
    summary:
      'Set on the upper terrace, this villa catches the afternoon wind that comes up off the Indian Ocean and holds the light longest.',
    story: [
      'Ungasan sits high on the Bukit peninsula, and this villa takes the best of that elevation. The living pavilion faces west, which means the last hour of light lands directly on the pool deck.',
      'It is the quietest of the villas — one neighbour, on one side, and nothing but planting on the other three. The bedroom has a daybed in the window that is, by common agreement among guests, the best seat on the property.',
      'There is no ocean view from the plot itself; what there is instead is the breeze, which arrives most afternoons around four and makes the terrace usable all evening.',
    ],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    bedConfiguration: '1 king bed · 1 daybed · 1 extra bed on request',
    landSize: 240,
    livingSize: 84,
    nightlyRate: 150,
    minNights: 3,
    amenityIds: [...COMMON_AMENITIES, 'family'],
    highlights: [
      'The highest plot on the property, west-facing',
      'Window daybed in the bedroom',
      'Afternoon sea breeze from the Indian Ocean',
      'Only one adjoining villa',
    ],
    images: villaImages('villa-ocean-breeze', 'Ocean Breeze Villa', [
      'the west-facing pool deck',
      'the living pavilion in late light',
      'the window daybed',
      'the bedroom',
      'the open-air bathroom',
      'the upper terrace garden',
    ]),
    isFeatured: true,
  },
  {
    slug: 'family-pool-villa',
    name: 'Family Pool Villa',
    tagline: 'Three bedrooms, one big table',
    summary:
      'The largest villa on the property: three bedrooms, a shallow pool ledge for small swimmers, and a kitchen built for cooking in numbers.',
    story: [
      'Built across the widest plot at Vantage Point, the Family Pool Villa gives three groups somewhere to retreat to and one place to come together. The dining table seats eight, under cover, a metre from the water.',
      'The pool steps down in two stages, with a broad shallow ledge at the shallow end — the part of the design parents notice first. The garden is walled on all sides and the gate latches at adult height.',
      'The third bedroom can be set up with two singles or one king, so the villa works for three couples as readily as it does for two families travelling together.',
    ],
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 7,
    bedConfiguration: '2 king beds · 2 single beds · 1 extra bed on request',
    landSize: 300,
    livingSize: 160,
    nightlyRate: 265,
    minNights: 3,
    amenityIds: [...COMMON_AMENITIES, 'family'],
    highlights: [
      'Three en-suite bedrooms, one convertible to twins',
      'Shallow pool ledge and a fully walled garden',
      'Covered dining for eight',
      'The largest kitchen on the property',
    ],
    images: villaImages('villa-family', 'Family Pool Villa', [
      'the pool and shallow ledge',
      'the covered dining area',
      'the first bedroom',
      'the twin bedroom',
      'the kitchen',
      'the lawn and garden',
      'the villa from the gate',
    ]),
    isFeatured: false,
  },
  {
    slug: 'vantage-suite',
    name: 'The Vantage Suite',
    tagline: 'A studio with a pool, for one or two',
    summary:
      'The smallest footprint on the property and the easiest to settle into — one open room, a kitchenette, and a plunge pool two steps from the bed.',
    story: [
      'The Vantage Suite is a single room done carefully: a bed, a sitting area, a kitchenette with a fridge and a two-ring hob, and a bathroom with a shower that opens to a planted light well.',
      'Outside, a plunge pool and a patio with a pair of loungers. It is a short stay villa by design — ideal for two nights between flights, or for a solo traveller spending the week surfing and wanting somewhere simple to come back to.',
      'It is also the best value on the property, and the one that books first.',
    ],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    bedConfiguration: '1 queen bed',
    landSize: 200,
    livingSize: 48,
    nightlyRate: 95,
    minNights: 2,
    amenityIds: COMMON_AMENITIES,
    highlights: [
      'Private plunge pool and patio',
      'Kitchenette with fridge and hob',
      'Shower opening onto a planted light well',
      'The best rate on the property',
    ],
    images: villaImages('villa-vantage-suite', 'The Vantage Suite', [
      'the plunge pool and patio',
      'the studio interior',
      'the bed and sitting area',
      'the kitchenette',
      'the shower and light well',
    ]),
    isFeatured: false,
  },
];

export const VILLA_SLUGS = VILLAS.map((v) => v.slug);

/** Lowest nightly rate across the property, used in "from" copy. */
export const LOWEST_RATE = Math.min(...VILLAS.map((v) => v.nightlyRate));
