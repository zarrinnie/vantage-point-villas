import {
  addDays,
  addMonths,
  daysInMonth,
  fromIso,
  isPeakNight,
  isValidIso,
  mondayFirstWeekday,
  nightsBetween,
  nightsOfStay,
  startOfMonth,
  toIso,
} from './date.util';
import { isVillaAvailable, isVillaBooked, unavailableNights } from './availability.util';

describe('date utilities', () => {
  it('round-trips a date through ISO without shifting the day', () => {
    const date = new Date(2026, 10, 10, 23, 30); // 10 Nov 2026, late evening
    expect(toIso(date)).toBe('2026-11-10');
    expect(toIso(fromIso('2026-11-10'))).toBe('2026-11-10');
  });

  it('validates ISO date strings', () => {
    expect(isValidIso('2026-07-04')).toBe(true);
    expect(isValidIso('2026-7-4')).toBe(false);
    expect(isValidIso('yesterday')).toBe(false);
    expect(isValidIso(undefined)).toBe(false);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('adds months from the first of the month', () => {
    expect(addMonths('2026-11-30', 1)).toBe('2026-12-01');
    expect(addMonths('2026-12-01', 2)).toBe('2027-02-01');
  });

  it('counts nights, and never counts backwards', () => {
    expect(nightsBetween('2026-07-01', '2026-07-05')).toBe(4);
    expect(nightsBetween('2026-07-05', '2026-07-01')).toBe(0);
    expect(nightsBetween('2026-07-01', '2026-07-01')).toBe(0);
  });

  it('lists the nights of a stay, excluding the departure day', () => {
    expect(nightsOfStay('2026-07-01', '2026-07-04')).toEqual([
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
    ]);
  });

  it('knows the peak windows', () => {
    expect(isPeakNight('2026-07-15')).toBe(true);
    expect(isPeakNight('2026-08-31')).toBe(true);
    expect(isPeakNight('2026-12-20')).toBe(true);
    expect(isPeakNight('2027-01-05')).toBe(true);
    expect(isPeakNight('2026-12-19')).toBe(false);
    expect(isPeakNight('2027-01-06')).toBe(false);
    expect(isPeakNight('2026-05-04')).toBe(false);
  });

  it('builds a Monday-first calendar grid', () => {
    // 1 Nov 2026 is a Sunday, the last column of a Monday-first week.
    expect(mondayFirstWeekday('2026-11-01')).toBe(6);
    expect(startOfMonth('2026-11-10')).toBe('2026-11-01');
    expect(daysInMonth('2026-02-01')).toBe(28);
    expect(daysInMonth('2028-02-01')).toBe(29);
  });
});

describe('mock availability', () => {
  it('is deterministic for the same villa and date', () => {
    const first = isVillaBooked('ocean-breeze-villa', '2027-04-10');
    for (let i = 0; i < 5; i++) {
      expect(isVillaBooked('ocean-breeze-villa', '2027-04-10')).toBe(first);
    }
  });

  it('treats a stay as unavailable when any of its nights is taken', () => {
    // Find a night that is taken, then build a stay that contains it.
    let taken: string | null = null;
    for (let i = 0; i < 400 && !taken; i++) {
      const date = addDays('2027-01-01', i);
      if (isVillaBooked('vantage-suite', date)) taken = date;
    }
    expect(taken).not.toBeNull();

    const checkIn = addDays(taken!, -1);
    const checkOut = addDays(taken!, 2);
    expect(isVillaAvailable('vantage-suite', checkIn, checkOut)).toBe(false);
    expect(unavailableNights('vantage-suite', checkIn, checkOut)).toContain(taken);
  });

  it('rejects an empty or inverted range', () => {
    expect(isVillaAvailable('vantage-suite', '2027-05-10', '2027-05-10')).toBe(false);
    expect(isVillaAvailable('vantage-suite', '2027-05-12', '2027-05-10')).toBe(false);
  });
});
