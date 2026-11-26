import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { GalleryGridComponent } from '../../shared/ui/gallery-grid';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { SeoService } from '../../core/services/seo.service';
import { GalleryCategory } from '../../core/models/villa.model';
import { ContentService } from '../../core/content/content.service';

@Component({
  selector: 'app-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeroComponent, GalleryGridComponent, CtaBandComponent],
  template: `
    <app-page-hero
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'Gallery' }]"
      [meta]="t().hero.meta"
    />

    <section class="section bg-sand-50">
      <div class="container-page">
        <!-- Filters -->
        <div class="mb-10 flex flex-wrap items-center justify-between gap-6 border-b border-ink-900/10 pb-6">
          <ul class="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter photographs">
            @for (filter of filters(); track filter.id) {
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

        @if (t().note) {
          <p class="mt-12 text-center text-xs text-ink-500">{{ t().note }}</p>
        }
      </div>
    </section>

    <app-cta-band [eyebrow]="t().cta.eyebrow" [title]="t().cta.title" [lede]="t().cta.lede" />
  `,
})
export class GalleryPage {
  private readonly content = inject(ContentService);
  protected readonly t = computed(() => this.content.pages().gallery);

  /** "Everything", then only the categories that actually have photographs. */
  protected readonly filters = computed(() => {
    const { gallery, galleryCategories } = this.content.content();
    const used = new Set(gallery.map((i) => i.category));
    return [
      { id: 'all', label: this.t().allFilterLabel },
      ...galleryCategories.filter((c) => used.has(c.id)),
    ];
  });
  protected readonly active = signal<GalleryCategory | 'all'>('all');

  protected readonly images = computed(() => {
    const category = this.active();
    const all = this.content.content().gallery;
    return category === 'all' ? all : all.filter((i) => i.category === category);
  });

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }
}
