# UI_GUIDELINES.md

**How to apply the design system.** `DESIGN_SYSTEM.md` defines the values; this
document defines the judgement — layout, hierarchy, density, and the rules that
keep a one-person site from drifting into inconsistency.

---

## 1. The visual hierarchy of a section

Every content section on this site follows the same four-part structure. Do not
invent a fifth pattern.

```html
<section class="section">
  <div class="wrap">                     <!-- or .wrap wrap-narrow -->
    <p class="section-eyebrow">…</p>     <!-- red, uppercase, 13px, tracked -->
    <h2 class="section-title">…</h2>     <!-- Anton, clamp(34px,5vw,54px) -->
    <p class="section-lead">…</p>        <!-- muted, max 60ch, optional -->
    …content…
  </div>
</section>
```

The eyebrow is the only place red text appears in running content. It exists to
give the eye an entry point on a dark page — without it, a section title floats.

## 2. One primary action per viewport

At any scroll position, exactly one red filled button should be visible. If two
are competing, one of them is wrong.

| Level | Treatment |
|---|---|
| Primary | `.btn .btn-primary` — red fill, white text, red glow |
| Secondary | Text link with red hover underline |
| Tertiary | `--muted` text link |

There are no outline buttons, ghost buttons, or secondary filled buttons. That
is deliberate: with one product and one action, a second button style would only
create ambiguity.

## 3. Density

The page is generous, not dense. Reading a dark page is more tiring than a light
one, so space does structural work here.

| Context | Rule |
|---|---|
| Between sections | 60–90px vertical |
| Inside a card | 26–30px padding desktop, 20–24px mobile |
| Between form fields | 18px |
| Between form blocks | 28px + a `--border` divider |
| Around a heading | Space above ≈ 2× space below |

Never let two cards touch. Never let text touch a container edge.

## 4. Grids

| Pattern | Desktop | Mobile |
|---|---|---|
| Steps ("Slik booker du") | 3 columns | 1 column |
| Included cards | 2 columns | 1 column |
| Footer | `1.7fr 1fr 1fr 1fr` | 2 columns → 1 column at 520px |
| Form field pairs | `1fr 1fr` | 1 column |
| About page | `400px 1fr` | 1 column |
| Trust strip | 3 columns | 3 columns (stays — it is short) |

Collapse to one column at `700px` unless the content is genuinely short.
Two-column layouts at 480px are always wrong.

## 5. Cards

The card is the workhorse. Its anatomy is fixed:

```css
background: var(--card);
border: 1px solid var(--border);
border-radius: var(--radius);
padding: 26px;
transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
```

On hover: lift 4px, border to `--border-2`, add `0 18px 40px rgba(0,0,0,.35)`.

**Hover states only on cards that do something.** A static informational card
that lifts on hover promises an interaction that does not exist. This is
currently violated by `.inc-card` — noted in `ROADMAP.md`.

## 6. Icons

- Inline SVG only. No icon font, no sprite sheet, no external request.
- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="1.8"`, round caps and joins.
- Always `aria-hidden="true"` on the wrapper — icons here are always decorative,
  and the adjacent text carries the meaning.
- Icon wells are circles with a red radial tint:
  ```css
  background: radial-gradient(circle at 30% 30%, rgba(255,59,59,.22), rgba(255,59,59,.08));
  border: 1px solid rgba(255,59,59,.25);
  color: var(--red);
  ```
- Sizes: 56px in content cards, 64px in the guarantee banner, 30px for step
  numerals, 20px for the hint button.

## 7. Images

| Rule | Why |
|---|---|
| Always set `width` and `height` attributes | Prevents layout shift (CLS) |
| Always `object-fit: cover` inside a fixed `aspect-ratio` box | Guarantees the frame regardless of source dimensions |
| Tune framing with `object-position`, never by re-cropping the file | Lets you adjust in one line without touching binaries |
| JPEG, not PNG, for photographs | 10× smaller at equivalent quality |
| Hero gets `fetchpriority="high"` and a `<link rel="preload">` | It is the LCP element |
| Everything below the fold gets `loading="lazy"` | |

Photos always sit on a dark gradient so white text over them stays legible.

## 8. Forms

The form is the product. It gets more care than anything else on the page.

- Grouped in `<fieldset class="form-block">` with a `<legend class="block-label">`.
- Each block is auto-numbered with a CSS counter — no hardcoded "1", "2", "3":
  ```css
  .form { counter-reset: skjema; }
  .block-label::before { counter-increment: skjema; content: counter(skjema); }
  ```
  Add or reorder a block and the numbers just work.
- Fields are 16px minimum — anything smaller triggers iOS zoom-on-focus.
- Required fields are marked with a red `*`; optional fields say `(valgfritt)`.
  Never both, never neither.
- Related short fields pair in `.field-row`; long fields go full width.
- Placeholders show an example, never an instruction.
- Help text sits below the field in `--muted-2`, 12.5px.

## 9. Popovers

Used once, for the headcount hint. If you add another, follow this exactly:

- Absolutely positioned relative to `.field` (which is `position: relative`).
- Opens **above** the trigger (`bottom: calc(100% - 6px)`) so it never covers
  the field being explained.
- `width: min(340px, calc(100vw - 80px))` — never overflows a phone.
- Arrow is a rotated square with two borders, matching the popover background.
- Closes on: click outside, `Escape`, or clicking the trigger again.
- Trigger carries `aria-expanded` and `aria-controls`.

## 10. The sticky mobile CTA

Appears only when the user is between the hero and the form — the window where
they have scrolled past the call to action but not yet reached it.

```
hero CTA visible?      → hide
booking form visible?  → hide
neither?               → show
```

Driven by two `IntersectionObserver`s. Never show it over the form; a floating
button that covers the thing it points at is worse than no button.

## 11. Consistency traps in this codebase

There is no templating. These are duplicated across five HTML files and drift is
the single most common defect:

| Duplicated | Files |
|---|---|
| `<header class="site-header">` | all 5 |
| `<footer class="site-footer">` | all 5 |
| Font `<link>` tags and `<link rel="stylesheet">` | all 5 |
| `styles.css?v=N` cache-buster | all 5 |
| Brand block markup | all 5 (twice per page — header and footer) |

**Change one, change all five.** Verify with:

```bash
grep -c 'styles.css?v=' *.html
grep -o 'styles.css?v=[0-9]*' *.html | sort -u   # should print exactly one version
```

## 12. Before you commit a visual change

```
[ ] Rendered at 375px, 768px, 1440px
[ ] Exactly one primary button visible per viewport
[ ] No new hex codes outside :root
[ ] No new font sizes outside the scale in DESIGN_SYSTEM.md
[ ] Hover states only on interactive things
[ ] prefers-reduced-motion respected for any new animation
[ ] Focus visible on every new interactive element
[ ] Shared components updated in all five HTML files
[ ] Cache-buster bumped
```
