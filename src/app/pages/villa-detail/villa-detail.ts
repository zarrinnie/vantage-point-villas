import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IconComponent } from '../../shared/ui/icon';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { GalleryGridComponent } from '../../shared/ui/gallery-grid';
import { VillaCardComponent } from '../../shared/ui/villa-card';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { DateRange, DateRangePickerComponent } from '../../shared/ui/date-range-picker';
import { RevealDirective } from '../../core/services/reveal.directive';
import { VillaService } from '../../core/services/villa.service';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';
import { coverOf, fill } from '../../core/content/content.util';
import { IsoDate, nightsBetween, nightsOfStay } from '../../core/utils/date.util';
import { priceStay, taxRate } from '../../core/utils/pricing.util';
import { nightsLabel, usd } from '../../core/utils/format.util';

@Component({
  selector: 'app-villa-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    PageHeroComponent,
    SectionHeadingComponent,
    GalleryGridComponent,
    VillaCardComponent,
    CtaBandComponent,
    DateRangePickerComponent,
    RevealDirective,
  ],
  templateUrl: './villa-detail.html',
})
export class VillaDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly villaService = inject(VillaService);
  private readonly seo = inject(SeoService);
  private readonly content = inject(ContentService);

  protected readonly t = computed(() => this.content.pages().villaDetail);
  protected readonly links = this.content.links;

  private readonly slug = toSignal(this.route.paramMap.pipe(map((p) => p.get('slug'))), {
    initialValue: this.route.snapshot.paramMap.get('slug'),
  });

  protected readonly villa = computed(() => this.villaService.bySlug(this.slug()));
  protected readonly amenities = computed(() => {
    const v = this.villa();
    return v ? this.villaService.amenitiesFor(v) : [];
  });
  protected readonly siblings = computed(() => {
    const v = this.villa();
    return v ? this.villaService.siblingsOf(v.slug) : [];
  });

  protected readonly checkIn = signal<IsoDate | null>(null);
  protected readonly checkOut = signal<IsoDate | null>(null);

  protected readonly nightsText = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    return from && to ? nightsLabel(nightsBetween(from, to)) : '';
  });

  /** Same arithmetic as the booking quote, for the panel's estimate. */
  protected readonly estimate = computed(() => {
    const v = this.villa();
    const from = this.checkIn();
    const to = this.checkOut();
    if (!v || !from || !to) return 0;

    const pricing = this.content.pricing();
    const { accommodation, peakSupplement, discount } = priceStay(
      v.nightlyRate,
      nightsOfStay(from, to),
      pricing,
    );
    return (accommodation + peakSupplement + discount) * (1 + taxRate(pricing));
  });

  /** Copy with {villaName} / {peakPercent} filled in for the villa on screen. */
  protected readonly copy = computed(() => {
    const t = this.t();
    const vars = { ...this.content.vars(), villaName: this.villa()?.name ?? '' };
    return {
      rateNote: fill(t.rateNote, vars),
      galleryTitle: fill(t.gallery.title, vars),
      ctaTitle: fill(t.cta.title, vars),
    };
  });

  protected readonly money = usd;

  constructor() {
    effect(() => {
      const v = this.villa();
      if (!v) {
        this.seo.set({
          title: this.t().notFound.title,
          description: this.t().notFound.body,
        });
        return;
      }
      this.seo.set({
        title: v.name,
        description: v.summary,
        image: coverOf(v).url,
      });
    });
  }

  protected onRange(range: DateRange): void {
    this.checkIn.set(range.checkIn);
    this.checkOut.set(range.checkOut);
  }
}
