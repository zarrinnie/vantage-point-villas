/* ============================================================================
 * PLACEHOLDER IMAGERY
 * ----------------------------------------------------------------------------
 * Every image in the site resolves through `img()`.
 *
 * Each seed is mapped to a hand-picked stock photograph (coast, water, tropical
 * planting, warm interiors) so the site reads as a villa property rather than a
 * random photo wall. They are still placeholders: none of them is this property.
 *
 * TO USE THE REAL PHOTOGRAPHY: drop the files into `public/assets/photos/` named
 * after the seeds below and change `img()` to
 *
 *     return `/assets/photos/${seed}.jpg`;
 *
 * Nothing else in the application needs to change.
 * ========================================================================== */

/**
 * seed → picsum photo id. Picked by eye from the picsum catalogue for subject
 * matter that suits a Bali villa property.
 */
const PHOTOS: Record<string, number> = {
  // ---- Page heroes and full-bleed breaks --------------------------------
  'hero-main': 871, // a cove of turquoise water below green cliffs
  'intro-pavilion': 1068, // a table set against bright water
  'break-frangipani': 1022, // dense dark foliage
  'neighbourhood-bukit': 1015, // coastline from above
  'cta-band': 865, // headland at sunset
  'villas-hero': 638, // a long empty beach
  'gallery-hero': 986, // sand and water at dusk
  'faq-hero': 517, // sea and cloud
  'policy-hero': 931, // a quiet misty sea
  'about-hero': 851, // green cliffs over the water
  'services-hero': 219, // a pier reaching into the sea
  'offers-hero': 741, // a beach at the end of the day
  'contact-hero': 103, // cliffs and sea
  'not-found': 227, // sunset over water

  // ---- Home -------------------------------------------------------------
  'services-breakfast': 365, // white linen and breakfast things
  'about-bukit': 1055, // a lagoon and the headland
  'about-path': 921, // a path through planting
  'about-pavilion': 649, // light through an open window
  'leisure-dusk': 227, // sunset over water

  // ---- Home: experiences --------------------------------------------------
  'exp-surf': 910, // open water from a boat
  'exp-sunset': 865, // headland at sunset
  'exp-spa': 1022, // dense dark foliage

  // ---- The team (grayscaled in the page) --------------------------------
  'team-1': 64,
  'team-2': 65,
  'team-3': 173,

  // ---- Offers -----------------------------------------------------------
  'offer-stay-longer': 1050, // a green valley
  'offer-early-bird': 827, // water at first light
  'offer-honeymoon': 102, // petals on white linen
  'offer-surf-week': 910, // open water from a boat

  // ---- One-Bedroom Pool Villa -------------------------------------------
  'villa-one-bedroom-1': 913, // blue water, early
  'villa-one-bedroom-2': 625, // an interior with a table and chairs
  'villa-one-bedroom-3': 775, // a bed beside a window
  'villa-one-bedroom-4': 431, // a table laid with coffee
  'villa-one-bedroom-5': 71, // a door in a white wall
  'villa-one-bedroom-6': 189, // leaves after rain

  // ---- Two-Bedroom Garden Pool Villa ------------------------------------
  'villa-two-bedroom-1': 970, // still water
  'villa-two-bedroom-2': 1084, // a warm interior
  'villa-two-bedroom-3': 649,
  'villa-two-bedroom-4': 365,
  'villa-two-bedroom-5': 625,
  'villa-two-bedroom-6': 807, // green ground
  'villa-two-bedroom-7': 986,

  // ---- Ocean Breeze Villa -----------------------------------------------
  'villa-ocean-breeze-1': 846, // the sea breaking
  'villa-ocean-breeze-2': 501, // the horizon
  'villa-ocean-breeze-3': 775,
  'villa-ocean-breeze-4': 102,
  'villa-ocean-breeze-5': 78, // weathered wooden doors
  'villa-ocean-breeze-6': 1006, // green hillside

  // ---- Family Pool Villa -------------------------------------------------
  'villa-family-1': 296, // open blue water
  'villa-family-2': 428, // a shaded colonnade
  'villa-family-3': 365,
  'villa-family-4': 775,
  'villa-family-5': 625,
  'villa-family-6': 18, // grass
  'villa-family-7': 975, // wooden shutters

  // ---- The Vantage Suite --------------------------------------------------
  'villa-vantage-suite-1': 1083, // pale water
  'villa-vantage-suite-2': 1084,
  'villa-vantage-suite-3': 775,
  'villa-vantage-suite-4': 431,
  'villa-vantage-suite-5': 649,

  // ---- Gallery -----------------------------------------------------------
  'gal-pool-morning': 1083,
  'gal-pavilion': 428,
  'gal-bedroom-linen': 365,
  'gal-frangipani': 967, // a single green leaf
  'gal-pool-ledge': 913,
  'gal-kitchen': 625,
  'gal-terrace-dinner': 1068,
  'gal-outdoor-shower': 649,
  'gal-garden-path': 921,
  'gal-uluwatu-cliff': 851,
  'gal-green-bowl': 638,
  'gal-gwk': 78,
  'gal-loungers': 219,
  'gal-living-sofa': 1084,
  'gal-gate': 71,
  'gal-surf-dawn': 910,
  'gal-pool-night': 827,
  'gal-breakfast': 431,

  // ---- Social / meta ------------------------------------------------------
  'hero-social': 871,
};

/** Fallback pool, so an unmapped seed still gets a plausible photograph. */
const FALLBACK = [871, 1015, 846, 970, 940, 844, 1050, 509, 973, 651, 627, 391];

function fallbackFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return FALLBACK[hash % FALLBACK.length];
}

/** Build a placeholder image URL for a given seed and intrinsic size. */
export function img(seed: string, width: number, height: number): string {
  const id = PHOTOS[seed] ?? fallbackFor(seed);
  return `https://picsum.photos/id/${id}/${width}/${height}`;
}

/** Convenience helper for the common 4:3 card crop. */
export function cardImg(seed: string): string {
  return img(seed, 1200, 900);
}

/** Convenience helper for full-bleed hero / break imagery. */
export function heroImg(seed: string): string {
  return img(seed, 2400, 1350);
}
