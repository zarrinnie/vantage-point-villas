import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon';

/** Horizontal progress indicator for the booking flow. */
@Component({
  selector: 'app-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <nav aria-label="Booking progress">
      <ol class="flex items-center gap-2 overflow-x-auto no-scrollbar sm:gap-3">
        @for (label of labels(); track label; let i = $index) {
          <li class="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              class="flex items-center gap-2.5 whitespace-nowrap text-[0.65rem] font-medium tracking-[0.18em] uppercase transition-colors"
              [class]="done(i) || active(i) ? 'text-ink-900' : 'text-ink-500/70'"
              [disabled]="!done(i) && !active(i)"
              [attr.aria-current]="active(i) ? 'step' : null"
              (click)="done(i) && stepSelect.emit(i + 1)"
            >
              <span
                class="flex size-7 items-center justify-center rounded-full border text-[0.7rem]"
                [class]="
                  active(i)
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : done(i)
                      ? 'border-clay-500 text-clay-600'
                      : 'border-sand-300 text-ink-500/70'
                "
              >
                @if (done(i)) {
                  <app-icon name="check" [size]="13" />
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="hidden sm:inline">{{ label }}</span>
            </button>

            @if (i < labels().length - 1) {
              <span
                class="h-px w-5 shrink-0 sm:w-10"
                [class]="done(i) ? 'bg-clay-500/60' : 'bg-sand-300'"
                aria-hidden="true"
              ></span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class StepperComponent {
  readonly labels = input.required<readonly string[]>();
  /** 1-based. */
  readonly current = input.required<number>();
  readonly stepSelect = output<number>();

  protected active(i: number): boolean {
    return this.current() === i + 1;
  }

  protected done(i: number): boolean {
    return this.current() > i + 1;
  }
}
