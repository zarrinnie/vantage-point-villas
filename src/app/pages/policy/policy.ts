import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { IconComponent } from '../../shared/ui/icon';
import { SeoService } from '../../core/services/seo.service';
import { PolicyPage as PolicyContent } from '../../core/models/content.model';
import { PRIVACY_POLICY } from '../../core/data/policies.data';
import { heroImg } from '../../core/data/images.data';

/** Shared page for the privacy policy and the booking terms; content comes from route data. */
@Component({
  selector: 'app-policy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeroComponent, IconComponent],
  template: `
    <app-page-hero
      eyebrow="Information"
      [title]="policy().title"
      [lede]="policy().intro"
      [image]="heroImage"
      [crumbs]="[{ label: policy().title }]"
    />

    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1fr_2.2fr] lg:gap-20">
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">Last updated</p>
          <p class="mt-1 text-ink-800">{{ policy().updated }}</p>

          <nav class="mt-8 border-t border-ink-900/10 pt-6" aria-label="On this page">
            <ul class="space-y-3">
              @for (section of policy().sections; track section.heading) {
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

          <p class="mt-8 flex gap-3 bg-sand-100 p-5 text-xs leading-relaxed text-ink-600">
            <app-icon name="warning" [size]="15" class="mt-px shrink-0 text-clay-500" />
            <span>Placeholder wording. Have it reviewed and replaced before the site goes live.</span>
          </p>
        </aside>

        <div class="max-w-2xl">
          @for (section of policy().sections; track section.heading) {
            <section [id]="anchor(section.heading)" class="mb-12 scroll-mt-32">
              <h2 class="font-display text-2xl md:text-3xl">{{ section.heading }}</h2>
              @for (paragraph of section.body; track paragraph) {
                <p class="mt-5 leading-[1.75] text-ink-600">{{ paragraph }}</p>
              }
            </section>
          }

          <div class="rule"></div>
          <p class="mt-8 text-sm text-ink-600">
            Questions about either document? Write to us from the
            <a routerLink="/contact" class="text-ink-900 underline decoration-clay-500 underline-offset-4">
              contact page </a
            >.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class PolicyPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  private readonly data = toSignal(this.route.data.pipe(map((d) => d['policy'] as PolicyContent)), {
    initialValue: this.route.snapshot.data['policy'] as PolicyContent,
  });

  protected readonly policy = computed(() => this.data() ?? PRIVACY_POLICY);
  protected readonly heroImage = heroImg('policy-hero');

  constructor() {
    const p = this.policy();
    this.seo.set({ title: p.title, description: p.intro });
  }

  protected anchor(heading: string): string {
    return heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
