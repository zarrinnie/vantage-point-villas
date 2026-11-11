import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from './icon';
import {
  IsoDate,
  addDays,
  addMonths,
  daysInMonth,
  formatMonthYear,
  fromIso,
  isPeakNight,
  mondayFirstWeekday,
  startOfMonth,
  today,
} from '../../core/utils/date.util';
import { isPropertyClosed, isVillaBooked } from '../../core/utils/availability.util';
import { nightsBetween } from '../../core/utils/date.util';

interface Day {
  iso: IsoDate;
  label: number;
  disabled: boolean;
  closed: boolean;
  peak: boolean;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  isToday: boolean;
}

interface MonthView {
  key: string;
  label: string;
  leading: number[];
  days: Day[];
}

export interface DateRange {
  checkIn: IsoDate | null;
  checkOut: IsoDate | null;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Two-month range calendar with no external dependency.
 *
 * Unavailable dates come from the mock availability helper: property-wide
 * closures are always disabled, and when a villa is being booked its own taken
 * nights are disabled too.
 */
@Component({
  selector: 'app-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="w-full">
      <!-- Month navigation -->
      <div class="mb-5 flex items-center justify-between">
        <button
          type="button"
          class="flex size-9 items-center justify-center border border-sand-300 text-ink-700 transition-colors hover:border-clay-500 hover:text-clay-600 disabled:opacity-25 disabled:hover:border-sand-300"
          [disabled]="!canGoBack()"
          aria-label="Previous month"
          (click)="shiftMonth(-1)"
        >
          <app-icon name="chevron-left" [size]="16" />
        </button>

        <p class="font-display text-lg text-ink-900" aria-live="polite">
          {{ months()[0].label }}
          <span class="hidden md:inline"> — {{ months()[1].label }}</span>
        </p>

        <button
          type="button"
          class="flex size-9 items-center justify-center border border-sand-300 text-ink-700 transition-colors hover:border-clay-500 hover:text-clay-600"
          aria-label="Next month"
          (click)="shiftMonth(1)"
        >
          <app-icon name="chevron-right" [size]="16" />
        </button>
      </div>

      <!-- Calendars -->
      <div class="grid gap-8 md:grid-cols-2" (keydown)="onKeydown($event)">
        @for (month of months(); track month.key; let first = $first) {
          <div [class]="first ? 'block' : 'hidden md:block'">
            <p class="mb-3 text-center text-[0.62rem] font-medium tracking-[0.25em] text-ink-500 uppercase md:hidden">
              {{ month.label }}
            </p>
            <div class="grid grid-cols-7 gap-px" role="grid" [attr.aria-label]="month.label">
              @for (day of weekdays; track day) {
                <div
                  role="columnheader"
                  class="pb-2 text-center text-[0.6rem] font-medium tracking-[0.15em] text-ink-500 uppercase"
                >
                  {{ day }}
                </div>
              }
              @for (blank of month.leading; track blank) {
                <div></div>
              }
              @for (day of month.days; track day.iso) {
                <button
                  type="button"
                  role="gridcell"
                  [attr.data-date]="day.iso"
                  [disabled]="day.disabled"
                  [attr.aria-label]="ariaLabel(day)"
                  [attr.aria-pressed]="day.isStart || day.isEnd"
                  class="relative flex aspect-square items-center justify-center text-sm transition-colors duration-200"
                  [class]="dayClass(day)"
                  (click)="pick(day)"
                  (mouseenter)="hovered.set(day.iso)"
                  (mouseleave)="hovered.set(null)"
                >
                  {{ day.label }}
                  @if (day.peak && !day.disabled) {
                    <span
                      class="absolute bottom-1 size-1 rounded-full bg-clay-500/70"
                      aria-hidden="true"
                    ></span>
                  }
                </button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Legend / summary -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-900/10 pt-5">
        <ul class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.7rem] text-ink-500">
          <li class="flex items-center gap-2">
            <span class="inline-block size-3 bg-clay-500" aria-hidden="true"></span>
            Selected
          </li>
          <li class="flex items-center gap-2">
            <span class="inline-block size-1.5 rounded-full bg-clay-500/70" aria-hidden="true"></span>
            Peak rate
          </li>
          <li class="flex items-center gap-2">
            <span class="inline-block size-3 bg-sand-200 line-through" aria-hidden="true"></span>
            Unavailable
          </li>
        </ul>

        @if (checkIn()) {
          <button type="button" class="link-underline" (click)="clear()">Clear dates</button>
        }
      </div>

      <p class="mt-4 text-sm text-ink-600" aria-live="polite">
        @if (checkIn() && checkOut()) {
          {{ nights() }} {{ nights() === 1 ? 'night' : 'nights' }} selected.
        } @else if (checkIn()) {
          Now choose your check-out date.
        } @else {
          Choose your check-in date.
        }
      </p>
    </div>
  `,
})
export class DateRangePickerComponent {
  readonly checkIn = input<IsoDate | null>(null);
  readonly checkOut = input<IsoDate | null>(null);
  /** When set, that villa's taken nights are disabled as well as closures. */
  readonly villaSlug = input<string | null>(null);
  readonly rangeChange = output<DateRange>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly hovered = signal<IsoDate | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly minDate = today();
  private readonly viewStart = signal<IsoDate>(startOfMonth(today()));

  protected readonly nights = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    return from && to ? nightsBetween(from, to) : 0;
  });

  protected readonly canGoBack = computed(() => this.viewStart() > startOfMonth(this.minDate));

  protected readonly months = computed<MonthView[]>(() =>
    [0, 1].map((offset) => this.buildMonth(addMonths(this.viewStart(), offset))),
  );

  protected shiftMonth(delta: number): void {
    const next = addMonths(this.viewStart(), delta);
    if (delta < 0 && next < startOfMonth(this.minDate)) return;
    this.viewStart.set(next);
  }

  protected pick(day: Day): void {
    if (day.disabled) return;
    const from = this.checkIn();
    const to = this.checkOut();

    if (!from || to || day.iso <= from) {
      this.rangeChange.emit({ checkIn: day.iso, checkOut: null });
      return;
    }
    this.rangeChange.emit({ checkIn: from, checkOut: day.iso });
  }

  protected clear(): void {
    this.rangeChange.emit({ checkIn: null, checkOut: null });
  }

  protected ariaLabel(day: Day): string {
    const date = fromIso(day.iso).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (day.closed) return `${date} — unavailable`;
    if (day.disabled) return `${date} — not selectable`;
    if (day.isStart) return `${date} — check-in`;
    if (day.isEnd) return `${date} — check-out`;
    return day.peak ? `${date} — peak rate` : date;
  }

  protected dayClass(day: Day): string {
    if (day.disabled) {
      return day.closed
        ? 'cursor-not-allowed bg-sand-200/70 text-ink-500/45 line-through'
        : 'cursor-not-allowed text-ink-500/35';
    }
    if (day.isStart || day.isEnd) return 'bg-clay-500 text-white font-medium';
    if (day.inRange) return 'bg-clay-500/15 text-ink-900';
    const base = 'text-ink-800 hover:bg-sand-200 cursor-pointer';
    return day.isToday ? `${base} ring-1 ring-inset ring-clay-500/50` : base;
  }

  /** Arrow-key navigation across the two visible months. */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const current = target?.dataset?.['date'];
    if (!current) return;

    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    const delta = deltas[event.key];
    if (delta === undefined) return;

    event.preventDefault();
    const next = addDays(current, delta);
    if (next < this.minDate) return;

    const lastVisible = addMonths(this.viewStart(), 2);
    if (next >= lastVisible) {
      this.shiftMonth(1);
    } else if (next < this.viewStart()) {
      this.shiftMonth(-1);
    }
    // Focus after the view has re-rendered.
    setTimeout(() => {
      this.host.nativeElement
        .querySelector<HTMLButtonElement>(`[data-date="${next}"]`)
        ?.focus();
    });
  }

  private buildMonth(monthStart: IsoDate): MonthView {
    const total = daysInMonth(monthStart);
    const from = this.checkIn();
    const to = this.checkOut();
    const hover = this.hovered();
    const villa = this.villaSlug();
    const now = today();

    // Two selection modes: choosing a check-in, or choosing a check-out for an
    // already chosen check-in. In the second mode the stay may not run past the
    // first night that is already taken.
    const selectingEnd = !!from && !to;
    const lastSelectableEnd = selectingEnd ? this.firstBlockedAfter(from!, villa) : null;

    // Hovering previews the range before the second click lands.
    const previewEnd = to ?? (from && hover && hover > from ? hover : null);

    const days: Day[] = [];
    for (let d = 1; d <= total; d++) {
      const iso = `${monthStart.slice(0, 7)}-${`${d}`.padStart(2, '0')}`;
      const taken = villa ? isVillaBooked(villa, iso) : isPropertyClosed(iso);

      let disabled: boolean;
      if (iso < now) {
        disabled = true;
      } else if (selectingEnd && iso > from!) {
        // Departure dates: every night from check-in up to the day before must
        // be free, so the range ends at the first taken night (inclusive).
        disabled = !!lastSelectableEnd && iso > lastSelectableEnd;
      } else {
        // Choosing (or re-choosing) a check-in: you cannot arrive on a taken night.
        disabled = taken;
      }

      days.push({
        iso,
        label: d,
        disabled,
        closed: taken,
        peak: isPeakNight(iso),
        isStart: iso === from,
        isEnd: iso === to,
        inRange: !!from && !!previewEnd && iso > from && iso < previewEnd,
        isToday: iso === now,
      });
    }

    return {
      key: monthStart,
      label: formatMonthYear(monthStart),
      leading: Array.from({ length: mondayFirstWeekday(monthStart) }, (_, i) => i),
      days,
    };
  }

  /** The first night at or after `from` that is already taken, if any. */
  private firstBlockedAfter(from: IsoDate, villa: string | null): IsoDate | null {
    for (let i = 1; i <= 60; i++) {
      const iso = addDays(from, i);
      const taken = villa ? isVillaBooked(villa, iso) : isPropertyClosed(iso);
      if (taken) return iso;
    }
    return null;
  }
}
