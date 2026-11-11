import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { SERVICES } from '../../core/data/services.data';
import { AMENITIES } from '../../core/data/amenities.data';
import { EXTRAS } from '../../core/data/extras.data';
import { SITE } from '../../core/data/site.data';
import { heroImg, img } from '../../core/data/images.data';
import { usd } from '../../core/utils/format.util';

@Component({
  selector: 'app-services',
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
      eyebrow="Services"
      title="Everything we can take off your hands"
      lede="Transfers, breakfast on the terrace, a driver for the day, a massage on your own patio. Some of it is included; the rest is arranged with a message."
      [image]="heroImage"
      [crumbs]="[{ label: 'Services' }]"
      [meta]="[
        { icon: 'car', label: 'Airport transfers around the clock' },
        { icon: 'breakfast', label: 'Breakfast in the villa' },
        { icon: 'bell', label: 'Daily housekeeping included' },
      ]"
    />

    <!-- ---------- Included as standard ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div appReveal>
          <app-section-heading
            eyebrow="No charge"
            title="Included in every villa"
            lede="This is the baseline, in all five villa types. Nothing here is an upsell."
          />
        </div>

        <ul class="grid gap-x-8 gap-y-5 sm:grid-cols-2" appReveal>
          @for (amenity of amenities; track amenity.id) {
            <li class="flex items-start gap-4 border-b border-ink-900/8 pb-5">
              <span class="mt-0.5 shrink-0 text-clay-500">
                <app-icon [name]="amenity.icon" [size]="19" />
              </span>
              <div>
                <p class="text-sm font-medium text-ink-800">{{ amenity.label }}</p>
                @if (amenity.description) {
                  <p class="mt-0.5 text-xs leading-relaxed text-ink-500">{{ amenity.description }}</p>
                }
              </div>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- ---------- The full list ---------- -->
    <section class="section bg-sand-100">
      <div class="container-page">
        <app-section-heading
          eyebrow="The full list"
          title="Services, and what they cost"
          lede="Prices are indicative placeholders. Ask reservations for the current rate card."
          align="center"
        />

        <div class="mt-16 grid gap-px bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-3">
          @for (service of services; track service.id; let i = $index) {
            <article class="flex flex-col bg-sand-100 p-7 transition-colors hover:bg-sand-50" [appReveal]="(i % 3) * 80">
              <span class="flex size-11 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon [name]="service.icon" [size]="20" />
              </span>

              <h3 class="mt-6 font-display text-xl leading-snug">{{ service.name }}</h3>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{{ service.description }}</p>

              <p class="mt-6 text-[0.7rem] font-medium tracking-[0.15em] text-clay-600 uppercase">
                {{ service.price }}
              </p>
              @if (service.notes) {
                <p class="mt-2 text-xs text-ink-500">{{ service.notes }}</p>
              }
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ---------- Add at booking ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <img
          [src]="extrasImage"
          alt="Breakfast laid out on a villa terrace beside the pool"
          loading="lazy"
          decoding="async"
          width="1400"
          height="1050"
          class="aspect-4/3 w-full object-cover"
          appReveal
        />

        <div appReveal>
          <app-section-heading
            eyebrow="At the time of booking"
            title="Add it while you book"
            lede="These four are built into the booking form — tick them in step three and they appear in the total."
          />

          <ul class="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            @for (extra of extras; track extra.id) {
              <li class="flex items-start justify-between gap-6 py-5">
                <div class="flex items-start gap-4">
                  <span class="mt-0.5 shrink-0 text-clay-500">
                    <app-icon [name]="extra.icon" [size]="18" />
                  </span>
                  <div>
                    <p class="text-[0.95rem] text-ink-900">{{ extra.label }}</p>
                    <p class="mt-1 text-xs leading-relaxed text-ink-500">{{ extra.description }}</p>
                  </div>
                </div>
                <p class="shrink-0 text-right">
                  <span class="block text-ink-900">{{ money(extra.price) }}</span>
                  <span class="block text-[0.6rem] tracking-[0.12em] text-ink-500 uppercase">
                    {{ unit(extra.pricing) }}
                  </span>
                </p>
              </li>
            }
          </ul>

          <a routerLink="/book" class="btn-primary mt-9">
            Start a booking
            <app-icon name="arrow-right" [size]="15" />
          </a>
        </div>
      </div>
    </section>

    <!-- ---------- House rules ---------- -->
    <section class="section bg-palm-900 text-sand-200">
      <div class="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div appReveal>
          <app-section-heading
            eyebrow="House rules"
            title="The short version"
            [dark]="true"
          />
        </div>

        <dl class="grid gap-x-10 gap-y-8 sm:grid-cols-2" appReveal>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Check-in</dt>
            <dd class="mt-2 text-sand-50">{{ site.checkIn }}</dd>
            <dd class="mt-1 text-xs text-sand-200/70">Express check-in is included.</dd>
          </div>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Check-out</dt>
            <dd class="mt-2 text-sand-50">{{ site.checkOut }}</dd>
            <dd class="mt-1 text-xs text-sand-200/70">Guaranteed late check-out can be added.</dd>
          </div>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Children</dt>
            <dd class="mt-2 text-sand-50">Welcome</dd>
            <dd class="mt-1 text-xs text-sand-200/70">One extra bed per villa; cot on request.</dd>
          </div>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Pets &amp; smoking</dt>
            <dd class="mt-2 text-sand-50">Neither, anywhere</dd>
            <dd class="mt-1 text-xs text-sand-200/70">The whole property is non-smoking.</dd>
          </div>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Languages</dt>
            <dd class="mt-2 text-sand-50">{{ site.languages.join(' and ') }}</dd>
          </div>
          <div>
            <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">Parking</dt>
            <dd class="mt-2 text-sand-50">Free, on site</dd>
            <dd class="mt-1 text-xs text-sand-200/70">Inside the gate, for cars and scooters.</dd>
          </div>
        </dl>
      </div>
    </section>

    <app-cta-band
      eyebrow="Arrange it"
      title="Tell us what you need"
      lede="Transfers, a cot, a driver for a day on the north coast — send it over with your booking and it will be waiting."
    />
  `,
})
export class ServicesPage {
  protected readonly site = SITE;
  protected readonly services = SERVICES;
  protected readonly extras = EXTRAS.slice(0, 4);
  protected readonly amenities = AMENITIES.filter(
    (a) => !['nosmoking', 'nopets'].includes(a.id),
  );

  protected readonly heroImage = heroImg('services-hero');
  protected readonly extrasImage = img('services-breakfast', 1400, 1050);
  protected readonly money = usd;

  constructor() {
    inject(SeoService).set({
      title: 'Services',
      description:
        'Airport transfers, breakfast in the villa, housekeeping, laundry, in-villa dining, spa treatments, cars and drivers at Vantage Point Villas, Uluwatu.',
      image: this.heroImage,
    });
  }

  protected unit(pricing: string): string {
    switch (pricing) {
      case 'per-night':
        return 'per night';
      case 'per-guest-night':
        return 'per guest, per day';
      default:
        return 'per stay';
    }
  }
}
