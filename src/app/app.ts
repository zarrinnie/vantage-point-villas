import { ChangeDetectionStrategy, Component, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { HeaderComponent } from './shared/layout/header';
import { FooterComponent } from './shared/layout/footer';
import { WhatsappFabComponent } from './shared/layout/whatsapp-fab';

const isAdminUrl = (url: string) => /^\/admin(\/|\?|#|$)/.test(url);

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WhatsappFabComponent],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  /** The admin brings its own layout, so the public header and footer step aside. */
  protected readonly isAdmin = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => isAdminUrl(e.urlAfterRedirects)),
    ),
    { initialValue: isAdminUrl(inject(DOCUMENT).location?.pathname ?? '') },
  );
}
