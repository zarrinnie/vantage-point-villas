/* ============================================================================
 * GALLERY — PLACEHOLDER imagery (see images.data.ts for how to swap it out).
 * ========================================================================== */
import { GalleryCategory, GalleryImage } from '../models/villa.model';
import { img } from './images.data';

interface Shot {
  seed: string;
  alt: string;
  category: GalleryCategory;
  /** Tall shots get a portrait crop and span two rows in the masonry grid. */
  tall?: boolean;
}

const SHOTS: readonly Shot[] = [
  { seed: 'gal-pool-morning', alt: 'A private villa pool at first light', category: 'pools', tall: true },
  { seed: 'gal-pavilion', alt: 'An open-sided living pavilion facing the garden', category: 'villas' },
  { seed: 'gal-bedroom-linen', alt: 'A villa bedroom with white linen and open doors', category: 'interiors' },
  { seed: 'gal-frangipani', alt: 'Frangipani in flower against a villa wall', category: 'grounds' },
  { seed: 'gal-pool-ledge', alt: 'The shallow ledge of a villa pool', category: 'pools' },
  { seed: 'gal-kitchen', alt: 'A villa kitchen with cookware and a dining table', category: 'interiors', tall: true },
  { seed: 'gal-terrace-dinner', alt: 'A terrace table laid for dinner at dusk', category: 'villas' },
  { seed: 'gal-outdoor-shower', alt: 'An outdoor rain shower in a planted courtyard', category: 'interiors' },
  { seed: 'gal-garden-path', alt: 'A stone path through the tropical garden', category: 'grounds' },
  { seed: 'gal-uluwatu-cliff', alt: 'The cliffs of the Bukit peninsula near Uluwatu', category: 'uluwatu', tall: true },
  { seed: 'gal-green-bowl', alt: 'The cove at Green Bowl Beach in Ungasan', category: 'uluwatu' },
  { seed: 'gal-gwk', alt: 'Garuda Wisnu Kencana Cultural Park', category: 'uluwatu' },
  { seed: 'gal-loungers', alt: 'Two loungers on a villa pool deck', category: 'pools' },
  { seed: 'gal-living-sofa', alt: 'The sofa and sitting area of a villa living room', category: 'interiors' },
  { seed: 'gal-gate', alt: 'A villa gate framed by planting', category: 'grounds' },
  { seed: 'gal-surf-dawn', alt: 'Surfers heading out at dawn on the Bukit', category: 'uluwatu' },
  { seed: 'gal-pool-night', alt: 'A villa pool lit after dark', category: 'pools', tall: true },
  { seed: 'gal-breakfast', alt: 'Breakfast laid out on a villa terrace', category: 'villas' },
];

export const GALLERY: readonly GalleryImage[] = SHOTS.map((s) => ({
  url: s.tall ? img(s.seed, 1000, 1400) : img(s.seed, 1400, 1000),
  alt: s.alt,
  width: s.tall ? 1000 : 1400,
  height: s.tall ? 1400 : 1000,
  category: s.category,
}));

export const GALLERY_FILTERS: readonly { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'villas', label: 'The villas' },
  { id: 'pools', label: 'Pools' },
  { id: 'interiors', label: 'Interiors' },
  { id: 'grounds', label: 'Grounds' },
  { id: 'uluwatu', label: 'Uluwatu' },
];

/** The tall shots double their row span in the masonry layout. */
export function isTall(image: GalleryImage): boolean {
  return image.height > image.width;
}
