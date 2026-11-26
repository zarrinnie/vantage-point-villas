# Vantage Point Villas

Marketing site and direct-booking flow for Vantage Point Villas, Ungasan, Uluwatu, Bali.
Angular 22 (standalone, signals, SSR) with Tailwind CSS v4, plus an admin area at `/admin`
where every piece of text, every picture, every price and every date can be edited.

```bash
ADMIN_PASSWORD=choose-one npm start     # dev server with the admin enabled
npm run build                           # production build
npm test                                # unit tests (vitest)

# production
ADMIN_PASSWORD=… ADMIN_SECRET=… CONTENT_DIR=/var/lib/vpv NG_ALLOWED_HOSTS=example.com \
  npm run serve:ssr:vantage-point-villas
```

## The admin (`/admin`)

Sign in with the password from `ADMIN_PASSWORD`. Edits are kept as a draft until you press
**Publish changes** (or Ctrl/⌘ + S). Publishing makes them live at once, with no rebuild or
redeploy.

| Section | What it edits |
| --- | --- |
| General & contact | Name, address, phone, WhatsApp, e-mails, check-in/out, languages, socials, the numbers strip |
| Page text | Every heading, paragraph, button label, hero picture and SEO title/description, page by page |
| Villas | Description, story, sizes, rate, minimum stay, photographs, amenities, "most asked for" badge |
| Prices & seasons | Tax %, peak-season date windows and supplement %, long-stay discount tiers |
| Availability | Calendar: click nights to close them for one villa or the whole property |
| Offers, Services & extras, Amenities, Gallery, FAQs, Guest reviews, Area & highlights | The lists behind those parts of the site: add, delete, duplicate, reorder |
| Menus | Top menu and footer columns |
| Policies | Privacy policy and terms, including "last updated" |
| Photo library | Upload (drag and drop), browse, delete; pick from it anywhere a picture is used |
| History | Every publish keeps the previous version; open one as a draft or restore it |

Copy conventions: `*word*` renders in italics, and `{tokens}` such as `{lowestRate}`,
`{taxPercent}` or `{villaName}` are filled in automatically (the admin shows a hint wherever
a field contains them).

### Configuration

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | **Required** to sign in. Without it the admin refuses every sign-in. |
| `ADMIN_SECRET` | Signs the session cookie. If unset, a random one is made at start-up and everyone is signed out when the server restarts. |
| `CONTENT_DIR` | Where content lives (default `./data`). Must be a **persistent disk** in production. |
| `NG_ALLOWED_HOSTS` | Hostnames the SSR server answers for (Angular's SSRF protection), e.g. `localhost` or your domain. You can also set `security.allowedHosts` in `angular.json`. |

`CONTENT_DIR` holds:

```
data/content.json      the live content (created on the first publish)
data/uploads/          uploaded photographs, served at /uploads/…
data/backups/          the last 30 published versions
```

Until the first publish, the site shows the defaults built from `src/app/core/data/*.data.ts`
and `src/app/core/content/default-pages.ts`. `data/` is git-ignored: back it up like a database.

### Security notes

- One password, compared in constant time; 8 failed attempts per IP per 15 minutes, then a lockout.
- Session: HMAC-signed, `HttpOnly`, `SameSite=Strict` cookie (and `Secure` behind HTTPS), 12 hours.
- Uploads are accepted only when the file's own bytes are JPEG, PNG, WebP, AVIF or GIF (no SVG), at most 15 MB, and get random names.
- Every save is validated on the server (types, unique slugs, valid date ranges, sane percentages, and links/pictures limited to `https://`, `http://` or site paths).
- Admin text is never rendered as HTML; the only markup is the `*italics*` convention, applied after escaping.

## Architecture

```
src/server.ts                 Express: API, /uploads, SSR (passes live content to each render)
src/server/
  api.ts                      /api/content and /api/admin/* routes
  content-store.ts            content.json read/validate/atomic write + backups
  auth.ts                     password check, signed session cookie
  uploads.ts                  photo uploads and the library
src/app/
  core/
    content/                  SiteContent model, defaults, ContentService, validation, tokens
    data/                     the original content, now the defaults
    models/ services/ utils/  villas, booking, SEO, dates, availability, pricing
  shared/                     layout and UI components
  pages/                      the public pages (all read ContentService)
  admin/                      the admin: shell, sign-in, schema, generic field editor,
                              availability calendar, photo library, history
```

Public pages render on the server for every request (`RenderMode.Server`), so they always
show the latest published content. `/book` and `/admin` render in the browser and fetch
`/api/content` on start-up.

The admin editors are generic: `admin/editor/field.ts` walks the content document and picks a
control for each value (text, text box, number, %, date, picture, icon, select, list, group).
`admin/schema.ts` defines the sections, labels and help text. A key added to
`default-pages.ts` or to a model therefore appears in the admin automatically.

## The booking flow

Five steps — stay → villa → extras → details → review — held in `BookingService` as signals and
persisted to `sessionStorage` so a reload mid-booking loses nothing.

Price = nightly rate × nights, plus the peak supplement on nights inside a peak season, minus
the best long-stay discount, plus extras, plus tax and service, all as set in
**Prices & seasons** (`core/utils/pricing.util.ts`).

Nights closed in **Availability** cannot be booked. There is no reservations back end. Two
integration points are marked in the source:

- `BookingService.confirm()` in `core/services/booking.service.ts`: POST to a reservations API.
- `ContactPage.submit()` in `pages/contact/contact.ts`: post the enquiry to the property's inbox.

To connect a channel manager, replace `isVillaBooked` in `core/utils/availability.util.ts`.

## Tests

`npm test` covers pricing (nights, peak supplement, long-stay tiers, extras, tax, and rules
edited at runtime), availability, minimum stays, confirmation, deep links, villa lookups,
date utilities and peak windows, content merging and validation, the copy helpers, and the
admin's night toggling and draft updates — 60 tests.
