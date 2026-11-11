/* ============================================================================
 * SITE-WIDE CONTENT
 * ----------------------------------------------------------------------------
 * VERIFIED (from the property's public listings): name, street address, village,
 * region, check-in / check-out times, languages, pet & smoking policy, the
 * Booking.com listing URL, and the positioning line about Ungasan.
 *
 * PLACEHOLDER (replace with the real values): phone, WhatsApp, every e-mail
 * address, the social handles, the number of villas, and the founding year.
 * ========================================================================== */

import { NavItem } from '../models/content.model';

export const SITE = {
  name: 'Vantage Point Villas',
  shortName: 'Vantage Point',
  /** VERIFIED positioning, lifted from the property's own description. */
  tagline: 'Private pool villas in the quiet heart of Uluwatu',
  intro:
    'Charming and private villas in the heart of Uluwatu, in a quiet area called Ungasan. ' +
    'Each villa sits on 200–300 sqm of its own ground, with a private pool, a tropical ' +
    'garden, a patio, a living room and a full kitchen.',

  address: {
    street: 'Jalan Toya Ning I',
    locality: 'Ungasan, Pecatu',
    region: 'Bali',
    postalCode: '80361',
    country: 'Indonesia',
  },
  /** Approximate — refine once the exact coordinates are confirmed. */
  mapQuery: 'Vantage Point Villas, Jalan Toya Ning I, Ungasan, Bali',

  /** PLACEHOLDER contact details. */
  phoneDisplay: '+62 361 000 0000',
  phoneHref: 'tel:+623610000000',
  whatsappDisplay: '+62 812 0000 0000',
  whatsappHref: 'https://wa.me/6281200000000',
  email: 'stay@example-vantagepointvillas.com',
  reservationsEmail: 'reservations@example-vantagepointvillas.com',

  /** VERIFIED policies. */
  checkIn: '15:00 – 23:59',
  checkOut: 'until 11:00',
  languages: ['English', 'Indonesian'],
  petsAllowed: false,
  smokingAllowed: false,

  /** VERIFIED: the property's live OTA listing, used as a booking fallback. */
  bookingComUrl: 'https://www.booking.com/hotel/id/vantage-point-villas.en-gb.html',

  /** PLACEHOLDER social handles. */
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
    { label: 'TripAdvisor', href: 'https://www.tripadvisor.com/', icon: 'tripadvisor' },
  ],

  /** PLACEHOLDER figures used in the "by the numbers" strip. */
  stats: [
    { value: '8', label: 'private villas' },
    { value: '200–300', label: 'sqm per villa' },
    { value: '5 km', label: 'to the airport' },
    { value: '2.9 km', label: 'to Green Bowl Beach' },
  ],

  currency: 'USD',
  taxRate: 0.21,
  taxLabel: 'Tax & service (21%)',
} as const;

export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Villas', path: '/villas' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Services', path: '/services' },
  { label: 'Offers', path: '/offers' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export const FOOTER_NAV: readonly { title: string; items: readonly NavItem[] }[] = [
  {
    title: 'Stay',
    items: [
      { label: 'The villas', path: '/villas' },
      { label: 'Offers & packages', path: '/offers' },
      { label: 'Services', path: '/services' },
      { label: 'Book a villa', path: '/book' },
    ],
  },
  {
    title: 'Explore',
    items: [
      { label: 'Gallery', path: '/gallery' },
      { label: 'About us', path: '/about' },
      { label: 'The neighbourhood', path: '/about' },
      { label: 'Frequently asked', path: '/faq' },
    ],
  },
  {
    title: 'Information',
    items: [
      { label: 'Contact', path: '/contact' },
      { label: 'Privacy policy', path: '/privacy' },
      { label: 'Terms & conditions', path: '/terms' },
    ],
  },
];
