/* BREAKZ — product page: fills THE CHASE, top 10, market data and details
   from BREAKZ data based on the ?id= query parameter. */

(function () {
  "use strict";
  const fmt = (n) => BREAKZ.formatNOK(n);
  const params = new URLSearchParams(location.search);
  const p = BREAKZ.getProduct(params.get("id"));
  const top = p.chase[0];

  document.title = `${p.name} — The Chase — BREAKZ`;

  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  /* ---------- chase hero ---------- */
  document.getElementById("chase-hero").style.setProperty("--pc-glow", p.glow);
  set("ch-card-name", top.name);
  set("ch-rarity", top.rarity);
  set("ch-odds", top.odds);
  set("ch-set", p.set.split("·")[0].trim() + " · " + p.category);
  set("ch-value", fmt(top.value));

  const hist = p.priceHistory;
  const deltaPct = Math.round(((hist[hist.length - 1] - hist[0]) / hist[0]) * 100);
  set("ch-delta", `▲ ${deltaPct}% · 12 months`);
  const sales = 14 + (p.id.length % 9) * 3;
  set("ch-sales", sales + " sales");
  set("ch-lastsale", "Last sale " + fmt(Math.round(top.value * 0.985)));
  set("ch-emblem", p.emblem);
  set("ch-foot-name", p.category);
  set("ch-foot-rarity", top.rarity.split(" ")[0]);
  document.querySelector("#chase-card-big .lux-card").style.borderColor = "rgba(201,169,97,0.5)";

  /* ---------- top 10 list ---------- */
  set("top10-sub", `The ten most valuable cards waiting inside ${p.name} — ${fmt(p.top10Combined)} combined market value.`);
  document.getElementById("chase-list").innerHTML = p.chase
    .map(
      (c, i) => `
    <div class="chase-row">
      <span class="cr-rank">${String(i + 1).padStart(2, "0")}</span>
      <div class="cr-thumb">${p.emblem}</div>
      <div>
        <div class="cr-name">${c.name}</div>
        <div class="cr-rarity">${c.rarity}</div>
      </div>
      <div class="cr-odds">${c.odds}</div>
      <div class="cr-value">${fmt(c.value)}</div>
    </div>`
    )
    .join("");

  /* ---------- price chart (SVG) ---------- */
  const svg = document.getElementById("price-chart");
  const W = 900, H = 300, PAD = 24;
  const min = Math.min(...hist), max = Math.max(...hist);
  const x = (i) => PAD + (i / (hist.length - 1)) * (W - PAD * 2);
  const y = (v) => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
  const pts = hist.map((v, i) => [x(i), y(v)]);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${line} L${x(hist.length - 1)},${H - 8} L${x(0)},${H - 8} Z`;
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  svg.innerHTML = `
    <defs>
      <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(201,169,97,0.32)" />
        <stop offset="100%" stop-color="rgba(201,169,97,0)" />
      </linearGradient>
      <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8a6f35" />
        <stop offset="55%" stop-color="#c9a961" />
        <stop offset="100%" stop-color="#e8ce8f" />
      </linearGradient>
    </defs>
    ${[0.25, 0.5, 0.75].map((f) => `<line x1="${PAD}" x2="${W - PAD}" y1="${PAD + f * (H - PAD * 2)}" y2="${PAD + f * (H - PAD * 2)}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`).join("")}
    <path d="${area}" fill="url(#areaFill)"/>
    <path d="${line}" fill="none" stroke="url(#lineGold)" stroke-width="2.5" stroke-linecap="round"
      pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"
      style="transition: stroke-dashoffset 2.2s cubic-bezier(0.22,1,0.36,1)"/>
    <circle cx="${x(hist.length - 1)}" cy="${y(hist[hist.length - 1])}" r="5" fill="#e8ce8f">
      <animate attributeName="r" values="4;6;4" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    ${hist.map((v, i) => (i % 2 === 0 ? `<text x="${x(i)}" y="${H - 2}" fill="rgba(244,243,239,0.3)" font-size="11" text-anchor="middle" font-family="Inter, sans-serif">${months[i]}</text>` : "")).join("")}
  `;
  // draw the line once visible
  const lineEl = svg.querySelector("path[pathLength]");
  new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        requestAnimationFrame(() => (lineEl.style.strokeDashoffset = "0"));
        obs.disconnect();
      }
    });
  }, { threshold: 0.4 }).observe(svg);

  set("chart-title", `${top.name} · Price history, 12 months`);
  set("chart-delta", `▲ +${deltaPct}%`);

  /* ---------- population report ---------- */
  const popLabels = { PSA10: "PSA 10", PSA9: "PSA 9", BGS95: "BGS 9.5", CGC10: "CGC 10" };
  document.getElementById("pop-grid").innerHTML =
    `<div class="pop-cell" style="grid-column:1/-1; text-align:left; border:none; background:none; padding:0 0 4px">
       <span class="g">Population report · ${top.name}</span>
     </div>` +
    Object.entries(p.population)
      .map(
        ([g, n], i) => `
      <div class="pop-cell ${i === 0 ? "gold-cell" : ""}">
        <div class="g">${popLabels[g] || g}</div>
        <div class="n">${n.toLocaleString("no-NO")}</div>
      </div>`
      )
      .join("");

  /* ---------- details ---------- */
  set("p-description", p.description);
  document.getElementById("spec-list").innerHTML = p.specs
    .map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`)
    .join("");

  /* ---------- buy bar ---------- */
  set("bb-name", p.name);
  set("bb-price", `${fmt(p.price)} · ${p.set}`);
  document.getElementById("bb-buy").addEventListener("click", () => {
    window.showToast(`<b>${p.name}</b> added to your vault.`);
  });
})();
