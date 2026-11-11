import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from './icon';
import { GalleryImage } from '../../core/models/villa.model';

/**
 * Photo grid with a built-in lightbox.
 *
 * The lightbox traps focus, closes on Escape or a backdrop click, and steps
 * through images with the arrow keys.
 */
@Component({
  selector: 'app-gallery-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <ul [class]="gridClass()">
      @for (image of images(); track image.url; let i = $index) {
        <li [class]="tall(image) && masonry() ? 'row-span-2' : ''">
          <button
            type="button"
            class="group relative block h-full w-full overflow-hidden bg-sand-200"
            (click)="open(i)"
          >
            <img
              [src]="image.url"
              [alt]="image.alt"
              loading="lazy"
              decoding="async"
              [attr.width]="image.width"
              [attr.height]="image.height"
              class="h-full w-full object-cover transition-transform duration-[1.4s] ease-editorial group-hover:scale-[1.05]"
            />
            <span
              class="absolute inset-0 flex items-end bg-gradient-to-t from-ink-900/65 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            >
              <span class="text-left text-xs leading-snug text-white">{{ image.alt }}</span>
            </span>
          </button>
        </li>
      }
    </ul>

    @if (activeIndex() !== null) {
      <div
        class="fixed inset-0 z-[90] flex flex-col bg-ink-900/96 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        (keydown)="onKeydown($event)"
      >
        <div class="flex items-center justify-between px-5 py-5 text-sand-200 md:px-8">
          <p class="text-[0.65rem] tracking-[0.2em] uppercase">
            {{ activeIndex()! + 1 }} / {{ images().length }}
          </p>
          <button
            #closeButton
            type="button"
            class="flex items-center gap-2 text-[0.65rem] tracking-[0.2em] uppercase transition-colors hover:text-white"
            (click)="close()"
          >
            Close
            <app-icon name="close" [size]="18" />
          </button>
        </div>

        <div class="relative flex flex-1 items-center justify-center px-4 pb-4 md:px-16">
          <button
            type="button"
            class="absolute left-2 flex size-11 items-center justify-center text-sand-200 transition-colors hover:text-white md:left-5"
            aria-label="Previous photo"
            (click)="step(-1)"
          >
            <app-icon name="chevron-left" [size]="26" />
          </button>

          <figure class="flex max-h-full flex-col items-center gap-4">
            <img
              [src]="active()!.url"
              [alt]="active()!.alt"
              class="max-h-[72vh] w-auto max-w-full object-contain"
            />
            <figcaption class="text-center text-sm text-sand-200">{{ active()!.alt }}</figcaption>
          </figure>

          <button
            type="button"
            class="absolute right-2 flex size-11 items-center justify-center text-sand-200 transition-colors hover:text-white md:right-5"
            aria-label="Next photo"
            (click)="step(1)"
          >
            <app-icon name="chevron-right" [size]="26" />
          </button>
        </div>
      </div>
    }
  `,
})
export class GalleryGridComponent {
  readonly images = input.required<readonly GalleryImage[]>();
  /** Masonry lets portrait shots span two rows. */
  readonly masonry = input(true);
  readonly columns = input<2 | 3 | 4>(3);

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly activeIndex = signal<number | null>(null);
  protected readonly active = computed(() => {
    const i = this.activeIndex();
    return i === null ? null : this.images()[i];
  });

  protected readonly gridClass = computed(() => {
    const cols = {
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-2 lg:grid-cols-3',
      4: 'sm:grid-cols-2 lg:grid-cols-4',
    }[this.columns()];
    const rows = this.masonry() ? 'auto-rows-[14rem] md:auto-rows-[15rem]' : 'auto-rows-auto';
    return `grid grid-cols-1 gap-3 md:gap-4 ${cols} ${rows}`;
  });

  protected tall(image: GalleryImage): boolean {
    return image.height > image.width;
  }

  protected open(index: number): void {
    this.activeIndex.set(index);
    // Move focus into the dialog so Escape and the arrow keys reach it.
    setTimeout(() => this.closeButton()?.nativeElement.focus());
  }

  protected close(): void {
    this.activeIndex.set(null);
  }

  protected step(delta: number): void {
    const total = this.images().length;
    const i = this.activeIndex();
    if (i === null || total === 0) return;
    this.activeIndex.set((i + delta + total) % total);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.step(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.step(-1);
        break;
      case 'Tab': {
        // Keep focus inside the dialog.
        const focusables = this.host.nativeElement.querySelectorAll<HTMLElement>(
          '[role="dialog"] button',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        break;
      }
    }
  }
}
