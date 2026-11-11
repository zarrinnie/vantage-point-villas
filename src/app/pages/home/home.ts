import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { BookingBarComponent } from '../../shared/ui/booking-bar';
import { TestimonialsComponent } from '../../shared/ui/testimonials';
import { VillaCarouselComponent } from '../../shared/ui/villa-carousel';
import { RevealDirective } from '../../core/services/reveal.directive';
import { VillaService } from '../../core/services/villa.service';
import { SeoService } from '../../core/services/seo.service';
import { SITE } from '../../core/data/site.data';
import { AMENITIES } from '../../core/data/amenities.data';
import { BENEFITS } from '../../core/data/benefits.data';
import { NEARBY } from '../../core/data/nearby.data';
import { OFFERS } from '../../core/data/offers.data';
import { TESTIMONIALS } from '../../core/data/testimonials.data';
import { EXPERIENCES } from '../../core/data/experiences.data';
import { GALLERY } from '../../core/data/gallery.data';
import { heroImg, img } from '../../core/data/images.data';
import { usd } from '../../core/utils/format.util';

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

  protected readonly villas = this.villaService.villas;
  protected readonly lowestRate = this.villaService.lowestRate();

  protected readonly site = SITE;
  protected readonly stats = SITE.stats;
  protected readonly whatsapp = SITE.whatsappHref;
  protected readonly mapsHref =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(SITE.mapQuery);
  protected readonly experiences = EXPERIENCES;
  /** Pool (tall), pavilion, kitchen (tall), terrace dinner — the logo tile sits between them. */
  protected readonly mosaic = [GALLERY[0], GALLERY[1], GALLERY[5], GALLERY[6]];
  protected readonly benefits = BENEFITS;
  protected readonly nearby = NEARBY;
  protected readonly testimonials = TESTIMONIALS;
  protected readonly offers = OFFERS.slice(0, 2);

  /** The twelve in-villa amenities, leaving the house rules for the FAQ. */
  protected readonly amenities = AMENITIES.filter(
    (a) => !['nosmoking', 'nopets', 'family'].includes(a.id),
  ).slice(0, 12);

  protected readonly heroImage = heroImg('hero-main');
  protected readonly leisureImage = img('leisure-dusk', 1400, 1600);

  protected readonly money = usd;

  constructor() {
    inject(SeoService).set({
      title: 'Vantage Point Villas — Private Pool Villas in Uluwatu, Bali',
      description:
        'Eight private pool villas in Ungasan, the quiet heart of Uluwatu. Walled tropical gardens, full kitchens, and the Bukit beaches ten minutes away.',
      image: this.heroImage,
    });
  }
}
