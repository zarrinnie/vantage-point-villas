import { Benefit } from '../models/content.model';

/** "Why Vantage Point" — each point is grounded in a verified property fact. */
export const BENEFITS: readonly Benefit[] = [
  {
    title: 'Your own pool, your own walls',
    description:
      'Every villa is a standalone plot of 200–300 sqm with a private pool and a walled tropical garden. Nothing is shared.',
    icon: 'pool',
  },
  {
    title: 'A kitchen, not a kitchenette',
    description:
      'Full cookware and utensils, a fridge and a dining table, so a long stay feels like living here rather than visiting.',
    icon: 'kitchen',
  },
  {
    title: 'Twenty minutes from the plane',
    description:
      'Ngurah Rai airport is around 5 km away. Garuda Wisnu Kencana is 2.1 km, Green Bowl Beach 2.9 km.',
    icon: 'pin',
  },
  {
    title: 'Book direct, pay less',
    description:
      'Reserving on this site skips the booking-platform commission, and we hold your rate once it is confirmed.',
    icon: 'leaf',
  },
];
