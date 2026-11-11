import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconComponent } from '../../shared/ui/icon';
import { SectionHeadingComponent } from '../../shared/ui/section-heading';
import { StepperComponent } from '../../shared/ui/stepper';
import { CounterInputComponent } from '../../shared/ui/counter-input';
import { DateRange, DateRangePickerComponent } from '../../shared/ui/date-range-picker';
import { PriceSummaryComponent } from '../../shared/ui/price-summary';
import { BookingService } from '../../core/services/booking.service';
import { SeoService } from '../../core/services/seo.service';
import { SITE } from '../../core/data/site.data';
import { extraById } from '../../core/data/extras.data';
import { BookingStep, Extra } from '../../core/models/booking.model';
import { Villa } from '../../core/models/villa.model';
import { formatLong, formatShort } from '../../core/utils/date.util';
import { guestsLabel, nightsLabel, usd } from '../../core/utils/format.util';

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    IconComponent,
    SectionHeadingComponent,
    StepperComponent,
    CounterInputComponent,
    DateRangePickerComponent,
    PriceSummaryComponent,
  ],
  templateUrl: './booking.html',
})
export class BookingPage {
  protected readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly site = SITE;
  protected readonly stepLabels = ['Stay', 'Villa', 'Extras', 'Details', 'Review'];
  protected readonly arrivalSlots = [
    'Before 15:00 (early arrival, subject to the villa being free)',
    '15:00 – 18:00',
    '18:00 – 21:00',
    'After 21:00',
  ];

  protected readonly step = this.booking.step;
  protected readonly confirmation = this.booking.confirmation;
  protected readonly candidates = this.booking.candidateVillas;

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    country: ['', [Validators.required]],
    arrivalTime: [''],
    requests: [''],
    terms: [false, [Validators.requiredTrue]],
  });

  protected readonly nightsText = computed(() => nightsLabel(this.booking.nights()));
  protected readonly guestsText = computed(() =>
    guestsLabel(this.booking.adults(), this.booking.children()),
  );

  protected readonly villaStepLede = computed(() => {
    const free = this.booking.bookableVillas().length;
    const guests = this.booking.guests();
    return `${free} of our villas can take ${guests} ${guests === 1 ? 'guest' : 'guests'} on those dates. Prices shown are the total for the whole stay, tax and service included.`;
  });

  protected readonly canAdvance = computed(() => {
    switch (this.step()) {
      case 1:
        return this.booking.canContinueFromStay();
      case 2:
        return this.booking.canContinueFromVilla();
      default:
        return true;
    }
  });

  protected readonly canConfirm = computed(
    () => !!this.booking.villa() && this.booking.nights() > 0 && !this.booking.selectionIssue(),
  );

  protected readonly bookedExtras = computed<Extra[]>(() => {
    const booked = this.confirmation();
    if (!booked) return [];
    return booked.extraIds.map((id) => extraById(id)).filter((e): e is Extra => !!e);
  });

  protected readonly formatLong = formatLong;
  protected readonly formatShort = formatShort;
  protected readonly money = usd;

  constructor() {
    inject(SeoService).set({
      title: 'Book your stay',
      description:
        'Choose your dates, pick a villa and see the full price before you confirm. Booking direct with Vantage Point Villas keeps the platform commission out of the rate.',
    });

    // Seed the flow from a deep link, e.g. from a villa page or the hero search.
    const params = this.route.snapshot.queryParamMap;
    this.booking.applyQueryParams({
      villa: params.get('villa') ?? undefined,
      checkIn: params.get('checkIn') ?? undefined,
      checkOut: params.get('checkOut') ?? undefined,
      adults: params.get('adults') ?? undefined,
      children: params.get('children') ?? undefined,
    });

    // Restore any details already typed in this session.
    const guest = this.booking.guest();
    this.form.patchValue({ ...guest, terms: false });
  }

  // ---- Step 1 -------------------------------------------------------------
  protected onRange(range: DateRange): void {
    this.booking.setDates(range.checkIn, range.checkOut);
  }

  // ---- Step 2 -------------------------------------------------------------
  protected choose(slug: string): void {
    this.booking.selectVilla(slug);
  }

  protected quoteFor(villa: Villa) {
    return this.booking.quoteFor(villa);
  }

  protected cardClass(candidate: {
    villa: Villa;
    available: boolean;
    meetsMinNights: boolean;
  }): string {
    if (!candidate.available || !candidate.meetsMinNights) {
      return 'border-sand-300 bg-sand-100/60 opacity-60 cursor-not-allowed';
    }
    return this.booking.villaSlug() === candidate.villa.slug
      ? 'border-clay-500 bg-clay-500/5'
      : 'border-sand-300 bg-white/60 hover:border-clay-400';
  }

  protected blockedText(nights: readonly string[]): string {
    const shown = nights.slice(0, 3).map((n) => formatShort(n));
    const more = nights.length - shown.length;
    return more > 0 ? `${shown.join(', ')} and ${more} more` : shown.join(', ');
  }

  // ---- Step 3 -------------------------------------------------------------
  protected extraAmount(extra: Extra): number {
    return this.booking.extraAmount(extra);
  }

  protected extraDetail(extra: Extra): string {
    return this.booking.extraDetail(extra);
  }

  // ---- Step 4 -------------------------------------------------------------
  protected invalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submitDetails(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { terms, ...guest } = this.form.getRawValue();
    void terms;
    this.booking.patchGuest(guest);
    this.booking.goToStep(5);
  }

  // ---- Navigation & confirmation -----------------------------------------
  protected advance(): void {
    if (!this.canAdvance()) return;
    this.booking.next();
  }

  protected goTo(step: number): void {
    this.booking.goToStep(step as BookingStep);
  }

  protected async confirm(): Promise<void> {
    if (!this.canConfirm()) return;
    await this.booking.confirm();
  }

  protected startAgain(): void {
    this.booking.reset();
    this.form.reset();
    void this.router.navigate(['/book']);
  }
}
