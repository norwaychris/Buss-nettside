# MASTER_CONTEXT.md

**The single source of truth for what NorwayRob is, what exists, and what is
true right now.** If any other document contradicts this one, this one wins
and the other should be corrected.

Last verified: 2026-08-01

---

## 1. The business in one paragraph

NorwayRob rents a bus with a driver to groups in Bergen and the surrounding
area — bachelor/bachelorette parties, student welcome weeks (*fadderuke*),
mystery trips (*blåtur*), birthdays, corporate outings and Christmas parties.
The differentiator is not the vehicle; it is Rob himself, a bus driver with 15
years of experience and 2.2 million TikTok followers, which turns the ride from
transport into part of the event. The website's only job is to convert
attention into qualified inquiries.

## 2. Who runs it

| | |
|---|---|
| Owner / operator | Rob |
| Legal form | Registered Norwegian company with its own transport licence (*løyve*) |
| Organisation number | **931 870 106** (displayed in the footer, terms and privacy policy) |
| Licence (løyve) | **Applied for — not yet granted.** See §3a. |
| Staff | One person. Rob is owner, driver, salesperson and support. |
| Contact | `norwayrob@outlook.com` |
| Phone | Exists, but is **not public**. See §8. |

> **Open item.** The licence number (*løyvenummer*) is still not recorded, and
> the licence itself has not been granted yet. Tracked in `ROADMAP.md`.

## 3. The most important fact about the current stage

**The bus has not been purchased yet.**

This single fact constrains almost everything:

- The site is live and indexed, but **cannot promise availability**.
- Every form submission is an **inquiry**, not a booking.
- **No payment may be accepted** until Rob has confirmed he can deliver.
- **No seat count may be hardcoded.** The first bus will likely have 35–49
  approved seats, but that is not settled. Capacity must be configurable from
  one place and propagate everywhere it is displayed.
- Copy must not describe features of a specific vehicle (interior, sound
  system specifics, toilet, etc.) that are not yet certain.

The site stays live deliberately: it validates demand and teaches us how
customers behave before capital is committed.

## 3a. The transport licence — a deliberate, documented decision

The *løyve* has been applied for but **not yet granted**. The site nevertheless
states "Løyve · forsikret" in the footer, the FAQ, the about page, the terms and
the quote emails.

**Rob's decision, 1 Aug 2026:** keep the wording as-is, because no trip will be
driven before the licence is in hand — so by the time the claim matters to any
customer, it will be true.

**The concern that was raised and overruled:** the site is live and indexed now,
so the claim is public before it is true. Operating passenger transport without
a licence is illegal under *yrkestransportlova*, and stating you hold one you do
not is a misrepresentation under *markedsføringsloven § 6*.

**Why the exposure is nevertheless small:** no booking can be completed, no
payment is accepted, and every submission is treated as an inquiry (§3).

**This must be revisited if any of the following happens:**

- The licence application is refused or delayed past the first booked trip
- Anyone is quoted a price and accepts before the licence is granted
- Payment is accepted from anyone

**When the licence is granted:** add the *løyvenummer* to the footer and the
terms page. It converts an unbacked claim into a verifiable one, which is
worth more than the claim alone.

The same reasoning applies to "forsikret" — vehicle insurance cannot exist
before the vehicle does.

## 4. What exists today

### Website — https://norwayrob.no

| Page | File | Purpose |
|---|---|---|
| Front page | `index.html` | Hero, trust strip, SEO intro, how-it-works, booking form, what's included, FAQ |
| About Rob | `om.html` | Trust and personality; the TikTok story |
| Terms | `vilkar.html` | Booking, payment, cancellation, conduct, liability |
| Privacy | `personvern.html` | GDPR privacy policy |
| Not found | `404.html` | Branded 404, `noindex` |

Supporting files: `styles.css`, `script.js`, `favicon.svg`, `robots.txt`,
`sitemap.xml`, `CNAME`, `googleb42a97d75978e695.html` (Search Console
verification — **never delete**), `images/hero.jpg`, `images/rob.jpg`.

### Backend — Google Apps Script

`google-apps-script/Code.gs` is deployed manually as a Web App from inside the
booking spreadsheet. On submission it:

1. Appends a row to the `Bestillinger` sheet with a fixed 16-column schema.
2. Emails a plain-text notification to `norwayrob@outlook.com`.
3. Emails an HTML confirmation to the customer.

### Email templates

`tilbud/` contains four ready-made HTML emails; `TILBUDSMAL.md` contains the
plain-text versions of nine scenarios plus a per-booking checklist.

| File | When |
|---|---|
| `tilbud/tilbud-epost.html` | Quote, departure more than 14 days away |
| `tilbud/tilbud-epost-kortvarsel.html` | Quote, departure less than 14 days away |
| `tilbud/paminnelse-epost.html` | Reminder, 2–3 days before the trip |
| `tilbud/takk-epost.html` | Thank you + Google review request, day after |

Text-only variants in `TILBUDSMAL.md` also cover: payment reminder, expired
reservation, date unavailable, and two cancellation confirmations.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) publishes to GitHub Pages on
push to `live`, plus manual `workflow_dispatch`. Custom domain via `CNAME` and
GoDaddy DNS.

## 5. Decisions already made — do not relitigate

These were decided deliberately. Changing them requires Rob's explicit consent.

| Decision | Why |
|---|---|
| Two-branch staging (`live` vs draft) | Rob reviews before anything reaches the public. Established after a live incident. |
| No public phone number | Only private numbers exist; 2.2M followers makes a public number a real liability. Number appears only in confirmation and reminder emails. |
| Bank transfer only, no Vipps initially | Keep it simple until volume justifies more payment rails. |
| Private pays in full up front; businesses may be invoiced | Cash-flow safety for a one-person operation. |
| No fabricated reviews or statistics | Fake testimonials were written and then removed. Nothing unverified goes on the site. |
| Free cancellation and unlimited date changes until 14 days before | Generous enough to remove booking anxiety, firm enough to protect a single-vehicle calendar. |
| The bus waits for late groups, but waiting time counts against rental time | Rob rejected "the bus leaves after 15 minutes" as bad brand behaviour. |
| A few extra passengers is fine, within approved capacity | Same reason — friendly, but safety and law are absolute. |
| Norwegian only for now, structurally ready for English | The person who books and pays is nearly always Norwegian. See `PRODUCT_VISION.md` §6. |
| Cookieless first-party analytics into the spreadsheet | No consent banner, no friction, no cost, no personal data. |

## 6. Strategy, as decided in the architecture interview

| Question | Answer |
|---|---|
| Two-year ambition | Build so it *can* scale, without over-engineering now. One bus and one driver initially; adding buses, drivers and capacity later must not require a rebuild. |
| Traffic strategy | Social (TikTok/Instagram) and Google search are **equally important**. The site must sell to a cold searcher without slowing down a warm follower. |
| Pricing | Customer always sees **one fixed price**. Internally derived from a configurable model: hourly rate, minimum duration, and adjustment for unusually long distances. |
| Automation | Semi-automated first: the system prepares everything, Rob approves every quote before sending. Architecture must allow the approval gate to be relaxed later without redesign. |
| 12-month definition of success | Proven profitable business with consistent demand — enough bookings every month to comfortably cover all operating costs, on top of a repeatable system that can scale. |

Everything in `ROADMAP.md` is ordered against that last row. Automation,
branding and expansion are means, not ends.

## 7. Data model — the booking spreadsheet

Sheet `Bestillinger`, 16 fixed columns in this exact order. The order is part
of the contract between the website, the Apps Script and any future migration.
**Do not reorder. Append only.**

```
Mottatt · Status · Navn · Telefon · E-post · Anledning · Dato · Tidsrom ·
Antall personer · Hentested · Rute · Anledning-detaljer · Ekstra ønsker ·
Kilde · Betalt (kr) · Notat
```

Status values: `Ny` · `Tilbud sendt` · `Betalt` · `Fullført` · `Avlyst`.

Form fields with a dedicated column: `Navn`, `Telefon`, `E-post`, `Anledning`,
`Dato`, `Tidsrom`, `Antall personer`, `Hentested`, `Rute`, `Ekstra ønsker`,
`Kilde`. Anything else the form sends — the per-occasion follow-up questions —
is concatenated into `Anledning-detaljer`.

Planned additions (see `ROADMAP.md`): a `Pris (kr)` column, a `Trafikk`
analytics sheet, and an `Innstillinger` configuration sheet.

## 8. Contact channels

| Channel | Public? | Notes |
|---|---|---|
| `norwayrob@outlook.com` | Yes | Footer, terms, privacy, schema, `replyTo` on all automated mail |
| Booking form | Yes | The primary and intended entry point |
| Phone | **No** | Appears only in confirmation and reminder emails to paying customers. Configured in Apps Script. **Never in this repository.** |
| TikTok `@norwayrob` | Yes | Footer, schema `sameAs` |
| Instagram `@norwayrob` | Yes | Footer, schema `sameAs` |

## 9. Known unverified claims currently on the site

These are believed true, but are not documented anywhere with evidence. They
should be substantiated or softened.

- "Løyve · forsikret" — **the licence is applied for, not yet granted**, and
  there is no vehicle to insure yet. Kept by Rob's explicit decision; see §3a.
- "2,2M følgere på TikTok" — verifiable; keep in sync as it grows.
- "Vasking inkludert", "lydanlegg", "henting og levering" — features of a bus
  that does not exist yet.

**Resolved 1 Aug 2026:** organisation number added everywhere · `priceRange:"$$"`
removed from JSON-LD · "15+ års erfaring" reconciled to "15 år bak rattet" ·
"svarer raskt" reconciled to "innen 24 timer" · all copy that implied guaranteed
availability or an automatic reservation rewritten (see `BUSINESS.md` §10).

## 10. Glossary

| Norwegian | Meaning |
|---|---|
| *Løyve* | Transport licence required to carry passengers commercially |
| *Fadderuke* | Norwegian university welcome week; a major seasonal demand driver |
| *Blåtur* | "Blue trip" — a mystery trip where the destination is kept secret |
| *Utdrikningslag* | Bachelor / bachelorette party |
| *Julebord* | Company Christmas party; the winter demand peak |
| *Tilbud* | Quote / offer |
| *Hentested* | Pickup location |
| *Vilkår* | Terms and conditions |
