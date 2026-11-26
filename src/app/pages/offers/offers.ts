import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { VillaService } from '../../core/services/villa.service';
import { ContentService } from '../../core/content/content.service';
import { fill } from '../../core/content/content.util';
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
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'Offers' }]"
      [meta]="heroMeta()"
    />

    <!-- ---------- Offers ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page space-y-20 md:space-y-28">
        @for (offer of offers(); track offer.slug; let odd = $odd) {
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
                @for (inclusion of offer.inclusions; track $index) {
                  <li class="flex items-start gap-3 text-sm text-ink-700">
                    <span class="mt-0.5 shrink-0 text-clay-500"><app-icon name="check" [size]="15" /></span>
                    {{ inclusion }}
                  </li>
                }
              </ul>

              <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-ink-900/10 pt-6">
                <div>
                  <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().minStayLabel }}</dt>
                  <dd class="mt-1 text-ink-800">{{ offer.minNights }} nights</dd>
                </div>
                <div>
                  <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().validLabel }}</dt>
                  <dd class="mt-1 text-ink-800">{{ offer.validity }}</dd>
                </div>
              </dl>

              <div class="mt-9 flex flex-wrap items-center gap-5">
                <a routerLink="/book" class="btn-primary">
                  {{ t().availabilityButton }}
                  <app-icon name="arrow-right" [size]="15" />
                </a>
                <a routerLink="/contact" class="link-underline">{{ t().askLink }}</a>
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
          [eyebrow]="t().rate.eyebrow"
          [title]="t().rate.title"
          [lede]="t().rate.lede"
          align="center"
        />

        <ol class="mx-auto mt-16 grid max-w-5xl gap-px bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of rateSteps(); track $index; let i = $index) {
            <li class="bg-sand-100 p-7">
              <p class="font-display text-4xl text-clay-500">{{ i + 1 }}</p>
              <h3 class="mt-4 font-display text-lg leading-snug">{{ step.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink-600">{{ step.body }}</p>
            </li>
          }
        </ol>

        @if (rateNote()) {
          <p class="mt-10 text-center text-xs leading-relaxed text-ink-500">{{ rateNote() }}</p>
        }
      </div>
    </section>

    <app-cta-band [eyebrow]="t().cta.eyebrow" [title]="t().cta.title" [lede]="t().cta.lede" />
  `,
})
export class OffersPage {
  private readonly content = inject(ContentService);
  private readonly villaService = inject(VillaService);

  protected readonly t = computed(() => this.content.pages().offers);
  protected readonly offers = computed(() => this.content.content().offers);

  private readonly vars = computed(() => ({
    ...this.content.vars(),
    lowestRate: usd(this.villaService.lowestRate()),
  }));

  protected readonly heroMeta = computed(() =>
    this.t().hero.meta.map((m) => ({ ...m, label: fill(m.label, this.vars()) })),
  );
  protected readonly rateSteps = computed(() =>
    this.t().rate.steps.map((step) => ({ ...step, body: fill(step.body, this.vars()) })),
  );
  protected readonly rateNote = computed(() => fill(this.t().rate.note, this.vars()));

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }
}
