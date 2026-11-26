import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
import { Villa } from '../../core/models/villa.model';
import { usd } from '../../core/utils/format.util';
import { ContentService } from '../../core/content/content.service';
import { coverOf } from '../../core/content/content.util';

@Component({
  selector: 'app-villa-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <article class="group flex h-full flex-col">
      <a
        [routerLink]="['/villas', villa().slug]"
        class="relative block overflow-hidden bg-sand-200"
        [attr.aria-label]="'View ' + villa().name"
      >
        <img
          [src]="cover().url"
          [alt]="cover().alt"
          loading="lazy"
          decoding="async"
          [attr.width]="cover().width"
          [attr.height]="cover().height"
          class="aspect-4/3 w-full object-cover transition-transform duration-[1.4s] ease-editorial group-hover:scale-[1.06]"
        />
        <div
          class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-900/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        ></div>
        @if (villa().isFeatured) {
          <span
            class="absolute top-4 left-4 rounded-full bg-sand-50/95 px-3.5 py-1.5 text-[0.6rem] font-medium tracking-[0.22em] text-ink-800 uppercase"
          >
            {{ copy().featuredBadge }}
          </span>
        }
      </a>

      <div class="flex flex-1 flex-col pt-6">
        <div class="flex items-baseline justify-between gap-4">
          <h3 class="font-display text-[1.75rem] leading-tight md:text-[2rem]">
            <a [routerLink]="['/villas', villa().slug]" class="transition-colors hover:text-clay-600">
              {{ villa().name }}
            </a>
          </h3>
          <p class="shrink-0 text-right">
            <span class="block text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">from</span>
            <span class="font-display text-xl text-ink-900">{{ rate() }}</span>
          </p>
        </div>

        <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ villa().summary }}</p>

        <ul class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] tracking-wide text-ink-500">
          <li class="flex items-center gap-1.5">
            <app-icon name="guests" [size]="15" />
            sleeps {{ villa().maxGuests }}
          </li>
          <li class="flex items-center gap-1.5">
            <app-icon name="bed" [size]="15" />
            {{ villa().bedrooms }} {{ villa().bedrooms === 1 ? 'bedroom' : 'bedrooms' }}
          </li>
          <li class="flex items-center gap-1.5">
            <app-icon name="pool" [size]="15" />
            private pool
          </li>
          <li class="flex items-center gap-1.5">
            <app-icon name="area" [size]="15" />
            {{ villa().landSize }} sqm
          </li>
        </ul>

        <div class="mt-7 flex items-center gap-6 pt-1">
          <a [routerLink]="['/villas', villa().slug]" class="link-underline">
            {{ copy().viewButton }}
            <app-icon name="arrow-right" [size]="14" />
          </a>
          <a
            [routerLink]="'/book'"
            [queryParams]="{ villa: villa().slug }"
            class="btn-outline ml-auto px-5 py-2.5 text-[0.65rem]"
          >
            {{ copy().bookButton }}
          </a>
        </div>
      </div>
    </article>
  `,
})
export class VillaCardComponent {
  readonly villa = input.required<Villa>();

  private readonly content = inject(ContentService);
  protected readonly copy = computed(() => this.content.pages().shared.villaCard);
  protected readonly cover = computed(() => coverOf(this.villa()));
  protected readonly rate = computed(() => `${usd(this.villa().nightlyRate)} / night`);
}
