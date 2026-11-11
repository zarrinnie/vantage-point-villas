# Vantage Point Villas

Marketing site and direct-booking flow for Vantage Point Villas, Ungasan, Uluwatu, Bali.
Angular 22 (standalone, signals, SSR + prerendering) with Tailwind CSS v4.

```bash
npm start          # dev server (add -- --port 4300 if 4200 is taken)
npm run build      # production build + prerender
npm test           # unit tests (vitest)
```

## What is real and what is placeholder

**Verified** from the property's public listings and used throughout:
address (Jalan Toya Ning I, Ungasan, Pecatu, Bali 80361), the positioning line about Ungasan,
plots of 200–300 sqm with a private pool / tropical garden / patio / living room / kitchen,
the amenity and services list, check-in 15:00–23:59 and check-out by 11:00, no pets,
non-smoking, English and Indonesian, one extra bed per villa, and the nearby distances
(airport ~5 km, GWK 2.1 km, Nirmala Waterpark ~2 km, Green Bowl 2.9 km, village 25-min walk).

**Placeholder** — replace before publishing:

| What | Where |
| --- | --- |
| Phone, WhatsApp, e-mail, socials, villa count | `src/app/core/data/site.data.ts` |
| Villa names, copy, bed configs, nightly rates | `src/app/core/data/villas.data.ts` |
| Offers and their terms | `src/app/core/data/offers.data.ts` |
| Service prices | `src/app/core/data/services.data.ts` |
| Extras and prices | `src/app/core/data/extras.data.ts` |
| Deposit / cancellation answers | `src/app/core/data/faqs.data.ts` |
| Privacy policy and booking terms | `src/app/core/data/policies.data.ts` |
| Guest quotes, team names and portraits | `testimonials.data.ts`, `about.ts` |
| **All photography** | `src/app/core/data/images.data.ts` |

### Swapping the photography

Every image in the site resolves through one function:

```ts
// src/app/core/data/images.data.ts
export function img(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/vpv-${seed}/${width}/${height}`;
}
```

It currently returns **seeded stock photos whose subjects are arbitrary** — they are stable per
seed but are not villas. Point the function at the real files (e.g.
`` `/assets/photos/${seed}.jpg` `` with the images in `public/assets/photos/`) and the whole site
changes at once. Seeds are descriptive (`villa-family-3`, `gal-pool-night`, `hero-main`).

## Architecture

```
src/app/
  core/
    data/       all content: villas, amenities, offers, services, FAQs, policies, images
    models/     Villa, BookingQuote, BookingConfirmation, content types
    services/   VillaService, BookingService, SeoService, RevealDirective
    utils/      date maths, mock availability, formatting
  shared/
    layout/     header (transparent→solid, mobile drawer), footer, WhatsApp button
    ui/         icons, villa card, date-range picker, stepper, price summary,
                gallery + lightbox, accordion, testimonials, booking bar, CTA band
  pages/        home, villas, villa-detail, book, gallery, services, offers,
                about, faq, contact, privacy/terms, 404
```

Routes are lazy and prerendered (15 static pages, including one per villa via
`getPrerenderParams`). `/book` renders client-side because it is stateful.

## The booking flow

Five steps — stay → villa → extras → details → review — held in `BookingService` as signals and
persisted to `sessionStorage` so a reload mid-booking loses nothing.

Price = nightly rate × nights, plus 25% on peak nights (July, August, 20 Dec–5 Jan), minus the
long-stay reduction (15% from 7 nights, 20% from 14), plus extras, plus 21% tax and service.

**There is no back end.** Two integration points are marked in the source:

- `BookingService.confirm()` in `core/services/booking.service.ts` — replace the simulated delay
  and generated `VPV-` reference with a POST to the reservations API. The returned
  `BookingConfirmation` is the shape the UI reads.
- `ContactPage.submit()` in `pages/contact/contact.ts` — post the enquiry to the property's inbox.

Availability is also mocked, deterministically, in `core/utils/availability.util.ts`
(`isPropertyClosed`, `isVillaBooked`) so server and client always agree. Swap those two predicates
for real availability calls and the calendar, villa filtering and validation follow automatically.

## Tests

`npm test` covers the pricing arithmetic (nights, peak supplement, long-stay tiers, extras
multipliers, tax), availability and minimum-stay validation, confirmation, deep links, villa
lookups, and the date utilities — 41 tests.
