import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { AccordionComponent } from '../../shared/ui/accordion';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { IconComponent } from '../../shared/ui/icon';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { FAQS, FAQ_GROUPS } from '../../core/data/faqs.data';
import { SITE } from '../../core/data/site.data';
import { heroImg } from '../../core/data/images.data';

@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageHeroComponent,
    AccordionComponent,
    CtaBandComponent,
    IconComponent,
    RevealDirective,
  ],
  template: `
    <app-page-hero
      eyebrow="Good to know"
      title="Frequently asked"
      lede="Arrival times, minimum stays, children, pets, and how to get here from the airport."
      [image]="heroImage"
      [crumbs]="[{ label: 'FAQ' }]"
    />

    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <!-- Quick facts -->
        <aside class="lg:sticky lg:top-28 lg:self-start" appReveal>
          <p class="eyebrow eyebrow-rule mb-6">At a glance</p>
          <dl class="space-y-5 border-t border-ink-900/10 pt-6">
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Check-in</dt>
              <dd class="mt-1 text-ink-800">{{ site.checkIn }}</dd>
            </div>
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Check-out</dt>
              <dd class="mt-1 text-ink-800">{{ site.checkOut }}</dd>
            </div>
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Languages</dt>
              <dd class="mt-1 text-ink-800">{{ site.languages.join(', ') }}</dd>
            </div>
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Pets</dt>
              <dd class="mt-1 text-ink-800">Not allowed</dd>
            </div>
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Smoking</dt>
              <dd class="mt-1 text-ink-800">Nowhere on the property</dd>
            </div>
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Airport</dt>
              <dd class="mt-1 text-ink-800">5 km · about 20 minutes</dd>
            </div>
          </dl>

          <div class="mt-10 border border-sand-300 bg-white/60 p-6">
            <p class="font-display text-xl">Still unanswered?</p>
            <p class="mt-2 text-sm leading-relaxed text-ink-600">
              Reservations answer e-mail within a day, and WhatsApp faster than that.
            </p>
            <a routerLink="/contact" class="btn-outline mt-5 w-full justify-center">
              Ask us
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>
        </aside>

        <!-- Groups -->
        <div class="space-y-16">
          @for (group of groups; track group) {
            <section appReveal>
              <h2 class="mb-7 font-display text-3xl">{{ group }}</h2>
              <app-accordion [items]="itemsFor(group)" [initialOpen]="-1" />
            </section>
          }

          <p class="text-xs leading-relaxed text-ink-500">
            Deposit and cancellation answers are placeholders pending the property’s real terms;
            everything about arrival times, facilities and distances comes from its published
            listings.
          </p>
        </div>
      </div>
    </section>

    <app-cta-band
      eyebrow="Ready"
      title="Nothing left to ask"
      lede="Choose your nights and we will take it from there."
    />
  `,
})
export class FaqPage {
  protected readonly site = SITE;
  protected readonly groups = FAQ_GROUPS;
  protected readonly heroImage = heroImg('faq-hero');

  constructor() {
    inject(SeoService).set({
      title: 'Frequently asked questions',
      description:
        'Check-in and check-out times, minimum stays, children, pets, smoking, airport distance and how to book at Vantage Point Villas, Uluwatu.',
      image: this.heroImage,
    });
  }

  protected itemsFor(group: string) {
    return FAQS.filter((f) => f.group === group);
  }
}
