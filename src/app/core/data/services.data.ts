/* ============================================================================
 * SERVICES
 * ----------------------------------------------------------------------------
 * VERIFIED that the property offers: breakfast, airport transportation,
 * laundry, room service, express check-in/out, free parking, free WiFi and
 * children's activities. PLACEHOLDER: every price and every detail below.
 * ========================================================================== */
import { Service } from '../models/content.model';

export const SERVICES: readonly Service[] = [
  {
    id: 'airport-transfer',
    name: 'Airport transfers',
    description:
      'A private car at arrivals, name board and all, for the twenty-minute run up to Ungasan. Tell us the flight number and we track it.',
    icon: 'car',
    price: 'from $22 one way',
    notes: 'Available around the clock, including the 02:00 arrivals.',
  },
  {
    id: 'breakfast',
    name: 'Breakfast in the villa',
    description:
      'Tropical fruit, eggs cooked how you like them, bread, and good coffee, brought to your own terrace rather than a dining room.',
    icon: 'breakfast',
    price: 'from $11 per person',
    notes: 'Order the night before; served 07:30–10:30, or earlier on request.',
  },
  {
    id: 'housekeeping',
    name: 'Daily housekeeping',
    description:
      'Every villa is serviced each morning — the pool skimmed, the garden swept, linen refreshed on a rotation.',
    icon: 'bell',
    price: 'Included',
  },
  {
    id: 'laundry',
    name: 'Laundry & pressing',
    description:
      'Collected in the morning, returned the same evening. Useful on the longer stays, and essential after a week in the water.',
    icon: 'laundry',
    price: 'per-piece pricing',
  },
  {
    id: 'room-service',
    name: 'In-villa dining',
    description:
      'A short menu of Indonesian and Western dishes delivered to the villa, plus a private chef for a set dinner on request.',
    icon: 'kitchen',
    price: 'à la carte',
    notes: 'Private chef dinners need 24 hours’ notice.',
  },
  {
    id: 'spa',
    name: 'Spa treatments at the villa',
    description:
      'Balinese massage, reflexology and body scrubs, with the therapist and the table coming to your patio.',
    icon: 'spa',
    price: 'from $28 per 60 min',
  },
  {
    id: 'transport',
    name: 'Cars, drivers & scooters',
    description:
      'A car with a driver by the half-day or full day for temple runs and the north of the island, or a scooter if you would rather be loose.',
    icon: 'car',
    price: 'from $35 per day',
  },
  {
    id: 'experiences',
    name: 'Booking the island',
    description:
      'Surf lessons at Padang Padang, the Kecak dance at Uluwatu Temple, day trips to Nusa Penida — arranged from reception so you do not negotiate anything.',
    icon: 'surf',
    price: 'at cost',
  },
  {
    id: 'families',
    name: 'Travelling with children',
    description:
      'A cot, a high chair and an extra bed can be added to any villa, and the pools in the family villas have a shallow ledge.',
    icon: 'family',
    price: 'Included',
    notes: 'One extra bed per villa.',
  },
  {
    id: 'express',
    name: 'Express check-in & out',
    description:
      'Paperwork done before you arrive, keys in hand at the gate. Check-in from 15:00, check-out by 11:00, with later departures arranged where the villa is free.',
    icon: 'clock',
    price: 'Included',
  },
  {
    id: 'wifi',
    name: 'Working from the villa',
    description:
      'Free WiFi throughout, a desk or dining table in every villa, and enough shade on the terrace to keep a laptop readable.',
    icon: 'wifi',
    price: 'Included',
  },
  {
    id: 'parking',
    name: 'Parking',
    description: 'Free, on site, inside the gate — for a hire car or a scooter.',
    icon: 'parking',
    price: 'Included',
  },
];
