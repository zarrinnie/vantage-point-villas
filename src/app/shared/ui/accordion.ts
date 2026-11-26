import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IconComponent } from './icon';

export interface AccordionItem {
  readonly question: string;
  readonly answer: string;
}

/** Deterministic ids: a shared counter keeps server and client output aligned. */
let instanceCount = 0;

/** Keyboard-accessible single-open accordion, used for the FAQ. */
@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="divide-y divide-ink-900/10 border-y border-ink-900/10">
      @for (item of items(); track $index; let i = $index) {
        <div>
          <h3>
            <button
              type="button"
              class="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-clay-600"
              [attr.aria-expanded]="isOpen(i)"
              [attr.aria-controls]="panelId(i)"
              [id]="buttonId(i)"
              (click)="toggle(i)"
            >
              <span class="font-display text-xl leading-snug md:text-[1.4rem]">{{ item.question }}</span>
              <span
                class="mt-1 shrink-0 text-clay-500 transition-transform duration-500 ease-editorial"
                [class.rotate-180]="isOpen(i)"
              >
                <app-icon name="chevron-down" [size]="18" />
              </span>
            </button>
          </h3>
          <div
            [id]="panelId(i)"
            role="region"
            [attr.aria-labelledby]="buttonId(i)"
            [hidden]="!isOpen(i)"
          >
            <p class="max-w-2xl pb-7 text-[0.95rem] leading-relaxed text-ink-600">{{ item.answer }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccordionComponent {
  readonly items = input.required<readonly AccordionItem[]>();
  /** Index open on first render; -1 for all closed. */
  readonly initialOpen = input(0);

  private readonly openIndex = signal<number | null>(null);
  private readonly resolved = computed(() =>
    this.openIndex() === null ? this.initialOpen() : this.openIndex(),
  );

  private readonly uid = `acc-${++instanceCount}`;

  protected isOpen(i: number): boolean {
    return this.resolved() === i;
  }

  protected toggle(i: number): void {
    this.openIndex.set(this.resolved() === i ? -1 : i);
  }

  protected buttonId(i: number): string {
    return `${this.uid}-btn-${i}`;
  }

  protected panelId(i: number): string {
    return `${this.uid}-panel-${i}`;
  }
}
