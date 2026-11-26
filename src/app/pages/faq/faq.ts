import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { AccordionComponent } from '../../shared/ui/accordion';
import { CtaBandComponent } from '../../shared/ui/cta-band';
import { IconComponent } from '../../shared/ui/icon';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';
import { fill } from '../../core/content/content.util';

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
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'FAQ' }]"
      [meta]="t().hero.meta"
    />

    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <!-- Quick facts -->
        <aside class="lg:sticky lg:top-28 lg:self-start" appReveal>
          <p class="eyebrow eyebrow-rule mb-6">{{ t().glanceTitle }}</p>
          <dl class="space-y-5 border-t border-ink-900/10 pt-6">
            @for (fact of glance(); track $index) {
              <div>
                <dt class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ fact.label }}</dt>
                <dd class="mt-1 text-ink-800">{{ fact.value }}</dd>
              </div>
            }
          </dl>

          <div class="mt-10 border border-sand-300 bg-white/60 p-6">
            <p class="font-display text-xl">{{ t().askBox.title }}</p>
            <p class="mt-2 text-sm leading-relaxed text-ink-600">
              {{ t().askBox.body }}
            </p>
            <a routerLink="/contact" class="btn-outline mt-5 w-full justify-center">
              {{ t().askBox.button }}
              <app-icon name="arrow-right" [size]="14" />
            </a>
          </div>
        </aside>

        <!-- Groups -->
        <div class="space-y-16">
          @for (group of groups(); track group.name) {
            <section appReveal>
              <h2 class="mb-7 font-display text-3xl">{{ group.name }}</h2>
              <app-accordion [items]="group.items" [initialOpen]="-1" />
            </section>
          }

          @if (t().note) {
            <p class="text-xs leading-relaxed text-ink-500">{{ t().note }}</p>
          }
        </div>
      </div>
    </section>

    <app-cta-band [eyebrow]="t().cta.eyebrow" [title]="t().cta.title" [lede]="t().cta.lede" />
  `,
})
export class FaqPage {
  private readonly content = inject(ContentService);
  protected readonly t = computed(() => this.content.pages().faq);

  protected readonly glance = computed(() => {
    const vars = { ...this.content.vars(), languages: this.content.site().languages.join(', ') };
    return this.t().glance.map((fact) => ({ ...fact, value: fill(fact.value, vars) }));
  });

  /** Groups in the admin's order; a question in an unlisted group still shows, last. */
  protected readonly groups = computed(() => {
    const { faqs, faqGroups } = this.content.content();
    const names = [...faqGroups, ...faqs.map((f) => f.group).filter((g) => !faqGroups.includes(g))];
    return [...new Set(names)]
      .map((name) => ({ name, items: faqs.filter((f) => f.group === name) }))
      .filter((group) => group.items.length > 0);
  });

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }
}
