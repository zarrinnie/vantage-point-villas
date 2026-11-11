import { Injectable, computed, signal } from '@angular/core';
import { Amenity, Villa } from '../models/villa.model';
import { VILLAS } from '../data/villas.data';
import { amenitiesByIds } from '../data/amenities.data';

/**
 * Read model for the villas. Backed by the static data file today; swapping in
 * a real API means replacing the `source` signal with an httpResource.
 */
@Injectable({ providedIn: 'root' })
export class VillaService {
  private readonly source = signal<readonly Villa[]>(VILLAS);

  readonly villas = computed(() => this.source());
  readonly featured = computed(() => this.source().filter((v) => v.isFeatured));
  readonly lowestRate = computed(() => Math.min(...this.source().map((v) => v.nightlyRate)));

  bySlug(slug: string | null | undefined): Villa | null {
    if (!slug) return null;
    return this.source().find((v) => v.slug === slug) ?? null;
  }

  /** Villas that sleep at least `guests` people. */
  fitsGuests(guests: number): Villa[] {
    return this.source().filter((v) => v.maxGuests >= guests);
  }

  amenitiesFor(villa: Villa): Amenity[] {
    return amenitiesByIds(villa.amenityIds);
  }

  /** Two other villas, for the "other villas" strip on a detail page. */
  siblingsOf(slug: string): Villa[] {
    const all = this.source();
    const i = all.findIndex((v) => v.slug === slug);
    if (i < 0) return all.slice(0, 2);
    return [all[(i + 1) % all.length], all[(i + 2) % all.length]];
  }
}
