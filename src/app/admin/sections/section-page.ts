import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { IconComponent } from '../../shared/ui/icon';
import { FieldComponent } from '../editor/field';
import { AvailabilityEditorComponent } from './availability-editor';
import { MediaLibraryComponent } from './media-library';
import { HistoryComponent } from './history';
import { AdminStore } from '../admin-store.service';
import { PAGE_TABS, SECTIONS } from '../schema';

/** One admin section: a heading, then its editors. */
@Component({
  selector: 'admin-section-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IconComponent,
    FieldComponent,
    AvailabilityEditorComponent,
    MediaLibraryComponent,
    HistoryComponent,
  ],
  template: `
    @if (section(); as s) {
      <header class="mb-8">
        <h1 class="font-display text-4xl text-ink-900">{{ s.label }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{{ s.intro }}</p>
      </header>

      @if (store.draft()) {
        @switch (s.special) {
          @case ('pages') {
            <nav class="mb-6 flex flex-wrap gap-1.5" aria-label="Pages">
              @for (tab of tabs; track tab.key) {
                <a
                  [routerLink]="[]"
                  [queryParams]="{ page: tab.key }"
                  class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
                  [class]="tab.key === page() ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-900/15 bg-white text-ink-700 hover:border-ink-900/40'"
                >
                  {{ tab.label }}
                </a>
              }
            </nav>
            @if (pageTab(); as tab) {
              <div class="adm-card p-5 md:p-6">
                @if (tab.link) {
                  <a [href]="tab.link" target="_blank" rel="noopener" class="mb-5 inline-flex items-center gap-1.5 text-xs text-clay-600 hover:underline">
                    View this page on the live site <app-icon name="external" [size]="12" />
                  </a>
                }
                <admin-field [path]="['pages', tab.key]" [bare]="true" />
              </div>
            }
          }
          @case ('availability') {
            <admin-availability-editor />
          }
          @case ('media') {
            <admin-media-library />
          }
          @case ('history') {
            <admin-history />
          }
          @default {
            <div class="space-y-10">
              @for (block of s.blocks; track block.title) {
                <section>
                  @if (s.blocks.length > 1) {
                    <h2 class="mb-1 text-lg font-semibold text-ink-900">{{ block.title }}</h2>
                  }
                  @if (block.help) {
                    <p class="adm-help mb-3">{{ block.help }}</p>
                  }
                  <div class="adm-card p-5 md:p-6">
                    <admin-field [path]="block.path" [bare]="true" />
                  </div>
                </section>
              }
            </div>
          }
        }
      }
    } @else {
      <p class="text-sm text-ink-600">That section does not exist. <a routerLink="/admin" class="underline">Go back</a>.</p>
    }
  `,
})
export class SectionPage {
  protected readonly store = inject(AdminStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly tabs = PAGE_TABS;

  private readonly sectionId = toSignal(this.route.paramMap.pipe(map((p) => p.get('section'))));
  protected readonly page = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('page') ?? PAGE_TABS[0].key)),
    { initialValue: PAGE_TABS[0].key as string },
  );

  protected readonly section = computed(() => SECTIONS.find((s) => s.id === this.sectionId()) ?? null);
  protected readonly pageTab = computed(
    () => PAGE_TABS.find((t) => t.key === this.page()) ?? PAGE_TABS[0],
  );
}
