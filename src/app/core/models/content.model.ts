import { IconName } from './villa.model';

export interface NavItem {
  readonly label: string;
  readonly path: string;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
  readonly group: 'Booking' | 'Your stay' | 'The villas' | 'Getting here';
}

export interface Offer {
  readonly slug: string;
  readonly name: string;
  readonly kicker: string;
  readonly description: string;
  readonly inclusions: readonly string[];
  /** e.g. "Save 15%" or "3rd night free" */
  readonly badge: string;
  readonly minNights: number;
  readonly validity: string;
  readonly image: string;
}

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconName;
  /** Human-readable price, or 'Included'. */
  readonly price: string;
  readonly notes?: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly author: string;
  readonly origin: string;
  readonly stay: string;
}

export interface Nearby {
  readonly name: string;
  readonly distance: string;
  readonly detail: string;
  /** True when sourced from the property's own listings rather than invented. */
  readonly verified: boolean;
}

export interface Benefit {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}

export interface PolicyPage {
  readonly title: string;
  readonly intro: string;
  readonly updated: string;
  readonly sections: readonly { readonly heading: string; readonly body: readonly string[] }[];
}
