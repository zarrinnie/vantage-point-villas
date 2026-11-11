/* ============================================================================
 * PRIVACY POLICY & TERMS — PLACEHOLDER TEXT
 * ----------------------------------------------------------------------------
 * This is boilerplate written to fill the pages, not legal advice and not a
 * policy the property has adopted. Have both documents reviewed and replaced
 * before the site is published.
 * ========================================================================== */
import { PolicyPage } from '../models/content.model';

const UPDATED = '10 November 2026';

export const PRIVACY_POLICY: PolicyPage = {
  title: 'Privacy policy',
  updated: UPDATED,
  intro:
    'This placeholder policy describes how Vantage Point Villas would handle the information you give us when you enquire or book. It has not been reviewed by a lawyer and must be replaced before launch.',
  sections: [
    {
      heading: 'What we collect',
      body: [
        'When you make a booking we collect your name, e-mail address, telephone number, country of residence, your travel dates and any requests you choose to send us.',
        'This demonstration site stores your booking only in your own browser (in session storage) and sends it nowhere. A live site would transmit it to the property’s reservation system.',
      ],
    },
    {
      heading: 'Why we hold it',
      body: [
        'To confirm and service your reservation, to arrange the extras you have asked for, and to contact you about your stay.',
        'We do not sell your details, and we do not add you to a mailing list unless you ask us to.',
      ],
    },
    {
      heading: 'Who else sees it',
      body: [
        'Only the people who need it to look after your stay — our reservations and housekeeping teams, and any driver or therapist booked for you by name.',
        'Payments on a live site would be handled by a payment provider who receives your card details directly; we would not store them.',
      ],
    },
    {
      heading: 'Cookies and analytics',
      body: [
        'This site sets no advertising cookies. Images are loaded from a third-party placeholder service, which will see your IP address as any image host would.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'You may ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete it once your stay is complete and our tax obligations allow.',
        'Write to us using the address on the contact page and we will answer within thirty days.',
      ],
    },
  ],
};

export const TERMS: PolicyPage = {
  title: 'Terms & conditions',
  updated: UPDATED,
  intro:
    'Placeholder booking terms, written to populate this page. The rates, deposits and cancellation windows below are examples only and must be replaced with the property’s real terms.',
  sections: [
    {
      heading: 'Rates and currency',
      body: [
        'Rates are quoted per villa per night in US dollars and are indicative. Government tax and service of 21% is shown separately in your quote and included in the total.',
        'Rates rise in the peak windows of July and August and from 20 December to 5 January.',
      ],
    },
    {
      heading: 'Deposits and payment',
      body: [
        'PLACEHOLDER: a deposit of 30% confirms the booking, with the balance payable on arrival. No payment is taken by this demonstration site.',
      ],
    },
    {
      heading: 'Cancellation and changes',
      body: [
        'PLACEHOLDER: cancellations received more than 14 days before arrival are refunded in full, less bank charges. Inside 14 days, the deposit is retained. Non-arrival is charged in full.',
        'One date change is permitted free of charge on Early Bird bookings, up to 14 days before arrival, subject to availability.',
      ],
    },
    {
      heading: 'Arrival, departure and occupancy',
      body: [
        'Check-in is from 15:00 until 23:59 and check-out is by 11:00. Later departures can be guaranteed in advance for a fee, or offered free of charge where the villa is not re-let.',
        'Villas may not be occupied by more guests than the maximum stated for that villa. One extra bed may be added per villa, on request.',
      ],
    },
    {
      heading: 'House rules',
      body: [
        'The property is entirely non-smoking and pets are not permitted.',
        'Children are welcome. Villa pools are unfenced and are not supervised; children must be accompanied by an adult at all times.',
        'Please respect the quiet of the neighbourhood after 22:00. Events and parties are not permitted in the villas.',
      ],
    },
    {
      heading: 'Liability',
      body: [
        'Guests are responsible for their own belongings. The property accepts no liability for loss or injury other than where it arises from its own negligence, to the extent permitted by Indonesian law.',
      ],
    },
  ],
};
