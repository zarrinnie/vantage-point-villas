import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeroComponent } from '../../shared/ui/page-hero';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { IconComponent } from '../../shared/ui/icon';
import { RevealDirective } from '../../core/services/reveal.directive';
import { SeoService } from '../../core/services/seo.service';
import { ContentService } from '../../core/content/content.service';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeroComponent,
    SectionHeadingComponent,
    IconComponent,
    RevealDirective,
  ],
  template: `
    <app-page-hero
      [eyebrow]="t().hero.eyebrow"
      [title]="t().hero.title"
      [lede]="t().hero.lede"
      [image]="t().hero.image"
      [crumbs]="[{ label: 'Contact' }]"
      [meta]="t().hero.meta"
    />

    <!-- ---------- Details + form ---------- -->
    <section class="section bg-sand-50">
      <div class="container-page grid gap-14 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <!-- Details -->
        <div appReveal>
          <app-section-heading [eyebrow]="t().details.eyebrow" [title]="t().details.title" />

          <ul class="mt-10 space-y-8">
            <li class="flex items-start gap-5">
              <span class="flex size-11 shrink-0 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon name="whatsapp" [size]="19" />
              </span>
              <div>
                <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().details.whatsappLabel }}</p>
                <a
                  [href]="links().whatsapp"
                  target="_blank"
                  rel="noopener"
                  class="mt-1 block text-lg text-ink-900 transition-colors hover:text-clay-600"
                >
                  {{ site().whatsapp }}
                </a>
                <p class="mt-1 text-xs text-ink-500">{{ t().details.whatsappNote }}</p>
              </div>
            </li>

            <li class="flex items-start gap-5">
              <span class="flex size-11 shrink-0 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon name="mail" [size]="19" />
              </span>
              <div>
                <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().details.emailLabel }}</p>
                <a
                  [href]="links().reservationsEmail"
                  class="mt-1 block text-lg break-all text-ink-900 transition-colors hover:text-clay-600"
                >
                  {{ site().reservationsEmail }}
                </a>
                <a
                  [href]="links().email"
                  class="mt-1 block text-sm break-all text-ink-600 transition-colors hover:text-clay-600"
                >
                  {{ site().email }}
                </a>
              </div>
            </li>

            <li class="flex items-start gap-5">
              <span class="flex size-11 shrink-0 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon name="phone" [size]="19" />
              </span>
              <div>
                <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().details.phoneLabel }}</p>
                <a [href]="links().phone" class="mt-1 block text-lg text-ink-900 transition-colors hover:text-clay-600">
                  {{ site().phone }}
                </a>
              </div>
            </li>

            <li class="flex items-start gap-5">
              <span class="flex size-11 shrink-0 items-center justify-center border border-clay-500/40 text-clay-600">
                <app-icon name="pin" [size]="19" />
              </span>
              <div>
                <p class="text-[0.6rem] tracking-[0.2em] text-ink-500 uppercase">{{ t().details.addressLabel }}</p>
                <address class="mt-1 text-lg leading-snug text-ink-900 not-italic">
                  {{ site().address.street }}<br />
                  {{ site().address.locality }}<br />
                  {{ site().address.region }} {{ site().address.postalCode }}<br />
                  {{ site().address.country }}
                </address>
              </div>
            </li>
          </ul>

          @if (t().details.note) {
            <p class="mt-10 bg-sand-100 p-5 text-xs leading-relaxed text-ink-600">{{ t().details.note }}</p>
          }

          <ul class="mt-8 flex items-center gap-3">
            @for (social of site().socials; track $index) {
              <li>
                <a
                  [href]="social.href"
                  target="_blank"
                  rel="noopener"
                  class="flex size-10 items-center justify-center border border-ink-900/15 text-ink-700 transition-colors hover:border-clay-500 hover:text-clay-600"
                  [attr.aria-label]="social.label"
                >
                  <app-icon [name]="social.icon" [size]="17" />
                </a>
              </li>
            }
          </ul>
        </div>

        <!-- Form -->
        <div appReveal>
          @if (sent()) {
            <div class="border border-clay-500/40 bg-white/70 p-8 md:p-10">
              <span class="flex size-12 items-center justify-center rounded-full bg-clay-500 text-white">
                <app-icon name="check" [size]="24" />
              </span>
              <h2 class="mt-7 font-display text-3xl">{{ t().form.sentTitle }}</h2>
              <p class="mt-4 leading-relaxed text-ink-600">{{ t().form.sentBody }}</p>
              <div class="mt-8 flex flex-wrap gap-4">
                <button type="button" class="btn-outline" (click)="sent.set(false)">
                  Write another
                </button>
                <a routerLink="/book" class="btn-primary">Check availability</a>
              </div>
            </div>
          } @else {
            <div class="border border-sand-300 bg-white/60 p-7 md:p-9">
              <h2 class="font-display text-2xl md:text-3xl">{{ t().form.title }}</h2>
              <p class="mt-3 text-sm leading-relaxed text-ink-600">{{ t().form.intro }}</p>

              <form [formGroup]="form" class="mt-8 space-y-6" (ngSubmit)="submit()">
                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label class="field-label" for="name">Your name</label>
                    <input
                      id="name"
                      type="text"
                      class="field"
                      [class.field-invalid]="invalid('name')"
                      formControlName="name"
                      autocomplete="name"
                    />
                    @if (invalid('name')) {
                      <p class="field-error"><app-icon name="warning" [size]="13" /> Please add your name.</p>
                    }
                  </div>

                  <div>
                    <label class="field-label" for="contactEmail">E-mail</label>
                    <input
                      id="contactEmail"
                      type="email"
                      class="field"
                      [class.field-invalid]="invalid('email')"
                      formControlName="email"
                      autocomplete="email"
                    />
                    @if (invalid('email')) {
                      <p class="field-error">
                        <app-icon name="warning" [size]="13" /> We need a valid e-mail to reply to.
                      </p>
                    }
                  </div>
                </div>

                <div>
                  <label class="field-label" for="subject">What is it about?</label>
                  <select id="subject" class="field" formControlName="subject">
                    @for (option of subjects(); track $index) {
                      <option [value]="option">{{ option }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="field-label" for="message">Message</label>
                  <textarea
                    id="message"
                    rows="6"
                    class="field resize-y"
                    [class.field-invalid]="invalid('message')"
                    formControlName="message"
                    [placeholder]="t().form.messagePlaceholder"
                  ></textarea>
                  @if (invalid('message')) {
                    <p class="field-error">
                      <app-icon name="warning" [size]="13" /> A line or two is enough to get started.
                    </p>
                  }
                </div>

                <label class="flex items-start gap-3 text-sm text-ink-600">
                  <input type="checkbox" class="mt-1 size-4 shrink-0 accent-clay-500" formControlName="consent" />
                  <span>
                    I am happy for Vantage Point Villas to use these details to answer me, as set out
                    in the
                    <a routerLink="/privacy" class="text-ink-900 underline decoration-clay-500 underline-offset-4">
                      privacy policy </a
                    >.
                  </span>
                </label>
                @if (invalid('consent')) {
                  <p class="field-error"><app-icon name="warning" [size]="13" /> Please tick the box so we may reply.</p>
                }

                <button type="submit" class="btn-primary w-full justify-center sm:w-auto">
                  {{ t().form.submitButton }}
                  <app-icon name="arrow-right" [size]="15" />
                </button>
              </form>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ---------- Getting here ---------- -->
    <section class="section bg-sand-100 pt-0">
      <div class="container-page">
        <div class="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div class="order-2 lg:order-1" appReveal>
            <div class="aspect-4/3 w-full border border-sand-300 bg-sand-200">
              <iframe
                [src]="mapUrl()"
                [title]="'Map showing ' + site().name"
                class="size-full"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div class="order-1 lg:order-2" appReveal>
            <app-section-heading
              [eyebrow]="t().gettingHere.eyebrow"
              [title]="t().gettingHere.title"
              [lede]="t().gettingHere.lede"
            />

            <ul class="mt-9 divide-y divide-ink-900/10 border-y border-ink-900/10">
              @for (place of nearby(); track $index) {
                <li class="flex items-baseline justify-between gap-5 py-3.5">
                  <p class="text-sm text-ink-800">{{ place.name }}</p>
                  <p class="shrink-0 text-[0.68rem] tracking-[0.1em] text-clay-600 uppercase">
                    {{ place.distance }}
                  </p>
                </li>
              }
            </ul>

            <a routerLink="/book" class="btn-outline mt-9">
              {{ t().gettingHere.button }}
              <app-icon name="arrow-right" [size]="15" />
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactPage {
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly content = inject(ContentService);

  protected readonly t = computed(() => this.content.pages().contact);
  protected readonly site = this.content.site;
  protected readonly links = this.content.links;
  protected readonly nearby = computed(() => this.content.content().nearby);
  protected readonly subjects = computed(() => this.t().form.subjects);
  protected readonly sent = signal(false);

  /** Keyless Google Maps embed, built from the map search set in General settings. */
  protected readonly mapUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.links().mapsEmbed),
  );

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: [this.subjects()[0] ?? ''],
    message: ['', [Validators.required, Validators.minLength(10)]],
    consent: [false, [Validators.requiredTrue]],
  });

  constructor() {
    const t = this.t();
    inject(SeoService).set({ ...t.seo, image: t.hero.image });
  }

  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  /**
   * ▸ REAL INTEGRATION POINT — post the form to the property's inbox or CRM here.
   *   Nothing is transmitted in this demonstration build.
   */
  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sent.set(true);
    this.form.reset({ subject: this.subjects()[0] ?? '', consent: false });
  }
}
