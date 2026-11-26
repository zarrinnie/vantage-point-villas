import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AdminApi, ApiError } from './admin-api.service';

@Component({
  selector: 'admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-svh items-center justify-center bg-sand-100 px-4">
      <form class="adm-card w-full max-w-sm p-8 shadow-xl shadow-ink-900/5" (submit)="submit($event)">
        <p class="font-display text-3xl text-ink-900">Vantage Point</p>
        <p class="mt-1 text-xs tracking-[0.2em] text-clay-600 uppercase">Site admin</p>

        @if (notConfigured()) {
          <p class="mt-6 rounded-md bg-sand-100 p-3 text-xs leading-relaxed text-ink-700">
            The admin password has not been set on the server. Start the server with an
            <code class="font-mono">ADMIN_PASSWORD</code> environment variable, then reload this page.
          </p>
        }

        <label class="adm-label mt-7" for="admin-password">Password</label>
        <input
          #password
          id="admin-password"
          type="password"
          class="adm-input"
          autocomplete="current-password"
          required
          autofocus
          [disabled]="busy()"
        />

        @if (error()) {
          <p class="mt-3 text-xs text-red-800" role="alert">{{ error() }}</p>
        }

        <button type="submit" class="adm-btn-primary mt-6 w-full" [disabled]="busy()">
          {{ busy() ? 'Signing in…' : 'Sign in' }}
        </button>

        <a href="/" class="mt-6 block text-center text-xs text-ink-500 hover:text-ink-900">← Back to the website</a>
      </form>
    </div>
  `,
})
export class AdminLoginPage {
  private readonly api = inject(AdminApi);
  private readonly router = inject(Router);

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notConfigured = signal(false);

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.api
      .session()
      .then((s) => {
        if (s.signedIn) void this.router.navigateByUrl('/admin');
        this.notConfigured.set(!s.configured);
      })
      .catch(() => undefined);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input') as HTMLInputElement;
    if (!input.value) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      await this.api.login(input.value);
      await this.router.navigateByUrl('/admin');
    } catch (error) {
      this.error.set(error instanceof ApiError ? error.message : 'Could not sign in.');
      input.select();
    } finally {
      this.busy.set(false);
    }
  }
}
