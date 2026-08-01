# COMPONENT_GUIDE.md

**The catalogue.** Every component that exists, its markup contract, its
behaviour, where it is used, and its gotchas. Reach for something here before
inventing something new.

There is no component framework. A "component" is a documented convention: a
class name, an expected markup shape, and rules in `styles.css`. Duplication
across the five HTML files is the cost of having no build step, and it is
accepted deliberately (`ARCHITECTURE.md` §2).

---

## 1. Brand block

```html
<a href="#top" class="brand" aria-label="NorwayRob – til toppen">
  <span class="brand-name">NORWAY<span class="brand-accent">ROB</span></span>
  <span class="brand-sub">Buss til leie · Bergen</span>
</a>
```

Appears twice per page (header, footer) × five pages = **ten copies**. On
subpages the `href` is `/#top`, on the front page it is `#top`. In the footer it
is a `<span>`, not a link.

Pure text — no image, no SVG. Always crisp, always indexable, zero bytes.

---

## 2. Header

```html
<header class="site-header">
  <div class="wrap header-inner">
    …brand…
    <nav class="header-nav" aria-label="Hovedmeny">
      <a href="/om.html" class="nav-link">Om oss</a>
      <a href="/#booking" class="btn btn-primary btn-sm">Få pris</a>
    </nav>
  </div>
</header>
```

Sticky, 68px tall, `rgba(10,10,11,.82)` with `backdrop-filter: blur(10px)`.

**Gotcha.** `index.html` uses relative links (`om.html`, `#booking`); subpages
use absolute (`/om.html`, `/#booking`). Both work, but keep the convention —
absolute on subpages avoids a broken link if a page is ever moved into a folder.

---

## 3. Buttons

| Class | Padding | Size |
|---|---|---|
| `.btn` | `14px 24px` | 16px — base, never used alone |
| `.btn-primary` | — | Red fill, white text, red glow |
| `.btn-sm` | `10px 18px` | 15px — header |
| `.btn-lg` | `16px 28px` | 17px — hero, form submit, mobile CTA |
| `.btn-block` | — | `width: 100%` |

Always combine: `.btn .btn-primary .btn-lg`.

**Gotcha.** On prose pages, `.prose a` sets `color: var(--red)`, which turned a
red button's label red-on-red. Fixed with `.prose a.btn { color:#fff; text-decoration:none; }`.
If you put a button inside new prose-styled content, verify the label is white.

---

## 4. Skip link

```html
<a href="#booking" class="skip-link">Hopp til bestillingsskjemaet</a>
```

First element in `<body>` on `index.html`. Parked at `top: -60px`, slides to
`top: 12px` on `:focus`. Points at the form, not at `<main>` — the form is what a
keyboard user actually came for.

**Gap.** Only present on `index.html`. Subpages should have one pointing at
`<main>`. Tracked in `ROADMAP.md`.

---

## 5. Hero

```html
<section class="hero">
  <div class="hero-photo" role="img" aria-label="Rob – NorwayRob">
    <img src="images/hero.jpg" width="1537" height="1023"
         fetchpriority="high" decoding="async" alt="…"
         onerror="this.style.display='none';this.parentElement.classList.add('no-photo')" />
    <span class="photo-placeholder" aria-hidden="true">…</span>
  </div>
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">…</p>
      <h1 class="hero-title">
        <span class="line-white">Leie buss?</span>
        <span class="line-red">Vi fikser kvelden.</span>
      </h1>
      <p class="hero-lead">…</p>
      <a href="#booking" class="btn btn-primary btn-lg">…</a>
      <ul class="cta-assure"><li>…</li><li>…</li><li>…</li></ul>
    </div>
  </div>
</section>
```

The two-tone `<h1>` (white line + red line) is a brand signature — keep it.

**Gotcha.** The `onerror` placeholder shows developer text ("Legg bildet ditt i
`images/hero.jpg`"). Harmless today because the image exists, but it would be
visible to a real visitor if the file ever 404s. Listed in `ROADMAP.md`.

---

## 6. CTA assurance list

```html
<ul class="cta-assure">
  <li>Tar under 2 min</li>
  <li>Gratis og uforpliktende</li>
  <li>Svar innen 24 timer</li>
</ul>
```

Glass box under the hero CTA: `rgba(10,10,11,.42)`, `blur(12px)`, radius 14px.
Each item gets a red `✓` via `::before`. Darkened and made more transparent at
Rob's explicit request — do not lighten it back.

Below 860px it becomes `flex-direction: column` with `width: 100%`. This was a
bug fix: horizontally it wrapped 2 + 1, which looked broken.

---

## 7. Trust strip

```html
<section class="trust-strip" aria-label="Nøkkeltall">
  <div class="wrap">
    <ul>
      <li><span class="num">15<em>+</em></span><span class="lbl">års erfaring</span></li>
      …
    </ul>
  </div>
</section>
```

Anton numerals, `<em>` for the red suffix (restyled to `font-style: normal`).
Stays three-across on mobile.

**Rule.** Every number here must be verifiable and appear in `BUSINESS.md`.
This strip is the single easiest place to accidentally publish a made-up figure.

---

## 8. Booking form

The most important component on the site. See `UX_GUIDELINES.md` for the
reasoning behind its structure.

### Structure

```
<form id="booking-form" class="form" novalidate>
  <fieldset class="form-block">  legend "Om dere"    → Navn, Telefon, E-post
  <fieldset class="form-block">  legend "Turen"      → Dato, Klokkeslett, Hentested,
                                                        Rute, Antall, Anledning, oppfølging
  <fieldset class="form-block">  legend "Til slutt"  → Ekstra ønsker, Kilde
  <button type="submit" class="btn btn-primary btn-block btn-lg" id="submit-btn">
  <p class="form-note">
  <p class="form-error" id="form-error" role="alert" hidden>
</form>
```

### Numbered blocks

CSS counter — no hardcoded numerals:

```css
.form { counter-reset: skjema; }
.block-label::before { counter-increment: skjema; content: counter(skjema); }
```

### Sub-components

| Class | Purpose |
|---|---|
| `.field` | One label + control + optional hint. `position: relative` — popovers anchor to it. |
| `.field-row` | Two fields side by side, `1fr 1fr`, collapses at 760px |
| `.field-half` | A single field at half width |
| `.time-range` | Two `<input type="time">` with a "til" separator |
| `.field-note` | Persistent explanatory text, 12.5px |
| `.field-hint` | Popover, hidden by default |
| `.chips` | Occasion selector |
| `.followup` | Container the follow-up questions render into |

### Validation

`novalidate` on the form, then in `script.js`:

1. Check `anledningInput.value` manually — a hidden input's `required` is
   ignored by the browser, so the chip selection must be checked in JS.
2. `form.checkValidity()` → `form.reportValidity()` for everything else.

**Known gap.** `#tid` (the hidden field actually submitted) has no `required`
and no check that end time is after start time. If the JS that composes it ever
fails, an empty `Tidsrom` reaches the spreadsheet silently. In `ROADMAP.md`.

**Known bug.** After a submission, `script.js` resets the button label to
`"Send forespørsel"` instead of the real label `"Få fast pris — uforpliktende"`.
In `ROADMAP.md`.

---

## 9. Occasion chips

```html
<div class="chips" id="occasion-chips" role="radiogroup" aria-label="Anledning">
  <button type="button" class="chip" data-value="Utdrikningslag" role="radio" aria-checked="false">…</button>
  …
</div>
<input type="hidden" id="anledning" name="Anledning" />
```

Clicking a chip sets `.active`, flips `aria-checked`, writes to the hidden
input, and renders the follow-up questions for that occasion.

Follow-ups are defined in the `FOLLOWUPS` object at the top of `script.js`. Each
entry's `name` becomes the key sent to Apps Script, which concatenates unknown
keys into the `Anledning-detaljer` column.

**To add an occasion:** add a chip in `index.html`, add a matching key in
`FOLLOWUPS`, bump `script.js?v=N`. Nothing in Apps Script needs to change.

**Known gap.** A real `radiogroup` needs arrow-key navigation and roving
tabindex. Neither exists, so the ARIA role currently overpromises. In
`ROADMAP.md`.

---

## 10. Hint popover

```html
<label for="antall">Antall personer <span class="req">*</span>
  <button type="button" class="hint-btn" id="antall-hint-btn"
          aria-expanded="false" aria-controls="antall-hint"
          aria-label="Usikker på antallet?">?</button>
</label>
<input type="number" id="antall" … />
<p class="field-hint" id="antall-hint" hidden>…</p>
```

Opens above the field, 340px wide (capped to the viewport), with a rotated-square
arrow. Closes on outside click, `Escape`, or re-clicking the trigger.

Rob specifically rejected an inline expanding section: *"jeg vil at det skal bli
en liten boks som kommer frem som egen fane"*. Keep it floating.

---

## 11. Content cards

| Class | Layout | Where |
|---|---|---|
| `.step-card` | Anton numeral 44px, heading, body | "Slik booker du" |
| `.inc-card` | Icon well 56px + text, horizontal | "Alt dette — uansett anledning" |
| `.guarantee` | Icon well 64px + text + side panel, red-tinted border and glow | Below the included grid |

**Dead CSS.** `.why-card`, `.review-card` and `.stars` remain in `styles.css`
but their sections were removed (the "Derfor velger folk" section and the fake
reviews). Safe to delete. In `ROADMAP.md`.

---

## 12. FAQ

```html
<details class="faq-item" open>
  <summary>Spørsmål?<span class="faq-icon" aria-hidden="true"></span></summary>
  <div class="faq-answer"><p>Svar.</p></div>
</details>
```

Native `<details>`/`<summary>` — accessible and keyboard-operable for free. The
first item is `open` so the block does not read as an empty list.

**Critical rule.** Every FAQ item is duplicated in the `FAQPage` JSON-LD block
at the bottom of `index.html`. **Add, edit or remove a question in one place and
you must do it in the other.** Structured data that contradicts visible content
is both a trust problem and a Google penalty risk.

---

## 13. Footer

Four columns (`1.7fr 1fr 1fr 1fr`): brand + tagline + social · Snarveier ·
Områder · Kontakt. Then `.footer-bottom` with the copyright line and legal nav.

Collapses to two columns at 860px, one at 520px.

**Gap.** Organisation number is legally required here and is missing. See
`BUSINESS.md` §9.

---

## 14. Mobile sticky CTA

```html
<div class="mobile-cta" id="mobile-cta" hidden>
  <a href="#booking" class="btn btn-primary btn-lg">Få pris — planlegg turen</a>
</div>
```

`display: none` above 700px. `hidden` is removed by JS only when both
`IntersectionObserver`s are available, so browsers without them never see a
broken bar. `pointer-events: none` until `.show` is added, so it cannot
intercept taps while invisible.

---

## 15. Success overlay

```html
<div id="success-overlay" class="overlay" hidden>
  <div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="success-title">
    <span class="success-check">✓</span>
    <h2 id="success-title">Takk! Forespørselen er sendt.</h2>
    <p>…</p>
    <button type="button" class="btn btn-primary" id="success-close">Lukk</button>
  </div>
</div>
```

Closes on the button or a click on the backdrop.

**Known gap.** `aria-modal="true"` is declared but focus is neither moved into
the dialog nor trapped, and `Escape` does not close it. For a keyboard or
screen-reader user the dialog is effectively broken. This is the highest-priority
accessibility fix. See `ACCESSIBILITY.md` §5 and `ROADMAP.md`.

---

## 16. Prose pages

`om.html`, `vilkar.html`, `personvern.html` share:

```html
<section class="page-hero">
  <div class="wrap wrap-narrow">
    <p class="eyebrow">…</p>
    <h1>…</h1>
    <p class="page-lead">…</p>
    <p class="updated">Sist oppdatert: …</p>   <!-- vilkar / personvern only -->
  </div>
</section>
<section class="section">
  <div class="wrap">
    <article class="prose">…</article>
  </div>
</section>
```

`.prose` sets 16.5px / 1.7 in `--muted`, `h2` at 22px, links in red.
`.back-link` closes every prose page.

---

## 17. About-page photo

```html
<figure class="about-media">
  <div class="about-photo"><img src="images/rob.jpg?v=2" … /></div>
  <span class="photo-badge"><span class="dot" aria-hidden="true"></span> Kjent fra TikTok</span>
</figure>
```

`aspect-ratio: 4/5`, `object-fit: cover`, framing set by `object-position: center 22%`.

**Gotcha.** Framing went through five rounds of adjustment with Rob. Change
`object-position` only, never re-crop the file, and expect to iterate — he
reviews visually and will tell you exactly what is wrong ("mer luft over hodet",
"zoom litt ut").

---

## 18. Email templates

Not web components — standalone HTML files, opened in a browser, copied, and
pasted into Outlook. Table-based, fully inline-styled, no external CSS.

| File | Scenario |
|---|---|
| `tilbud/tilbud-epost.html` | Quote, departure > 14 days |
| `tilbud/tilbud-epost-kortvarsel.html` | Quote, departure < 14 days (yellow warning block) |
| `tilbud/paminnelse-epost.html` | Reminder, 2–3 days before |
| `tilbud/takk-epost.html` | Thank you + Google review link, day after |

Plain-text versions of these plus five more scenarios (payment reminder, expired
reservation, date unavailable, two cancellation confirmations) live in
`TILBUDSMAL.md`.

Shared anatomy: black brand header → 3px red rule → white body card → detail box
→ one call to action → signature with the Rob quote.

**Rules.** Inline styles only — Gmail and Outlook strip `<style>`. Tables for
layout. Placeholders in `[brackets]`. **Never put a real account number or phone
number in these files.**

---

## 19. Automated emails in Apps Script

`sendVarsel()` (plain text to Rob) and `sendAutosvar()` (HTML to the customer)
in `google-apps-script/Code.gs` build their HTML as concatenated strings.

They use the same visual language as `tilbud/` but are **a separate
implementation**. Change one and the other does not follow. When updating the
brand look of emails, update both.

Both are wrapped in `try/catch` that swallows errors so a mail failure never
blocks the spreadsheet write. That is correct for data integrity and a problem
for observability — you will not know mail stopped working. See `ROADMAP.md`.

---

## 20. Adding a new component

1. Is an existing component close enough? Use it.
2. Name the class in Norwegian if it is content-specific (`.trust-strip`,
   `.faq-item`), English if it is structural (`.field`, `.wrap`). Match what is
   already there.
3. Use existing tokens only.
4. Add hover only if it is interactive.
5. Give it a visible focus state.
6. Test at 375px.
7. **Document it here in the same commit.**
