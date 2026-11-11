import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from './icon';
import { CounterInputComponent } from './counter-input';
import { DateRange, DateRangePickerComponent } from './date-range-picker';
import { IsoDate, formatShort, nightsBetween } from '../../core/utils/date.util';
import { guestsLabel, nightsLabel } from '../../core/utils/format.util';

/**
 * Quick availability search. It does not book anything itself — it collects a
 * stay and hands it to `/book` as query parameters.
 */
@Component({
  selector: 'app-booking-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, CounterInputComponent, DateRangePickerComponent],
  template: `
    <div class="relative">
      <form
        class="grid"
        [class]="formClass()"
        (submit)="submit($event)"
      >
        <!-- Dates -->
        <button
          type="button"
          class="flex items-center gap-3 text-left transition-colors"
          [class]="fieldClass()"
          [attr.aria-expanded]="panel() === 'dates'"
          (click)="toggle('dates')"
        >
          <app-icon name="calendar" [size]="18" class="text-clay-500" />
          <span class="min-w-0">
            <span class="block text-[0.6rem] font-medium tracking-[0.2em] text-ink-500 uppercase">
              Dates
            </span>
            <span class="block truncate text-sm text-ink-900">
              @if (checkIn() && checkOut()) {
                {{ formatShort(checkIn()!) }} – {{ formatShort(checkOut()!) }} · {{ nightsText() }}
              } @else {
                Choose your nights
              }
            </span>
          </span>
        </button>

        <!-- Guests -->
        <button
          type="button"
          class="flex items-center gap-3 text-left transition-colors"
          [class]="fieldClass()"
          [attr.aria-expanded]="panel() === 'guests'"
          (click)="toggle('guests')"
        >
          <app-icon name="guests" [size]="18" class="text-clay-500" />
          <span class="min-w-0">
            <span class="block text-[0.6rem] font-medium tracking-[0.2em] text-ink-500 uppercase">
              Guests
            </span>
            <span class="block truncate text-sm text-ink-900">{{ guestsText() }}</span>
          </span>
        </button>

        <button
          type="submit"
          class="btn-primary justify-center"
          [class]="layout() === 'stacked' ? 'mt-2 w-full py-4' : 'md:px-9'"
        >
          Check availability
          <app-icon name="arrow-right" [size]="15" />
        </button>
      </form>

      @if (panel()) {
        <div
          class="z-40 rounded-3xl border border-sand-300 bg-sand-50 p-6 md:p-7"
          [class]="
            layout() === 'stacked'
              ? 'mt-3'
              : 'absolute inset-x-0 top-full mt-2 shadow-2xl shadow-ink-900/20'
          "
        >
          @if (panel() === 'dates') {
            <app-date-range-picker
              [checkIn]="checkIn()"
              [checkOut]="checkOut()"
              (rangeChange)="onRange($event)"
            />
          } @else {
            <div class="mx-auto max-w-sm space-y-5">
              <app-counter-input
                label="Adults"
                hint="Aged 13 and over"
                [value]="adults()"
                [min]="1"
                [max]="10"
                (valueChange)="adults.set($event)"
              />
              <div class="rule"></div>
              <app-counter-input
                label="Children"
                hint="One extra bed per villa"
                [value]="children()"
                [min]="0"
                [max]="8"
                (valueChange)="children.set($event)"
              />
              <button type="button" class="btn-outline w-full justify-center" (click)="panel.set(null)">
                Done
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BookingBarComponent {
  /** Adds a drop shadow when the bar floats over imagery. */
  readonly floating = input(false);

  /** `bar`: one horizontal pill. `stacked`: fields one above the other, for forms in a column. */
  readonly layout = input<'bar' | 'stacked'>('bar');

  private readonly router = inject(Router);

  protected readonly formClass = computed(() => {
    if (this.layout() === 'stacked') return 'gap-3';
    const base =
      'gap-1 rounded-[1.75rem] border border-sand-300/70 bg-sand-50 p-1.5 md:grid-cols-[1.4fr_1fr_auto] md:rounded-full';
    return this.floating() ? `${base} shadow-2xl shadow-ink-900/20` : base;
  });

  protected readonly fieldClass = computed(() =>
    this.layout() === 'stacked'
      ? 'rounded-2xl border border-sand-300 bg-white px-5 py-4 hover:border-ink-900/40'
      : 'rounded-full px-6 py-3 hover:bg-sand-100',
  );

  protected readonly checkIn = signal<IsoDate | null>(null);
  protected readonly checkOut = signal<IsoDate | null>(null);
  protected readonly adults = signal(2);
  protected readonly children = signal(0);
  protected readonly panel = signal<'dates' | 'guests' | null>(null);

  protected readonly nightsText = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    return from && to ? nightsLabel(nightsBetween(from, to)) : '';
  });

  protected readonly guestsText = computed(() => guestsLabel(this.adults(), this.children()));

  protected readonly formatShort = formatShort;

  protected toggle(which: 'dates' | 'guests'): void {
    this.panel.update((p) => (p === which ? null : which));
  }

  protected onRange(range: DateRange): void {
    this.checkIn.set(range.checkIn);
    this.checkOut.set(range.checkOut);
    if (range.checkIn && range.checkOut) {
      this.panel.set(null);
    }
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.panel.set(null);
    const queryParams: Record<string, string> = {
      adults: `${this.adults()}`,
      children: `${this.children()}`,
    };
    if (this.checkIn()) queryParams['checkIn'] = this.checkIn()!;
    if (this.checkOut()) queryParams['checkOut'] = this.checkOut()!;
    void this.router.navigate(['/book'], { queryParams });
  }
}
