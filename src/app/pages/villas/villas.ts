import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { VillaService } from '../../core/services/villa.service';
import { SeoService } from '../../core/services/seo.service';
import { heroImg } from '../../core/data/images.data';
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

  protected readonly guests = signal(1);
  protected readonly bedrooms = signal(0);
  protected readonly sort = signal<Sort>('rate-asc');

  protected readonly guestOptions = [1, 2, 3, 4, 5, 6, 7];
  protected readonly bedroomOptions = [1, 2, 3];
  protected readonly total = this.villaService.villas().length;
  protected readonly heroImage = heroImg('villas-hero');
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
    inject(SeoService).set({
      title: 'The Villas',
      description:
        'Five private pool villas in Ungasan, Uluwatu — from a studio with a plunge pool to a three-bedroom house sleeping seven. Plots of 200–300 sqm, each with its own garden.',
      image: this.heroImage,
    });
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
