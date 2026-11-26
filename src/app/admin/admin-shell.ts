import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../shared/ui/icon';
import { AdminApi } from './admin-api.service';
import { AdminStore } from './admin-store.service';
import { SECTIONS } from './schema';

@Component({
  selector: 'admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  host: {
    '(window:beforeunload)': 'beforeUnload($event)',
    '(document:keydown)': 'shortcut($event)',
  },
  template: `
    <div class="min-h-svh bg-sand-100 text-ink-900 md:grid md:grid-cols-[15rem_1fr]">
      <!-- ================= Sidebar ================= -->
      <aside class="bg-ink-900 text-sand-200 md:sticky md:top-0 md:flex md:h-svh md:flex-col">
        <div class="flex items-center justify-between px-5 py-5">
          <a routerLink="/admin" class="leading-none">
            <span class="block font-display text-2xl text-white">Vantage Point</span>
            <span class="mt-1 block text-[0.6rem] tracking-[0.25em] text-clay-300 uppercase">Site admin</span>
          </a>
          <button type="button" class="adm-icon-btn text-sand-200 md:hidden" aria-label="Menu" (click)="menuOpen.set(!menuOpen())">
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" [size]="18" />
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 pb-4 md:block" [class.hidden]="!menuOpen()" aria-label="Admin sections">
          <ul class="space-y-0.5">
            @for (section of sections; track section.id) {
              <li>
                <a
                  [routerLink]="['/admin', section.id]"
                  routerLinkActive="bg-white/10 text-white"
                  class="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5 hover:text-white"
                  (click)="menuOpen.set(false)"
                >
                  <app-icon [name]="section.icon" [size]="16" class="text-clay-300" />
                  {{ section.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="space-y-1 border-t border-white/10 px-3 py-3 md:block" [class.hidden]="!menuOpen()">
          <a href="/" target="_blank" rel="noopener" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/5 hover:text-white">
            <app-icon name="external" [size]="15" /> View the website
          </a>
          <button type="button" class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-white/5 hover:text-white" (click)="signOut()">
            <app-icon name="logout" [size]="15" /> {{ confirmSignOut() ? 'Discard changes and sign out?' : 'Sign out' }}
          </button>
        </div>
      </aside>

      <!-- ================= Main ================= -->
      <div class="min-w-0">
        <div class="sticky top-0 z-30 border-b border-ink-900/10 bg-white/95 backdrop-blur">
          <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10">
            <p class="flex items-center gap-2 text-sm" aria-live="polite">
              <span class="size-2 rounded-full" [class]="statusDot()"></span>
              {{ status() }}
            </p>
            <div class="flex items-center gap-2">
              @if (store.dirty()) {
                @if (confirmDiscard()) {
                  <span class="text-xs text-ink-600">Throw away every unpublished change?</span>
                  <button type="button" class="adm-btn-danger" (click)="discard()">Discard</button>
                  <button type="button" class="adm-btn" (click)="confirmDiscard.set(false)">Keep editing</button>
                } @else {
                  <button type="button" class="adm-btn" (click)="confirmDiscard.set(true)">
                    <app-icon name="undo" [size]="13" /> Discard changes
                  </button>
                }
              }
              <button
                type="button"
                class="adm-btn-primary"
                [disabled]="!store.dirty() || store.saveState() === 'saving'"
                title="Ctrl/⌘ + S"
                (click)="publish()"
              >
                {{ store.saveState() === 'saving' ? 'Publishing…' : 'Publish changes' }}
              </button>
            </div>
          </div>

          @if (store.sessionExpired()) {
            <div class="border-t border-red-700/20 bg-red-50 px-5 py-3 text-sm text-red-900 md:px-10">
              Your session has ended. Your changes are kept in this browser tab —
              <a routerLink="/admin/login" class="font-medium underline">sign in again</a>, then publish.
            </div>
          } @else if (store.errors().length) {
            <div class="border-t border-red-700/20 bg-red-50 px-5 py-3 text-sm text-red-900 md:px-10" role="alert">
              <p class="font-medium">Nothing was published. Please fix:</p>
              <ul class="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                @for (error of store.errors(); track $index) {
                  <li>{{ error }}</li>
                }
              </ul>
            </div>
          } @else if (store.message()) {
            <div class="border-t border-emerald-700/20 bg-emerald-50 px-5 py-2.5 text-sm text-emerald-900 md:px-10">
              {{ store.message() }}
              <a href="/" target="_blank" rel="noopener" class="ml-1 font-medium underline">View the website</a>
            </div>
          }
        </div>

        <main class="px-5 py-8 md:px-10 md:py-10">
          @if (store.loadError()) {
            <p class="rounded-md bg-red-50 p-4 text-sm text-red-800">{{ store.loadError() }}</p>
          } @else if (!store.draft()) {
            <p class="text-sm text-ink-500">Loading…</p>
          } @else {
            <div class="mx-auto max-w-5xl">
              <router-outlet />
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export class AdminShell {
  protected readonly store = inject(AdminStore);
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly sections = SECTIONS;
  protected readonly menuOpen = signal(false);
  protected readonly confirmDiscard = signal(false);
  protected readonly confirmSignOut = signal(false);

  protected readonly status = computed(() => {
    switch (this.store.saveState()) {
      case 'saving':
        return 'Publishing…';
      case 'error':
        return 'Not published';
    }
    if (this.store.dirty()) return 'Unpublished changes';
    return this.store.saveState() === 'saved' ? 'All changes published' : 'Up to date with the live site';
  });

  protected readonly statusDot = computed(() => {
    if (this.store.saveState() === 'error') return 'bg-red-600';
    if (this.store.dirty()) return 'bg-amber-500';
    return 'bg-emerald-600';
  });

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.store.sessionExpired.set(false);
    void this.store.load();
  }

  protected async publish(): Promise<void> {
    this.confirmDiscard.set(false);
    await this.store.publish();
  }

  protected discard(): void {
    this.store.discard();
    this.confirmDiscard.set(false);
  }

  protected async signOut(): Promise<void> {
    if (this.store.dirty() && !this.confirmSignOut()) {
      this.confirmSignOut.set(true);
      return;
    }
    try {
      await this.api.logout();
    } finally {
      this.store.discard();
      this.store.reset();
      await this.router.navigateByUrl('/admin/login');
    }
  }

  protected beforeUnload(event: BeforeUnloadEvent): void {
    if (this.store.dirty()) event.preventDefault();
  }

  protected shortcut(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (this.store.dirty()) void this.publish();
    }
  }
}
