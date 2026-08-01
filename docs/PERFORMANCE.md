# PERFORMANCE.md

**Why the site is fast, and the rules for keeping it that way.**

Performance is not a technical vanity metric here. Most traffic arrives from
TikTok — from an app with instant response — on mobile, often on cellular. A
slow page reads as "this business is not serious", and it is judged in the first
second.

---

## 1. Current state

| Asset | Size | Notes |
|---|---|---|
| `index.html` | 32 KB | Includes three JSON-LD blocks and all FAQ copy |
| `styles.css` | 28 KB | Entire site |
| `script.js` | 10 KB | Entire site |
| `images/hero.jpg` | 196 KB | Was 2 MB as PNG |
| `images/rob.jpg` | 264 KB | Was 2.2 MB as PNG |
| `favicon.svg` | 499 B | |
| Google Fonts | ~45 KB | Anton + Inter (5 weights) |
| **Total, front page** | **~310 KB** | |

**Third-party requests: 2** — both to Google Fonts. No analytics script, no tag
manager, no CDN library, no tracking pixel, no chat widget, no A/B testing tool.

That number is the most valuable performance property this site has. Protect it.

## 2. Budgets

Treat these as hard limits. Exceeding one requires a deliberate decision
recorded in `ARCHITECTURE.md`.

| Metric | Budget |
|---|---|
| Total front-page weight | **< 500 KB** |
| Any single image | **< 300 KB** |
| `styles.css` | < 50 KB |
| `script.js` | < 25 KB |
| Third-party requests | **≤ 2** (the fonts) |
| JS dependencies | **0** |
| Largest Contentful Paint | < 2.5 s on 4G |
| Cumulative Layout Shift | **< 0.1** |
| Interaction to Next Paint | < 200 ms |

## 3. Images

Images are the only asset class large enough to matter, so they get the strictest
rules.

### Format

**JPEG for photographs. Always.** PNG is for graphics with flat colour and sharp
edges — a photograph in PNG is roughly ten times larger for no visible gain. The
two site photos were converted from PNG (2 MB and 2.2 MB) to JPEG (196 KB and
264 KB): a 90 % reduction with no perceptible quality loss.

```python
from PIL import Image
im = Image.open("source.png").convert("RGB")
im.save("output.jpg", "JPEG", quality=82, optimize=True, progressive=True)
```

`quality=82` is the sweet spot. Below 75 artefacts become visible on skin tones;
above 88 the file grows without visible benefit.

### Markup

```html
<img src="images/hero.jpg"
     width="1537" height="1023"
     fetchpriority="high" decoding="async"
     alt="Rob fra NorwayRob foran bussen med fjorden i bakgrunnen" />
```

| Attribute | Why |
|---|---|
| `width` + `height` | **Mandatory.** The browser reserves space before the image loads. Omitting them is the number-one cause of layout shift. |
| `fetchpriority="high"` | Hero only — it is the LCP element |
| `decoding="async"` | Does not block the main thread |
| `loading="lazy"` | Everything below the fold. **Never on the hero** — it would delay LCP. |

Plus, in `<head>`:

```html
<link rel="preload" as="image" href="images/hero.jpg" fetchpriority="high" />
```

### Framing

Crop with CSS, not by re-encoding:

```css
.about-photo { aspect-ratio: 4 / 5; }
.about-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center 22%; }
```

The about photo went through five rounds of framing adjustment. Because framing
is CSS, each round was a one-line change rather than a new binary in git history.

### Before adding any image

```
[ ] JPEG if it is a photograph
[ ] Under 300 KB
[ ] width and height attributes set
[ ] loading="lazy" unless it is the hero
[ ] Meaningful alt text
[ ] Dimensions no larger than the largest rendered size × 2
```

## 4. Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

- **One request** for both families. Never split them into two `<link>` tags.
- `display=swap` — text renders immediately in the fallback, then swaps. A flash
  of unstyled text is better than invisible text.
- `preconnect` to both hosts saves the DNS + TLS round trip.
- Fallbacks are metric-adjacent: `"Arial Narrow"` for Anton,
  `system-ui, -apple-system, "Segoe UI", Roboto` for Inter.

### Do not add font weights casually

Inter loads five weights (400, 500, 600, 700, 800). Each additional weight is
another download. Before adding one, check whether an existing weight works.

### Considered and rejected: self-hosting

Self-hosting would remove the two third-party requests and the privacy question,
and could cut the payload with a subset. It also means committing binaries,
maintaining `@font-face` declarations, and losing Google's caching and format
negotiation. **Revisit if the fonts ever measurably delay LCP.** Not now.

## 5. CSS and JS delivery

Both are single files, unminified, loaded with cache-busting query strings:

```html
<link rel="stylesheet" href="styles.css?v=21" />
<script src="script.js?v=9"></script>
```

- CSS in `<head>` — render-blocking by necessity, but it is 28 KB.
- **JS at the end of `<body>`**, no `defer` needed because nothing above it
  depends on the script.
- Unminified deliberately: the files are small, gzip does most of the work
  anyway, and readable source is worth more here than the last few kilobytes.

### Caching

GitHub Pages sets a long cache lifetime on static assets. The `?v=N` query
string is what forces a refresh. **If you change the file and forget to bump the
version, returning visitors keep the old one.** This has already caused a "siden
ser helt merkelig ut" incident — new HTML with an old stylesheet.

Verify:

```bash
grep -o 'styles.css?v=[0-9]*' *.html | cut -d: -f2 | sort -u   # one line
```

## 6. Rendering performance

| Technique | Where |
|---|---|
| `transform` and `opacity` only for animation | Everywhere — they are compositor-only, no layout or paint |
| `IntersectionObserver` instead of scroll listeners | Scroll reveal, mobile CTA |
| `io.unobserve()` after an element reveals | Each element is observed exactly once |
| `backdrop-filter` used sparingly | Three places only — it is GPU-expensive |
| No layout-thrashing loops | No read-then-write cycles in any handler |

**Never animate** `width`, `height`, `top`, `left`, `margin`, `padding` or
`box-shadow` size. They trigger layout on every frame.

## 7. Cumulative Layout Shift

CLS is the metric most easily broken by a careless change, and the hardest to
notice locally on a fast connection.

Sources of shift, and how each is prevented here:

| Source | Prevention |
|---|---|
| Images without dimensions | `width`/`height` on every `<img>` |
| Web fonts swapping | `display=swap` + metric-adjacent fallbacks |
| Content injected above the fold | Follow-up fields render *below* the chips, never above |
| The sticky mobile CTA | `position: fixed` — outside normal flow, shifts nothing |
| The success overlay | `position: fixed`, `hidden` until needed |
| Scroll-reveal | Uses `transform`, which does not affect layout |

**Test CLS on a throttled connection.** On a fast local server everything loads
before it can shift, which hides the problem entirely.

## 8. Monitoring

There is no automated monitoring. Manual checks, quarterly and after any large
change:

1. **PageSpeed Insights** — `https://pagespeed.web.dev/` against the live URL.
   Check mobile, not desktop; mobile is the real audience.
2. **Search Console → Core Web Vitals** — real-user field data once traffic
   accumulates. More trustworthy than lab scores.
3. **Local check:**
   ```bash
   du -sh images/* styles.css script.js index.html
   ```

## 9. What must never be added without a decision

| | Why |
|---|---|
| jQuery or any JS library | Nothing here needs one |
| A CSS framework | The design system is 24 tokens |
| Google Analytics / Tag Manager | Decided against — cookieless first-party instead |
| Chat widget | Heavy, third-party, and off-brand |
| Carousel or slider library | Not needed, and hostile on mobile |
| Video hosted on-site | Use an embed with a poster image — a self-hosted video would blow the entire budget |
| Web font beyond Anton and Inter | Two families is the design |
| Any CDN script | Zero third-party JS is the property worth protecting most |

## 10. Known opportunities

Real, but not urgent — the site is already fast.

| Opportunity | Gain | Cost |
|---|---|---|
| Serve WebP/AVIF with a `<picture>` fallback | ~30 % on images | Extra markup, two files per image |
| Self-host a subset of Anton | Removes one third-party request | Binary in repo, manual `@font-face` |
| Minify CSS/JS on deploy | ~30 % pre-gzip | Requires a build step — conflicts with `ARCHITECTURE.md` §2 |
| Inline critical CSS | Faster first paint | Hard to maintain by hand |
| Responsive `srcset` for the hero | Less data on small screens | Multiple exports per image |

**Recommendation: do none of these yet.** Every one trades simplicity for a
gain the site does not currently need. Revisit when field data in Search Console
shows a real problem.
