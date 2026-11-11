import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon';
import { SeoService } from '../../core/services/seo.service';
import { heroImg } from '../../core/data/images.data';
import { MAIN_NAV } from '../../core/data/site.data';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="relative isolate flex min-h-svh items-center overflow-hidden bg-ink-900">
      <img
        [src]="image"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 size-full object-cover opacity-40"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/55 to-ink-900/70"></div>

      <div class="container-page relative py-28 text-center">
        <p class="eyebrow justify-center text-clay-300">Error 404</p>

        <h1 class="mx-auto mt-7 max-w-2xl font-display text-display-sm text-sand-50 md:text-display lg:text-display-lg">
          This path does not lead anywhere
        </h1>

        <p class="mx-auto mt-6 max-w-lg leading-relaxed text-sand-200">
          The page you asked for is not here. Easily done — the lanes in Ungasan are much the same.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a routerLink="/" class="btn-solid-light">
            Back to the start
            <app-icon name="arrow-right" [size]="15" />
          </a>
          <a routerLink="/villas" class="btn-glass">See the villas</a>
        </div>

        <nav class="mt-16" aria-label="Site sections">
          <ul class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            @for (item of nav; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  class="text-[0.65rem] font-medium tracking-[0.2em] text-sand-200/80 uppercase transition-colors hover:text-white"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  protected readonly nav = MAIN_NAV;
  protected readonly image = heroImg('not-found');

  constructor() {
    inject(SeoService).set({
      title: 'Page not found',
      description: 'That page does not exist. Find the villas, offers and contact details instead.',
    });
  }
}
