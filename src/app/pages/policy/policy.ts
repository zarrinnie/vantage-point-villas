import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { IconComponent } from '../../shared/ui/icon';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';

export type PolicyKey = 'privacy' | 'terms';

/** Shared page for the privacy policy and the booking terms; route data says which. */
@Component({
  selector: 'app-policy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeroComponent, IconComponent],
  template: `
    <app-page-hero
      [eyebrow]="t().eyebrow"
      [title]="policy().title"
      [lede]="policy().intro"
      [image]="t().heroImage"
      [crumbs]="[{ label: policy().title }]"
    />

    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1fr_2.2fr] lg:gap-20">
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().updatedLabel }}</p>
          <p class="mt-1 text-ink-800">{{ policy().updated }}</p>

          <nav class="mt-8 border-t border-ink-900/10 pt-6" aria-label="On this page">
            <ul class="space-y-3">
              @for (section of policy().sections; track $index) {
                <li>
                  <a
                    [href]="'#' + anchor(section.heading)"
                    class="text-sm text-ink-600 transition-colors hover:text-clay-600"
                  >
                    {{ section.heading }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          @if (t().warning) {
            <p class="mt-8 flex gap-3 bg-sand-100 p-5 text-xs leading-relaxed text-ink-600">
              <app-icon name="warning" [size]="15" class="mt-px shrink-0 text-clay-500" />
              <span>{{ t().warning }}</span>
            </p>
          }
        </aside>

        <div class="max-w-2xl">
          @for (section of policy().sections; track $index) {
            <section [id]="anchor(section.heading)" class="mb-12 scroll-mt-32">
              <h2 class="font-display text-2xl md:text-3xl">{{ section.heading }}</h2>
              @for (paragraph of section.body; track $index) {
                <p class="mt-5 leading-[1.75] text-ink-600">{{ paragraph }}</p>
              }
            </section>
          }

          <div class="rule"></div>
          <p class="mt-8 text-sm text-ink-600">
            <a routerLink="/contact" class="hover:text-clay-600">{{ t().footer }}</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class PolicyPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  private readonly content = inject(ContentService);

  private readonly key = toSignal(this.route.data.pipe(map((d) => d['policy'] as PolicyKey)), {
    initialValue: this.route.snapshot.data['policy'] as PolicyKey,
  });

  protected readonly t = computed(() => this.content.pages().policy);
  protected readonly policy = computed(
    () => this.content.content().policies[this.key() === 'terms' ? 'terms' : 'privacy'],
  );

  constructor() {
    // Privacy and terms share this component, so follow the route rather than set once.
    effect(() => {
      const p = this.policy();
      this.seo.set({ title: p.title, description: p.intro });
    });
  }

  protected anchor(heading: string): string {
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
