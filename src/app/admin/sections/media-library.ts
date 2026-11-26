import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon';
import { AdminMedia, messageOf } from '../media.service';
import { AdminStore } from '../admin-store.service';

/** Upload, browse and delete photographs. */
@Component({
  selector: 'admin-media-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent],
  template: `
    <label
      class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-900/15 bg-white px-6 py-10 text-center transition-colors hover:border-clay-500"
      [class.border-clay-500]="dragging()"
      (dragover)="$event.preventDefault(); dragging.set(true)"
      (dragleave)="dragging.set(false)"
      (drop)="drop($event)"
    >
      <app-icon name="plus" [size]="22" class="text-clay-500" />
      <span class="text-sm font-medium text-ink-900">
        {{ uploading() ? 'Uploading ' + uploading() + '…' : 'Drop photographs here, or click to choose' }}
      </span>
      <span class="text-xs text-ink-500">JPEG, PNG, WebP, AVIF or GIF · up to 15 MB each</span>
      <input type="file" accept="image/*" multiple class="sr-only" (change)="choose($event)" />
    </label>

    @for (error of errors(); track $index) {
      <p class="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">{{ error }}</p>
    }
    @if (media.error()) {
      <p class="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">{{ media.error() }}</p>
    }

    <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      @for (item of media.items(); track item.name) {
        <li class="adm-card overflow-hidden">
          <a [href]="item.url" target="_blank" rel="noopener">
            <img [src]="item.url" [alt]="item.name" loading="lazy" class="aspect-4/3 w-full bg-sand-100 object-cover" />
          </a>
          <div class="space-y-2 p-3">
            <p class="truncate text-xs text-ink-800" [title]="item.name">{{ item.name }}</p>
            <p class="text-[0.7rem] text-ink-500">
              {{ size(item.size) }} ·
              @if (inUse().has(item.url)) {
                <span class="text-emerald-700">in use</span>
              } @else {
                not used
              }
            </p>
            <div class="flex gap-2">
              <button type="button" class="adm-btn flex-1" (click)="copy(item.url)">
                {{ copied() === item.url ? 'Copied' : 'Copy address' }}
              </button>
              @if (confirming() === item.name) {
                <button type="button" class="adm-btn-danger" (click)="remove(item.name)">Delete</button>
              } @else {
                <button
                  type="button"
                  class="adm-icon-btn hover:text-red-700"
                  [title]="inUse().has(item.url) ? 'This photograph is used on the site' : 'Delete'"
                  (click)="confirming.set(item.name)"
                >
                  <app-icon name="trash" [size]="14" />
                </button>
              }
            </div>
            @if (confirming() === item.name && inUse().has(item.url)) {
              <p class="text-[0.7rem] leading-snug text-red-800">
                It is used on the site; those places will show no picture.
              </p>
            }
          </div>
        </li>
      } @empty {
        @if (media.loaded()) {
          <li class="col-span-full py-10 text-center text-sm text-ink-500">No photographs uploaded yet.</li>
        }
      }
    </ul>
  `,
})
export class MediaLibraryComponent {
  protected readonly media = inject(AdminMedia);
  private readonly store = inject(AdminStore);

  protected readonly uploading = signal(0);
  protected readonly dragging = signal(false);
  protected readonly errors = signal<string[]>([]);
  protected readonly confirming = signal<string | null>(null);
  protected readonly copied = signal<string | null>(null);

  /** Addresses referenced anywhere in the draft. */
  protected readonly inUse = computed(() => {
    const json = JSON.stringify(this.store.draft() ?? {});
    return new Set(this.media.items().map((i) => i.url).filter((url) => json.includes(`"${url}"`)));
  });

  constructor() {
    void this.media.refresh();
  }

  protected choose(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    void this.uploadAll(files);
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.uploadAll(Array.from(event.dataTransfer?.files ?? []));
  }

  protected async remove(name: string): Promise<void> {
    try {
      await this.media.remove(name);
    } catch (error) {
      this.errors.set([messageOf(error)]);
    }
    this.confirming.set(null);
  }

  protected async copy(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(new URL(url, location.origin).href);
      this.copied.set(url);
      setTimeout(() => this.copied.set(null), 1500);
    } catch {
      /* clipboard blocked: the address is visible on the card */
    }
  }

  protected size(bytes: number): string {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
  }

  private async uploadAll(files: File[]): Promise<void> {
    this.errors.set([]);
    for (const [i, file] of files.entries()) {
      this.uploading.set(files.length - i);
      try {
        await this.media.upload(file);
      } catch (error) {
        this.errors.update((list) => [...list, messageOf(error)]);
      }
    }
    this.uploading.set(0);
  }
}
