/* BREAKZ — homepage rendering: pulls ticker, product grid, mystery crates */

(function () {
  "use strict";
  const fmt = (n) => BREAKZ.formatNOK(n);

  /* ---------- recent pulls ticker (duplicated for seamless loop) ---------- */
  const ticker = document.getElementById("pulls-ticker");
  if (ticker) {
    const items = BREAKZ.recentPulls
      .map(
        (p) => `<span class="tick-item">Pulled — <b>${p.card}</b> · ${p.product} <span class="v">${fmt(p.value)}</span></span>`
      )
      .join("");
    ticker.innerHTML = `<div class="ticker-track">${items}${items}</div>`;
  }

  /* ---------- product grid ---------- */
  const grid = document.getElementById("products-grid");
  if (grid) {
    grid.innerHTML = BREAKZ.products
      .map((p, i) => {
        const top3 = p.chase
          .slice(0, 3)
          .map(
            (c) => `
          <div class="chase-mini">
            <div class="cm-thumb">${p.emblem}</div>
            <div class="cm-info">
              <div class="cm-name">${c.name}</div>
              <div class="cm-rarity">${c.rarity}</div>
            </div>
            <div class="cm-value">${fmt(c.value)}</div>
          </div>`
          )
          .join("");
        return `
        <article class="product-card reveal" style="--pc-glow:${p.glow}; --float-d:${(i % 3) * -2.6}s; --d:${(i % 3) * 0.12}s">
          <a href="product.html?id=${p.id}" class="pc-visual" aria-label="${p.name}">
            <span class="pc-category">${p.category}</span>
            ${p.limited ? '<span class="pc-limited">Limited</span>' : ""}
            <div class="mini-box" style="--mb-accent:${p.accent}">
              <div class="mb-face">
                <span class="mb-emblem">${p.emblem}</span>
                <span class="mb-line"></span>
                <span class="mb-name">${p.name}</span>
              </div>
            </div>
          </a>
          <div class="pc-body">
            <h3 class="pc-name">${p.name}</h3>
            <p class="pc-set">${p.set}</p>
            <div class="pc-pull">
              <div class="pc-pull-label">🔥 Top Pull</div>
              <div class="pc-pull-value">${fmt(p.topPull.value)}</div>
              <div class="pc-pull-card">${p.topPull.card}</div>
            </div>
            <div class="pc-top10">
              <span class="t">Top 10 Chase Cards</span>
              <span class="v">${fmt(p.top10Combined)} <em>combined</em></span>
            </div>
            <div class="pc-chase-preview" aria-hidden="true">
              <div class="pc-chase-inner">${top3}</div>
            </div>
            <div class="pc-footer">
              <div class="pc-price">${fmt(p.price)}<span>Sealed product</span></div>
              <a class="link-arrow" href="product.html?id=${p.id}">View Chase Cards <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </article>`;
      })
      .join("");

    // First tap opens the chase preview on touch devices; second tap follows the link.
    if (!window.matchMedia("(pointer: fine)").matches) {
      grid.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (!card.classList.contains("touch-open")) {
            e.preventDefault();
            grid.querySelectorAll(".touch-open").forEach((c) => c.classList.remove("touch-open"));
            card.classList.add("touch-open");
          }
        });
      });
    }
    window.observeReveals(grid);
  }

  /* ---------- mystery crates ---------- */
  const mgrid = document.getElementById("mystery-grid");
  if (mgrid) {
    mgrid.innerHTML = BREAKZ.mystery
      .map(
        (m, i) => `
      <article class="mystery-card reveal" style="--d:${i * 0.14}s">
        <span class="mc-no">${m.no}</span>
        <h3>${m.name}</h3>
        <p class="mc-desc">${m.desc}</p>
        <div class="mc-hits">
          Top possible hit
          <div class="mc-hit-value">${fmt(m.maxHit)}</div>
        </div>
        <p class="mc-desc" style="margin-top:14px; font-size:12.5px">${m.hits}</p>
        <div class="mc-foot">
          <span class="mc-price">${fmt(m.price)}</span>
          <button class="btn btn-ghost btn-sm" data-toast="<b>${m.name}</b> reserved — we'll be in touch.">Reserve</button>
        </div>
      </article>`
      )
      .join("");
    window.observeReveals(mgrid);
  }
})();
