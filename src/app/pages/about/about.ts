import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { TestimonialsComponent } from '../../shared/ui/testimonials';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';

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
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'About' }]"
      [meta]="t().hero.meta"
    />

    <!-- ---------- Story ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
        <div appReveal>
          <app-section-heading [eyebrow]="t().story.eyebrow" [title]="t().story.title" />

          <div class="mt-9 space-y-6 text-[1.02rem] leading-[1.75] text-ink-600">
            @for (paragraph of t().story.paragraphs; track $index) {
              <p>{{ paragraph }}</p>
            }
            @if (t().story.note) {
              <p class="text-ink-500 italic">{{ t().story.note }}</p>
            }
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-7">
            <a routerLink="/villas" class="btn-outline">
              {{ t().story.primaryButton }}
              <app-icon name="arrow-right" [size]="15" />
            </a>
            <a routerLink="/contact" class="link-underline">{{ t().story.secondaryLink }}</a>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2" appReveal>
          @for (picture of t().story.images.slice(0, 2); track $index; let first = $first) {
            <img
              [src]="picture.url"
              [alt]="picture.alt"
              loading="lazy"
              decoding="async"
              width="1000"
              height="1400"
              [class]="first ? 'aspect-5/7 w-full object-cover sm:mt-10' : 'aspect-5/7 w-full object-cover'"
            />
          }
        </div>
      </div>
    </section>

    <!-- ---------- Numbers ---------- -->
    <section class="bg-palm-800 py-16 md:py-20">
      <div class="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of content.site().stats; track $index) {
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
          [eyebrow]="t().values.eyebrow"
          [title]="t().values.title"
          align="center"
        />

        <div class="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          @for (benefit of all().benefits; track $index; let i = $index) {
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
            [eyebrow]="t().neighbourhood.eyebrow"
            [title]="t().neighbourhood.title"
            [lede]="t().neighbourhood.lede"
          />

          <ul class="mt-10 divide-y divide-ink-900/10 border-y border-ink-900/10">
            @for (place of all().nearby; track $index) {
              <li class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                <div class="min-w-0">
                  <p class="text-[0.95rem] text-ink-900">
                    {{ place.name }}
                    @if (!place.verified) {
                      <span class="ml-2 text-[0.6rem] tracking-[0.15em] text-ink-500 uppercase">
                        {{ t().neighbourhood.approxLabel }}
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
          [src]="t().neighbourhood.image"
          [alt]="t().neighbourhood.imageAlt"
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
          [eyebrow]="t().team.eyebrow"
          [title]="t().team.title"
          [lede]="t().team.lede"
          align="center"
        />

        <div class="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
          @for (member of t().team.members; track $index; let i = $index) {
            <div class="text-center" [appReveal]="i * 90">
              <img
                [src]="member.image"
                [alt]="member.name + ', ' + member.role"
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

        @if (t().team.note) {
          <p class="mt-10 text-center text-xs text-ink-500">{{ t().team.note }}</p>
        }
      </div>
    </section>

    <!-- ---------- Quotes ---------- -->
    <section class="section bg-sand-100">
      <div class="container-page" appReveal>
        <app-testimonials [items]="all().testimonials" />
      </div>
    </section>

    <app-cta-band
      [eyebrow]="t().cta.eyebrow"
      [title]="t().cta.title"
      [lede]="t().cta.lede || content.site().intro"
    />
  `,
})
export class AboutPage {
  protected readonly content = inject(ContentService);
  protected readonly all = this.content.content;
  protected readonly t = computed(() => this.content.pages().about);

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }
}
