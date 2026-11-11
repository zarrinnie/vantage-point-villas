/** A single photograph used anywhere in the site. */
export interface GalleryImage {
  /** Full image URL. Produced by `img()` in `core/data/images.data.ts`. */
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Optional grouping used by the gallery page filters. */
  readonly category?: GalleryCategory;
}

export type GalleryCategory = 'villas' | 'pools' | 'interiors' | 'grounds' | 'uluwatu';

export interface Amenity {
  readonly id: string;
  readonly label: string;
  /** Key into the icon set in `shared/ui/icon`. */
  readonly icon: IconName;
  readonly description?: string;
}

export type IconName =
  | 'pool'
  | 'wifi'
  | 'parking'
  | 'air'
  | 'kitchen'
  | 'fridge'
  | 'tv'
  | 'sofa'
  | 'terrace'
  | 'garden'
  | 'breakfast'
  | 'car'
  | 'laundry'
  | 'bell'
  | 'clock'
  | 'family'
  | 'nosmoking'
  | 'nopets'
  | 'bed'
  | 'bath'
  | 'guests'
  | 'area'
  | 'spa'
  | 'surf'
  | 'leaf'
  | 'pin'
  | 'phone'
  | 'mail'
  | 'whatsapp';

export interface Villa {
  readonly slug: string;
  readonly name: string;
  /** One-line summary used on cards. */
  readonly tagline: string;
  /** Short paragraph for cards and listings. */
  readonly summary: string;
  /** Long-form copy for the detail page, one paragraph per entry. */
  readonly story: readonly string[];
  readonly bedrooms: number;
  readonly bathrooms: number;
  readonly maxGuests: number;
  /** e.g. "1 king bed + 1 sofa bed" */
  readonly bedConfiguration: string;
  /** Plot size in square metres (the property sits on 200–300 sqm plots). */
  readonly landSize: number;
  /** Interior size in square metres. */
  readonly livingSize: number;
  /** Indicative nightly rate in USD, before season adjustment, tax and service. */
  readonly nightlyRate: number;
  readonly amenityIds: readonly string[];
  /** Short bullet list of what makes this villa distinct. */
  readonly highlights: readonly string[];
  readonly images: readonly GalleryImage[];
  readonly isFeatured: boolean;
  /** Minimum nights accepted for this villa. */
  readonly minNights: number;
}
