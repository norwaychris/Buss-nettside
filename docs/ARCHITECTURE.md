# ARCHITECTURE.md

**How the system is built, why it is built that way, and how it grows.**

The guiding constraint, set by Rob in the architecture interview:

> *"Optimize for simplicity today, but avoid decisions that would make future
> growth unnecessarily difficult."*

Every decision below is measured against that sentence.

---

## 1. System overview

```
                    ┌──────────────────────────┐
   Visitor ────────▶│  norwayrob.no            │
                    │  GitHub Pages (static)   │
                    │  HTML · CSS · JS         │
                    └───────────┬──────────────┘
                                │ POST (no-cors, urlencoded)
                                ▼
                    ┌──────────────────────────┐
                    │  Google Apps Script      │
                    │  Web App (doPost)        │
                    └───────┬──────────┬───────┘
                            │          │
              appendRow     │          │  MailApp
                            ▼          ▼
                ┌────────────────┐  ┌──────────────────────┐
                │ Google Sheet   │  │ norwayrob@outlook.com│  ← notification
                │ "Bestillinger" │  │ customer's inbox     │  ← auto-reply
                └────────────────┘  └──────────────────────┘
                            ▲
                            │ manual: price, status, send
                        ┌───┴────┐
                        │  Rob   │
                        └────────┘
```

There is no server, no database, no API layer, and no runtime we operate.
Total operating cost: **the domain name.**

---

## 2. The core decision: no build step

The site is hand-written HTML, one stylesheet, one script. No npm, no bundler,
no framework, no preprocessor, no package.json.

**Why this is right for this project:**

- Rob can open any file and recognise the text on his own website.
- Nothing can break because a transitive dependency published a bad version.
- Deployment is `git push` — no build to fail, nothing to reproduce.
- Zero supply-chain surface on a site that will handle customer data.
- No dependency will need updating in eighteen months.

**What it costs:**

- The header and footer are duplicated across five HTML files.
- Cache-busting query strings are maintained by hand.
- No type checking, no linting, no tests.

**When to revisit:** when the page count passes roughly ten, or a second
language ships. Both make duplication genuinely expensive. Until then, five
copies of a header is cheaper than a build pipeline.

> **This is a locked decision.** Introducing a build step, a framework, or an
> npm dependency requires Rob's explicit agreement, recorded here.

---

## 3. File layout

```
/
├── CLAUDE.md                    Auto-loaded agent entry point
├── index.html                   Front page — hero, form, FAQ
├── om.html                      About Rob
├── vilkar.html                  Terms
├── personvern.html              Privacy policy
├── 404.html                     Branded 404, noindex
├── styles.css                   All styles, ~795 lines
├── script.js                    All behaviour, ~272 lines
├── favicon.svg                  Site icon
├── robots.txt                   Crawl directives + sitemap pointer
├── sitemap.xml                  4 URLs
├── CNAME                        norwayrob.no
├── googleb42a97d75978e695.html  Search Console verification — NEVER DELETE
├── README.md                    Human-facing repo readme
├── SETUP.md                     One-time Google Sheets connection guide
├── TILBUDSMAL.md                All email templates, plain text
├── images/                      hero.jpg (196K), rob.jpg (264K)
├── tilbud/                      4 HTML email templates
├── google-apps-script/Code.gs   Backend — deployed by copy-paste
├── docs/                        This knowledge base
└── .github/workflows/deploy.yml GitHub Pages deployment
```

---

## 4. Frontend architecture

### CSS

Single file, organised in commented sections, roughly in page order:

```
TOKENS → BASE → BUTTONS → HEADER → HERO → TRUST STRIP → SECTIONS →
STEPS → FORM → INCLUDED → GUARANTEE → FAQ → FOOTER → PROSE/SUBPAGES →
OVERLAY → MOBILE CTA → MEDIA QUERIES
```

Flat class selectors. No BEM, no nesting deeper than two levels, no `!important`
anywhere. Desktop-first with `max-width` media queries (legacy, kept for
consistency).

### JavaScript

Single file, no modules, no bundling. Two shapes:

- **Top-level code** for the form — it must run and share state.
- **Named IIFEs** for independent features, each guarded so a missing element
  is a no-op rather than a crash:

  ```js
  (function antallHint() {
    const btn = document.getElementById("antall-hint-btn");
    if (!btn) return;      // subpages don't have it — exit quietly
    …
  })();
  ```

This pattern is why one script file can be loaded on every page without errors.
**Follow it for anything new.**

Features currently implemented: occasion chips + follow-ups · form submission ·
success overlay · headcount hint popover · time-range composition · minimum date ·
scroll reveal · mobile sticky CTA.

### Progressive enhancement

The site works without JavaScript, in a degraded but honest way: content renders,
`.reveal` elements are visible (the class is added by JS, not present in markup),
`<details>` FAQ works natively, and the form falls back to `mailto:` if
`BOOKING_ENDPOINT` is empty. Only chip selection and the composed time range
genuinely require JS.

---

## 5. The website ↔ spreadsheet contract

This is the most important interface in the system.

**A form field's `name` attribute is a spreadsheet column name.**

```html
<input type="text" id="navn" name="Navn" required />
```

`script.js` collects every named control into a flat object and posts it as
`application/x-www-form-urlencoded`. Apps Script reads `e.parameter` and maps it
onto `KOLONNER`.

### Rules

1. **Never rename a field** without renaming the column and migrating existing
   rows. Old rows would silently lose data.
2. **Never reorder `KOLONNER`.** Append only. Existing rows are positional.
3. **Fields not in `KJENTE_FELT`** are concatenated into `Anledning-detaljer`.
   This is how per-occasion follow-ups work without schema changes — adding an
   occasion requires **no backend change at all**. Preserve that property.
4. **Norwegian column names**, because Rob reads the spreadsheet daily.

### Why `no-cors`

Apps Script Web Apps do not return usable CORS headers to a browser. Options
were: `no-cors` and accept a blind write; a hidden iframe + form POST; or a
proxy. `no-cors` is simplest and works.

**The cost:** the browser cannot read the response to the POST.

### Confirmed delivery (implemented 1 Aug 2026)

We cannot read the answer to the POST, so we ask a **second** question whose
answer we *can* read.

```
1. Client generates a reference          nr-<base36 time>-<random>
2. POST (no-cors) carries it as `Ref`    → Apps Script writes it to the sheet
3. Client asks "did Ref arrive?" over a  → doGet looks it up, replies JSONP
   <script> tag, 6 s timeout                {"funnet": true}
4. Confirmed  → success overlay
   Not confirmed → honest message + prefilled mailto; form is NOT reset
5. Unconfirmed submissions are kept in localStorage and retried silently on
   the next visit (max 5, max 7 days old)
```

**Why a `<script>` tag and not `fetch`.** Script tags are not subject to CORS at
all, so the response is always readable. That is the entire reason JSONP is used
here — it is not legacy, it is the only channel that works without control over
the response headers.

**Why the reference makes retrying safe.** `doPost` looks up the reference
before appending. A reference it has already seen returns
`{status:"ok", duplikat:true}` without writing a second row. Without that,
step 5 would create duplicates every time a POST succeeded but its confirmation
was lost.

**Security.** The JSONP callback name is validated against
`/^[A-Za-z0-9_]{1,40}$/` in `svarJsonp()` before being echoed. Anything else
falls back to plain JSON. Never relax that check — it is the one place where a
query parameter would otherwise end up inside executed JavaScript.

**We never guess "yes".** A timeout, a network error and an explicit
`funnet: false` are all treated as *not confirmed*. Showing a customer a false
"Takk!" is the failure this whole mechanism exists to prevent.

---

## 6. Configuration over hardcoding

Set by Rob explicitly, about seat capacity:

> *"Design the site so seating capacity is configurable from one place and
> automatically updates wherever it's shown."*

Generalised: **no business fact is written into markup.** Facts change; markup
is copied across five files.

### The mechanism

A single config object at the top of `script.js`, and `data-` placeholders in
HTML with safe fallback text:

```js
const CONFIG = {
  kapasitet: null,          // seats — null until the bus is bought
  kapasitetTekst: "hele gjengen",   // used while kapasitet is null
  svartidTimer: 24,
  avbestillingsdager: 14,
  tilbudGyldigDager: 7,
};
```

```html
<p>Bussen tar <span data-config="kapasitetTekst">hele gjengen</span>.</p>
```

A small hydrator replaces the text of every `[data-config]` element on load.
The literal text inside the element is the fallback: if JS fails, or the value
is `null`, the sentence still reads correctly. **Never leave a placeholder
element empty.**

For the form's `max` attribute, the same config drives `antall.max`.

### Facts that must be configurable

`kapasitet` · `svartidTimer` · `avbestillingsdager` · `tilbudGyldigDager` ·
`minimumTimer` · service area list.

### Facts that stay in the spreadsheet, never in code

Hourly rate · distance surcharge · bank account number · Rob's phone number.
These are commercial or private and belong in the `Innstillinger` sheet, read by
Apps Script at send time.

> **Status: not yet implemented.** `ROADMAP.md` priority 5.

---

## 7. Analytics architecture (planned)

Decided: **cookieless, first-party, into the spreadsheet.** No consent banner
required under *ekomloven § 2-7b* because nothing is stored on the device and no
personal data is collected.

```
Browser event ──▶ navigator.sendBeacon(ENDPOINT, {type:"hendelse", …})
                            │
                            ▼
                  Apps Script doPost()
                   routes on payload type
                            │
                            ▼
                  Sheet "Trafikk"
```

### Payload

| Field | Example | Notes |
|---|---|---|
| `tidspunkt` | server-side `new Date()` | Never from the client |
| `hendelse` | `sidevisning` · `skjema_start` · `anledning_valgt` · `innsendt` | Fixed vocabulary |
| `side` | `/` · `/om.html` | Path only, never query strings |
| `kilde` | `tiktok` · `google` · `direkte` | Derived from `document.referrer` + UTM |
| `enhet` | `mobil` · `desktop` | From viewport width |

**Never collected:** IP address, user agent string, any identifier, any form
field value, anything that persists between visits.

### Why `doPost` routes on payload type — and routes *before* the lock

The same endpoint receives bookings and analytics events. `doPost` branches on
`type === "hendelse"` and defaults to the booking path, so an old cached
`script.js` keeps working.

**The branch sits above `LockService.getScriptLock()` and returns immediately.**
This is the single most important detail in the analytics design: the booking
path holds a lock for up to 30 seconds, and if page views queued behind it, one
viral video could lock out a paying customer. A dropped analytics row costs
nothing; a dropped booking costs a trip.

### What is written, and what never is

| Written | Never written |
|---|---|
| Server-side timestamp | IP address |
| Event name, from a fixed whitelist | User agent / fingerprint |
| Path only (`/`, `/om.html`) | Query strings — they can carry anything |
| Source (`tiktok`, `google`, `direkte`) | Any identifier, any cookie |
| Device (`mobil` / `desktop`) | Anything from the form |

`loggHendelse()` rejects any event name outside `TRAFIKK_HENDELSER`, truncates
`side` to 80 and `kilde` to 40 characters, strips newlines and tabs, and
normalises `enhet` to one of two values. The timestamp is always
`new Date()` on the server — a client-supplied time is ignored, because a
precise client clock is itself a fingerprinting signal.

> **Status: implemented 1 Aug 2026.** Menu item *Trafikk – siste 30 dager*
> renders the funnel. Verified with browser tests (source detection, single
> `skjema_start`, no query-string leakage, no form data in the traffic log) and
> unit tests (whitelist rejection, truncation, server-side timestamp, and that
> the routing branch precedes the lock).

**Known gap:** `script.js` only loads on `index.html`, so subpages are not
measured. Loading it everywhere would require guarding the top-level form code,
which currently throws when `#booking-form` is absent. Tracked in `ROADMAP.md`.

---

## 8. Email automation architecture (planned)

Decided: **semi-automated with an approval gate that can be relaxed later
without redesign.**

```
Sheet row  ──▶  [NorwayRob ▾] menu  ──▶  build email from template + row
                                                     │
                                    ┌────────────────┴─────────────────┐
                                    │  GODKJENNING_PAAKREVD === true?  │
                                    └────────┬────────────────┬────────┘
                                          yes│                │no
                                             ▼                ▼
                                    show preview       send immediately
                                    dialog → Send
                                             │                │
                                             └───────┬────────┘
                                                     ▼
                                       MailApp.sendEmail() → update Status
                                                            → log timestamp
```

### Design rules

1. **The approval gate is one boolean**, `GODKJENNING_PAAKREVD`, at the top of
   `Code.gs`. Turning automation up is flipping a flag, not a rewrite.
2. **Templates are data, not code.** Email bodies live as functions taking a row
   object and returning `{emne, html, tekst}` — so a copy change never touches
   send logic.
3. **Never send from an incomplete row.** Guard: a quote requires `Pris (kr)`
   and a valid `E-post`; a confirmation requires status `Betalt`. A missing
   field must produce a visible error, never a half-filled email.
4. **Every send writes back**: new `Status`, and a timestamp in a `Sendt`
   column. That log is what makes time-triggered automation (reminders,
   thank-yous) safe — it prevents double sends.
5. **Time-driven triggers come last**, and only for messages that ask for
   nothing: the pre-trip reminder and the post-trip thank-you. Anything
   involving money stays behind the gate.

### Menu

```js
function onOpen() {
  SpreadsheetApp.getUi().createMenu("NorwayRob")
    .addItem("Send tilbud",            "sendTilbud")
    .addItem("Send bekreftelse",       "sendBekreftelse")
    .addItem("Send betalingspåminnelse","sendBetalingspaminnelse")
    .addSeparator()
    .addItem("Send påminnelse før tur","sendTurpaminnelse")
    .addItem("Send takk + anmeldelse", "sendTakk")
    .addToUi();
}
```

Every action operates on **the currently selected row**.

> **Status: implemented 1 Aug 2026.** All five steps are live in `Code.gs`.

### The safety switch: `TESTMODUS`

A second boolean sits above the approval gate:

```js
var TESTMODUS = true;   // ALL mail goes to VARSEL_EPOST, never to the customer
```

When on, every email — including the automatic reply on form submission — is
delivered to Rob with `[TEST → kunde@…]` prefixed to the subject. The real
recipient is visible but never contacted.

This exists because the bus is not bought and the licence is not granted. The
quote email asks for payment to a bank account; sending it to a real customer
before we can deliver would mean holding someone's money for a trip that cannot
happen. `TESTMODUS` lets the entire flow be exercised end to end with zero
exposure.

**It must stay `true` until the bus is purchased and the licence granted.**

### Actual column layout after implementation

Three columns appended (never inserted — see §5):

| Column | Purpose |
|---|---|
| `Pris (kr)` | The quoted price. Required before a quote can be sent. |
| `Timer` | Trip duration, auto-derived from `Tidsrom`, editable when the end time was left blank. Drives the price suggestion. |
| `Sendt` | Append-only log, one line per email: `Tilbud · 01.08.2026 14:22`. Prevents accidental double sends and is what future time-driven triggers will read. |

### Migration safety

`hentEllerLagArk()` previously archived the whole sheet whenever the header did
not match, which would have moved existing bookings to `Bestillinger (gammel)`
the moment these columns were added. It now classifies the header three ways:

| Result | Action |
|---|---|
| `lik` | Header matches exactly — nothing to do |
| `eldre` | Existing header is a **prefix** of `KOLONNER` — append the missing columns in place, keep all data, backfill `Timer` where computable |
| `ukjent` | Genuinely different layout — archive as before |

**Any future column addition must preserve this property: append only, never
insert or rename.**

---

## 9. Deployment

`.github/workflows/deploy.yml` — triggers on push to `live` and on
`workflow_dispatch`. Uploads the repository root as a Pages artifact.

### The rule that caused a production incident

**GitHub Pages serves only the most recent deployment across the entire
repository — regardless of which branch produced it.**

An old branch (`claude/bus-booking-website-xyve0m`) carried its own deploy
workflow. It ran after the live deploy and silently replaced norwayrob.no with a
different project. Fixed by deleting that workflow from the old branch.

**Consequence:** there must never be more than one deploy workflow in this
repository, on any branch. Before adding any workflow, check every branch.

Custom domain: `CNAME` in the repository root + DNS at GoDaddy. If `CNAME` is
ever lost from a deployment, the domain stops resolving to the site.

---

## 10. The Apps Script deployment gap

`google-apps-script/Code.gs` is version-controlled but **not deployed by this
repository.** It is copy-pasted into the Apps Script editor and deployed
manually.

**Risks:**

- Repo and deployed code can drift with no signal.
- No rollback except pasting an older version.
- No way to verify which version is running.

**Mitigation for now:** always change `Code.gs` in the repo first, commit, then
give Rob the paste-and-redeploy steps. Add a version constant at the top and
have `doGet()` return it, so the deployed version can be checked by visiting the
URL.

**Proper fix (later, not now):** `clasp` gives two-way sync between the repo and
Apps Script. It requires Node and an auth flow, which conflicts with the
no-dependency decision, so it waits until the script is large enough to justify
it.

---

## 11. Security model

| Concern | Position |
|---|---|
| Endpoint is public (`Anyone`) | Required — Apps Script cannot authenticate an anonymous web form |
| Automated submissions | Filtering tracked in `ROADMAP.md` 2.4. Implementation detail is deliberately kept out of the docs |
| Throughput | Bounded by the Gmail daily send quota; alerting tracked in `ROADMAP.md` 2.5 |
| Secrets in repo | None, by rule. See `AI_RULES.md` §1.2 |
| Customer data | Google Sheet on Rob's account. Backup tracked in `ROADMAP.md` 1.4 |
| Transport | HTTPS everywhere; Pages enforces it |
| XSS | Low surface — `followupWrap.innerHTML` is built from the hardcoded `FOLLOWUPS` object, never from user input. **Keep it that way.** |
| Dependencies | Two Google Fonts requests. Nothing else. |

---

## 12. Scaling path

What changes, and at what point, per Rob's "must not require a rebuild" constraint.

| Stage | Trigger | Change |
|---|---|---|
| **Now** | — | One bus, one driver, spreadsheet + Apps Script |
| **Automation** | > 5 bookings/month | Menu-driven approval-gated emails; add `Pris (kr)`, `Sendt`, `Innstillinger`, `Trafikk` |
| **Calendar** | Double-booking risk becomes real | A `Kalender` sheet or Google Calendar integration; availability check before quoting |
| **Second bus** | Second vehicle bought | Add a `Buss` column. This is why capacity must already be config-driven, not hardcoded |
| **Drivers** | First hired driver | Add `Sjåfør` column; the row is already the unit of work |
| **Real database** | Spreadsheet passes ~2,000 rows or two people need concurrent access | Migrate `Bestillinger` — the fixed column order exists precisely to make this a straight import |
| **English site** | 15% English inquiries, or an operator relationship | `/en/` paths + `hreflang`; structure planned now (`SEO_GUIDE.md` §9) |

**The invariant that makes all of this cheap:** one booking = one row, with a
stable column order and a status field. Preserve it and every step above is
additive.

---

## 13. Decision log

| Decision | Rationale | Revisit when |
|---|---|---|
| Static site, no build | Simplicity, zero maintenance, Rob can read it | > 10 pages or 2nd language |
| Google Sheets as the database | Free, Rob already knows it, doubles as an admin UI | > 2,000 rows or concurrent editors |
| Apps Script as backend | No server to run or pay for | Mail quota or execution limits bite |
| `no-cors` POST | Only workable option for Apps Script | Never — mitigate instead |
| Two-branch staging | Rob reviews before the public sees it | Never |
| No public phone number | 2.2M followers is not a customer list | Rob decides otherwise |
| Cookieless first-party analytics | No consent banner, no cost, no friction | Needs exceed simple counts |
| Approval-gated automation | Price model not yet trustworthy | Model proves reliable |
| Norwegian only | The person who books and pays is Norwegian | See `PRODUCT_VISION.md` §6 |
| Capacity never hardcoded | Bus not bought; must stay flexible | Never — this is permanent |
