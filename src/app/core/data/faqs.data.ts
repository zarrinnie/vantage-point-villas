/* ============================================================================
 * FAQ
 * ----------------------------------------------------------------------------
 * VERIFIED: check-in 15:00–23:59, check-out by 11:00, no pets, non-smoking,
 * one extra bed per villa, languages spoken, airport distance, free parking
 * and WiFi. PLACEHOLDER: deposit terms, cancellation windows, and anything
 * involving a specific amount of money.
 * ========================================================================== */
import { FaqItem } from '../models/content.model';

export const FAQS: readonly FaqItem[] = [
  {
    group: 'Booking',
    question: 'How do I book a villa?',
    answer:
      'Choose your dates and villa on this site and complete the five steps of the booking form. You will see the full price — accommodation, any extras, tax and service — before you confirm anything. You can also reserve through Booking.com, though booking direct avoids the platform commission.',
  },
  {
    group: 'Booking',
    question: 'Is a deposit required?',
    answer:
      'PLACEHOLDER: a deposit of 30% is requested to hold the villa, with the balance due on arrival. Replace this with the property’s real deposit terms.',
  },
  {
    group: 'Booking',
    question: 'What is the cancellation policy?',
    answer:
      'PLACEHOLDER: cancellations more than 14 days before arrival are refunded in full, less any bank charges; inside 14 days the deposit is retained. Terms vary by rate and by season, so the real policy for your rate will be stated on your confirmation.',
  },
  {
    group: 'Booking',
    question: 'Is there a minimum stay?',
    answer:
      'Two nights in most villas, three in the Ocean Breeze and Family villas, and longer over the Christmas and New Year period.',
  },
  {
    group: 'Your stay',
    question: 'What time can I check in and out?',
    answer:
      'Check-in is from 15:00 and the desk stays open until 23:59, so late flights are not a problem. Check-out is by 11:00. Express check-in and check-out are included, and a guaranteed late check-out can be added to any booking.',
  },
  {
    group: 'Your stay',
    question: 'Is breakfast included?',
    answer:
      'Breakfast is available rather than automatically included. You can add it to any booking as an extra, and it is served in your own villa.',
  },
  {
    group: 'Your stay',
    question: 'Can we bring children?',
    answer:
      'Yes — the property is family friendly and one extra bed can be added per villa. A cot and a high chair are available on request, and the Family Pool Villa has a shallow ledge in the pool.',
  },
  {
    group: 'Your stay',
    question: 'Are pets allowed? Can I smoke?',
    answer:
      'Pets are not allowed, and the property is entirely non-smoking, indoors and out.',
  },
  {
    group: 'Your stay',
    question: 'What languages does the team speak?',
    answer: 'English and Indonesian.',
  },
  {
    group: 'The villas',
    question: 'Is the pool really private?',
    answer:
      'Yes. Each villa is its own plot of 200–300 sqm with a walled tropical garden, and the pool inside it is used only by that villa.',
  },
  {
    group: 'The villas',
    question: 'What is in the kitchen?',
    answer:
      'A fridge, a hob, cookware and utensils, and a dining table. The larger villas have full kitchens; The Vantage Suite has a kitchenette with a two-ring hob.',
  },
  {
    group: 'The villas',
    question: 'Is there air conditioning and WiFi?',
    answer:
      'Air conditioning is in every bedroom and living space, and free WiFi covers the villas and the grounds.',
  },
  {
    group: 'Getting here',
    question: 'How far is the airport?',
    answer:
      'Ngurah Rai International Airport is around 5 km away — roughly twenty minutes by car. We can have a driver waiting for you; add an airport transfer to your booking or send us the flight details.',
  },
  {
    group: 'Getting here',
    question: 'Do I need a car?',
    answer:
      'A car or a scooter makes the Bukit much easier, and parking on site is free. We can arrange either, with or without a driver.',
  },
  {
    group: 'Getting here',
    question: 'What is nearby?',
    answer:
      'Garuda Wisnu Kencana Cultural Park is 2.1 km away, Nirmala Waterpark about 2 km, and Green Bowl Beach in Ungasan 2.9 km. The village centre around Masjid Agung Palapa is a 25-minute walk.',
  },
];

export const FAQ_GROUPS = ['Booking', 'Your stay', 'The villas', 'Getting here'] as const;
