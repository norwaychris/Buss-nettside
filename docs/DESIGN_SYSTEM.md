# DESIGN_SYSTEM.md

**The primitives.** Colour, type, space, radius, shadow, motion — every value
that exists, where it is defined, and when to use it. `UI_GUIDELINES.md` covers
how to apply them; `COMPONENT_GUIDE.md` covers the assembled components.

Everything lives in `styles.css`. There is no preprocessor and no build step.

---

## 1. Where tokens live

`styles.css` lines 2–24, in `:root`. **This is the only place a raw colour,
radius, font family or container width may be defined.** If you find a hex code
elsewhere in the stylesheet, it is either a deliberate one-off with a comment
explaining it, or a bug.

```css
:root {
  --bg:        #0a0a0b;
  --bg-2:      #101012;
  --card:      #141417;
  --card-2:    #17171b;
  --border:    #232327;
  --border-2:  #2c2c32;

  --ink:       #f5f5f6;
  --muted:     #a1a1aa;
  --muted-2:   #7a7a83;

  --red:       #ff3b3b;
  --red-dark:  #e12b2b;
  --red-soft:  rgba(255, 59, 59, 0.12);

  --radius:    16px;
  --radius-sm: 10px;
  --wrap:      1120px;

  --display: "Anton", "Arial Narrow", sans-serif;
  --sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

## 2. Colour

### Surfaces — a four-step depth ladder

| Token | Value | Depth | Used for |
|---|---|---|---|
| `--bg` | `#0a0a0b` | 0 — the page | `body`, hero, most sections |
| `--bg-2` | `#101012` | 1 — lifted | Trust strip, alternating sections |
| `--card` | `#141417` | 2 — floating | Cards, the form, FAQ items |
| `--card-2` | `#17171b` | 3 — nested | Surfaces inside a card |

Never skip a step (don't put `--card-2` directly on `--bg`) and never invent a
fifth. Four levels is enough depth for a page this size; more reads as noise.

### Text — three weights of attention

| Token | Value | Contrast on `--bg` | Used for |
|---|---|---|---|
| `--ink` | `#f5f5f6` | 18.4:1 | All primary text, headings, labels |
| `--muted` | `#a1a1aa` | 8.2:1 | Body copy inside cards, secondary info |
| `--muted-2` | `#7a7a83` | 4.9:1 | Eyebrows, hints, footnotes, timestamps |

All three pass WCAG AA for normal text. `--muted-2` is at the edge — never use
it below 12px, and never for anything the user must read to complete a task.

### Accent

| Token | Value | Used for |
|---|---|---|
| `--red` | `#ff3b3b` | Actions and emphasis only |
| `--red-dark` | `#e12b2b` | Hover on primary button |
| `--red-soft` | `rgba(255,59,59,.12)` | Tinted backgrounds behind red icons and numerals |

> `--red` on `--bg` is roughly **4.6:1** — it passes AA for normal text but is
> not comfortable for long reading. Use it for short strings only. White on
> `--red` (the primary button) is **3.5:1**, which is why button text is always
> ≥16px and bold — large-text AA.

### Borders

| Token | Used for |
|---|---|
| `--border` | Resting state on every card, field and divider |
| `--border-2` | Hover, focus-adjacent, and nested emphasis |

## 3. Typography

Two families, loaded together in a single Google Fonts request on every page:

```html
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

| Family | Weights | Role |
|---|---|---|
| **Anton** (`--display`) | 400 only — it has no other | Logo, all headings, large numerals, step numbers |
| **Inter** (`--sans`) | 400, 500, 600, 700, 800 | Everything else |

### Scale

| Role | Size | Family |
|---|---|---|
| Hero heading | `clamp(52px, 7vw, 96px)` | Anton |
| Section heading | `clamp(34px, 5vw, 54px)` | Anton |
| Subpage heading | `clamp(34px, 6vw, 60px)` | Anton |
| Brand name | 26px | Anton |
| Trust-strip numeral | 26px | Anton |
| Step numeral | 44px | Anton |
| Hero lead | 19px | Inter |
| Body / base | 17px | Inter |
| Prose body | 16.5px | Inter |
| Card body, FAQ answer | 15–16px | Inter |
| Field label | 15px | Inter 600 |
| Hint, note, footnote | 12.5–14px | Inter |
| Eyebrow | 13px, `letter-spacing: 3–4px`, uppercase | Inter 700 |
| Brand sub-label | 11px, `letter-spacing: 2.5px`, uppercase | Inter |

Base line height is `1.6`; prose is `1.7`; Anton headings are `1.02–1.1`
because the face is tall and tight already.

`clamp()` is the only responsive type mechanism used. Do not add font-size
media queries — extend the clamp instead.

## 4. Spacing

There is no numeric spacing scale token. Spacing follows an informal 4px grid
expressed directly in `px`. The recurring values:

| Value | Typical use |
|---|---|
| 4–8px | Inside a label, between an icon and its text |
| 10–16px | Between related elements, gap in a flex row |
| 18–24px | Between fields, card padding on mobile |
| 26–30px | Card padding on desktop |
| 38–44px | Between blocks inside a section |
| 60–90px | Between sections |

> **Known debt.** These should become tokens (`--space-1` … `--space-6`). It is
> not urgent, and converting them wholesale is a large, risky diff for no user-
> visible benefit. Listed in `ROADMAP.md` as low priority. Until then, match the
> value used by the nearest similar element rather than inventing a new one.

### Containers

| Class | Width | Use |
|---|---|---|
| `.wrap` | `max-width: 1120px`, `padding: 0 24px` | Default page container |
| `.wrap-narrow` | `max-width: 760px` | Reading and form content — intro, booking, FAQ, prose |

Prose line length is additionally capped with `max-width: 60ch` on leads and
`36ch` on the footer tagline. Never let body text run wider than ~75 characters.

## 5. Radius

| Token / value | Applied to |
|---|---|
| `--radius` (16px) | Cards, sections, guarantee banner, review-style panels |
| `--radius-sm` (10px) | Buttons, input fields, chips |
| 12px | Hint popovers, small icon tiles |
| 20px | The booking form card |
| 22–24px | Hero photo, about photo, overlay card |
| 999px | Pills, badges, circular icon wells |
| 50% | Icon circles, step-number circles |
| 4px | Focus outline |

Rule of thumb: **the bigger the surface, the bigger the radius.** A 10px radius
on a full-width card looks like a mistake; a 24px radius on a button looks like
a different brand.

## 6. Elevation

Shadows are dark and deep, because the page is near-black — a light shadow is
invisible.

| Purpose | Value |
|---|---|
| Card at rest | none — the border carries the edge |
| Card on hover | `0 18px 40px rgba(0,0,0,.35)` |
| The form | `0 30px 70px rgba(0,0,0,.4)` |
| Photo | `0 34px 70px rgba(0,0,0,.55)` |
| Popover | `0 18px 50px rgba(0,0,0,.55)` |
| Glass box on photo | `0 10px 30px rgba(0,0,0,.4)` |
| **Primary button (red glow)** | `0 8px 24px rgba(255,59,59,.28)` |
| **Primary button, hover** | `0 14px 34px rgba(255,59,59,.4)` |
| Guarantee banner (red glow) | `0 14px 50px rgba(255,59,59,.10), 0 2px 20px rgba(255,59,59,.08)` |

The red glow is a **signal**, not decoration. Only elements the user should act
on get it.

## 7. Motion

| Interaction | Transform | Duration | Easing |
|---|---|---|---|
| Button hover | `translateY(-2px)` | 150 ms | `ease` |
| Button active | `translateY(1px)` | 60 ms | `ease` |
| Card hover | `translateY(-4px)` | 200 ms | `ease` |
| Nav underline | `scaleX(0 → 1)` from left | 200 ms | `ease` |
| Skip link reveal | `top: -60px → 12px` | 150 ms | `ease` |
| Scroll reveal | `translateY(18px)` + fade | 600 ms | `cubic-bezier(.22,.61,.36,1)` |
| Mobile CTA appear | `translateY(12px)` + fade | 250 ms | `ease` |

Scroll-reveal stagger: `(index % 4) * 70ms`, applied in `script.js`.

### The non-negotiable

```css
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

Any new animation must have an equivalent escape hatch. `script.js` also checks
`matchMedia("(prefers-reduced-motion: reduce)")` and skips the reveal observer
entirely — belt and braces, deliberately.

## 8. Breakpoints

Mobile-first is **not** used here; the CSS is desktop-first with `max-width`
queries. That is a legacy choice, kept for consistency.

| Query | Purpose |
|---|---|
| `max-width: 960px` | About-page split collapses |
| `max-width: 860px` | Footer grid collapses; hero assurance list stacks |
| `max-width: 760px` | Form and content padding tighten |
| `max-width: 700px` | Steps and cards go single-column; mobile CTA activates |
| `max-width: 520px` | Footer goes single-column |
| `max-width: 460px` | Brand and nav shrink |

**Test at 375px, 768px and 1440px.** Those three catch nearly everything.

## 9. Focus

One global rule, and it is not to be removed or overridden per-component:

```css
:focus-visible {
  outline: 2px solid var(--red);
  outline-offset: 3px;
  border-radius: 4px;
}
```

`:focus-visible` rather than `:focus` means mouse users never see it and
keyboard users always do. Never write `outline: none` without an equally
visible replacement in the same rule.

## 10. Dark mode

There is no light mode. The site is dark by design, `color-scheme` is forced
dark on date and time inputs so native pickers match:

```css
input[type="date"], input[type="time"] { color-scheme: dark; }
```

`<meta name="theme-color" content="#0a0a0b">` is set on every page so mobile
browser chrome matches the page.

## 11. Adding to the system

Before adding a token or a value:

1. **Does an existing token work?** Use it. Near-duplicates are how design
   systems die.
2. **Is it used in more than one place?** If yes, it is a token. If no, it is a
   local value and belongs in the component's own rule.
3. **Does it fit the depth ladder / type scale / radius logic?** If it does not,
   the component is probably wrong, not the system.
4. **Update this file in the same commit.**
