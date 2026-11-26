import { Injectable, computed, inject } from '@angular/core';
import { Amenity, Villa } from '../models/villa.model';
import { ContentService } from '../content/content.service';

/** Read model for the villas, backed by the editable content document. */
@Injectable({ providedIn: 'root' })
export class VillaService {
  private readonly content = inject(ContentService);

  readonly villas = computed<readonly Villa[]>(() => this.content.villas());
  readonly featured = computed(() => this.villas().filter((v) => v.isFeatured));
  readonly lowestRate = computed(() => {
    const rates = this.villas().map((v) => v.nightlyRate);
    return rates.length ? Math.min(...rates) : 0;
  });

  private readonly amenityIndex = computed(
    () => new Map(this.content.amenities().map((a) => [a.id, a])),
  );

  bySlug(slug: string | null | undefined): Villa | null {
    if (!slug) return null;
    return this.villas().find((v) => v.slug === slug) ?? null;
  }

  /** Villas that sleep at least `guests` people. */
  fitsGuests(guests: number): Villa[] {
    return this.villas().filter((v) => v.maxGuests >= guests);
  }

  amenitiesFor(villa: Villa): Amenity[] {
    const index = this.amenityIndex();
    return villa.amenityIds.map((id) => index.get(id)).filter((a): a is Amenity => !!a);
  }

  /** Two other villas, for the "other villas" strip on a detail page. */
  siblingsOf(slug: string): Villa[] {
    const all = this.villas();
    const i = all.findIndex((v) => v.slug === slug);
    if (i < 0) return all.slice(0, 2);
    return [1, 2]
      .map((step) => all[(i + step) % all.length])
      .filter((v, n, list) => v.slug !== slug && list.indexOf(v) === n);
  }
}
