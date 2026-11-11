import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { OFFERS } from '../../core/data/offers.data';
import { SITE } from '../../core/data/site.data';
import { VillaService } from '../../core/services/villa.service';
import { heroImg } from '../../core/data/images.data';
import { usd } from '../../core/utils/format.util';

@Component({
  selector: 'app-offers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageHeroComponent,
    SectionHeadingComponent,
    IconComponent,
    CtaBandComponent,
    RevealDirective,
  ],
  template: `
    <app-page-hero
      eyebrow="Offers & packages"
      title="Better rates for longer stays"
      lede="Four packages, all of them bookable direct. The long-stay reduction is built into the booking form and applies automatically."
      [image]="heroImage"
      [crumbs]="[{ label: 'Offers' }]"
      [meta]="[
        { icon: 'sparkle', label: 'From ' + money(lowestRate) + ' a night' },
        { icon: 'leaf', label: 'No platform commission' },
      ]"
    />

    <!-- ---------- Offers ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page space-y-20 md:space-y-28">
        @for (offer of offers; track offer.slug; let odd = $odd) {
          <article class="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16" appReveal>
            <div [class]="odd ? 'lg:order-2' : ''">
              <div class="relative overflow-hidden bg-sand-200">
                <img
                  [src]="offer.image"
                  [alt]="offer.name"
                  loading="lazy"
                  decoding="async"
                  width="1200"
                  height="900"
                  class="aspect-4/3 w-full object-cover"
                />
                <span
                  class="absolute top-5 left-5 bg-clay-500 px-4 py-2 text-[0.62rem] font-medium tracking-[0.2em] text-white uppercase"
                >
                  {{ offer.badge }}
                </span>
              </div>
            </div>

            <div [class]="odd ? 'lg:order-1' : ''">
              <p class="eyebrow eyebrow-rule mb-5">{{ offer.kicker }}</p>
              <h2 class="font-display text-display-sm leading-[1.1] md:text-[2.9rem]">{{ offer.name }}</h2>
              <p class="mt-6 max-w-xl leading-relaxed text-ink-600">{{ offer.description }}</p>

              <ul class="mt-8 space-y-3">
                @for (inclusion of offer.inclusions; track inclusion) {
                  <li class="flex items-start gap-3 text-sm text-ink-700">
                    <span class="mt-0.5 shrink-0 text-clay-500"><app-icon name="check" [size]="15" /></span>
                    {{ inclusion }}
                  </li>
                }
              </ul>

              <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-ink-900/10 pt-6">
                <div>
                  <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Minimum stay</dt>
                  <dd class="mt-1 text-ink-800">{{ offer.minNights }} nights</dd>
                </div>
                <div>
                  <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Valid</dt>
                  <dd class="mt-1 text-ink-800">{{ offer.validity }}</dd>
                </div>
              </dl>

              <div class="mt-9 flex flex-wrap items-center gap-5">
                <a routerLink="/book" class="btn-primary">
                  Check availability
                  <app-icon name="arrow-right" [size]="15" />
                </a>
                <a routerLink="/contact" class="link-underline">Ask about this offer</a>
              </div>
            </div>
          </article>
        }
      </div>
    </section>

    <!-- ---------- How the rate works ---------- -->
    <section class="section bg-sand-100">
      <div class="container-page">
        <app-section-heading
          eyebrow="How the rate is built"
          title="No surprises at the end"
          lede="Exactly what the booking form does with your dates, in the order it does it."
          align="center"
        />

        <ol class="mx-auto mt-16 grid max-w-5xl gap-px bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of rateSteps; track step.title; let i = $index) {
            <li class="bg-sand-100 p-7">
              <p class="font-display text-4xl text-clay-500">{{ i + 1 }}</p>
              <h3 class="mt-4 font-display text-lg leading-snug">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ step.body }}</p>
            </li>
          }
        </ol>

        <p class="mt-10 text-center text-xs leading-relaxed text-ink-500">
          Placeholder terms. Rates, reductions and the {{ taxPercent }}% tax and service figure
          should be confirmed against the property’s own rate card before publishing.
        </p>
      </div>
    </section>

    <app-cta-band
      eyebrow="Direct only"
      title="These rates are not on the platforms"
      lede="Book here and the commission stays out of the price. We hold your rate once it is confirmed."
    />
  `,
})
export class OffersPage {
  protected readonly offers = OFFERS;
  protected readonly heroImage = heroImg('offers-hero');
  protected readonly lowestRate = inject(VillaService).lowestRate();
  protected readonly taxPercent = Math.round(SITE.taxRate * 100);
  protected readonly money = usd;

  protected readonly rateSteps = [
    {
      title: 'The villa rate',
      body: 'Your villa’s nightly rate, multiplied by the number of nights in the stay.',
    },
    {
      title: 'Peak nights',
      body: 'Nights in July, August and 20 December to 5 January carry a 25% supplement — only those nights, not the whole stay.',
    },
    {
      title: 'Long-stay reduction',
      body: '15% comes off from seven nights, 20% from fourteen. It is applied automatically.',
    },
    {
      title: 'Tax & service',
      body: `Government tax and service of ${Math.round(SITE.taxRate * 100)}% is added last, and is shown as its own line in your quote.`,
    },
  ];

  constructor() {
    inject(SeoService).set({
      title: 'Offers & packages',
      description:
        'Long-stay reductions, early-bird rates, honeymoon inclusions and a Bukit surf week at Vantage Point Villas — all bookable direct.',
      image: this.heroImage,
    });
  }
}
