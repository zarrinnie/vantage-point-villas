import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from '../ui/icon';
import { ContentService } from '../../core/content/content.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ease-editorial"
      [class]="
        solid()
          ? 'bg-sand-50/95 shadow-[0_1px_0_0_rgba(16,16,16,0.08)] backdrop-blur-md'
          : 'bg-transparent'
      "
    >
      <!-- Utility bar: only while the header sits over the hero -->
      <div
        class="hidden overflow-hidden border-b transition-[max-height,opacity,border-color] duration-500 ease-editorial md:block"
        [class]="solid() ? 'max-h-0 border-transparent opacity-0' : 'max-h-12 border-white/15 opacity-100'"
        [attr.aria-hidden]="solid()"
      >
        <div
          class="container-page flex items-center justify-between gap-6 py-2.5 text-[0.62rem] font-medium tracking-[0.18em] text-sand-100/85 uppercase"
        >
          <p class="flex items-center gap-2">
            <app-icon name="pin" [size]="13" />
            {{ site().address.street }}, {{ site().address.locality }}, {{ site().address.region }}
          </p>
          <div class="flex items-center gap-6">
            <a [href]="links().phone" class="transition-colors hover:text-white" [attr.tabindex]="solid() ? -1 : 0">
              {{ site().phone }}
            </a>
            <a
              [href]="links().whatsapp"
              target="_blank"
              rel="noopener"
              class="transition-colors hover:text-white"
              [attr.tabindex]="solid() ? -1 : 0"
            >
              {{ copy().utilityWhatsapp }}
            </a>
            <a routerLink="/contact" class="transition-colors hover:text-white" [attr.tabindex]="solid() ? -1 : 0">
              {{ copy().utilityContact }}
            </a>
          </div>
        </div>
      </div>

      <div
        class="container-page flex items-center justify-between gap-6 transition-[padding] duration-500 ease-editorial"
        [class]="solid() ? 'py-3' : 'py-5'"
      >
        <!-- Wordmark -->
        <a
          routerLink="/"
          class="group flex flex-col leading-none"
          [attr.aria-label]="site().name + ' — home'"
        >
          <span
            class="font-display text-[1.45rem] tracking-[-0.02em] transition-colors md:text-[1.65rem]"
            [class]="solid() ? 'text-ink-900' : 'text-white'"
          >
            {{ copy().wordmark }}
          </span>
          <span
            class="mt-1 text-[0.55rem] font-medium tracking-[0.42em] uppercase transition-colors"
            [class]="solid() ? 'text-clay-600' : 'text-sand-200'"
          >
            {{ copy().wordmarkSub }}
          </span>
        </a>

        <!-- Desktop navigation -->
        <nav class="hidden items-center gap-9 lg:flex" aria-label="Main">
          @for (item of nav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="after:scale-x-100"
              class="relative text-[0.68rem] font-medium tracking-[0.2em] uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100"
              [class]="solid() ? 'text-ink-700 hover:text-ink-900' : 'text-sand-100 hover:text-white'"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="flex items-center gap-3">
          <a
            [href]="links().whatsapp"
            target="_blank"
            rel="noopener"
            class="hidden size-10 items-center justify-center rounded-full border transition-colors md:flex"
            [class]="
              solid()
                ? 'border-ink-900/15 text-ink-700 hover:border-clay-500 hover:text-clay-600'
                : 'border-white/35 text-white hover:border-white hover:bg-white/10'
            "
            aria-label="Message us on WhatsApp"
          >
            <app-icon name="whatsapp" [size]="18" />
          </a>

          <a
            routerLink="/book"
            [class]="solid() ? 'btn-primary' : 'btn-glass'"
            class="hidden px-6 py-3 sm:inline-flex"
          >
            {{ copy().bookButton }}
          </a>

          <!-- Mobile toggle -->
          <button
            type="button"
            class="flex size-10 items-center justify-center rounded-full border transition-colors lg:hidden"
            [class]="
              solid() ? 'border-ink-900/15 text-ink-900' : 'border-white/35 text-white'
            "
            [attr.aria-expanded]="menuOpen()"
            aria-controls="mobile-nav"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
            (click)="menuOpen.set(!menuOpen())"
          >
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" [size]="20" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile drawer -->
    <div
      id="mobile-nav"
      class="fixed inset-0 z-40 flex flex-col bg-sand-50 transition-[opacity,visibility] duration-500 ease-editorial lg:hidden"
      [class]="menuOpen() ? 'visible opacity-100' : 'invisible opacity-0'"
      [attr.aria-hidden]="!menuOpen()"
    >
      <div class="flex flex-1 flex-col justify-center px-7 pt-24 pb-10">
        <nav aria-label="Mobile">
          <ul class="space-y-1">
            @for (item of nav(); track item.path; let i = $index) {
              <li>
                <a
                  [routerLink]="item.path"
                  class="block border-b border-ink-900/8 py-4 font-display text-4xl tracking-[-0.035em] text-ink-900 transition-colors hover:text-clay-600"
                  [attr.tabindex]="menuOpen() ? 0 : -1"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="mt-10 space-y-3">
          <a
            routerLink="/book"
            class="btn-primary w-full justify-center"
            [attr.tabindex]="menuOpen() ? 0 : -1"
          >
            {{ copy().mobileBookButton }}
          </a>
          <a
            [href]="links().whatsapp"
            target="_blank"
            rel="noopener"
            class="btn-outline w-full justify-center"
            [attr.tabindex]="menuOpen() ? 0 : -1"
          >
            <app-icon name="whatsapp" [size]="16" />
            {{ copy().mobileWhatsappButton }}
          </a>
        </div>

        <address class="mt-10 space-y-1 text-sm not-italic text-ink-600">
          <p>{{ site().address.street }}, {{ site().address.locality }}</p>
          <p>{{ site().address.region }} {{ site().address.postalCode }}, {{ site().address.country }}</p>
          <p class="pt-2">
            <a [href]="links().phone" class="hover:text-clay-600">{{ site().phone }}</a>
          </p>
        </address>
      </div>
    </div>
  `,
})
export class HeaderComponent {
  private readonly content = inject(ContentService);
  protected readonly site = this.content.site;
  protected readonly links = this.content.links;
  protected readonly nav = computed(() => this.content.content().mainNav);
  protected readonly copy = computed(() => this.content.pages().shared.header);

  protected readonly menuOpen = signal(false);
  private readonly scrolled = signal(false);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Solid once scrolled, and always solid while the drawer is open. */
  protected readonly solid = computed(() => this.scrolled() || this.menuOpen());

  constructor() {
    if (this.isBrowser) {
      const onScroll = () => this.scrolled.set(window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
    }

    // Close the drawer whenever navigation completes.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));

    // Stop the page behind the drawer from scrolling.
    effect(() => {
      if (!this.isBrowser) return;
      document.body.style.overflow = this.menuOpen() ? 'hidden' : '';
    });
  }
}
