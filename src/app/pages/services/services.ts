import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';
import { fill } from '../../core/content/content.util';
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
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'Services' }]"
      [meta]="t().hero.meta"
    />

    <!-- ---------- Included as standard ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div appReveal>
          <app-section-heading
            [eyebrow]="t().included.eyebrow"
            [title]="t().included.title"
            [lede]="t().included.lede"
          />
        </div>

        <ul class="grid gap-x-8 gap-y-5 sm:grid-cols-2" appReveal>
          @for (amenity of amenities(); track amenity.id) {
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
          [eyebrow]="t().list.eyebrow"
          [title]="t().list.title"
          [lede]="t().list.lede"
          align="center"
        />

        <div class="mt-16 grid gap-px bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-3">
          @for (service of services(); track service.id; let i = $index) {
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
          [src]="t().extras.image"
          [alt]="t().extras.imageAlt"
          loading="lazy"
          decoding="async"
          width="1400"
          height="1050"
          class="aspect-4/3 w-full object-cover"
          appReveal
        />

        <div appReveal>
          <app-section-heading
            [eyebrow]="t().extras.eyebrow"
            [title]="t().extras.title"
            [lede]="t().extras.lede"
          />

          <ul class="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            @for (extra of extras(); track extra.id) {
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
            {{ t().extras.button }}
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
            [eyebrow]="t().rules.eyebrow"
            [title]="t().rules.title"
            [dark]="true"
          />
        </div>

        <dl class="grid gap-x-10 gap-y-8 sm:grid-cols-2" appReveal>
          @for (rule of rules(); track $index) {
            <div>
              <dt class="text-[0.6rem] tracking-[0.2em] text-clay-300 uppercase">{{ rule.label }}</dt>
              <dd class="mt-2 text-sand-50">{{ rule.value }}</dd>
              @if (rule.note) {
                <dd class="mt-1 text-xs text-sand-200/70">{{ rule.note }}</dd>
              }
            </div>
          }
        </dl>
      </div>
    </section>

    <app-cta-band [eyebrow]="t().cta.eyebrow" [title]="t().cta.title" [lede]="t().cta.lede" />
  `,
})
export class ServicesPage {
  private readonly content = inject(ContentService);
  protected readonly t = computed(() => this.content.pages().services);

  protected readonly services = computed(() => this.content.content().services);
  protected readonly extras = computed(() =>
    this.content.extras().slice(0, Math.max(0, this.t().extras.count)),
  );
  protected readonly amenities = computed(() =>
    this.content.amenities().filter((a) => !['nosmoking', 'nopets'].includes(a.id)),
  );
  protected readonly rules = computed(() => {
    const vars = this.content.vars();
    return this.t().rules.items.map((item) => ({ ...item, value: fill(item.value, vars) }));
  });

  protected readonly money = usd;

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
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
