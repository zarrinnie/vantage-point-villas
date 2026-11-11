import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IconComponent } from './icon';
import { Testimonial } from '../../core/models/content.model';

/** Quote carousel. One quote at a time, with dots and arrows. */
@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="relative mx-auto max-w-3xl text-center">
      <span class="mx-auto mb-8 flex justify-center text-clay-400" aria-hidden="true">
        <app-icon name="quote" [size]="34" />
      </span>

      <blockquote aria-live="polite">
        <p class="font-display text-2xl leading-[1.45] text-ink-900 md:text-[2rem] md:leading-[1.4]">
          “{{ current().quote }}”
        </p>
        <footer class="mt-8 text-[0.7rem] tracking-[0.2em] text-ink-500 uppercase">
          {{ current().author }} · {{ current().origin }}
          <span class="mt-1.5 block text-clay-600 normal-case tracking-normal">
            {{ current().stay }}
          </span>
        </footer>
      </blockquote>

      <div class="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          class="flex size-11 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
          aria-label="Previous quote"
          (click)="step(-1)"
        >
          <app-icon name="chevron-left" [size]="16" />
        </button>

        <ul class="flex items-center gap-2.5">
          @for (item of items(); track item.quote; let i = $index) {
            <li>
              <button
                type="button"
                class="block size-2 rounded-full transition-colors"
                [class]="i === index() ? 'bg-clay-500' : 'bg-ink-900/20 hover:bg-ink-900/40'"
                [attr.aria-label]="'Quote ' + (i + 1)"
                [attr.aria-current]="i === index() ? 'true' : null"
                (click)="index.set(i)"
              ></button>
            </li>
          }
        </ul>

        <button
          type="button"
          class="flex size-11 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
          aria-label="Next quote"
          (click)="step(1)"
        >
          <app-icon name="chevron-right" [size]="16" />
        </button>
      </div>
    </div>
  `,
})
export class TestimonialsComponent {
  readonly items = input.required<readonly Testimonial[]>();

  protected readonly index = signal(0);
  protected readonly current = computed(() => this.items()[this.index()] ?? this.items()[0]);

  protected step(delta: number): void {
    const total = this.items().length;
    this.index.update((i) => (i + delta + total) % total);
  }
}
