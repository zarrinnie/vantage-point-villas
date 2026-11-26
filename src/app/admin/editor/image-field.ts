import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon';
import { MediaPickerComponent } from './media-picker';
import { AdminMedia, messageOf } from '../media.service';

/** A picture: preview, upload, pick from the library, or paste an address. */
@Component({
  selector: 'admin-image-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent, MediaPickerComponent],
  template: `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div class="relative h-24 w-36 shrink-0 overflow-hidden rounded-md border border-ink-900/10 bg-sand-100">
        @if (value()) {
          <img [src]="value()" alt="" class="size-full object-cover" (error)="broken.set(true)" (load)="broken.set(false)" />
          @if (broken()) {
            <span class="absolute inset-0 flex items-center justify-center bg-sand-100 p-2 text-center text-[0.65rem] text-red-800">
              Picture not found
            </span>
          }
        } @else {
          <span class="flex size-full items-center justify-center text-[0.65rem] text-ink-500">No picture</span>
        }
      </div>

      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap gap-2">
          <label class="adm-btn cursor-pointer" [class.opacity-50]="uploading()">
            <app-icon name="plus" [size]="13" />
            {{ uploading() ? 'Uploading…' : 'Upload' }}
            <input type="file" accept="image/*" class="sr-only" [disabled]="uploading()" (change)="upload($event)" />
          </label>
          <button type="button" class="adm-btn" (click)="pickerOpen.set(true)">Choose from library</button>
        </div>
        <input
          type="url"
          class="adm-input font-mono text-xs"
          [id]="fieldId()"
          [value]="value()"
          placeholder="…or paste a picture address (https://…)"
          (change)="valueChange.emit($any($event.target).value.trim())"
        />
        @if (error()) {
          <p class="text-xs text-red-800">{{ error() }}</p>
        }
      </div>
    </div>

    @if (pickerOpen()) {
      <admin-media-picker (chosen)="choose($event)" (closed)="pickerOpen.set(false)" />
    }
  `,
})
export class ImageFieldComponent {
  private readonly media = inject(AdminMedia);

  readonly value = input.required<string>();
  readonly fieldId = input('');
  readonly valueChange = output<string>();

  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pickerOpen = signal(false);
  protected readonly broken = signal(false);

  protected async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      this.valueChange.emit(await this.media.upload(file));
    } catch (error) {
      this.error.set(messageOf(error));
    } finally {
      this.uploading.set(false);
    }
  }

  protected choose(url: string): void {
    this.pickerOpen.set(false);
    this.valueChange.emit(url);
  }
}
