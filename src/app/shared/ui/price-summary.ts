import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IconComponent } from './icon';
import { BookingService } from '../../core/services/booking.service';
import { ContentService } from '../../core/content/content.service';
import { formatLong } from '../../core/utils/date.util';
import { guestsLabel, nightsLabel, usd } from '../../core/utils/format.util';

/** The running price panel shown beside the booking flow. */
@Component({
  selector: 'app-price-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <aside class="border border-sand-300 bg-white/70" aria-label="Your booking so far">
      @if (villa(); as v) {
        <img
          [src]="v.images[0].url"
          [alt]="v.images[0].alt"
          loading="lazy"
          decoding="async"
          width="1600"
          height="1067"
          class="aspect-16/10 w-full object-cover"
        />
      }

      <div class="p-6 lg:p-7">
        <p class="eyebrow mb-4">Your stay</p>

        <h3 class="font-display text-2xl leading-snug">
          {{ villa()?.name ?? 'No villa chosen yet' }}
        </h3>

        <dl class="mt-5 space-y-2.5 text-sm">
          <div class="flex items-start gap-2.5">
            <dt class="mt-0.5 text-clay-500"><app-icon name="calendar" [size]="16" /><span class="sr-only">Dates</span></dt>
            <dd class="text-ink-700">
              @if (checkIn() && checkOut()) {
                {{ formatLong(checkIn()!) }} → {{ formatLong(checkOut()!) }}
                <span class="block text-xs text-ink-500">{{ nightsText() }}</span>
              } @else {
                <span class="text-ink-500">Dates not chosen</span>
              }
            </dd>
          </div>
          <div class="flex items-start gap-2.5">
            <dt class="mt-0.5 text-clay-500"><app-icon name="guests" [size]="16" /><span class="sr-only">Guests</span></dt>
            <dd class="text-ink-700">{{ guests() }}</dd>
          </div>
        </dl>

        @if (quote().lines.length) {
          <div class="mt-6 space-y-3 border-t border-ink-900/10 pt-6">
            @for (line of quote().lines; track line.label) {
              <div class="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p [class]="line.amount < 0 ? 'text-clay-600' : 'text-ink-700'">{{ line.label }}</p>
                  @if (line.detail) {
                    <p class="text-xs text-ink-500">{{ line.detail }}</p>
                  }
                </div>
                <p
                  class="shrink-0 tabular-nums"
                  [class]="line.amount < 0 ? 'text-clay-600' : 'text-ink-800'"
                >
                  {{ money(line.amount) }}
                </p>
              </div>
            }
          </div>

          <div class="mt-6 flex items-baseline justify-between border-t border-ink-900/10 pt-5">
            <p class="text-[0.65rem] font-medium tracking-[0.22em] text-ink-500 uppercase">
              Total
            </p>
            <p class="font-display text-3xl text-ink-900 tabular-nums">{{ money(quote().total) }}</p>
          </div>
          <p class="mt-2 text-xs text-ink-500">
            {{ money(quote().averageNightly) }} average per night, tax and service included in the total.
          </p>
        } @else {
          <p class="mt-6 border-t border-ink-900/10 pt-6 text-sm text-ink-500">
            Choose your dates and a villa to see the price.
          </p>
        }

        @if (showNote()) {
          <p class="mt-6 flex gap-2.5 bg-sand-100 p-4 text-xs leading-relaxed text-ink-600">
            <app-icon name="info" [size]="15" class="mt-px shrink-0 text-clay-500" />
            <span>{{ note() }}</span>
          </p>
        }
      </div>
    </aside>
  `,
})
export class PriceSummaryComponent {
  readonly showNote = input(true);
  private readonly content = inject(ContentService);
  protected readonly note = computed(() => this.content.pages().shared.priceSummaryNote);

  private readonly booking = inject(BookingService);

  protected readonly villa = this.booking.villa;
  protected readonly checkIn = this.booking.checkIn;
  protected readonly checkOut = this.booking.checkOut;
  protected readonly quote = this.booking.quote;

  protected readonly nightsText = computed(() => nightsLabel(this.booking.nights()));
  protected readonly guests = computed(() =>
    guestsLabel(this.booking.adults(), this.booking.children()),
  );

  protected readonly formatLong = formatLong;
  protected readonly money = usd;
}
