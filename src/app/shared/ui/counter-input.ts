import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon';

/** Minus / value / plus stepper for guest counts. */
@Component({
  selector: 'app-counter-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-ink-800">{{ label() }}</p>
        @if (hint()) {
          <p class="text-xs text-ink-500">{{ hint() }}</p>
        }
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex size-9 items-center justify-center border border-sand-300 text-ink-700 transition-colors hover:border-clay-500 hover:text-clay-600 disabled:opacity-30 disabled:hover:border-sand-300 disabled:hover:text-ink-700"
          [disabled]="value() <= min()"
          [attr.aria-label]="'Fewer ' + label().toLowerCase()"
          (click)="step(-1)"
        >
          <app-icon name="minus" [size]="15" />
        </button>

        <output
          class="w-10 text-center font-display text-xl text-ink-900"
          [attr.aria-label]="label() + ': ' + value()"
        >
          {{ value() }}
        </output>

        <button
          type="button"
          class="flex size-9 items-center justify-center border border-sand-300 text-ink-700 transition-colors hover:border-clay-500 hover:text-clay-600 disabled:opacity-30 disabled:hover:border-sand-300 disabled:hover:text-ink-700"
          [disabled]="value() >= max()"
          [attr.aria-label]="'More ' + label().toLowerCase()"
          (click)="step(1)"
        >
          <app-icon name="plus" [size]="15" />
        </button>
      </div>
    </div>
  `,
})
export class CounterInputComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly value = input.required<number>();
  readonly min = input(0);
  readonly max = input(10);
  readonly valueChange = output<number>();

  protected step(delta: number): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + delta));
    if (next !== this.value()) this.valueChange.emit(next);
  }
}
