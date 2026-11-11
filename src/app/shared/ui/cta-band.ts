import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon';
import { heroImg } from '../../core/data/images.data';
import { SITE } from '../../core/data/site.data';

/** Full-bleed closing call to action, used at the foot of most pages. */
@Component({
  selector: 'app-cta-band',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="relative isolate overflow-hidden bg-palm-900">
      <img
        [src]="image()"
        [alt]="''"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width="2400"
        height="1350"
        class="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-palm-900/70 via-palm-900/60 to-palm-900/85"></div>

      <div class="container-page relative py-24 text-center md:py-32">
        <p class="eyebrow justify-center text-clay-300">{{ eyebrow() }}</p>
        <h2 class="mt-6 font-display text-display-sm text-sand-50 md:text-display lg:text-display-lg">
          {{ title() }}
        </h2>
        <p class="mx-auto mt-6 max-w-xl text-sand-200">{{ lede() }}</p>

        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a routerLink="/book" class="btn-solid-light">
            Check availability
            <app-icon name="arrow-right" [size]="16" />
          </a>
          <a [href]="whatsapp" target="_blank" rel="noopener" class="btn-glass">
            <app-icon name="whatsapp" [size]="16" />
            Message us
          </a>
        </div>
      </div>
    </section>
  `,
})
export class CtaBandComponent {
  readonly eyebrow = input('Reservations');
  readonly title = input('Come and see it for yourself');
  readonly lede = input(
    'Tell us your dates and we will hold a villa for you. Booking direct keeps the platform commission out of the price.',
  );
  readonly image = input(heroImg('cta-band'));

  protected readonly whatsapp = SITE.whatsappHref;
}
