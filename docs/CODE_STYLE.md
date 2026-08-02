# CODE_STYLE.md

**How code in this repository is written.** Match what is already there. When
this document and the existing code disagree, the existing code usually wins —
consistency beats correctness in a codebase this small.

---

## 1. General

| | |
|---|---|
| Indentation | 2 spaces, never tabs |
| Line endings | LF |
| Encoding | UTF-8 — the site is Norwegian; `æ ø å` appear everywhere |
| Quotes | Double in HTML attributes; double in JS strings |
| Semicolons | Yes, in JS |
| Trailing whitespace | None |
| Final newline | Yes |

## 2. Language of identifiers

The split is not arbitrary — it follows who has to read the thing.

| Thing | Language | Why |
|---|---|---|
| Form field `name` attributes | **Norwegian** | They are spreadsheet column headers Rob reads daily |
| Spreadsheet columns and status values | **Norwegian** | Same |
| Apps Script constants and functions | **Norwegian** | Rob opens this file when something breaks |
| Content-specific CSS classes | Norwegian | `.trust-strip`, `.faq-item`, `.cta-assure` |
| Structural CSS classes | English | `.wrap`, `.field`, `.btn`, `.section` |
| JS function names | Either — match the surroundings | `renderFollowup()`, `tidsromFelt()` |
| JS variable names | Either | `chipsWrap`, `anledningInput` |
| Comments in code | Norwegian | Rob reads them |
| User-facing text | **Always Norwegian** | |
| Commit messages | **Norwegian** | |
| Documentation | Per `CLAUDE.md` | |

Mixed-language identifiers within one line (`anledningInput`) are normal here and
fine. Do not "clean this up".

## 3. HTML

### Structure

```html
<!-- ===================== SECTION NAME ===================== -->
<section id="booking" class="section booking">
  <div class="wrap wrap-narrow">
    …
  </div>
</section>
```

- Section banner comments in that exact format — they are how you navigate a
  557-line file.
- Semantic elements: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`,
  `<footer>`, `<fieldset>`, `<legend>`, `<details>`.
- Self-close void elements with a space: `<img … />`, `<input … />`.
- Attribute order: `type` → `id` → `name` → `class` → `placeholder` →
  `autocomplete` → ARIA → boolean.
- One `<h1>` per page. Never skip heading levels.

### Always

- `lang="no"` on `<html>`
- `alt` on every `<img>` — empty `alt=""` if genuinely decorative
- `width` and `height` on every `<img>` (prevents layout shift)
- `aria-label` on any nav or region whose purpose is not obvious from text
- `rel="noopener"` on every `target="_blank"`

### Never

- Inline `style` attributes (the one exception is the button on `om.html`, which
  should be moved to a class)
- Inline event handlers — with one deliberate exception: the hero image's
  `onerror`, which must run before any script loads
- `<br>` for spacing
- `<div>` where a semantic element exists

## 4. CSS

### Organisation

One file, sections in page order, each with a banner comment:

```css
/* ===================== FORM ===================== */
```

Media queries sit at the **end** of the file, grouped by breakpoint — not
scattered next to each rule. That is the existing convention; keep it.

### Selectors

```css
/* Good */
.faq-item summary { … }
.inc-card:hover { … }
.block-label::before { … }

/* Not used here */
#id-selectors { }
div.class { }
.a .b .c .d { }
```

- Flat class selectors. Max two levels of descent.
- No BEM, no utility classes, no CSS-in-JS.
- **No `!important`.** There are currently zero in the file. Keep it that way —
  if you need one, the selector is wrong.

### Property order within a rule

Loosely: layout → box → typography → colour → effects.

```css
.inc-card {
  display: flex;                 /* layout */
  gap: 20px;
  align-items: flex-start;
  background: var(--card);       /* box */
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 26px;
  transition: transform .2s ease; /* effects */
}
```

### Values

- **Colours, radii, fonts and container widths come from `:root`.** No raw hex
  outside the token block.
- Timings without a leading zero: `.2s`, not `0.2s` — matches existing code.
- `rgba()` for translucency; never `opacity` on a container (it fades children).
- `clamp()` for responsive type. No font-size media queries.

### Browser quirks that have actually bitten us

Only verified ones belong here. Each cost real debugging, and none of them
reproduce in the sandbox's Chromium — that is precisely why they are written
down rather than rediscovered.

- **`input[type="date"]` and `input[type="time"]` need `appearance: none`.**
  iOS Safari ignores `box-sizing: border-box` on these two while they carry
  their default appearance, so padding lands *outside* `width: 100%`. At 390 px
  the date field was 26 px wider than the form card and got clipped at the
  screen edge by `overflow-x: clip` — it read as a rendering bug, not a layout
  slip. `appearance: none` restores normal width maths. Pair it with
  `::-webkit-date-and-time-value { text-align: left; min-height: 1.4em; }`,
  or iOS centres the value and collapses the height while the field is empty.
  The picker still opens on tap; the whole field is the tap target, not the
  icon. *Confirmed on a real iPhone, 2 August 2026.*
- **`overflow-x: clip` on `html`, never `hidden`.** `hidden` breaks
  `position: sticky`, and the header is sticky.
- **`object-position` on the Y axis does nothing** for a landscape image in a
  portrait box under `object-fit: cover` — the image is scaled by height, so
  there is no vertical overflow left to position. Use `transform: translate()`.
- **Grid and flex children need `min-width: 0`** before they will shrink below
  their content's intrinsic width. Two `input[type="time"]` side by side
  overflowed at 360 px until `.field-row > * { min-width: 0 }` was added.

## 5. JavaScript

### Two shapes, and when to use each

**Top-level** — for the form, which needs shared state:

```js
const form = document.getElementById("booking-form");
form.addEventListener("submit", async (e) => { … });
```

**Named IIFE** — for every independent feature:

```js
/* ---------------- Klokkeslett fra–til → Tidsrom ---------------- */
(function tidsromFelt() {
  const fra = document.getElementById("tid-fra");
  const til = document.getElementById("tid-til");
  const tidsrom = document.getElementById("tid");
  if (!fra || !til || !tidsrom) return;   // ← the important line
  …
})();
```

**The guard clause is mandatory.** One script file loads on all five pages;
without it, a missing element throws and kills every feature below it.

### Conventions

- `const` by default, `let` when reassigned, never `var` (except in `Code.gs`).
- Arrow functions for callbacks; named `function` for anything called by name —
  it makes stack traces readable.
- `document.getElementById` for single known elements, `querySelectorAll` for
  sets.
- Feature-detect before using: `if (!("IntersectionObserver" in window)) return;`
- Section comments in the `/* ---------------- Name ---------------- */` format.

### Forbidden

- `innerHTML` with anything derived from user input. `renderFollowup()` uses it
  with values from the hardcoded `FOLLOWUPS` object only. **Keep that boundary.**
- `eval`, `Function()`, `document.write`
- Global variables beyond the few module-level constants at the top
- `console.log` left in committed code (`console.error` in a catch is fine)
- Any external library

## 6. Apps Script (`Code.gs`)

Apps Script is a different environment with different constraints. It has its
own style, and it is deliberate.

```js
// Configuration at the top, in SCREAMING_SNAKE_CASE, Norwegian
var VARSEL_EPOST = "norwayrob@outlook.com";
var KOLONNER = [ … ];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    …
  } catch (err) {
    return svar({ status: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}
```

- **`var`, not `const`/`let`.** The V8 runtime supports both, but the file is
  consistently `var` and Rob may paste it into an older-configured project.
- **Always take a script lock** in `doPost` — concurrent submissions would
  otherwise interleave `appendRow` calls.
- **Always release it in `finally`.**
- **Never let email failure block the write.** `sendVarsel` and `sendAutosvar`
  each wrap everything in `try/catch` and swallow. Data integrity beats
  notification. (The observability cost is noted in `ROADMAP.md`.)
- Configuration constants at the top, in Norwegian, so Rob can find and edit
  them.
- Syntax-check before handing it over:
  ```bash
  cp google-apps-script/Code.gs /tmp/check.js && node --check /tmp/check.js
  ```

### Email HTML in Apps Script

Built as concatenated strings with inline styles. Rules:

- Inline styles only — Gmail and Outlook strip `<style>` blocks.
- Tables for layout, not flexbox or grid.
- HTML entities for Norwegian characters in generated markup (`&Oslash;`,
  `&aring;`) to survive encoding differences between clients.
- Always send both `htmlBody` and a plain-text `body`.
- Always set `name` (sender display name) and `replyTo`.

## 7. Comments

Comment **why**, not **what**.

```js
/* Good — explains a non-obvious constraint */
// no-cors: Apps Script tar imot POST-en, vi viser suksess optimistisk.

/* Bad — restates the code */
// Sett verdien til tom streng
tidsrom.value = "";
```

The file-top comment block in `script.js` and `Code.gs` is instructional — it is
written **for Rob**, in Norwegian, telling him what to change and where. Preserve
that tone.

## 8. Cache-busting

Every reference to a versioned asset:

```html
<link rel="stylesheet" href="styles.css?v=21" />
<script src="script.js?v=9"></script>
```

- Bump `styles.css?v=N` whenever `styles.css` changes.
- Bump `script.js?v=N` whenever `script.js` changes.
- **In all five HTML files.** The two counters are independent.

Verify:

```bash
grep -o 'styles.css?v=[0-9]*' *.html | cut -d: -f2 | sort -u   # one line expected
grep -o 'script.js?v=[0-9]*'  *.html | cut -d: -f2 | sort -u
```

## 9. Formatting tools

There are none. No Prettier, no ESLint, no Stylelint — consistent with the
no-dependency decision. Formatting is maintained by matching surrounding code.

If a formatter is ever added, it must not reformat the whole file in one commit;
the diff would be unreviewable and would destroy the git history that explains
why things are the way they are.
