import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from './icon';
import { VillaCardComponent } from './villa-card';
import { Villa } from '../../core/models/villa.model';

/**
 * Horizontal, swipeable row of villa cards. Native CSS scroll-snap does the
 * work; the arrow buttons simply scroll the track by one card.
 */
@Component({
  selector: 'app-villa-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, VillaCardComponent],
  template: `
    <div class="relative">
      <ul
        #track
        class="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:gap-8 lg:px-0"
        aria-label="Villas"
        (scroll)="onScroll()"
      >
        @for (villa of villas(); track villa.slug) {
          <li
            class="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
          >
            <app-villa-card [villa]="villa" />
          </li>
        }
      </ul>

      <div class="mt-10 flex items-center justify-between gap-6">
        <div class="h-px flex-1 bg-ink-900/10">
          <div
            class="h-px bg-ink-900 transition-[width] duration-300"
            [style.width.%]="progress()"
          ></div>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex size-12 items-center justify-center rounded-full border border-ink-900/15 text-ink-800 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
            aria-label="Previous villas"
            (click)="scroll(-1)"
          >
            <app-icon name="chevron-left" [size]="18" />
          </button>
          <button
            type="button"
            class="flex size-12 items-center justify-center rounded-full border border-ink-900/15 text-ink-800 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-white"
            aria-label="Next villas"
            (click)="scroll(1)"
          >
            <app-icon name="chevron-right" [size]="18" />
          </button>
        </div>
      </div>
    </div>
  `,
})
export class VillaCarouselComponent {
  readonly villas = input.required<readonly Villa[]>();

  private readonly track = viewChild.required<ElementRef<HTMLUListElement>>('track');

  /** How far through the row the visitor has scrolled, as a width percentage. */
  protected readonly progress = signal(33);

  constructor() {
    afterNextRender(() => this.onScroll());
  }

  protected scroll(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;

    // Wrap around at either end so the arrows never feel dead.
    if (direction === 1 && atEnd) el.scrollTo({ left: 0 });
    else if (direction === -1 && atStart) el.scrollTo({ left: el.scrollWidth });
    else el.scrollBy({ left: direction * step });
  }

  protected onScroll(): void {
    const el = this.track().nativeElement;
    const visible = el.clientWidth / el.scrollWidth;
    const max = el.scrollWidth - el.clientWidth;
    const ratio = max > 0 ? el.scrollLeft / max : 1;
    this.progress.set(Math.round((visible + (1 - visible) * ratio) * 100));
  }
}
