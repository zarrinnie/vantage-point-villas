/* ============================================================================
 * PAGE COPY — the default wording of every page, editable in Admin → Page text.
 * ----------------------------------------------------------------------------
 * Conventions understood by the templates:
 *   *word*        renders in italics (used in a few display headings)
 *   {token}       is filled in at runtime, e.g. {lowestRate}, {taxPercent},
 *                 {villaName}. Each field that accepts tokens says which.
 *
 * Adding a key here makes it appear in the admin automatically; a stored
 * content.json without the key falls back to the value written here.
 * ========================================================================== */

import { heroImg, img } from '../data/images.data';

export interface HeroMeta {
  icon: string;
  label: string;
}

export interface PageHeroCopy {
  eyebrow: string;
  title: string;
  lede: string;
  image: string;
  meta: HeroMeta[];
}

export interface CtaCopy {
  eyebrow: string;
  title: string;
  lede: string;
}

export interface SeoCopy {
  title: string;
  description: string;
}

export interface HeadingCopy {
  eyebrow: string;
  title: string;
  lede: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface PictureCopy {
  url: string;
  alt: string;
}

function hero(
  eyebrow: string,
  title: string,
  lede: string,
  image: string,
  meta: HeroMeta[] = [],
): PageHeroCopy {
  return { eyebrow, title, lede, image, meta };
}

export const DEFAULT_PAGES = {
  // ---------------------------------------------------------------- Shared
  shared: {
    header: {
      wordmark: 'Vantage Point',
      wordmarkSub: 'Villas · Uluwatu',
      utilityWhatsapp: 'WhatsApp',
      utilityContact: 'Contact',
      bookButton: 'Book now',
      mobileBookButton: 'Check availability',
      mobileWhatsappButton: 'WhatsApp us',
    },
    footer: {
      brandSub: 'Ungasan · Uluwatu · Bali',
      findUsTitle: 'Find us',
      checkInLabel: 'Check-in',
      checkOutLabel: 'Check-out',
      /** Tokens: {year}, {name} */
      copyright: '© {year} {name}. All rights reserved.',
      privacyLink: 'Privacy policy',
      termsLink: 'Terms & conditions',
      bookingComLink: 'Also on Booking.com',
      disclaimer:
        'Demonstration site. Photography is placeholder imagery and rates are indicative; telephone numbers, e-mail addresses and social links are not live. The address, facilities and check-in times are taken from the property’s public listings.',
    },
    cta: {
      eyebrow: 'Reservations',
      title: 'Come and see it for yourself',
      lede: 'Tell us your dates and we will hold a villa for you. Booking direct keeps the platform commission out of the price.',
      image: heroImg('cta-band'),
      primaryButton: 'Check availability',
      secondaryButton: 'Message us',
    },
    whatsappButton: 'Chat with us',
    villaCard: {
      featuredBadge: 'Most asked for',
      viewButton: 'View villa',
      bookButton: 'Book',
    },
    priceSummaryNote:
      'Rates are indicative placeholders. No payment is taken on this site — a confirmed booking here is a request we answer by e-mail.',
  },

  // ---------------------------------------------------------------- Home
  home: {
    seo: {
      title: 'Vantage Point Villas — Private Pool Villas in Uluwatu, Bali',
      description:
        'Eight private pool villas in Ungasan, the quiet heart of Uluwatu. Walled tropical gardens, full kitchens, and the Bukit beaches ten minutes away.',
    } as SeoCopy,
    hero: {
      image: heroImg('hero-main'),
      imageAlt: 'A private pool villa at Vantage Point Villas in Ungasan, Bali',
      eyebrow: 'Ungasan · Uluwatu · Bali',
      /** Wrap a word in *asterisks* to set it in italics. */
      title: 'The *quiet* side of Uluwatu.',
      lede: 'Private pool villas on their own walled plots, ten minutes from the Bukit beaches.',
      bookButton: 'Book now',
      tourButton: 'Take the tour',
      /** Tokens: {lowestRate} */
      bookDirectNote: 'Book direct from {lowestRate} a night — no platform commission',
    },
    intro: {
      eyebrow: 'Welcome to Vantage Point',
      title: 'Charming, private villas in the heart of Uluwatu',
      body: 'There is no lobby here and no restaurant with a queue. What there is instead is a set of small houses on 200–300 sqm of their own ground — your own pool, your own garden, your own gate — looked after properly, a short drive from the cliffs at Uluwatu and the sand at Green Bowl.',
    },
    villas: {
      eyebrow: 'The villas',
      title: 'Five ways to stay',
      lede: 'From a studio with a plunge pool to a three-bedroom house with a table for eight.',
      button: 'All villas',
    },
    amenities: {
      eyebrow: 'In every villa',
      title: 'Every villa, appointed the same way',
      body: 'Breakfast comes to your terrace when you want it. The kitchen has real pans. Housekeeping arrives in the morning and leaves the place as you found it on the first day. Nothing here is an upgrade.',
      primaryButton: 'Discover our villas',
      secondaryLink: 'Services & extras',
    },
    leisure: {
      image: img('leisure-dusk', 1400, 1600),
      imageAlt: 'The sea at dusk off the Bukit peninsula',
      eyebrow: 'Slow days on the Bukit',
      title: 'A life of leisure',
      body: 'Mornings in the pool before the heat. Lunch on the terrace. A sunset at the cliffs, then dinner back home under the frangipani. Behind your own wall, the day takes the shape you give it.',
      quote: '“By the second morning you stop noticing there are neighbours at all.”',
      button: 'Book now',
    },
    experiences: {
      eyebrow: 'Around Uluwatu',
      title: 'Surf, sunsets & slow afternoons',
      lede: 'You are never more than a few minutes from the breaks, the beaches and the clifftop temples of the Bukit — and back behind your own gate whenever you like.',
      conciergeButton: 'Let our concierge assist you',
    },
    why: {
      eyebrow: 'Why Vantage Point',
      title: 'Small, private, and properly run',
    },
    gallery: {
      eyebrow: 'Gallery',
      title: 'Simply, privately yours',
      button: 'View the gallery',
      logoTitle: 'Vantage Point',
      logoSubtitle: 'Villas · Uluwatu',
      /** Exactly four pictures: tall left, small top, tall right, wide bottom. */
      mosaic: [
        { url: img('gal-pool-morning', 1000, 1400), alt: 'A private villa pool at first light' },
        { url: img('gal-pavilion', 1400, 1000), alt: 'An open-sided living pavilion facing the garden' },
        { url: img('gal-kitchen', 1000, 1400), alt: 'A villa kitchen with cookware and a dining table' },
        { url: img('gal-terrace-dinner', 1400, 1000), alt: 'A terrace table laid for dinner at dusk' },
      ] as PictureCopy[],
    },
    offers: {
      eyebrow: 'Offers',
      title: 'Reasons to stay a little longer',
      lede: 'Booking direct is the cheapest way in. These packages make it cheaper still.',
      button: 'All offers',
      cardButton: 'See the terms',
      /** How many offers to show on the home page. */
      count: 2,
    },
    testimonialsNote: 'Placeholder quotes — real guest reviews will replace these.',
    findUs: {
      eyebrow: 'Find us',
      phoneLabel: 'Telephone',
      emailLabel: 'E-mail',
      checkInLabel: 'Check-in',
      checkOutLabel: 'Check-out',
      directionsLink: 'Get directions',
    },
    book: {
      title: 'Book your stay',
      lede: 'Choose your nights and party size — we will show you which villas are free.',
    },
  },

  // ---------------------------------------------------------------- Villas
  villas: {
    seo: {
      title: 'The Villas',
      description:
        'Five private pool villas in Ungasan, Uluwatu — from a studio with a plunge pool to a three-bedroom house sleeping seven. Plots of 200–300 sqm, each with its own garden.',
    } as SeoCopy,
    hero: hero(
      'Accommodation',
      'Five villas, one quiet lane',
      'Every villa is its own walled plot with a private pool, a tropical garden and a kitchen. Choose by the size of your party.',
      heroImg('villas-hero'),
      [
        { icon: 'pool', label: 'Private pool in every villa' },
        { icon: 'area', label: '200–300 sqm plots' },
        { icon: 'guests', label: 'Sleeps 2 to 7' },
      ],
    ),
    empty: {
      title: 'Nothing matches that combination',
      body: 'The largest villa sleeps seven. For bigger groups we can hold two villas side by side — ask us and we will arrange it.',
      resetButton: 'Reset filters',
      contactButton: 'Ask about two villas',
    },
    detailsButton: 'Villa details',
    datesButton: 'Check dates',
    cta: {
      eyebrow: 'Not sure which one',
      title: 'Tell us who is coming',
      lede: 'Send us the dates and the size of the party and we will tell you which villa fits, and what it costs.',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- Villa detail
  villaDetail: {
    storyEyebrow: 'The villa',
    highlightsTitle: 'What stands out',
    rateLabel: 'Rate from',
    rateUnit: 'per night',
    /** Tokens: {peakPercent} */
    rateNote:
      'Before tax and service. Peak nights in July, August and over New Year carry a {peakPercent}% supplement; stays of seven nights or more are reduced.',
    datesLabel: 'Check these dates',
    estimateNote: 'Estimate for the villa, tax and service included.',
    continueButton: 'Continue to booking',
    startButton: 'Start a booking',
    whatsappPrefix: 'or',
    whatsappLink: 'ask on WhatsApp',
    gallery: {
      eyebrow: 'Photographs',
      /** Tokens: {villaName} */
      title: 'Inside {villaName}',
      lede: 'Placeholder imagery — the real photography of this villa will replace it.',
    },
    amenities: {
      eyebrow: 'Included',
      title: 'Everything in this villa',
      lede: 'All of it comes as standard, in every villa on the property.',
      link: 'Extras you can add',
    },
    others: {
      eyebrow: 'Also available',
      title: 'Other villas on the property',
      link: 'All villas',
    },
    cta: {
      eyebrow: 'Reservations',
      /** Tokens: {villaName} */
      title: 'Hold {villaName} for your dates',
      lede: 'Send us your dates and we will confirm by e-mail, usually the same day.',
    } as CtaCopy,
    notFound: {
      eyebrow: 'Not found',
      title: 'We do not have a villa by that name',
      body: 'The link may be out of date. All of our villas are listed on the villas page.',
      button: 'See the villas',
    },
  },

  // ---------------------------------------------------------------- Booking
  booking: {
    seo: {
      title: 'Book your stay',
      description:
        'Choose your dates, pick a villa and see the full price before you confirm. Booking direct with Vantage Point Villas keeps the platform commission out of the rate.',
    } as SeoCopy,
    eyebrow: 'Reservations',
    title: 'Book your stay',
    confirmedTitle: 'Your villa is held',
    intro:
      'No payment is taken here. Confirming sends us a reservation request, which we answer by e-mail — usually the same day.',
    steps: {
      stay: {
        eyebrow: 'Step one',
        title: 'When would you like to come?',
        lede: 'Check-in is from 15:00 and check-out by 11:00. Dates shown struck through are already taken.',
      } as HeadingCopy,
      villa: { eyebrow: 'Step two', title: 'Choose your villa' },
      extras: {
        eyebrow: 'Step three',
        title: 'Anything to add?',
        lede: 'All optional, all arranged before you arrive. You can add them later too.',
      } as HeadingCopy,
      details: {
        eyebrow: 'Step four',
        title: 'Who is coming?',
        lede: 'We need enough to confirm the villa and meet you at the gate.',
      } as HeadingCopy,
      review: {
        eyebrow: 'Last step',
        title: 'Check it over',
        lede: 'Nothing is charged. Confirming sends the request to reservations.',
      } as HeadingCopy,
    },
    confirmation: {
      /** Tokens: {firstName} */
      title: 'Thank you, {firstName}',
      /** Tokens: {villaName}, {email} */
      body: 'We have your request for {villaName}. A confirmation will go to {email} with the deposit details and directions to the villa.',
      demoNote:
        'This is a demonstration booking. Nothing was sent and no card was charged — the reference exists only in this browser session.',
    },
  },

  // ---------------------------------------------------------------- Gallery
  gallery: {
    seo: {
      title: 'Gallery',
      description:
        'Photographs of the villas, pools, gardens and grounds at Vantage Point Villas in Ungasan, Uluwatu.',
    } as SeoCopy,
    hero: hero(
      'Gallery',
      'The property, in pictures',
      'The villas, the pools, the gardens, and the part of the Bukit they sit on.',
      heroImg('gallery-hero'),
    ),
    allFilterLabel: 'Everything',
    note: 'Placeholder imagery, served from a stock-photo service. The property’s own photography will replace it.',
    cta: {
      eyebrow: 'See it properly',
      title: 'Photographs only get you so far',
      lede: 'Pick your dates and come and stand in the garden instead.',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- Services
  services: {
    seo: {
      title: 'Services',
      description:
        'Airport transfers, breakfast in the villa, housekeeping, laundry, in-villa dining, spa treatments, cars and drivers at Vantage Point Villas, Uluwatu.',
    } as SeoCopy,
    hero: hero(
      'Services',
      'Everything we can take off your hands',
      'Transfers, breakfast on the terrace, a driver for the day, a massage on your own patio. Some of it is included; the rest is arranged with a message.',
      heroImg('services-hero'),
      [
        { icon: 'car', label: 'Airport transfers around the clock' },
        { icon: 'breakfast', label: 'Breakfast in the villa' },
        { icon: 'bell', label: 'Daily housekeeping included' },
      ],
    ),
    included: {
      eyebrow: 'No charge',
      title: 'Included in every villa',
      lede: 'This is the baseline, in every villa type. Nothing here is an upsell.',
    } as HeadingCopy,
    list: {
      eyebrow: 'The full list',
      title: 'Services, and what they cost',
      lede: 'Prices are indicative placeholders. Ask reservations for the current rate card.',
    } as HeadingCopy,
    extras: {
      image: img('services-breakfast', 1400, 1050),
      imageAlt: 'Breakfast laid out on a villa terrace beside the pool',
      eyebrow: 'At the time of booking',
      title: 'Add it while you book',
      lede: 'These are built into the booking form — tick them in step three and they appear in the total.',
      button: 'Start a booking',
      /** How many booking extras to list here. */
      count: 4,
    },
    rules: {
      eyebrow: 'House rules',
      title: 'The short version',
      /** Tokens in values: {checkIn}, {checkOut}, {languages} */
      items: [
        { label: 'Check-in', value: '{checkIn}', note: 'Express check-in is included.' },
        { label: 'Check-out', value: '{checkOut}', note: 'Guaranteed late check-out can be added.' },
        { label: 'Children', value: 'Welcome', note: 'One extra bed per villa; cot on request.' },
        { label: 'Pets & smoking', value: 'Neither, anywhere', note: 'The whole property is non-smoking.' },
        { label: 'Languages', value: '{languages}', note: '' },
        { label: 'Parking', value: 'Free, on site', note: 'Inside the gate, for cars and scooters.' },
      ],
    },
    cta: {
      eyebrow: 'Arrange it',
      title: 'Tell us what you need',
      lede: 'Transfers, a cot, a driver for a day on the north coast — send it over with your booking and it will be waiting.',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- Offers
  offers: {
    seo: {
      title: 'Offers & packages',
      description:
        'Long-stay reductions, early-bird rates, honeymoon inclusions and a Bukit surf week at Vantage Point Villas — all bookable direct.',
    } as SeoCopy,
    hero: hero(
      'Offers & packages',
      'Better rates for longer stays',
      'Four packages, all of them bookable direct. The long-stay reduction is built into the booking form and applies automatically.',
      heroImg('offers-hero'),
      [
        { icon: 'sparkle', label: 'From {lowestRate} a night' },
        { icon: 'leaf', label: 'No platform commission' },
      ],
    ),
    minStayLabel: 'Minimum stay',
    validLabel: 'Valid',
    availabilityButton: 'Check availability',
    askLink: 'Ask about this offer',
    rate: {
      eyebrow: 'How the rate is built',
      title: 'No surprises at the end',
      lede: 'Exactly what the booking form does with your dates, in the order it does it.',
      /** Tokens: {peakPercent}, {taxPercent} */
      steps: [
        {
          title: 'The villa rate',
          body: 'Your villa’s nightly rate, multiplied by the number of nights in the stay.',
        },
        {
          title: 'Peak nights',
          body: 'Nights in July, August and 20 December to 5 January carry a {peakPercent}% supplement — only those nights, not the whole stay.',
        },
        {
          title: 'Long-stay reduction',
          body: '15% comes off from seven nights, 20% from fourteen. It is applied automatically.',
        },
        {
          title: 'Tax & service',
          body: 'Government tax and service of {taxPercent}% is added last, and is shown as its own line in your quote.',
        },
      ],
      note: 'Placeholder terms. Rates, reductions and the {taxPercent}% tax and service figure should be confirmed against the property’s own rate card before publishing.',
    },
    cta: {
      eyebrow: 'Direct only',
      title: 'These rates are not on the platforms',
      lede: 'Book here and the commission stays out of the price. We hold your rate once it is confirmed.',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- About
  about: {
    seo: {
      title: 'About',
      description:
        'Vantage Point Villas is a small property on Jalan Toya Ning I in Ungasan, Uluwatu — private pool villas on walled plots of 200–300 sqm, run in person.',
    } as SeoCopy,
    hero: hero(
      'About',
      'Eight villas, looked after by hand',
      'Vantage Point is a small property in Ungasan, run the way small properties should be: in person, and without a lobby.',
      heroImg('about-hero'),
      [
        { icon: 'pin', label: 'Jalan Toya Ning I, Ungasan' },
        { icon: 'leaf', label: 'Walled tropical gardens' },
        { icon: 'clock', label: 'Reception until 23:59' },
      ],
    ),
    story: {
      eyebrow: 'Our story',
      title: 'Why Ungasan, and not the strip',
      paragraphs: [
        'The Bukit peninsula has two characters. There is the coast road, with its cafés and its traffic, and there is the village behind it — lanes, warungs, temple walls, and gardens that have been growing for decades.',
        'Vantage Point was built on the second one. The villas sit on Jalan Toya Ning I, a quiet road in Ungasan, each on its own plot of 200 to 300 square metres. Every one has a private pool, a tropical garden, a patio, a living room and a kitchen, and every one is walled so that what happens inside stays inside.',
        'It means a ten-minute drive to the sand at Green Bowl and twenty to the airport, but it also means that at ten o’clock at night you can hear the frogs instead of the bass from a beach club.',
      ],
      note: 'Placeholder history — the founding year, the family behind the property and the story of how it was built should replace these paragraphs.',
      primaryButton: 'See the villas',
      secondaryLink: 'Come and visit',
      images: [
        { url: img('about-path', 1000, 1400), alt: 'A stone path through the tropical garden of a villa' },
        { url: img('about-pavilion', 1000, 1400), alt: 'The open-sided living pavilion of a villa' },
      ] as PictureCopy[],
    },
    values: {
      eyebrow: 'How we work',
      title: 'Four things we will not compromise on',
    },
    neighbourhood: {
      eyebrow: 'The neighbourhood',
      title: 'What is within reach',
      lede: 'Distances as the property publishes them. A car or a scooter makes all of it easier — parking here is free.',
      approxLabel: 'approx.',
      image: img('about-bukit', 1400, 1750),
      imageAlt: 'The coast of the Bukit peninsula near Ungasan',
    },
    team: {
      eyebrow: 'The team',
      title: 'The people who are actually here',
      lede: 'A small team lives this property daily — reservations, housekeeping, gardens and drivers.',
      members: [
        { name: 'Placeholder Name', role: 'Reservations', image: img('team-1', 800, 800) },
        { name: 'Placeholder Name', role: 'Villa host', image: img('team-2', 800, 800) },
        { name: 'Placeholder Name', role: 'Grounds & pools', image: img('team-3', 800, 800) },
      ] as TeamMember[],
      note: 'Placeholder names and portraits — replace with the real team.',
    },
    cta: {
      eyebrow: 'Visit',
      title: 'Come and stay in Ungasan',
      /** Leave empty to use the site introduction from General settings. */
      lede: '',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- FAQ
  faq: {
    seo: {
      title: 'Frequently asked questions',
      description:
        'Check-in and check-out times, minimum stays, children, pets, smoking, airport distance and how to book at Vantage Point Villas, Uluwatu.',
    } as SeoCopy,
    hero: hero(
      'Good to know',
      'Frequently asked',
      'Arrival times, minimum stays, children, pets, and how to get here from the airport.',
      heroImg('faq-hero'),
    ),
    glanceTitle: 'At a glance',
    /** Tokens in values: {checkIn}, {checkOut}, {languages} */
    glance: [
      { label: 'Check-in', value: '{checkIn}' },
      { label: 'Check-out', value: '{checkOut}' },
      { label: 'Languages', value: '{languages}' },
      { label: 'Pets', value: 'Not allowed' },
      { label: 'Smoking', value: 'Nowhere on the property' },
      { label: 'Airport', value: '5 km · about 20 minutes' },
    ],
    askBox: {
      title: 'Still unanswered?',
      body: 'Reservations answer e-mail within a day, and WhatsApp faster than that.',
      button: 'Ask us',
    },
    note: 'Deposit and cancellation answers are placeholders pending the property’s real terms; everything about arrival times, facilities and distances comes from its published listings.',
    cta: {
      eyebrow: 'Ready',
      title: 'Nothing left to ask',
      lede: 'Choose your nights and we will take it from there.',
    } as CtaCopy,
  },

  // ---------------------------------------------------------------- Contact
  contact: {
    seo: {
      title: 'Contact',
      description:
        'Reach Vantage Point Villas in Ungasan, Uluwatu — WhatsApp, e-mail, telephone and the address, plus how to get here from Ngurah Rai airport.',
    } as SeoCopy,
    hero: hero(
      'Contact',
      'Talk to someone who is there',
      'Reservations answer e-mail within a day. WhatsApp is faster, and reception is staffed until 23:59.',
      heroImg('contact-hero'),
      [
        { icon: 'pin', label: 'Jalan Toya Ning I, Ungasan' },
        { icon: 'clock', label: 'Reception until 23:59' },
      ],
    ),
    details: {
      eyebrow: 'Get in touch',
      title: 'However suits you',
      whatsappLabel: 'WhatsApp',
      whatsappNote: 'Fastest for anything about an existing booking.',
      emailLabel: 'Reservations',
      phoneLabel: 'Telephone',
      addressLabel: 'The property',
      note: 'The address and check-in times are the property’s own. The telephone number, WhatsApp number and e-mail addresses on this page are placeholders and are not monitored.',
    },
    form: {
      title: 'Send us a message',
      intro: 'For dates and prices the booking form is quicker — it shows the full price as you go.',
      subjects: [
        'A new booking',
        'An existing booking',
        'Transfers and transport',
        'Larger groups (two villas)',
        'Something else',
      ],
      messagePlaceholder: 'Dates you have in mind, how many of you, anything you need…',
      submitButton: 'Send message',
      sentTitle: 'Message noted',
      sentBody:
        'Thank you — in a live site this would be with reservations now, and answered within the day. On this demonstration site nothing left your browser.',
    },
    gettingHere: {
      eyebrow: 'Getting here',
      title: 'From the airport',
      lede: 'About 5 km and twenty minutes. Send us your flight number and a driver will be waiting.',
      button: 'Book a transfer with your stay',
    },
  },

  // ---------------------------------------------------------------- Policies
  policy: {
    eyebrow: 'Information',
    heroImage: heroImg('policy-hero'),
    updatedLabel: 'Last updated',
    warning: 'Placeholder wording. Have it reviewed and replaced before the site goes live.',
    footer: 'Questions about either document? Write to us from the contact page.',
  },

  // ---------------------------------------------------------------- 404
  notFound: {
    image: heroImg('not-found'),
    eyebrow: 'Error 404',
    title: 'This path does not lead anywhere',
    body: 'The page you asked for is not here. Easily done — the lanes in Ungasan are much the same.',
    homeButton: 'Back to the start',
    villasButton: 'See the villas',
  },
};

export type PagesCopy = typeof DEFAULT_PAGES;
