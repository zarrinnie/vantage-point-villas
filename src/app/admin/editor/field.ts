import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { IconComponent, ICON_NAMES } from '../../shared/ui/icon';
import { AdminStore } from '../admin-store.service';
import { ImageFieldComponent } from './image-field';
import { Path, clone } from '../path.util';
import {
  helpFor,
  isHidden,
  itemThumb,
  itemTitle,
  kindFor,
  labelFor,
  newItemFor,
} from '../schema';

interface Option {
  value: string;
  label: string;
}

const PRICING_OPTIONS: Option[] = [
  { value: 'per-stay', label: 'Once per stay' },
  { value: 'per-night', label: 'Per night' },
  { value: 'per-guest-night', label: 'Per guest, per night' },
];

/**
 * Edits whatever lives at `path` in the draft: a text box for text, a list
 * editor for lists, a set of fields for groups — and recurses into itself for
 * anything nested. Every change goes straight into the draft.
 */
@Component({
  selector: 'admin-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [IconComponent, ImageFieldComponent],
  template: `
    @let v = $any(value());
    @switch (kind()) {
      <!-- ================= Group of fields ================= -->
      @case ('group') {
        @if (bare()) {
          <div class="space-y-5">
            @for (key of keys(); track key) {
              <admin-field [path]="child(key)" />
            }
          </div>
        } @else {
          <fieldset class="rounded-lg border border-ink-900/10 bg-sand-50/60 p-4">
            <legend class="px-1.5 text-xs font-semibold tracking-wide text-ink-800 uppercase">{{ label() }}</legend>
            @if (help()) {
              <p class="adm-help -mt-1 mb-3">{{ help() }}</p>
            }
            <div class="space-y-5">
              @for (key of keys(); track key) {
                <admin-field [path]="child(key)" />
              }
            </div>
          </fieldset>
        }
      }

      <!-- ================= List ================= -->
      @case ('list') {
        <div>
          @if (!bare()) {
            <p class="adm-label">{{ label() }} <span class="font-normal text-ink-500">({{ items().length }})</span></p>
          }
          @if (help()) {
            <p class="adm-help -mt-1 mb-2">{{ help() }}</p>
          }

          @if (simpleList()) {
            <!-- A list of words or paragraphs: edit in place. -->
            <ul class="space-y-2">
              @for (item of items(); track $index; let i = $index, first = $first, last = $last) {
                <li class="flex items-start gap-2">
                  @if (isLongList()) {
                    <textarea
                      class="adm-input min-h-24 resize-y leading-relaxed"
                      [value]="item"
                      [attr.aria-label]="label() + ' ' + (i + 1)"
                      (input)="setItem(i, $any($event.target).value)"
                    ></textarea>
                  } @else {
                    <input
                      type="text"
                      class="adm-input"
                      [value]="item"
                      [attr.aria-label]="label() + ' ' + (i + 1)"
                      (input)="setItem(i, $any($event.target).value)"
                    />
                  }
                  <div class="flex shrink-0 items-center pt-1">
                    <button type="button" class="adm-icon-btn" title="Move up" [disabled]="first" (click)="move(i, -1)">
                      <app-icon name="arrow-up" [size]="14" />
                    </button>
                    <button type="button" class="adm-icon-btn" title="Move down" [disabled]="last" (click)="move(i, 1)">
                      <app-icon name="arrow-down" [size]="14" />
                    </button>
                    <button type="button" class="adm-icon-btn hover:text-red-700" title="Remove" (click)="remove(i)">
                      <app-icon name="trash" [size]="14" />
                    </button>
                  </div>
                </li>
              }
            </ul>
          } @else {
            <!-- A list of records: collapsed rows that open into their fields. -->
            <ul class="divide-y divide-ink-900/10 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
              @for (item of items(); track $index; let i = $index, first = $first, last = $last) {
                <li>
                  <div class="flex items-center gap-3 px-3 py-2" [class.bg-sand-50]="isOpen(i)">
                    <button
                      type="button"
                      class="flex min-w-0 flex-1 items-center gap-3 text-left"
                      [attr.aria-expanded]="isOpen(i)"
                      (click)="toggle(i)"
                    >
                      <app-icon [name]="isOpen(i) ? 'chevron-down' : 'chevron-right'" [size]="14" class="text-ink-500" />
                      @if (thumbOf(item); as thumb) {
                        <img [src]="thumb" alt="" class="h-9 w-12 shrink-0 rounded object-cover" />
                      }
                      <span class="truncate text-sm text-ink-900">{{ titleOf(item, i) }}</span>
                    </button>
                    <div class="flex shrink-0 items-center">
                      <button type="button" class="adm-icon-btn" title="Move up" [disabled]="first" (click)="move(i, -1)">
                        <app-icon name="arrow-up" [size]="14" />
                      </button>
                      <button type="button" class="adm-icon-btn" title="Move down" [disabled]="last" (click)="move(i, 1)">
                        <app-icon name="arrow-down" [size]="14" />
                      </button>
                      <button type="button" class="adm-icon-btn" title="Duplicate" (click)="duplicate(i)">
                        <app-icon name="copy" [size]="14" />
                      </button>
                      @if (confirming() === i) {
                        <button type="button" class="adm-btn-danger ml-1 py-1" (click)="remove(i)">Delete</button>
                        <button type="button" class="adm-btn ml-1 py-1" (click)="confirming.set(null)">Keep</button>
                      } @else {
                        <button type="button" class="adm-icon-btn hover:text-red-700" title="Delete" (click)="confirming.set(i)">
                          <app-icon name="trash" [size]="14" />
                        </button>
                      }
                    </div>
                  </div>
                  @if (isOpen(i)) {
                    <div class="border-t border-ink-900/10 px-4 py-5">
                      <admin-field [path]="child(i)" [bare]="true" />
                    </div>
                  }
                </li>
              } @empty {
                <li class="px-4 py-6 text-center text-sm text-ink-500">Nothing here yet.</li>
              }
            </ul>
          }

          <button type="button" class="adm-btn mt-2" (click)="add()">
            <app-icon name="plus" [size]="13" />
            Add {{ singular() }}
          </button>
        </div>
      }

      <!-- ================= Amenity checkboxes ================= -->
      @case ('amenities') {
        <div>
          <p class="adm-label">{{ label() }}</p>
          <div class="grid gap-x-4 gap-y-1.5 rounded-lg border border-ink-900/10 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
            @for (amenity of amenityOptions(); track amenity.value) {
              <label class="flex items-center gap-2 text-sm text-ink-800">
                <input
                  type="checkbox"
                  class="size-4 accent-clay-500"
                  [checked]="items().includes(amenity.value)"
                  (change)="toggleAmenity(amenity.value, $any($event.target).checked)"
                />
                {{ amenity.label }}
              </label>
            }
          </div>
        </div>
      }

      <!-- ================= Yes / no ================= -->
      @case ('boolean') {
        <label class="flex items-start gap-3 text-sm text-ink-800">
          <input
            type="checkbox"
            class="mt-0.5 size-4 accent-clay-500"
            [checked]="v"
            (change)="set($any($event.target).checked)"
          />
          <span>
            {{ label() }}
            @if (help()) {
              <span class="adm-help block">{{ help() }}</span>
            }
          </span>
        </label>
      }

      <!-- ================= Picture ================= -->
      @case ('image') {
        <div>
          <label class="adm-label" [for]="id()">{{ label() }}</label>
          <admin-image-field [value]="$any(v) ?? ''" [fieldId]="id()" (valueChange)="set($event)" />
        </div>
      }

      <!-- ================= Everything else: one input ================= -->
      @default {
        <div>
          <label class="adm-label" [for]="id()">{{ label() }}</label>
          @switch (kind()) {
            @case ('textarea') {
              <textarea
                class="adm-input min-h-24 resize-y leading-relaxed"
                [id]="id()"
                [value]="v ?? ''"
                [rows]="rows()"
                (input)="set($any($event.target).value)"
              ></textarea>
            }
            @case ('number') {
              <input type="number" class="adm-input max-w-40" [id]="id()" [value]="v" (change)="setNumber($event)" />
            }
            @case ('money') {
              <div class="flex max-w-48 items-center gap-2">
                <span class="text-sm text-ink-500">$</span>
                <input type="number" min="0" step="1" class="adm-input" [id]="id()" [value]="v" (change)="setNumber($event)" />
              </div>
            }
            @case ('percent') {
              <div class="flex max-w-40 items-center gap-2">
                <input type="number" min="0" step="0.5" class="adm-input" [id]="id()" [value]="v" (change)="setNumber($event)" />
                <span class="text-sm text-ink-500">%</span>
              </div>
            }
            @case ('date') {
              <input type="date" class="adm-input max-w-48" [id]="id()" [value]="v" (change)="set($any($event.target).value)" />
            }
            @case ('icon') {
              <div class="flex items-center gap-3">
                <span class="flex size-9 shrink-0 items-center justify-center rounded-md border border-ink-900/10 bg-white text-clay-600">
                  <app-icon [name]="$any(v)" [size]="18" />
                </span>
                <select class="adm-input max-w-56" [id]="id()" [value]="v" (change)="set($any($event.target).value)">
                  @for (name of icons; track name) {
                    <option [value]="name" [selected]="name === v">{{ name }}</option>
                  }
                </select>
              </div>
            }
            @case ('select') {
              <select class="adm-input max-w-80" [id]="id()" (change)="set($any($event.target).value)">
                @for (option of options(); track option.value) {
                  <option [value]="option.value" [selected]="option.value === v">{{ option.label }}</option>
                }
                @if (!optionKnown()) {
                  <option [value]="v" selected>{{ v || '— choose —' }}</option>
                }
              </select>
            }
            @case ('link') {
              <input type="text" class="adm-input font-mono text-xs" [id]="id()" [value]="v ?? ''" (input)="set($any($event.target).value)" />
            }
            @default {
              <input type="text" class="adm-input" [id]="id()" [value]="v ?? ''" (input)="set($any($event.target).value)" />
            }
          }
          @if (help()) {
            <p class="adm-help">{{ help() }}</p>
          }
        </div>
      }
    }
  `,
})
export class FieldComponent {
  private readonly store = inject(AdminStore);

  readonly path = input.required<Path>();
  /** Render without its own label or frame (the caller already titles it). */
  readonly bare = input(false);

  protected readonly icons = ICON_NAMES;
  protected readonly confirming = signal<number | null>(null);
  private readonly open = signal<ReadonlySet<number>>(new Set());

  protected readonly value = computed(() => this.store.get(this.path()));
  protected readonly kind = computed(() => kindFor(this.path(), this.value()));
  protected readonly label = computed(() => labelFor(this.path()));
  protected readonly help = computed(() => helpFor(this.path(), this.value()));
  protected readonly id = computed(() => 'f-' + this.path().join('-'));

  protected readonly keys = computed(() => {
    const v = this.value();
    return v && typeof v === 'object' && !Array.isArray(v)
      ? Object.keys(v).filter((k) => !isHidden([...this.path(), k]))
      : [];
  });

  protected readonly items = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? (v as unknown[]) : [];
  });

  /** Lists of plain text (languages, inclusions, paragraphs) edit in place. */
  protected readonly simpleList = computed(() => {
    const items = this.items();
    if (items.length) return typeof items[0] === 'string';
    return typeof newItemFor(this.path(), items) === 'string';
  });

  protected readonly isLongList = computed(() => {
    const key = this.path()[this.path().length - 1];
    return key === 'story' || key === 'body' || key === 'paragraphs';
  });

  protected readonly singular = computed(() => {
    const words = this.label().toLowerCase();
    return words.endsWith('ies') ? `${words.slice(0, -3)}y` : words.replace(/s$/, '');
  });

  protected readonly rows = computed(() => {
    const text = String(this.value() ?? '');
    return Math.min(12, Math.max(3, Math.ceil(text.length / 90)));
  });

  protected readonly options = computed<Option[]>(() => {
    const key = this.path()[this.path().length - 1];
    const draft = this.store.draft();
    if (!draft) return [];
    switch (key) {
      case 'pricing':
        return PRICING_OPTIONS;
      case 'category':
        return [
          { value: '', label: 'No category' },
          ...draft.galleryCategories.map((c) => ({ value: c.id, label: c.label || c.id })),
        ];
      case 'group':
        return draft.faqGroups.map((g) => ({ value: g, label: g }));
      case 'villa':
        return [
          { value: '', label: 'Whole property (every villa)' },
          ...draft.villas.map((v) => ({ value: v.slug, label: v.name || v.slug })),
        ];
      default:
        return [];
    }
  });

  protected readonly optionKnown = computed(() =>
    this.options().some((o) => o.value === this.value()),
  );

  protected readonly amenityOptions = computed<Option[]>(() =>
    (this.store.draft()?.amenities ?? []).map((a) => ({ value: a.id, label: a.label || a.id })),
  );

  protected child(key: string | number): Path {
    return [...this.path(), key];
  }

  protected titleOf(item: unknown, i: number): string {
    return itemTitle(item, i);
  }

  protected thumbOf(item: unknown): string | null {
    return itemThumb(item);
  }

  // ---- Editing -------------------------------------------------------------
  protected set(value: unknown): void {
    this.store.set(this.path(), value);
  }

  protected setNumber(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const n = Number(raw);
    this.set(raw === '' || Number.isNaN(n) ? 0 : n);
  }

  protected setItem(index: number, value: unknown): void {
    this.store.set(this.child(index), value);
  }

  protected add(): void {
    const items = this.items();
    this.set([...items, newItemFor(this.path(), items)]);
    if (!this.simpleList()) this.open.set(new Set([items.length]));
  }

  protected duplicate(index: number): void {
    const items = [...this.items()];
    const copy = clone(items[index]);
    // Ids and slugs must stay unique.
    if (copy && typeof copy === 'object') {
      const o = copy as Record<string, unknown>;
      for (const key of ['slug', 'id']) {
        if (typeof o[key] === 'string') o[key] = `${o[key]}-copy`;
      }
    }
    items.splice(index + 1, 0, copy);
    this.set(items);
    this.open.set(new Set([index + 1]));
  }

  protected remove(index: number): void {
    this.set(this.items().filter((_, i) => i !== index));
    this.confirming.set(null);
    this.open.set(new Set());
  }

  protected move(index: number, by: -1 | 1): void {
    const items = [...this.items()];
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this.set(items);
    const open = this.open();
    if (open.has(index)) this.open.set(new Set([target]));
  }

  protected toggleAmenity(id: string, on: boolean): void {
    const ids = this.items() as string[];
    this.set(on ? [...ids.filter((x) => x !== id), id] : ids.filter((x) => x !== id));
  }

  // ---- Expanded rows -------------------------------------------------------
  protected isOpen(index: number): boolean {
    return this.open().has(index);
  }

  protected toggle(index: number): void {
    const next = new Set(this.open());
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.open.set(next);
  }
}
