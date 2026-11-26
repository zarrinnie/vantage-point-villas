import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
import { ContentService } from '../../core/content/content.service';

/**
 * Full-bleed closing call to action, used at the foot of most pages. Any input
 * left empty falls back to Admin → Page text → Shared → Cta.
 */
@Component({
  selector: 'app-cta-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="relative isolate overflow-hidden bg-palm-900">
      <img
        [src]="shown().image"
        [alt]="''"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width="2400"
        height="1350"
        class="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-palm-900/70 via-palm-900/60 to-palm-900/85"></div>

      <div class="container-page relative py-24 text-center md:py-32">
        <p class="eyebrow justify-center text-clay-300">{{ shown().eyebrow }}</p>
        <h2 class="mt-6 font-display text-display-sm text-sand-50 md:text-display lg:text-display-lg">
          {{ shown().title }}
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-sand-200">{{ shown().lede }}</p>

        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a routerLink="/book" class="btn-solid-light">
            {{ shown().primaryButton }}
            <app-icon name="arrow-right" [size]="16" />
          </a>
          <a [href]="whatsapp()" target="_blank" rel="noopener" class="btn-glass">
            <app-icon name="whatsapp" [size]="16" />
            {{ shown().secondaryButton }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class CtaBandComponent {
  private readonly content = inject(ContentService);

  readonly eyebrow = input('');
  readonly title = input('');
  readonly lede = input('');
  readonly image = input('');

  protected readonly whatsapp = computed(() => this.content.links().whatsapp);

  protected readonly shown = computed(() => {
    const fallback = this.content.pages().shared.cta;
    return {
      ...fallback,
      eyebrow: this.eyebrow() || fallback.eyebrow,
      title: this.title() || fallback.title,
      lede: this.lede() || fallback.lede,
      image: this.image() || fallback.image,
    };
  });
}
