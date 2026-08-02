# SEO_GUIDE.md

**Search strategy, what is implemented, and the rules for not breaking it.**

Search is one of two equally weighted channels (`PRODUCT_VISION.md` §7). It
delivers less volume than social but far higher intent: someone searching "leie
buss bergen" is going to rent a bus from someone.

---

## 1. Current status

| | |
|---|---|
| Domain | `norwayrob.no` — new, no history, no backlinks |
| Search Console | Verified via `googleb42a97d75978e695.html` — **never delete this file** |
| Indexing | Confirmed indexed ("Nettadressen er på Google — Siden er indeksert") |
| Sitemap | `sitemap.xml`, 5 URLs, submitted |
| Rankings | Effectively none — expected for a domain this young |
| Google Business Profile | Exists; review link live. **Incomplete** — see §8 |

**Set expectations honestly.** A brand-new `.no` domain in a competitive local
category takes 3–9 months to rank for its main terms. Nothing in this document
changes that. What it does is make sure that when authority arrives, the site is
ready to convert it.

## 2. Target keywords

### Primary — the money terms

| Query | Intent |
|---|---|
| `leie buss bergen` | Highest value. Direct commercial intent. |
| `bussutleie bergen` | Same, slightly more formal phrasing |
| `leie buss med sjåfør bergen` | Qualified — already knows they want a driver |
| `charterbuss bergen` | Industry term; often B2B |
| `buss til leie bergen` | Long-tail variant |

### Secondary — occasion terms

`buss utdrikningslag bergen` · `buss fadderuke bergen` · `buss blåtur bergen` ·
`buss julebord bergen` · `buss firmatur bergen` · `minibuss bergen` ·
`gruppetransport bergen`

Occasion terms are less competitive and convert better because the searcher has
already decided what they are doing. **This is where the near-term opportunity
is**, and it is the basis for the landing-page plan in §7.

### Geographic modifiers

Bergen sentrum · Åsane · Fana · Ytrebygda · Laksevåg · Arna · Askøy · Sotra ·
Øygarden · Os / Bjørnafjorden · Nordhordland · Flesland · Voss

### Explicitly not targeted

`buss oslo`, `busstur norge`, `bus rental norway` — outside the service area or
the wrong language. Chasing them dilutes the local signal.

## 3. Per-page metadata

Every page has: `<title>`, `<meta name="description">`, `<link rel="canonical">`,
`<meta name="robots">`, `<meta name="theme-color">`, full Open Graph, favicon,
and font preconnects.

| Page | Title | Robots |
|---|---|---|
| `index.html` | `Leie buss i Bergen – bussutleie med sjåfør \| NorwayRob` | `index, follow, max-image-preview:large` |
| `utdrikningslag.html` | `Buss til utdrikningslag i Bergen \| NorwayRob` | `index, follow` |
| `om.html` | `Om Rob – bussjåføren fra Bergen \| NorwayRob` | `index, follow` |
| `vilkar.html` | `Vilkår og avbestilling \| NorwayRob` | `index, follow` |
| `personvern.html` | `Personvern \| NorwayRob` | `index, follow` |
| `404.html` | — | **`noindex`** |

### Rules

- Title ≤ 60 characters, keyword first, brand last after a `|`.
- **Capitalise the first word of every segment.** Google rewrites and reorders
  titles in roughly half of all results, and will happily promote a middle
  segment to the front. `… – bussutleie med sjåfør` was rendered by Google as
  `bussutleie med sjåfør | NorwayRob: Leie buss i Bergen` — lowercase, first
  thing a searcher sees. Every fragment between `–`, `|` and `:` must be able to
  stand first. Check with:
  ```bash
  grep -o '<title>[^<]*</title>' *.html | grep -E '[–|:] +[a-zæøå]'
  ```
  Any output is a fragment that will look wrong if Google leads with it.
- Description 140–160 characters, contains the keyword, ends with a reason to
  click — not a summary of the page.
- `canonical` is absolute and always `https://norwayrob.no/…`.
- Every page has a unique title and description. Duplicates are wasted slots.

## 4. Structured data

Three JSON-LD blocks on `index.html`, one `Person` + one `BreadcrumbList` on
`om.html`, one `BreadcrumbList` on `vilkar.html` and `personvern.html`.

| Type | Where | Purpose |
|---|---|---|
| `LocalBusiness` | `index.html` | The core entity. `@id: https://norwayrob.no/#bedrift` |
| `WebSite` | `index.html` | Site-level identity |
| `FAQPage` | `index.html` | Rich results for question queries |
| `Person` | `om.html` | Rob as an entity, `worksFor` → the business `@id` |
| `BreadcrumbList` | subpages | Navigation context in results |

`LocalBusiness` carries `hasOfferCatalog` (six services), `areaServed` (nine
places + Vestland), `geo`, `address`, `sameAs` (TikTok, Instagram), `email`,
`slogan` and `knowsLanguage`.

### The rule that matters most

**The `FAQPage` block must match the visible FAQ exactly.** Ten questions in the
markup, ten in the JSON-LD, same wording. Structured data that contradicts
visible content is a manual-action risk and a trust problem. Change one, change
both, in the same commit.

### Known issues

- `priceRange: "$$"` is an unsubstantiated guess on a site that deliberately
  refuses to state price levels. Remove it or justify it.
- `LocalBusiness` should carry the organisation number (via `identifier` or
  `vatID`) and a `telephone` once one exists publicly. Neither does today.

## 5. Content and on-page

### Heading structure

One `<h1>` per page. `<h2>` per section, `<h3>` inside cards and FAQ. Never
skipped, never used for styling — the visual scale comes from CSS classes.

### Keyword placement on the front page

| Location | Contains |
|---|---|
| `<title>` | `Leie buss i Bergen – bussutleie med sjåfør` |
| `<h1>` | `Leie buss?` |
| First `<h2>` | `Leie buss i Bergen — med sjåfør` |
| Intro paragraph | `bussutleie med sjåfør i Bergen`, `charterbuss` |
| FAQ questions | `Kan man leie buss med sjåfør?`, `Hva koster det å leie buss i Bergen?` |
| Image `alt` | `Rob fra NorwayRob foran bussen med fjorden i bakgrunnen` |

The intro section exists primarily for search. It is written to read naturally
anyway — see `COPYWRITING_GUIDE.md` §9. **If you have to read a sentence twice
to parse it, it is over-optimised.**

### Internal links

Header → Om oss. Footer → every page. FAQ and guarantee → `vilkar.html`.
Every page → back to the front page. Descriptive anchor text always; never
"les mer" or "klikk her".

## 6. Technical SEO

| Item | Status |
|---|---|
| HTTPS | ✅ Enforced by Pages |
| Mobile-friendly | ✅ Responsive, 16px+ inputs |
| Core Web Vitals | ✅ See `PERFORMANCE.md` |
| `robots.txt` | ✅ Allows all, points at the sitemap |
| `sitemap.xml` | ✅ 5 URLs, `lastmod` current (2026-08-02) |
| Canonicals | ✅ All pages |
| 404 | ✅ Branded, `noindex` |
| Structured data | ✅ Five types |
| `hreflang` | N/A — single language today |
| `www` handling | ⚠️ Not documented. Verify `www.norwayrob.no` redirects |
| Trailing-slash consistency | ⚠️ Not documented |

**Maintain `sitemap.xml` by hand.** Every time a page is added or substantially
changed, update its `lastmod`. A stale sitemap teaches Google to re-crawl less
often.

## 7. The biggest untapped opportunity: occasion landing pages

The front page targets `leie buss bergen`, a term it will not win for months.
Occasion terms are far less competitive and convert better.

Proposed, in priority order:

| URL | Target | Season |
|---|---|---|
| ~~`/utdrikningslag.html`~~ | `buss utdrikningslag bergen` | **Live since 2 Aug 2026** |
| `/fadderuke.html` | `buss fadderuke bergen` | Publish by June for August |
| `/firmatur.html` | `buss firmatur bergen`, `buss julebord bergen` | The low-season fix |
| `/blatur.html` | `buss blåtur bergen` | Year-round |

Each page: unique `<h1>` and description, 400–600 words genuinely about that
occasion, its own FAQ, the same booking form (anchored to the front page or
inlined with the occasion pre-selected), its own `Service` schema, and links
both ways with the front page.

**Do not create these as thin duplicates.** Four near-identical pages are worse
than one good one — that is exactly what triggers a thin-content demotion. Each
needs real, specific content.

### The pattern the first page established

`utdrikningslag.html` is the reference implementation. Copy its shape, not its
prose: 653 words about that occasion specifically, five FAQ entries that apply
to nothing else, `Service` schema pointing at the business `@id`, its own
`FAQPage`, and links both ways with the front page.

**The form is not duplicated.** Calls to action link to
`/?anledning=<Occasion>#booking`, and `script.js` preselects the matching chip
on load. One form, one place to change it. The value must match a chip's
`data-value` exactly; unknown values are ignored rather than guessed at.

Preselection deliberately does **not** emit `anledning_valgt` — only a real
click does. Counting a prefilled choice as a funnel step would inflate the
metric with actions no visitor took.

## 8. Off-page

### Google Business Profile — the highest-leverage unfinished item

For a local service business, GBP drives more local traffic than the website
does. It is created and the review link works
(`https://g.page/r/CaOsA5S43vnjEBM/review`), but incomplete.

To finish: full description with keywords · every service listed · service area
covering all target districts · photos of the bus and Rob · opening hours ·
category set to bus/charter service · organisation number.

### Reviews

**We have none, and that is correct** — there have been no customers. The
thank-you email (`tilbud/takk-epost.html`) asks for one the day after each trip,
which is the highest-conversion moment.

Reviews are the single strongest local ranking factor. Getting the first ten is
worth more than any on-page change in this document.

**Never fabricate one.** This has already happened once and was correctly
reverted.

### Backlinks

Realistic sources: student associations and line societies after fadderuke ·
local Bergen event and wedding directories · businesses linking after a
corporate trip · local press if the TikTok angle is pitched.

No paid links, no directory spam.

## 9. Preparing for English without building it

The decision (`PRODUCT_VISION.md` §6) is Norwegian now, English later. What to
do now so that "later" is cheap:

- Reserve the `/en/` path prefix. Do not use it for anything else.
- Keep user-facing strings out of JavaScript where practical, so translation
  does not mean editing logic.
- When adding a page, note its future English counterpart in the sitemap plan.
- When English ships: `hreflang="no"` / `hreflang="en"` / `x-default` on every
  page pair, plus separate Search Console property handling.

Do **not** add `hreflang` tags now. A tag pointing at a page that does not exist
is worse than no tag.

## 10. Before you change anything SEO-relevant

```
[ ] Title unique, ≤ 60 chars, keyword first
[ ] Description unique, 140–160 chars, gives a reason to click
[ ] Canonical absolute and correct
[ ] One h1, no skipped heading levels
[ ] Every image has meaningful alt text
[ ] FAQ markup and FAQPage JSON-LD still identical
[ ] New page added to sitemap.xml with today's lastmod
[ ] New page linked from the footer
[ ] Open Graph tags present (title, description, image, url, type)
[ ] Nothing claimed that BUSINESS.md cannot back up
```
