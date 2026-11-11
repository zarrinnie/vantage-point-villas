import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { TestimonialsComponent } from '../../shared/ui/testimonials';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { SITE } from '../../core/data/site.data';
import { BENEFITS } from '../../core/data/benefits.data';
import { NEARBY } from '../../core/data/nearby.data';
import { TESTIMONIALS } from '../../core/data/testimonials.data';
import { heroImg, img } from '../../core/data/images.data';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PageHeroComponent,
    SectionHeadingComponent,
    IconComponent,
    CtaBandComponent,
    TestimonialsComponent,
    RevealDirective,
  ],
  template: `
    <app-page-hero
      eyebrow="About"
      title="Eight villas, looked after by hand"
      lede="Vantage Point is a small property in Ungasan, run the way small properties should be: in person, and without a lobby."
      [image]="heroImage"
      [crumbs]="[{ label: 'About' }]"
      [meta]="[
        { icon: 'pin', label: 'Jalan Toya Ning I, Ungasan' },
        { icon: 'leaf', label: 'Walled tropical gardens' },
        { icon: 'clock', label: 'Reception until 23:59' },
      ]"
    />

    <!-- ---------- Story ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
        <div appReveal>
          <app-section-heading eyebrow="Our story" title="Why Ungasan, and not the strip" />

          <div class="mt-9 space-y-6 text-[1.02rem] leading-[1.75] text-ink-600">
            <p>
              The Bukit peninsula has two characters. There is the coast road, with its cafés and
              its traffic, and there is the village behind it — lanes, warungs, temple walls, and
              gardens that have been growing for decades.
            </p>
            <p>
              Vantage Point was built on the second one. The villas sit on Jalan Toya Ning I, a
              quiet road in Ungasan, each on its own plot of 200 to 300 square metres. Every one
              has a private pool, a tropical garden, a patio, a living room and a kitchen, and
              every one is walled so that what happens inside stays inside.
            </p>
            <p>
              It means a ten-minute drive to the sand at Green Bowl and twenty to the airport, but
              it also means that at ten o'clock at night you can hear the frogs instead of the bass
              from a beach club.
            </p>
            <p class="text-ink-500 italic">
              Placeholder history — the founding year, the family behind the property and the story
              of how it was built should replace these paragraphs.
            </p>
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-7">
            <a routerLink="/villas" class="btn-outline">
              See the villas
              <app-icon name="arrow-right" [size]="15" />
            </a>
            <a routerLink="/contact" class="link-underline">Come and visit</a>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2" appReveal>
          <img
            [src]="storyImages[0]"
            alt="A stone path through the tropical garden of a villa"
            loading="lazy"
            decoding="async"
            width="1000"
            height="1400"
            class="aspect-5/7 w-full object-cover sm:mt-10"
          />
          <img
            [src]="storyImages[1]"
            alt="The open-sided living pavilion of a villa"
            loading="lazy"
            decoding="async"
            width="1000"
            height="1400"
            class="aspect-5/7 w-full object-cover"
          />
        </div>
      </div>
    </section>

    <!-- ---------- Numbers ---------- -->
    <section class="bg-palm-800 py-16 md:py-20">
      <div class="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <div class="border-l border-sand-200/20 pl-6">
            <p class="font-display text-4xl text-sand-50 md:text-5xl">{{ stat.value }}</p>
            <p class="mt-2 text-[0.62rem] tracking-[0.2em] text-clay-300 uppercase">{{ stat.label }}</p>
          </div>
        }
      </div>
    </section>

    <!-- ---------- How we work ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page">
        <app-section-heading
          eyebrow="How we work"
          title="Four things we will not compromise on"
          align="center"
        />

        <div class="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          @for (benefit of benefits; track benefit.title; let i = $index) {
            <div class="border-t border-ink-900/12 pt-7" [appReveal]="i * 90">
              <span class="flex size-11 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon [name]="benefit.icon" [size]="20" />
              </span>
              <h3 class="mt-6 font-display text-xl leading-snug">{{ benefit.title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ benefit.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ---------- The neighbourhood ---------- -->
    <section class="section bg-sand-100">
      <div class="container-page grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div appReveal>
          <app-section-heading
            eyebrow="The neighbourhood"
            title="What is within reach"
            lede="Distances as the property publishes them. A car or a scooter makes all of it easier — parking here is free."
          />

          <ul class="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            @for (place of nearby; track place.name) {
              <li class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                <div class="min-w-0">
                  <p class="text-[0.95rem] text-ink-900">
                    {{ place.name }}
                    @if (!place.verified) {
                      <span class="ml-2 text-[0.6rem] tracking-[0.15em] text-ink-500 uppercase">
                        approx.
                      </span>
                    }
                  </p>
                  <p class="text-xs text-ink-500">{{ place.detail }}</p>
                </div>
                <p class="shrink-0 text-[0.7rem] tracking-[0.12em] text-clay-600 uppercase">
                  {{ place.distance }}
                </p>
              </li>
            }
          </ul>
        </div>

        <img
          [src]="neighbourhoodImage"
          alt="The coast of the Bukit peninsula near Ungasan"
          loading="lazy"
          decoding="async"
          width="1400"
          height="1750"
          class="aspect-4/5 w-full object-cover"
          appReveal
        />
      </div>
    </section>

    <!-- ---------- The team ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page">
        <app-section-heading
          eyebrow="The team"
          title="The people who are actually here"
          lede="A small team lives this property daily — reservations, housekeeping, gardens and drivers."
          align="center"
        />

        <div class="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
          @for (member of team; track member.role; let i = $index) {
            <div class="text-center" [appReveal]="i * 90">
              <img
                [src]="member.image"
                [alt]="member.role + ' at Vantage Point Villas (placeholder portrait)'"
                loading="lazy"
                decoding="async"
                width="800"
                height="800"
                class="aspect-square w-full object-cover grayscale"
              />
              <p class="mt-5 font-display text-xl">{{ member.name }}</p>
              <p class="mt-1 text-[0.62rem] tracking-[0.2em] text-clay-600 uppercase">{{ member.role }}</p>
            </div>
          }
        </div>

        <p class="mt-10 text-center text-xs text-ink-500">
          Placeholder names and portraits — replace with the real team.
        </p>
      </div>
    </section>

    <!-- ---------- Quotes ---------- -->
    <section class="section bg-sand-100">
      <div class="container-page" appReveal>
        <app-testimonials [items]="testimonials" />
      </div>
    </section>

    <app-cta-band
      eyebrow="Visit"
      title="Come and stay in Ungasan"
      [lede]="site.intro"
    />
  `,
})
export class AboutPage {
  protected readonly site = SITE;
  protected readonly stats = SITE.stats;
  protected readonly benefits = BENEFITS;
  protected readonly nearby = NEARBY;
  protected readonly testimonials = TESTIMONIALS;

  protected readonly heroImage = heroImg('about-hero');
  protected readonly neighbourhoodImage = img('about-bukit', 1400, 1750);
  protected readonly storyImages = [img('about-path', 1000, 1400), img('about-pavilion', 1000, 1400)];

  /** PLACEHOLDER team. */
  protected readonly team = [
    { name: 'Placeholder Name', role: 'Reservations', image: img('team-1', 800, 800) },
    { name: 'Placeholder Name', role: 'Villa host', image: img('team-2', 800, 800) },
    { name: 'Placeholder Name', role: 'Grounds & pools', image: img('team-3', 800, 800) },
  ];

  constructor() {
    inject(SeoService).set({
      title: 'About',
      description:
        'Vantage Point Villas is a small property on Jalan Toya Ning I in Ungasan, Uluwatu — private pool villas on walled plots of 200–300 sqm, run in person.',
      image: this.heroImage,
    });
  }
}
