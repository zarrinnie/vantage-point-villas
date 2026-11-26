/* ============================================================================
 * THE CONTENT DOCUMENT
 * ----------------------------------------------------------------------------
 * Everything the public site shows (copy, pictures, dates, prices) lives in
 * one JSON document of this shape. The server stores it in `content.json`, the
 * admin area edits it, and every page reads it through `ContentService`.
 * ========================================================================== */

import { Amenity, GalleryImage, Villa } from '../models/villa.model';
import {
  Benefit,
  FaqItem,
  NavItem,
  Nearby,
  Offer,
  PolicyPage,
  Service,
  Testimonial,
} from '../models/content.model';
import { Extra } from '../models/booking.model';
import { PagesCopy } from './default-pages';

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface SiteInfo {
  name: string;
  shortName: string;
  tagline: string;
  intro: string;
  address: {
    street: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  };
  /** What Google Maps searches for on the contact page and "Get directions". */
  mapQuery: string;
  phone: string;
  whatsapp: string;
  email: string;
  reservationsEmail: string;
  checkIn: string;
  checkOut: string;
  languages: string[];
  bookingComUrl: string;
  socials: SocialLink[];
  stats: { value: string; label: string }[];
}

export interface Experience {
  title: string;
  description: string;
  image: string;
  alt: string;
}

/** A date range, both ends inclusive, as `YYYY-MM-DD`. */
export interface DateRangeRule {
  start: string;
  end: string;
}

export interface PeakSeason extends DateRangeRule {
  label: string;
  /** When true only the month and day matter, so the window recurs every year. */
  repeatsYearly: boolean;
}

export interface BlockedRange extends DateRangeRule {
  /** Villa slug, or empty for the whole property. */
  villa: string;
  note: string;
}

export interface LongStayTier {
  minNights: number;
  discountPercent: number;
  label: string;
}

export interface PricingRules {
  taxPercent: number;
  taxLabel: string;
  peakSupplementPercent: number;
  peakSupplementLabel: string;
  peakSeasons: PeakSeason[];
  longStayTiers: LongStayTier[];
}

export interface Availability {
  blocked: BlockedRange[];
}

export interface CategoryOption {
  id: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  items: NavItem[];
}

export interface SiteContent {
  site: SiteInfo;
  mainNav: NavItem[];
  footerNav: FooterColumn[];
  pages: PagesCopy;
  villas: Villa[];
  amenities: Amenity[];
  offers: Offer[];
  services: Service[];
  extras: Extra[];
  gallery: GalleryImage[];
  galleryCategories: CategoryOption[];
  faqs: FaqItem[];
  faqGroups: string[];
  testimonials: Testimonial[];
  nearby: Nearby[];
  experiences: Experience[];
  benefits: Benefit[];
  policies: { privacy: PolicyPage; terms: PolicyPage };
  pricing: PricingRules;
  availability: Availability;
}
