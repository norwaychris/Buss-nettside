# ACCESSIBILITY.md

**Target: WCAG 2.1 level AA.**

Two reasons, and the second is the one that pays. First, Norwegian law
(*likestillings- og diskrimineringsloven* with the *forskrift om universell
utforming av IKT*) requires WCAG 2.1 AA for websites aimed at the general
public. Second, an accessible booking form is a *better* booking form — larger
targets, clearer labels, better errors, keyboard operability. Every fix below
helps everyone.

---

## 1. What is already right

| | Implementation |
|---|---|
| Skip link | `.skip-link` — first element in `<body>`, slides in on focus, points at the form |
| Focus indicator | Global `:focus-visible` — 2px red outline, 3px offset. Keyboard-only. |
| Semantic HTML | `<header> <main> <nav> <section> <article> <footer> <fieldset> <legend> <details>` |
| Form labels | Every control has a `<label for>` |
| Landmark labels | `aria-label` on both `<nav>` elements and the trust strip |
| Reduced motion | Respected in both CSS and JS |
| Alt text | Present and descriptive on every image |
| Decorative icons | `aria-hidden="true"` on every SVG wrapper |
| Error announcement | `.form-error` has `role="alert"` |
| Heading order | One `<h1>` per page, no skipped levels |
| Language | `lang="no"` on every page |
| Colour contrast | All text passes AA — see §3 |
| Touch targets | Buttons and fields exceed 44 × 44px |
| Native disclosure | FAQ uses `<details>`/`<summary>` — keyboard-operable for free |
| Zoom | No `maximum-scale`, no `user-scalable=no` |

## 2. Keyboard operation

The whole site must be usable with `Tab`, `Shift+Tab`, `Enter`, `Space` and
`Escape`. Test this after every interactive change — it takes thirty seconds and
catches most defects.

| Element | Expected |
|---|---|
| Skip link | First `Tab` reveals it; `Enter` jumps to the form |
| Nav links and buttons | Focusable, red outline visible |
| Occasion chips | `Tab` reaches them; `Enter`/`Space` selects — **but see §4** |
| Form fields | Natural order top to bottom |
| Hint button | `Enter` opens; `Escape` closes |
| FAQ | `Enter`/`Space` toggles |
| Success overlay | **Broken — see §5** |

## 3. Colour contrast

Measured, not estimated. Every figure below comes from the WCAG relative-
luminance formula applied to the actual computed colours in the browser.

| Combination | Ratio | AA |
|---|---|---|
| `--ink` `#f5f5f6` on `--bg` | 18.16:1 | ✅ |
| `--muted` `#a1a1aa` on `--bg` | 7.72:1 | ✅ |
| `--muted-2` `#82828c` on `--bg` | 5.20:1 | ✅ |
| `--muted-2` `#82828c` on `--card` | 4.83:1 | ✅ |
| `--red` `#ff3b3b` on `--bg` | 5.60:1 | ✅ |
| `--red` `#ff3b3b` on `--card` | 5.20:1 | ✅ |
| White on `--red-fyll` `#e12b2b` | 4.58:1 | ✅ |
| White on `--red-fyll-hover` `#c41f28` | 5.88:1 | ✅ |

### Two failures this table used to hide

Both were found by axe-core on 2 August 2026, and both had been documented here
as passing.

**White on `--red` was 3.53:1, on the primary button, on every page.** This
document called it "✅ large text only". The large-text exemption needs ≥18.66px
*and* bold, or ≥24px. The buttons render at 15px and 17px, so the exemption
never applied. Fixed by introducing `--red-fyll` `#e12b2b` (4.58:1) for red
fills that carry white text. See `DESIGN_SYSTEM.md` §2.

**`--muted-2` was `#7a7a83`, measured only against `--bg`.** Against `--bg` it
is 4.65:1 and passes. But it is used on `.form-note`, `.field-note` and
`.time-sep`, which sit on `--card` — and there it was **4.32:1**, below AA.
Fixed by lightening to `#82828c`.

> **The lesson worth keeping:** measure a colour against the background it is
> actually rendered on, not against the darkest background in the system. The
> old figures in this table were not typos; they were measured against the
> wrong surface.

### Rules that follow

- **Red text uses `--red`. Red behind white text uses `--red-fyll`.** Writing
  `background: var(--red)` together with `color: #fff` is the bug, every time.
- **Check both `--bg` and `--card`** when adding or changing a text colour.
  Most text on this site sits on a card, not on the page background.
- **`--muted-2` never below 12px**, and never for text required to complete a
  task.
- **Red is never the only signal.** Selected chips also change background and
  carry `aria-checked`. Required fields have `*` plus the `required` attribute.
  Errors have text, not just colour.

## 4. Known defect — the occasion chips

```html
<div class="chips" role="radiogroup" aria-label="Anledning">
  <button type="button" class="chip" role="radio" aria-checked="false">…</button>
```

The ARIA roles promise radiogroup semantics that are not implemented. A real
radiogroup requires:

- **Arrow-key navigation** between options
- **Roving tabindex** — the group is one tab stop, not seven
- `Home` / `End` support

Today all seven chips are separate tab stops with no arrow keys. A screen-reader
user is told this is a radiogroup and finds it does not behave like one, which is
worse than no ARIA at all.

**Two valid fixes:**

1. Implement roving tabindex and arrow keys properly.
2. Replace with visually-styled native `<input type="radio">` — free semantics,
   free keyboard support, less code.

Option 2 is recommended. Tracked in `ROADMAP.md`.

## 5. Known defect — the success overlay

```html
<div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="success-title">
```

`aria-modal="true"` tells assistive technology that everything outside is
inert. Nothing enforces that:

- Focus is not moved into the dialog when it opens.
- Focus is not trapped — `Tab` walks straight out into the page behind it.
- `Escape` does not close it.
- Focus is not restored to the submit button on close.

For a keyboard or screen-reader user, submitting the form leaves them somewhere
undefined with no announcement that anything happened. **This is the
highest-priority accessibility fix.**

The correct implementation:

```js
let sistFokusert = null;

function apneOverlay() {
  sistFokusert = document.activeElement;
  overlay.hidden = false;
  document.getElementById("success-close").focus();
  document.addEventListener("keydown", overlayTaster);
}

function lukkOverlay() {
  overlay.hidden = true;
  document.removeEventListener("keydown", overlayTaster);
  if (sistFokusert) sistFokusert.focus();
}

function overlayTaster(e) {
  if (e.key === "Escape") { lukkOverlay(); return; }
  if (e.key !== "Tab") return;
  const f = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!f.length) return;
  const forste = f[0], siste = f[f.length - 1];
  if (e.shiftKey && document.activeElement === forste) { e.preventDefault(); siste.focus(); }
  else if (!e.shiftKey && document.activeElement === siste) { e.preventDefault(); forste.focus(); }
}
```

## 6. Other known gaps

| Gap | Impact | Priority |
|---|---|---|
| Skip link only on `index.html` | Keyboard users on subpages tab through header first | Medium |
| Hidden `Tidsrom` field carries the real value | If JS fails, an empty value submits with no warning | Medium |
| Form has `novalidate` | Correct, but means JS is solely responsible for validation | Low — accepted |
| No live region for "Sender…" | Submission state is visual only | Low |
| `apple-touch-icon` points at an SVG | iOS does not support SVG here — no home-screen icon | Low |
| Hero `onerror` placeholder text | Developer text could reach a real user | Low |

## 7. Rules for new work

### Every interactive element must

- Be reachable by `Tab`
- Show a visible focus indicator
- Be operable by `Enter` and/or `Space`
- Have an accessible name — visible text, `aria-label`, or `aria-labelledby`
- Have a state that assistive technology can read (`aria-expanded`,
  `aria-checked`, `aria-pressed`)

### Every form field must

- Have a `<label for="…">` — placeholders are not labels
- Use the right `type` (`tel`, `email`, `date`, `time`, `number`)
- Have `autocomplete` where a standard token exists
- Be at least 16px so iOS does not zoom on focus
- Mark required state with both `*` and the `required` attribute

### Every image must

- Have `alt` describing what it shows, or `alt=""` if purely decorative
- Have `width` and `height`
- Have `aria-hidden="true"` on the wrapper if it is an inline decorative SVG

### Every animation must

- Use `transform`/`opacity` only
- Have a `prefers-reduced-motion: reduce` escape
- Not flash more than three times per second

### Never

- `outline: none` without an equally visible replacement in the same rule
- `tabindex` above 0
- `role` that promises behaviour you have not implemented (see §4)
- Colour as the only carrier of meaning
- `user-scalable=no` or `maximum-scale`

## 8. Testing

### Every change — thirty seconds

1. `Tab` through the affected area. Everything reachable? Focus visible?
2. Operate it with the keyboard only.
3. Zoom to 200 %. Anything clipped or overlapping?

### Every substantial change

4. Run the page through an automated checker (axe DevTools, WAVE, or Lighthouse's
   accessibility audit). Automated tools catch roughly 30 % of issues — a clean
   report is a starting point, not a pass.
5. Turn on a screen reader (VoiceOver `Cmd+F5`, NVDA on Windows) and submit the
   form start to finish. This is the test that finds what tools miss.

### Quarterly

6. Full keyboard pass across all six pages.
7. Re-verify contrast if any colour changed — **against `--card` as well as
   `--bg`**.
8. Re-check that the FAQ markup and `FAQPage` JSON-LD still match.

### Current automated status

As of 2 August 2026, axe-core (WCAG 2.1 A + AA + best-practice) reports
**0 violations across all six pages**, and every tap target measures ≥24 px
(WCAG 2.2, 2.5.8). Both were verified with Playwright against a local server.

That is a floor, not a ceiling. Automated tools catch roughly a third of real
problems — a screen-reader pass through the booking form still finds things no
checker will.
