# BREAKZ

The world's most premium trading card shopping experience — matte black, graphite,
glass and gold. Every product is sold on the excitement of its legendary chase cards.

## Pages

- `index.html` — Homepage, built from **two independent sections**:
  - **Section 1 — Japan Mystery Crates launch promo.** Fully self-contained and
    marked with `<!-- PROMO START -->` / `<!-- PROMO END -->` comments. Delete
    everything between the markers to remove the campaign; the permanent homepage
    below is untouched and complete on its own.
  - **Section 2 — Permanent homepage.** Hero, live pulls ticker, product collection
    with chase-card previews, mystery crates, category vaults, Japan story teaser,
    newsletter and footer.
- `product.html?id=<product-id>` — Product page. Opens with **THE CHASE** (top chase
  card, market value, sales), then the Top 10 chase list, 12-month price history,
  population report — and only after that description, specifications, shipping
  and reviews.
- `japan.html` — The Japan Story: a documentary-style timeline of the sourcing trip.

## Structure

```
index.html            Homepage (promo section + permanent homepage)
product.html          Product page template (driven by ?id=)
japan.html            Japan story timeline
assets/css/main.css   Full design system
assets/js/data.js     Products, chase cards, values, price history
assets/js/main.js     Shared interactions (nav, reveals, countdown, tilt, toast)
assets/js/home.js     Homepage rendering (ticker, product grid, mystery crates)
assets/js/product.js  Product page rendering (chase hero, top 10, chart)
```

No build step — static HTML/CSS/JS, deployable directly to GitHub Pages.
Products are added or edited in `assets/js/data.js`.
