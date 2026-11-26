import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { VILLAS } from '../data/villas.data';
import { EXTRAS } from '../data/extras.data';
import { ContentService } from '../content/content.service';
import { createDefaultContent } from '../content/default-content';
import { BlockedRange } from '../content/content.model';
import { isVillaAvailable } from '../utils/availability.util';
import { addDays, isPeakNight, toIso } from '../utils/date.util';

const VILLA = VILLAS[1]; // Two-Bedroom Garden Pool Villa: sleeps 5, min 2 nights
const CONTENT = createDefaultContent();
const PRICING = CONTENT.pricing;
const TAX = PRICING.taxPercent / 100;

/** One night the test villa is closed, a month out, set as an admin would. */
const CLOSED_NIGHT = addDays(toIso(new Date()), 30);
const RULES: BlockedRange[] = [{ villa: VILLA.slug, start: CLOSED_NIGHT, end: CLOSED_NIGHT, note: 'test' }];

/** Walk forward from `from` until a stay of `nights` is free for the villa. */
function freeRange(slug: string, nights: number, from: string): { checkIn: string; checkOut: string } {
  for (let i = 0; i < 400; i++) {
    const checkIn = addDays(from, i);
    const checkOut = addDays(checkIn, nights);
    if (isVillaAvailable(slug, checkIn, checkOut, RULES)) return { checkIn, checkOut };
  }
  throw new Error(`No free ${nights}-night range found for ${slug}`);
}

/** The same, but every night must be a peak-season night. */
function freePeakRange(slug: string, nights: number): { checkIn: string; checkOut: string } {
  const july = `${new Date().getFullYear() + 1}-07-01`;
  for (let i = 0; i < 45; i++) {
    const checkIn = addDays(july, i);
    const checkOut = addDays(checkIn, nights);
    const allPeak = Array.from({ length: nights }, (_, n) =>
      isPeakNight(addDays(checkIn, n), PRICING.peakSeasons),
    ).every(Boolean);
    if (allPeak && isVillaAvailable(slug, checkIn, checkOut, RULES)) return { checkIn, checkOut };
  }
  throw new Error('No free peak range found');
}

/** A stay that contains the closed night. */
function blockedRange(): { checkIn: string; checkOut: string } {
  return { checkIn: addDays(CLOSED_NIGHT, -1), checkOut: addDays(CLOSED_NIGHT, 2) };
}

describe('BookingService', () => {
  let service: BookingService;
  let tomorrow: string;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    TestBed.inject(ContentService).replace({ ...createDefaultContent(), availability: { blocked: RULES } });
    service = TestBed.inject(BookingService);
    tomorrow = addDays(toIso(new Date()), 1);
  });

  // ---- Stay ---------------------------------------------------------------
  it('starts with no stay chosen', () => {
    expect(service.nights()).toBe(0);
    expect(service.villa()).toBeNull();
    expect(service.quote().total).toBe(0);
    expect(service.guests()).toBe(2);
  });

  it('counts nights between check-in and check-out', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 5, tomorrow);
    service.setDates(checkIn, checkOut);
    expect(service.nights()).toBe(5);
  });

  it('clamps the guest counters', () => {
    service.setAdults(0);
    expect(service.adults()).toBe(1);
    service.setAdults(99);
    expect(service.adults()).toBe(10);
    service.setChildren(-3);
    expect(service.children()).toBe(0);
  });

  // ---- Pricing ------------------------------------------------------------
  it('prices accommodation as rate x nights plus tax', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);

    const quote = service.quote();
    const accommodation = VILLA.nightlyRate * 3;
    const expectedSubtotal = accommodation + quote.peakSupplement + quote.discount;

    expect(quote.nights).toBe(3);
    expect(quote.accommodation).toBe(accommodation);
    expect(quote.extrasTotal).toBe(0);
    expect(quote.subtotal).toBeCloseTo(expectedSubtotal, 6);
    expect(quote.taxAndService).toBeCloseTo(expectedSubtotal * TAX, 6);
    expect(quote.total).toBeCloseTo(expectedSubtotal * (1 + TAX), 6);
  });

  it('adds the peak-season supplement only for peak nights', () => {
    const { checkIn, checkOut } = freePeakRange(VILLA.slug, 3);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);

    const quote = service.quote();
    expect(quote.hasPeakNights).toBe(true);
    expect(quote.peakSupplement).toBeCloseTo(
      VILLA.nightlyRate * (PRICING.peakSupplementPercent / 100) * 3,
      6,
    );
    expect(quote.lines.some((l) => l.label === PRICING.peakSupplementLabel)).toBe(true);
  });

  it('charges no supplement outside the peak windows', () => {
    // Early May is outside both peak windows.
    const may = `${new Date().getFullYear() + 1}-05-04`;
    const { checkIn, checkOut } = freeRange(VILLA.slug, 2, may);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);

    expect(service.quote().hasPeakNights).toBe(false);
    expect(service.quote().peakSupplement).toBe(0);
  });

  it('follows pricing rules edited in the admin', () => {
    const content = TestBed.inject(ContentService);
    content.replace({
      ...content.content(),
      pricing: { ...PRICING, taxPercent: 10, longStayTiers: [{ minNights: 3, discountPercent: 50, label: 'Half off' }] },
    });
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, `${new Date().getFullYear() + 1}-05-04`);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);

    const quote = service.quote();
    expect(quote.discount).toBeCloseTo(-VILLA.nightlyRate * 3 * 0.5, 6);
    expect(quote.taxAndService).toBeCloseTo(quote.subtotal * 0.1, 6);
    expect(quote.lines.some((l) => l.label === 'Half off')).toBe(true);
  });

  it('reduces the rate for stays of seven nights and again at fourteen', () => {
    const seven = freeRange(VILLA.slug, 7, tomorrow);
    service.setDates(seven.checkIn, seven.checkOut);
    service.selectVilla(VILLA.slug);

    let quote = service.quote();
    const sevenTier = PRICING.longStayTiers.find((t) => t.minNights === 7)!;
    expect(quote.discount).toBeCloseTo(
      -((quote.accommodation + quote.peakSupplement) * (sevenTier.discountPercent / 100)),
      6,
    );

    const fourteen = freeRange(VILLA.slug, 14, tomorrow);
    service.setDates(fourteen.checkIn, fourteen.checkOut);
    service.selectVilla(VILLA.slug);

    quote = service.quote();
    const fourteenTier = PRICING.longStayTiers.find((t) => t.minNights === 14)!;
    expect(quote.discount).toBeCloseTo(
      -((quote.accommodation + quote.peakSupplement) * (fourteenTier.discountPercent / 100)),
      6,
    );
  });

  it('applies no reduction below seven nights', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 6, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);
    expect(service.quote().discount).toBe(0);
  });

  // ---- Extras -------------------------------------------------------------
  it('multiplies each extra out according to how it is priced', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 4, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);
    service.setAdults(2);
    service.setChildren(1);

    const perStay = EXTRAS.find((e) => e.pricing === 'per-stay')!;
    const perNight = EXTRAS.find((e) => e.pricing === 'per-night')!;
    const perGuestNight = EXTRAS.find((e) => e.pricing === 'per-guest-night')!;

    expect(service.extraAmount(perStay)).toBe(perStay.price);
    expect(service.extraAmount(perNight)).toBe(perNight.price * 4);
    expect(service.extraAmount(perGuestNight)).toBe(perGuestNight.price * 3 * 4);
  });

  it('adds selected extras to the quote and removes them again', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);

    const extra = EXTRAS[0];
    service.toggleExtra(extra.id);
    expect(service.hasExtra(extra.id)).toBe(true);
    expect(service.quote().extrasTotal).toBe(service.extraAmount(extra));

    service.toggleExtra(extra.id);
    expect(service.hasExtra(extra.id)).toBe(false);
    expect(service.quote().extrasTotal).toBe(0);
  });

  // ---- Availability & validation -----------------------------------------
  it('refuses a villa when any night of the stay is taken', () => {
    const { checkIn, checkOut } = blockedRange();
    service.checkIn.set(checkIn);
    service.checkOut.set(checkOut);
    service.selectVilla(VILLA.slug);

    expect(service.selectionIssue()).toContain('not free');
    expect(service.candidateVillas().find((c) => c.villa.slug === VILLA.slug)?.available).toBe(
      false,
    );
  });

  it('only offers villas large enough for the party', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    service.setAdults(6);
    service.setChildren(1);

    const slugs = service.candidateVillas().map((c) => c.villa.slug);
    expect(slugs).toContain('family-pool-villa'); // sleeps 7
    expect(slugs).not.toContain('vantage-suite'); // sleeps 2
  });

  it('enforces each villa’s minimum stay', () => {
    const ocean = VILLAS.find((v) => v.slug === 'ocean-breeze-villa')!;
    expect(ocean.minNights).toBe(3);

    const { checkIn, checkOut } = freeRange(ocean.slug, 2, tomorrow);
    service.checkIn.set(checkIn);
    service.checkOut.set(checkOut);
    service.selectVilla(ocean.slug);

    expect(service.selectionIssue()).toContain('minimum stay');
    expect(service.canContinueFromVilla()).toBe(false);
  });

  it('drops a chosen villa when new dates no longer suit it', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);
    expect(service.villaSlug()).toBe(VILLA.slug);

    const blocked = blockedRange();
    service.setDates(blocked.checkIn, blocked.checkOut);
    expect(service.villaSlug()).toBeNull();
  });

  // ---- Confirmation -------------------------------------------------------
  it('confirms a valid booking with a reference and the quoted total', async () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 4, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);
    service.patchGuest({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });

    const expectedTotal = Math.round(service.quote().total);
    const confirmation = await service.confirm();

    expect(confirmation).not.toBeNull();
    expect(confirmation!.reference).toMatch(/^VPV-[A-Z0-9]{4}-\d{4}$/);
    expect(confirmation!.villaSlug).toBe(VILLA.slug);
    expect(confirmation!.nights).toBe(4);
    expect(confirmation!.total).toBe(expectedTotal);
    expect(confirmation!.guest.firstName).toBe('Ada');
    expect(service.confirmation()).toEqual(confirmation);
    expect(service.step()).toBe(5);
    expect(service.submitting()).toBe(false);
  });

  it('will not confirm without a villa', async () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    await expect(service.confirm()).resolves.toBeNull();
    expect(service.confirmation()).toBeNull();
  });

  it('will not confirm a stay the villa cannot take', async () => {
    const { checkIn, checkOut } = blockedRange();
    service.checkIn.set(checkIn);
    service.checkOut.set(checkOut);
    service.selectVilla(VILLA.slug);

    await expect(service.confirm()).resolves.toBeNull();
  });

  it('clears everything on reset', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 3, tomorrow);
    service.setDates(checkIn, checkOut);
    service.selectVilla(VILLA.slug);
    service.toggleExtra(EXTRAS[0].id);

    service.reset();

    expect(service.checkIn()).toBeNull();
    expect(service.checkOut()).toBeNull();
    expect(service.villaSlug()).toBeNull();
    expect(service.extraIds()).toEqual([]);
    expect(service.adults()).toBe(2);
    expect(service.step()).toBe(1);
  });

  // ---- Deep links ---------------------------------------------------------
  it('seeds the flow from query parameters and skips to the extras step', () => {
    const { checkIn, checkOut } = freeRange(VILLA.slug, 4, tomorrow);
    service.applyQueryParams({ villa: VILLA.slug, checkIn, checkOut, adults: '3' });

    expect(service.villaSlug()).toBe(VILLA.slug);
    expect(service.nights()).toBe(4);
    expect(service.adults()).toBe(3);
    expect(service.step()).toBe(3);
  });

  it('ignores malformed query parameters', () => {
    service.applyQueryParams({ villa: 'no-such-villa', checkIn: 'yesterday', adults: 'two' });

    expect(service.villaSlug()).toBeNull();
    expect(service.checkIn()).toBeNull();
    expect(service.adults()).toBe(2);
    expect(service.step()).toBe(1);
  });
});
