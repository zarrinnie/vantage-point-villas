import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { BookingBarComponent } from '../../shared/ui/booking-bar';
import { TestimonialsComponent } from '../../shared/ui/testimonials';
import { VillaCarouselComponent } from '../../shared/ui/villa-carousel';
import { RevealDirective } from '../../core/services/reveal.directive';
import { VillaService } from '../../core/services/villa.service';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';
import { emphasise, fill } from '../../core/content/content.util';
import { usd } from '../../core/utils/format.util';

/** In-villa amenities shown on the home page; the house rules belong to the FAQ. */
const HOUSE_RULES = ['nosmoking', 'nopets', 'family'];

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    SectionHeadingComponent,
    BookingBarComponent,
    TestimonialsComponent,
    VillaCarouselComponent,
    RevealDirective,
  ],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly villaService = inject(VillaService);
  private readonly content = inject(ContentService);

  protected readonly villas = this.villaService.villas;
  protected readonly site = this.content.site;
  protected readonly links = this.content.links;
  protected readonly t = computed(() => this.content.pages().home);

  protected readonly heroTitle = computed(() => emphasise(this.t().hero.title));
  protected readonly bookDirectNote = computed(() =>
    fill(this.t().hero.bookDirectNote, { lowestRate: usd(this.villaService.lowestRate()) }),
  );

  /** Always four tiles, even if the admin saved fewer pictures. */
  protected readonly mosaic = computed(() =>
    [0, 1, 2, 3].map((i) => this.t().gallery.mosaic[i] ?? { url: '', alt: '' }),
  );

  protected readonly experiences = computed(() => this.content.content().experiences);
  protected readonly benefits = computed(() => this.content.content().benefits);
  protected readonly nearby = computed(() => this.content.content().nearby);
  protected readonly testimonials = computed(() => this.content.content().testimonials);
  protected readonly offers = computed(() =>
    this.content.content().offers.slice(0, Math.max(0, this.t().offers.count)),
  );
  protected readonly amenities = computed(() =>
    this.content
      .amenities()
      .filter((a) => !HOUSE_RULES.includes(a.id))
      .slice(0, 12),
  );

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }
}
