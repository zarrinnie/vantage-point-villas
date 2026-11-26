import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon';
import { AdminMedia, messageOf } from '../media.service';

/** Modal grid of uploaded photos; emits the chosen photo's URL. */
@Component({
  selector: 'admin-media-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/50 p-4" (click)="closed.emit()">
      <div
        class="adm-card flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a photograph"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between gap-4 border-b border-ink-900/10 px-5 py-4">
          <h2 class="text-base font-semibold text-ink-900">Choose a photograph</h2>
          <div class="flex items-center gap-2">
            <label class="adm-btn cursor-pointer">
              <app-icon name="plus" [size]="14" />
              {{ uploading() ? 'Uploading…' : 'Upload new' }}
              <input type="file" accept="image/*" multiple class="sr-only" (change)="upload($event)" />
            </label>
            <button type="button" class="adm-icon-btn" aria-label="Close" (click)="closed.emit()">
              <app-icon name="close" [size]="16" />
            </button>
          </div>
        </div>

        @if (error()) {
          <p class="border-b border-red-700/20 bg-red-50 px-5 py-2 text-xs text-red-800">{{ error() }}</p>
        }

        <div class="overflow-y-auto p-5">
          @if (media.items().length === 0) {
            <p class="py-16 text-center text-sm text-ink-500">
              No photographs uploaded yet. Use “Upload new” to add some.
            </p>
          } @else {
            <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              @for (item of media.items(); track item.name) {
                <li>
                  <button
                    type="button"
                    class="group block w-full overflow-hidden rounded-lg border border-ink-900/10 text-left hover:border-clay-500 focus:border-clay-500 focus:outline-none"
                    (click)="chosen.emit(item.url)"
                  >
                    <img [src]="item.url" alt="" loading="lazy" class="aspect-4/3 w-full bg-sand-100 object-cover" />
                    <span class="block truncate px-2 py-1.5 text-[0.7rem] text-ink-600">{{ item.name }}</span>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>
  `,
})
export class MediaPickerComponent {
  protected readonly media = inject(AdminMedia);
  readonly chosen = output<string>();
  readonly closed = output<void>();

  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.media.refresh();
  }

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;
    this.uploading.set(true);
    this.error.set(null);
    let last: string | null = null;
    for (const file of files) {
      try {
        last = await this.media.upload(file);
      } catch (error) {
        this.error.set(messageOf(error));
      }
    }
    this.uploading.set(false);
    // A single upload is almost always the picture they wanted: use it.
    if (files.length === 1 && last) this.chosen.emit(last);
  }
}
