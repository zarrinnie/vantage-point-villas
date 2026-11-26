import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { VillaService } from '../../core/services/villa.service';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';
import { usd } from '../../core/utils/format.util';

type Sort = 'rate-asc' | 'rate-desc' | 'size-desc';

@Component({
  selector: 'app-villas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, PageHeroComponent, CtaBandComponent, RevealDirective],
  templateUrl: './villas.html',
})
export class VillasPage {
  private readonly villaService = inject(VillaService);
  private readonly content = inject(ContentService);
  protected readonly t = computed(() => this.content.pages().villas);

  protected readonly guests = signal(1);
  protected readonly bedrooms = signal(0);
  protected readonly sort = signal<Sort>('rate-asc');

  /** Filter options follow the largest villa, so new villas are always findable. */
  protected readonly guestOptions = computed(() => {
    const max = Math.max(1, ...this.villaService.villas().map((v) => v.maxGuests));
    return Array.from({ length: max }, (_, i) => i + 1);
  });
  protected readonly bedroomOptions = computed(() => {
    const max = Math.max(1, ...this.villaService.villas().map((v) => v.bedrooms));
    return Array.from({ length: max }, (_, i) => i + 1);
  });
  protected readonly total = computed(() => this.villaService.villas().length);
  protected readonly money = usd;

  protected readonly isFiltered = computed(
    () => this.guests() > 1 || this.bedrooms() > 0 || this.sort() !== 'rate-asc',
  );

  protected readonly results = computed(() => {
    const list = this.villaService
      .villas()
      .filter((v) => v.maxGuests >= this.guests() && v.bedrooms >= this.bedrooms());

    const sorted = [...list];
    switch (this.sort()) {
      case 'rate-desc':
        sorted.sort((a, b) => b.nightlyRate - a.nightlyRate);
        break;
      case 'size-desc':
        sorted.sort((a, b) => b.landSize - a.landSize || b.maxGuests - a.maxGuests);
        break;
      default:
        sorted.sort((a, b) => a.nightlyRate - b.nightlyRate);
    }
    return sorted;
  });

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }

  protected setGuests(event: Event): void {
    this.guests.set(Number((event.target as HTMLSelectElement).value));
  }

  protected setBedrooms(event: Event): void {
    this.bedrooms.set(Number((event.target as HTMLSelectElement).value));
  }

  protected setSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as Sort);
  }

  protected clear(): void {
    this.guests.set(1);
    this.bedrooms.set(0);
    this.sort.set('rate-asc');
  }
}
