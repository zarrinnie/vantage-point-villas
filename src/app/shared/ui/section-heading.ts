import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Eyebrow + display heading + optional lede, used at the top of every section. */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col gap-5"
      [class.items-center]="align() === 'center'"
      [class.text-center]="align() === 'center'"
      [class.max-w-2xl]="align() === 'center'"
      [class.mx-auto]="align() === 'center'"
    >
      @if (eyebrow()) {
        <p class="eyebrow" [class.eyebrow-rule]="align() !== 'center'" [class.text-clay-300]="dark()">
          {{ eyebrow() }}
        </p>
      }
      <h2
        class="font-display text-display-sm md:text-display lg:text-display-lg"
        [class.text-sand-50]="dark()"
      >
        {{ title() }}
      </h2>
      @if (lede()) {
        <p
          class="lede max-w-xl"
          [class.text-sand-200]="dark()"
          [class.text-ink-600]="!dark()"
        >
          {{ lede() }}
        </p>
      }
    </div>
  `,
})
export class SectionHeadingComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly lede = input('');
  readonly align = input<'left' | 'center'>('left');
  readonly dark = input(false);
}
