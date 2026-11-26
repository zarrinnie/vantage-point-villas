import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon';
import { FieldComponent } from '../editor/field';
import { AdminStore } from '../admin-store.service';
import { toggleNight } from '../availability.util';
import { BlockedRange } from '../../core/content/content.model';
import {
  addMonths,
  daysInMonth,
  formatMonthYear,
  isPeakNight,
  mondayFirstWeekday,
  startOfMonth,
  today,
} from '../../core/utils/date.util';

interface DayCell {
  iso: string;
  day: number;
  past: boolean;
  closedHere: boolean;
  closedProperty: boolean;
  peak: boolean;
  note: string;
}

/** Click nights to close or reopen them, for one villa or the whole property. */
@Component({
  selector: 'admin-availability-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent, FieldComponent],
  template: `
    <div class="adm-card p-5">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label class="adm-label" for="avail-villa">Closing dates for</label>
          <select id="avail-villa" class="adm-input w-72" (change)="villa.set($any($event.target).value)">
            <option value="" [selected]="villa() === ''">Whole property (every villa)</option>
            @for (v of villas(); track v.slug) {
              <option [value]="v.slug" [selected]="villa() === v.slug">{{ v.name }}</option>
            }
          </select>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="adm-icon-btn" aria-label="Earlier months" (click)="shift(-3)">
            <app-icon name="chevron-left" [size]="16" />
          </button>
          <button type="button" class="adm-btn" (click)="start.set(thisMonth)">Today</button>
          <button type="button" class="adm-icon-btn" aria-label="Later months" (click)="shift(3)">
            <app-icon name="chevron-right" [size]="16" />
          </button>
        </div>
      </div>

      <p class="adm-help mt-3">
        Click a night to close it; click again to reopen it. Closed nights cannot be booked.
      </p>

      <div class="mt-5 grid gap-6 md:grid-cols-3">
        @for (month of months(); track month.key) {
          <div>
            <p class="mb-2 text-sm font-semibold text-ink-900">{{ month.label }}</p>
            <div class="grid grid-cols-7 gap-1 text-center text-[0.65rem] text-ink-500">
              @for (d of weekdays; track d) {
                <span>{{ d }}</span>
              }
              @for (blank of month.leading; track $index) {
                <span></span>
              }
              @for (cell of month.days; track cell.iso) {
                <button
                  type="button"
                  class="relative aspect-square rounded text-xs transition-colors"
                  [class]="cellClass(cell)"
                  [disabled]="cell.past || (cell.closedProperty && villa() !== '')"
                  [title]="cellTitle(cell)"
                  (click)="toggle(cell.iso)"
                >
                  {{ cell.day }}
                  @if (cell.peak) {
                    <span class="absolute top-0.5 right-0.5 size-1 rounded-full bg-clay-500"></span>
                  }
                </button>
              }
            </div>
          </div>
        }
      </div>

      <ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-600">
        <li class="flex items-center gap-2"><span class="size-3 rounded bg-ink-900"></span> Closed</li>
        <li class="flex items-center gap-2"><span class="size-3 rounded bg-ink-900/30"></span> Closed for the whole property</li>
        <li class="flex items-center gap-2"><span class="size-1.5 rounded-full bg-clay-500"></span> Peak season</li>
      </ul>
    </div>

    <div class="mt-8">
      <h3 class="mb-1 text-sm font-semibold text-ink-900">All closed dates</h3>
      <p class="adm-help mb-3">Longer closures are quicker to type here. Add a note so you remember why.</p>
      <admin-field [path]="['availability', 'blocked']" [bare]="true" />
    </div>
  `,
})
export class AvailabilityEditorComponent {
  private readonly store = inject(AdminStore);

  protected readonly weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  protected readonly thisMonth = startOfMonth(today());
  protected readonly start = signal(this.thisMonth);
  protected readonly villa = signal('');

  protected readonly villas = computed(() => this.store.draft()?.villas ?? []);
  private readonly rules = computed<BlockedRange[]>(() => this.store.draft()?.availability.blocked ?? []);

  protected readonly months = computed(() => {
    const draft = this.store.draft();
    const seasons = draft?.pricing.peakSeasons ?? [];
    const rules = this.rules();
    const villa = this.villa();
    const now = today();

    return [0, 1, 2].map((offset) => {
      const first = addMonths(this.start(), offset);
      const days: DayCell[] = [];
      for (let d = 1; d <= daysInMonth(first); d++) {
        const iso = `${first.slice(0, 7)}-${`${d}`.padStart(2, '0')}`;
        const here = rules.find((r) => r.villa === villa && iso >= r.start && iso <= r.end);
        const property = rules.find((r) => !r.villa && iso >= r.start && iso <= r.end);
        days.push({
          iso,
          day: d,
          past: iso < now,
          closedHere: !!here,
          closedProperty: !!property,
          peak: isPeakNight(iso, seasons),
          note: here?.note || property?.note || '',
        });
      }
      return {
        key: first,
        label: formatMonthYear(first),
        leading: Array.from({ length: mondayFirstWeekday(first) }),
        days,
      };
    });
  });

  protected shift(months: number): void {
    this.start.update((s) => addMonths(s, months));
  }

  protected toggle(iso: string): void {
    this.store.set(['availability', 'blocked'], toggleNight(this.rules(), this.villa(), iso));
  }

  protected cellClass(cell: DayCell): string {
    if (cell.past) return 'text-ink-500/40';
    if (cell.closedHere) return 'bg-ink-900 text-white hover:bg-ink-700';
    if (cell.closedProperty) return 'bg-ink-900/30 text-white';
    return 'bg-sand-100 text-ink-800 hover:bg-clay-500/20';
  }

  protected cellTitle(cell: DayCell): string {
    const state = cell.closedHere || cell.closedProperty ? 'Closed' : 'Open';
    return [cell.iso, state, cell.peak ? 'peak season' : '', cell.note].filter(Boolean).join(' · ');
  }
}
