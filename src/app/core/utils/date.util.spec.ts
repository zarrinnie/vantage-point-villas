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

  it('knows the yearly peak windows, including one that wraps over New Year', () => {
    const seasons = [
      { start: '2026-07-01', end: '2026-08-31', repeatsYearly: true },
      { start: '2026-12-20', end: '2027-01-05', repeatsYearly: true },
    ];
    expect(isPeakNight('2026-07-15', seasons)).toBe(true);
    expect(isPeakNight('2026-08-31', seasons)).toBe(true);
    expect(isPeakNight('2026-12-20', seasons)).toBe(true);
    expect(isPeakNight('2027-01-05', seasons)).toBe(true);
    expect(isPeakNight('2026-12-19', seasons)).toBe(false);
    expect(isPeakNight('2027-01-06', seasons)).toBe(false);
    expect(isPeakNight('2026-05-04', seasons)).toBe(false);
    // Yearly windows recur in later years too.
    expect(isPeakNight('2030-07-15', seasons)).toBe(true);
  });

  it('limits a one-off peak window to its own dates', () => {
    const seasons = [{ start: '2027-03-10', end: '2027-03-12', repeatsYearly: false }];
    expect(isPeakNight('2027-03-11', seasons)).toBe(true);
    expect(isPeakNight('2028-03-11', seasons)).toBe(false);
    expect(isPeakNight('2027-03-13', seasons)).toBe(false);
    expect(isPeakNight('2027-03-11', [])).toBe(false);
  });

  it('builds a Monday-first calendar grid', () => {
    // 1 Nov 2026 is a Sunday, the last column of a Monday-first week.
    expect(mondayFirstWeekday('2026-11-01')).toBe(6);
    expect(startOfMonth('2026-11-10')).toBe('2026-11-01');
    expect(daysInMonth('2026-02-01')).toBe(28);
    expect(daysInMonth('2028-02-01')).toBe(29);
  });
});

describe('availability', () => {
  const rules = [
    { villa: 'vantage-suite', start: '2027-04-10', end: '2027-04-12' },
    { villa: '', start: '2027-06-01', end: '2027-06-01' },
  ];

  it('closes a villa only on its own closed nights', () => {
    expect(isVillaBooked('vantage-suite', '2027-04-11', rules)).toBe(true);
    expect(isVillaBooked('vantage-suite', '2027-04-13', rules)).toBe(false);
    expect(isVillaBooked('ocean-breeze-villa', '2027-04-11', rules)).toBe(false);
  });

  it('closes every villa on a property-wide closure', () => {
    expect(isVillaBooked('ocean-breeze-villa', '2027-06-01', rules)).toBe(true);
    expect(isVillaBooked('vantage-suite', '2027-06-01', rules)).toBe(true);
  });

  it('treats a stay as unavailable when any of its nights is taken', () => {
    expect(isVillaAvailable('vantage-suite', '2027-04-08', '2027-04-11', rules)).toBe(false);
    expect(unavailableNights('vantage-suite', '2027-04-08', '2027-04-12', rules)).toEqual([
      '2027-04-10',
      '2027-04-11',
    ]);
    // Leaving on the first closed day is fine: that night is not slept.
    expect(isVillaAvailable('vantage-suite', '2027-04-08', '2027-04-10', rules)).toBe(true);
  });

  it('rejects an empty or inverted range', () => {
    expect(isVillaAvailable('vantage-suite', '2027-05-10', '2027-05-10', rules)).toBe(false);
    expect(isVillaAvailable('vantage-suite', '2027-05-12', '2027-05-10', rules)).toBe(false);
  });
});
