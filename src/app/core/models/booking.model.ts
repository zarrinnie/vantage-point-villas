import { Villa } from './villa.model';

export interface Extra {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Price in USD. */
  readonly price: number;
  /**
   * How the price multiplies out across the stay:
   * - `per-stay`       charged once
   * - `per-night`      price x nights
   * - `per-guest-night` price x guests x nights
   */
  readonly pricing: 'per-stay' | 'per-night' | 'per-guest-night';
  readonly icon: string;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  arrivalTime: string;
  requests: string;
}

export interface QuoteLine {
  readonly label: string;
  readonly detail?: string;
  readonly amount: number;
}

export interface BookingQuote {
  readonly villa: Villa | null;
  readonly nights: number;
  readonly guests: number;
  readonly lines: readonly QuoteLine[];
  /** Base rate x nights, before season adjustment or discount. */
  readonly accommodation: number;
  /** Uplift for nights falling in a peak window (0 when none do). */
  readonly peakSupplement: number;
  /** Long-stay reduction, stored as a negative number (0 when none applies). */
  readonly discount: number;
  readonly extrasTotal: number;
  readonly subtotal: number;
  readonly taxAndService: number;
  readonly total: number;
  /** Average per-night rate actually charged, useful for display. */
  readonly averageNightly: number;
  /** True when any night of the stay falls in a peak-season window. */
  readonly hasPeakNights: boolean;
}

export interface BookingConfirmation {
  readonly reference: string;
  readonly createdAt: string;
  readonly villaSlug: string;
  readonly villaName: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly nights: number;
  readonly adults: number;
  readonly children: number;
  readonly extraIds: readonly string[];
  readonly guest: GuestDetails;
  readonly total: number;
}

export type BookingStep = 1 | 2 | 3 | 4 | 5;
