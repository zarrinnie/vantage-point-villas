import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';

export interface Crumb {
  label: string;
  path?: string;
}

/** The compact hero every inner page opens with: breadcrumb, eyebrow, title. */
@Component({
  selector: 'app-page-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <header class="relative isolate overflow-hidden bg-ink-900">
      <img
        [src]="image()"
        alt=""
        aria-hidden="true"
        fetchpriority="high"
        width="2400"
        height="1350"
        class="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/45 to-ink-900/65"></div>

      <div class="container-page relative flex min-h-[58vh] flex-col justify-end pt-36 pb-14 md:min-h-[62vh] md:pb-20">
        <nav aria-label="Breadcrumb" class="mb-7">
          <ol class="flex flex-wrap items-center gap-2 text-[0.65rem] tracking-[0.2em] text-sand-200/80 uppercase">
            <li>
              <a routerLink="/" class="transition-colors hover:text-white">Home</a>
            </li>
            @for (crumb of crumbs(); track crumb.label) {
              <li aria-hidden="true" class="text-sand-200/40">/</li>
              <li>
                @if (crumb.path) {
                  <a [routerLink]="crumb.path" class="transition-colors hover:text-white">{{ crumb.label }}</a>
                } @else {
                  <span class="text-white" aria-current="page">{{ crumb.label }}</span>
                }
              </li>
            }
          </ol>
        </nav>

        @if (eyebrow()) {
          <p class="eyebrow mb-5 text-clay-300">{{ eyebrow() }}</p>
        }

        <h1 class="max-w-4xl font-display text-display-sm text-sand-50 md:text-display-lg lg:text-display-xl">
          {{ title() }}
        </h1>

        @if (lede()) {
          <p class="lede mt-6 max-w-xl text-sand-200">{{ lede() }}</p>
        }

        @if (meta().length) {
          <ul class="mt-9 flex flex-wrap gap-x-8 gap-y-3">
            @for (item of meta(); track item.label) {
              <li class="flex items-center gap-2.5 text-sm text-sand-100">
                <app-icon [name]="item.icon" [size]="17" class="text-clay-300" />
                {{ item.label }}
              </li>
            }
          </ul>
        }
      </div>
    </header>
  `,
})
export class PageHeroComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('');
  readonly lede = input('');
  readonly image = input.required<string>();
  readonly crumbs = input<readonly Crumb[]>([]);
  readonly meta = input<readonly { icon: string; label: string }[]>([]);
}
