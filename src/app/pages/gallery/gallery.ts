import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { GalleryGridComponent } from '../../shared/ui/gallery-grid';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { SeoService } from '../../core/services/seo.service';
import { GALLERY, GALLERY_FILTERS } from '../../core/data/gallery.data';
import { GalleryCategory } from '../../core/models/villa.model';
import { heroImg } from '../../core/data/images.data';

@Component({
  selector: 'app-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeroComponent, GalleryGridComponent, CtaBandComponent],
  template: `
    <app-page-hero
      eyebrow="Gallery"
      title="The property, in pictures"
      lede="The villas, the pools, the gardens, and the part of the Bukit they sit on."
      [image]="heroImage"
      [crumbs]="[{ label: 'Gallery' }]"
    />

    <section class="section bg-sand-50">
      <div class="container-page">
        <!-- Filters -->
        <div class="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-ink-900/10 pb-6">
          <ul class="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter photographs">
            @for (filter of filters; track filter.id) {
              <li>
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="active() === filter.id"
                  class="rounded-full border px-5 py-2.5 text-[0.68rem] font-medium tracking-[0.16em] uppercase transition-colors"
                  [class]="
                    active() === filter.id
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-900/15 text-ink-600 hover:border-ink-900 hover:text-ink-900'
                  "
                  (click)="active.set(filter.id)"
                >
                  {{ filter.label }}
                </button>
              </li>
            }
          </ul>
          <p class="text-sm text-ink-500" aria-live="polite">{{ images().length }} photographs</p>
        </div>

        <app-gallery-grid [images]="images()" [columns]="3" />

        <p class="mt-12 text-center text-xs text-ink-500">
          Placeholder imagery, served from a stock-photo service. The property’s own photography
          replaces it by editing a single helper in the data layer.
        </p>
      </div>
    </section>

    <app-cta-band
      eyebrow="See it properly"
      title="Photographs only get you so far"
      lede="Pick your dates and come and stand in the garden instead."
    />
  `,
})
export class GalleryPage {
  protected readonly filters = GALLERY_FILTERS;
  protected readonly active = signal<GalleryCategory | 'all'>('all');
  protected readonly heroImage = heroImg('gallery-hero');

  protected readonly images = computed(() => {
    const category = this.active();
    return category === 'all' ? GALLERY : GALLERY.filter((i) => i.category === category);
  });

  constructor() {
    inject(SeoService).set({
      title: 'Gallery',
      description:
        'Photographs of the villas, pools, gardens and grounds at Vantage Point Villas in Ungasan, Uluwatu.',
      image: this.heroImage,
    });
  }
}
