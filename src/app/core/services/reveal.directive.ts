import {
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/* ----------------------------------------------------------------------------
 * One shared scroll watcher for every revealing element on the page.
 *
 * An IntersectionObserver is the obvious tool here, but it only fires when an
 * element *crosses* a threshold: a large scroll jump (PageDown, a restored
 * scroll position, an in-page anchor) can carry an element from below the fold
 * to above it between two observations, and it then stays hidden for good.
 * Measuring the pending elements on a rAF after each scroll cannot miss them.
 * -------------------------------------------------------------------------- */

const pending = new Set<HTMLElement>();
let listening = false;
let frame = 0;

/** Reveal once the element's top edge is inside the lower 92% of the viewport. */
function measure(): void {
  frame = 0;
  const limit = window.innerHeight * 0.92;

  for (const el of pending) {
    if (el.getBoundingClientRect().top < limit) {
      el.classList.add('is-visible');
      pending.delete(el);
    }
  }

  if (pending.size === 0) stopListening();
}

function schedule(): void {
  if (!frame) frame = requestAnimationFrame(measure);
}

function startListening(): void {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function stopListening(): void {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
}

/**
 * Fades an element up the first time it scrolls into view.
 *
 * Nothing is hidden during server rendering or when JavaScript is unavailable:
 * the `js-reveal` class — which does the hiding — is only ever added at runtime
 * in the browser, and never when the visitor prefers reduced motion.
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnDestroy {
  /** Optional stagger in milliseconds, for grids of cards. */
  readonly appReveal = input<number | ''>('');

  /** Direction the element enters from. */
  readonly revealFrom = input<'up' | 'left' | 'right'>('up');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser) return;

      const reduced =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      const el = this.host.nativeElement;
      const delay = this.appReveal();
      if (typeof delay === 'number' && delay > 0) {
        el.style.transitionDelay = `${delay}ms`;
      }

      el.classList.add('js-reveal');
      const from = this.revealFrom();
      if (from !== 'up') el.classList.add(`js-reveal-${from}`);
      pending.add(el);
      startListening();
      schedule();
    });
  }

  ngOnDestroy(): void {
    pending.delete(this.host.nativeElement);
    if (pending.size === 0) stopListening();
  }
}
