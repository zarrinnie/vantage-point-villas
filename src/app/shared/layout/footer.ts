import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../ui/icon';
import { FOOTER_NAV, SITE } from '../../core/data/site.data';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <footer class="bg-ink-900 text-sand-200">
      <div class="container-page py-20 md:py-24">
        <div class="grid gap-14 lg:grid-cols-[1.3fr_2fr]">
          <!-- Brand -->
          <div>
            <p class="font-display text-4xl tracking-[-0.035em] text-sand-50">Vantage Point Villas</p>
            <p class="mt-1 text-[0.58rem] font-medium tracking-[0.42em] text-clay-300 uppercase">
              Ungasan · Uluwatu · Bali
            </p>

            <p class="mt-7 max-w-sm text-sm leading-relaxed text-sand-200/80">
              {{ site.intro }}
            </p>

            <ul class="mt-8 flex items-center gap-3">
              @for (social of site.socials; track social.label) {
                <li>
                  <a
                    [href]="social.href"
                    target="_blank"
                    rel="noopener"
                    class="flex size-10 items-center justify-center rounded-full border border-sand-200/20 text-sand-200 transition-colors hover:border-white hover:bg-white hover:text-ink-900"
                    [attr.aria-label]="social.label"
                  >
                    <app-icon [name]="social.icon" [size]="17" />
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Links + contact -->
          <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            @for (column of footerNav; track column.title) {
              <nav [attr.aria-label]="column.title">
                <p class="mb-5 text-[0.72rem] font-medium tracking-[0.14em] text-white uppercase">
                  {{ column.title }}
                </p>
                <ul class="space-y-3">
                  @for (item of column.items; track item.label) {
                    <li>
                      <a
                        [routerLink]="item.path"
                        class="text-sm text-sand-200/85 transition-colors hover:text-white"
                      >
                        {{ item.label }}
                      </a>
                    </li>
                  }
                </ul>
              </nav>
            }

            <div>
              <p class="mb-5 text-[0.72rem] font-medium tracking-[0.14em] text-white uppercase">
                Find us
              </p>
              <address class="space-y-3 text-sm not-italic text-sand-200/85">
                <p class="leading-relaxed">
                  {{ site.address.street }}<br />
                  {{ site.address.locality }}<br />
                  {{ site.address.region }} {{ site.address.postalCode }}<br />
                  {{ site.address.country }}
                </p>
                <p>
                  <a [href]="site.phoneHref" class="transition-colors hover:text-white">
                    {{ site.phoneDisplay }}
                  </a>
                </p>
                <p>
                  <a [href]="'mailto:' + site.email" class="transition-colors hover:text-white">
                    {{ site.email }}
                  </a>
                </p>
              </address>

              <p class="mt-5 text-xs leading-relaxed text-sand-200/60">
                Check-in {{ site.checkIn }}<br />
                Check-out {{ site.checkOut }}
              </p>
            </div>
          </div>
        </div>

        <!-- Legal -->
        <div
          class="mt-16 flex flex-col gap-5 border-t border-sand-200/15 pt-8 text-xs text-sand-200/60 md:flex-row md:items-center md:justify-between"
        >
          <p>© {{ year }} Vantage Point Villas. All rights reserved.</p>
          <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a routerLink="/privacy" class="transition-colors hover:text-white">Privacy policy</a>
            <a routerLink="/terms" class="transition-colors hover:text-white">Terms & conditions</a>
            <a [href]="site.bookingComUrl" target="_blank" rel="noopener" class="transition-colors hover:text-white">
              Also on Booking.com
            </a>
          </div>
        </div>

        <p class="mt-6 max-w-3xl text-[0.7rem] leading-relaxed text-sand-200/45">
          Demonstration site. Photography is placeholder imagery and rates are indicative;
          telephone numbers, e-mail addresses and social links are not live. The address,
          facilities and check-in times are taken from the property’s public listings.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly site = SITE;
  protected readonly footerNav = FOOTER_NAV;
  protected readonly year = new Date().getFullYear();
}
