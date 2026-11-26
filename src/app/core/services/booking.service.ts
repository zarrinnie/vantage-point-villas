import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  BookingConfirmation,
  BookingQuote,
  BookingStep,
  Extra,
  GuestDetails,
  QuoteLine,
} from '../models/booking.model';
import { Villa } from '../models/villa.model';
import { VillaService } from './villa.service';
import { ContentService } from '../content/content.service';
import {
  IsoDate,
  addDays,
  isValidIso,
  nightsBetween,
  nightsOfStay,
  today,
} from '../utils/date.util';
import { isVillaAvailable, unavailableNights } from '../utils/availability.util';
import { priceStay, taxRate } from '../utils/pricing.util';
import { nightsLabel, usd } from '../utils/format.util';

const DRAFT_KEY = 'vpv.booking.draft.v1';
const CONFIRMATION_KEY = 'vpv.booking.confirmation.v1';

export const EMPTY_GUEST: GuestDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  arrivalTime: '',
  requests: '',
};

interface PersistedDraft {
  checkIn: IsoDate | null;
  checkOut: IsoDate | null;
  adults: number;
  children: number;
  villaSlug: string | null;
  extraIds: string[];
  guest: GuestDetails;
  step: BookingStep;
}

/**
 * Holds the whole booking flow. State is signals, the price is a computed, and
 * `confirm()` is the one place a real reservations API would be called.
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly villaService = inject(VillaService);
  private readonly content = inject(ContentService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ---- Raw state ---------------------------------------------------------
  readonly checkIn = signal<IsoDate | null>(null);
  readonly checkOut = signal<IsoDate | null>(null);
  readonly adults = signal(2);
  readonly children = signal(0);
  readonly villaSlug = signal<string | null>(null);
  readonly extraIds = signal<readonly string[]>([]);
  readonly guest = signal<GuestDetails>({ ...EMPTY_GUEST });
  readonly step = signal<BookingStep>(1);
  readonly confirmation = signal<BookingConfirmation | null>(null);
  readonly submitting = signal(false);

  /** Every extra on offer, as edited in Admin → Services & extras. */
  readonly allExtras = this.content.extras;

  constructor() {
    this.restore();

    // Persist the draft so a reload mid-booking does not lose the stay.
    effect(() => {
      const draft: PersistedDraft = {
        checkIn: this.checkIn(),
        checkOut: this.checkOut(),
        adults: this.adults(),
        children: this.children(),
        villaSlug: this.villaSlug(),
        extraIds: [...this.extraIds()],
        guest: this.guest(),
        step: this.step(),
      };
      this.write(DRAFT_KEY, draft);
    });
  }

  // ---- Derived state -----------------------------------------------------
  readonly guests = computed(() => this.adults() + this.children());

  readonly nights = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    return from && to ? nightsBetween(from, to) : 0;
  });

  readonly villa = computed(() => this.villaService.bySlug(this.villaSlug()));

  readonly extras = computed(() =>
    this.extraIds()
      .map((id) => this.extraById(id))
      .filter((e): e is Extra => !!e),
  );

  readonly datesChosen = computed(() => this.nights() > 0);

  /** Villas that sleep the party and are free for the chosen dates. */
  readonly candidateVillas = computed(() => {
    const from = this.checkIn();
    const to = this.checkOut();
    const rules = this.content.blocked();
    return this.villaService.fitsGuests(this.guests()).map((villa) => ({
      villa,
      available: from && to ? isVillaAvailable(villa.slug, from, to, rules) : true,
      meetsMinNights: this.nights() === 0 || this.nights() >= villa.minNights,
      blockedNights: from && to ? unavailableNights(villa.slug, from, to, rules) : [],
    }));
  });

  readonly bookableVillas = computed(() =>
    this.candidateVillas().filter((c) => c.available && c.meetsMinNights),
  );

  /** Why the current selection cannot proceed, or null when it can. */
  readonly selectionIssue = computed<string | null>(() => {
    const villa = this.villa();
    const from = this.checkIn();
    const to = this.checkOut();
    if (!villa || !from || !to) return null;
    if (this.guests() > villa.maxGuests) {
      return `${villa.name} sleeps ${villa.maxGuests}. Choose a larger villa or reduce the party.`;
    }
    if (this.nights() < villa.minNights) {
      return `${villa.name} has a minimum stay of ${nightsLabel(villa.minNights)}.`;
    }
    if (!isVillaAvailable(villa.slug, from, to, this.content.blocked())) {
      return `${villa.name} is not free for every night of those dates.`;
    }
    return null;
  });

  readonly quote = computed<BookingQuote>(() => this.quoteFor(this.villa()));

  readonly canContinueFromStay = computed(
    () => this.datesChosen() && this.guests() > 0 && !!this.checkIn() && !!this.checkOut(),
  );

  readonly canContinueFromVilla = computed(() => !!this.villa() && !this.selectionIssue());

  // ---- Mutations ---------------------------------------------------------
  setDates(checkIn: IsoDate | null, checkOut: IsoDate | null): void {
    this.checkIn.set(checkIn);
    this.checkOut.set(checkOut);
    // A villa already chosen may no longer suit the new dates.
    const issue = this.villa() ? this.selectionIssue() : null;
    if (issue) this.villaSlug.set(null);
  }

  setAdults(n: number): void {
    this.adults.set(Math.min(10, Math.max(1, Math.round(n))));
  }

  setChildren(n: number): void {
    this.children.set(Math.min(8, Math.max(0, Math.round(n))));
  }

  selectVilla(slug: string | null): void {
    this.villaSlug.set(slug);
  }

  toggleExtra(id: string): void {
    const current = this.extraIds();
    this.extraIds.set(
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  hasExtra(id: string): boolean {
    return this.extraIds().includes(id);
  }

  patchGuest(patch: Partial<GuestDetails>): void {
    this.guest.set({ ...this.guest(), ...patch });
  }

  goToStep(step: BookingStep): void {
    this.step.set(step);
  }

  next(): void {
    this.step.update((s) => (Math.min(5, s + 1) as BookingStep));
  }

  back(): void {
    this.step.update((s) => (Math.max(1, s - 1) as BookingStep));
  }

  /**
   * Seed the flow from query parameters, e.g.
   * `/book?villa=ocean-breeze-villa&checkIn=2026-07-02&checkOut=2026-07-06&adults=2`.
   */
  applyQueryParams(params: Record<string, string | undefined>): void {
    const { villa, checkIn, checkOut, adults, children } = params;

    if (isValidIso(checkIn)) this.checkIn.set(checkIn);
    if (isValidIso(checkOut)) this.checkOut.set(checkOut);
    if (adults && !Number.isNaN(Number(adults))) this.setAdults(Number(adults));
    if (children && !Number.isNaN(Number(children))) this.setChildren(Number(children));

    if (villa && this.villaService.bySlug(villa)) {
      this.villaSlug.set(villa);
      // Dates and a villa together mean the visitor can start at the extras step.
      if (this.datesChosen() && !this.selectionIssue()) {
        this.step.set(3);
        return;
      }
      this.step.set(this.datesChosen() ? 2 : 1);
      return;
    }
    if (this.datesChosen()) this.step.set(2);
  }

  /** Sensible defaults for an empty picker: next Friday, four nights. */
  suggestDates(): void {
    if (this.checkIn() && this.checkOut()) return;
    const start = addDays(today(), 14);
    this.checkIn.set(start);
    this.checkOut.set(addDays(start, 4));
  }

  reset(): void {
    this.checkIn.set(null);
    this.checkOut.set(null);
    this.adults.set(2);
    this.children.set(0);
    this.villaSlug.set(null);
    this.extraIds.set([]);
    this.guest.set({ ...EMPTY_GUEST });
    this.step.set(1);
    this.confirmation.set(null);
    this.remove(CONFIRMATION_KEY);
  }

  // ---- Pricing -----------------------------------------------------------
  /**
   * Prices the current stay for any villa, so the villa step can show what
   * each one would cost before it is selected.
   */
  quoteFor(villa: Villa | null): BookingQuote {
    const nights = this.nights();
    const guests = this.guests();
    const from = this.checkIn();
    const to = this.checkOut();

    if (!villa || nights <= 0 || !from || !to) {
      return {
        villa,
        nights,
        guests,
        lines: [],
        accommodation: 0,
        peakSupplement: 0,
        discount: 0,
        extrasTotal: 0,
        subtotal: 0,
        taxAndService: 0,
        total: 0,
        averageNightly: villa?.nightlyRate ?? 0,
        hasPeakNights: false,
      };
    }

    const pricing = this.content.pricing();
    const { accommodation, peakNights, peakSupplement, tier, discount } = priceStay(
      villa.nightlyRate,
      nightsOfStay(from, to),
      pricing,
    );

    const lines: QuoteLine[] = [
      {
        label: villa.name,
        detail: `${usd(villa.nightlyRate)} × ${nightsLabel(nights)}`,
        amount: accommodation,
      },
    ];

    if (peakSupplement > 0) {
      lines.push({
        label: pricing.peakSupplementLabel,
        detail: `${nightsLabel(peakNights)} at +${pricing.peakSupplementPercent}%`,
        amount: peakSupplement,
      });
    }

    if (tier && discount !== 0) {
      lines.push({
        label: tier.label,
        detail: `${tier.discountPercent}% off from ${tier.minNights} nights`,
        amount: discount,
      });
    }

    let extrasTotal = 0;
    for (const extra of this.extras()) {
      const amount = this.extraAmount(extra, nights, guests);
      extrasTotal += amount;
      lines.push({
        label: extra.label,
        detail: this.extraDetail(extra, nights, guests),
        amount,
      });
    }

    const subtotal = accommodation + peakSupplement + discount + extrasTotal;
    const taxAndService = subtotal * taxRate(pricing);
    const total = subtotal + taxAndService;

    lines.push({ label: `${pricing.taxLabel} (${pricing.taxPercent}%)`, amount: taxAndService });

    return {
      villa,
      nights,
      guests,
      lines,
      accommodation,
      peakSupplement,
      discount,
      extrasTotal,
      subtotal,
      taxAndService,
      total,
      averageNightly: (accommodation + peakSupplement + discount) / nights,
      hasPeakNights: peakNights > 0,
    };
  }

  /** What a single extra adds to the bill for this stay. */
  extraAmount(extra: Extra, nights = this.nights(), guests = this.guests()): number {
    switch (extra.pricing) {
      case 'per-night':
        return extra.price * Math.max(1, nights);
      case 'per-guest-night':
        return extra.price * Math.max(1, guests) * Math.max(1, nights);
      case 'per-stay':
      default:
        return extra.price;
    }
  }

  extraDetail(extra: Extra, nights = this.nights(), guests = this.guests()): string {
    switch (extra.pricing) {
      case 'per-night':
        return `${usd(extra.price)} × ${nightsLabel(nights)}`;
      case 'per-guest-night':
        return `${usd(extra.price)} × ${guests} guests × ${nightsLabel(nights)}`;
      case 'per-stay':
      default:
        return 'once per stay';
    }
  }

  // ---- Confirmation ------------------------------------------------------
  /**
   * Completes the booking.
   *
   * ▸ REAL INTEGRATION POINT — replace the body of this method with a POST to
   *   the reservations API (inject `HttpClient` and await the response). The
   *   returned `BookingConfirmation` shape is what the rest of the UI reads.
   */
  async confirm(): Promise<BookingConfirmation | null> {
    const villa = this.villa();
    const from = this.checkIn();
    const to = this.checkOut();
    if (!villa || !from || !to || this.selectionIssue()) return null;

    this.submitting.set(true);
    // Stand-in for network latency so the UI's pending state is exercised.
    await new Promise((resolve) => setTimeout(resolve, 650));

    const confirmation: BookingConfirmation = {
      reference: this.makeReference(),
      createdAt: new Date().toISOString(),
      villaSlug: villa.slug,
      villaName: villa.name,
      checkIn: from,
      checkOut: to,
      nights: this.nights(),
      adults: this.adults(),
      children: this.children(),
      extraIds: [...this.extraIds()],
      guest: { ...this.guest() },
      total: Math.round(this.quote().total),
    };

    this.confirmation.set(confirmation);
    this.write(CONFIRMATION_KEY, confirmation);
    this.remove(DRAFT_KEY);
    this.submitting.set(false);
    this.step.set(5);
    return confirmation;
  }

  /** "VPV-7K2F-4310" */
  private makeReference(): string {
    const block = () =>
      Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const digits = `${Math.floor(1000 + Math.random() * 9000)}`;
    return `VPV-${block().padEnd(4, 'X')}-${digits}`;
  }

  extraById(id: string): Extra | undefined {
    return this.content.extras().find((e) => e.id === id);
  }

  /** Villas that sleep a given party, used by the quick-search bar. */
  villasFor(guests: number): Villa[] {
    return this.villaService.fitsGuests(guests);
  }

  // ---- Storage (browser only) -------------------------------------------
  private restore(): void {
    const confirmation = this.read<BookingConfirmation>(CONFIRMATION_KEY);
    if (confirmation?.reference) {
      this.confirmation.set(confirmation);
    }

    const draft = this.read<PersistedDraft>(DRAFT_KEY);
    if (!draft) return;

    if (isValidIso(draft.checkIn) && draft.checkIn >= today()) this.checkIn.set(draft.checkIn);
    if (isValidIso(draft.checkOut) && this.checkIn()) this.checkOut.set(draft.checkOut);
    if (typeof draft.adults === 'number') this.setAdults(draft.adults);
    if (typeof draft.children === 'number') this.setChildren(draft.children);
    if (draft.villaSlug && this.villaService.bySlug(draft.villaSlug)) {
      this.villaSlug.set(draft.villaSlug);
    }
    if (Array.isArray(draft.extraIds)) {
      this.extraIds.set(draft.extraIds.filter((id) => !!this.extraById(id)));
    }
    if (draft.guest) this.guest.set({ ...EMPTY_GUEST, ...draft.guest });
    if (draft.step >= 1 && draft.step <= 4) this.step.set(draft.step);
  }

  private read<T>(key: string): T | null {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private browsing, or storage full — the flow works without it */
    }
  }

  private remove(key: string): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
