/* ============================================================
   NorwayRob – buss til leie
   ------------------------------------------------------------
   Skjemaet sender forespørsler til et Google Sheets-regneark.

   >>> SETT INN LENKEN DIN HER <<<
   Lim inn Web App-URL-en fra Google Apps Script mellom
   anførselstegnene under. Se SETUP.md for oppskrift.
   La den stå tom ("") før du er ferdig – da åpnes e-post i
   stedet, så skjemaet virker uansett.
   ============================================================ */
const BOOKING_ENDPOINT = "https://script.google.com/macros/s/AKfycbxqT2-OqxBV3QsVx_GSZVjzryRtSge7kChRdyXpbvvIaEZ_-7ZZC3A2AWwjVVOwpGpCsQ/exec";

/* E-post som brukes hvis endpoint ikke er satt ennå */
const FALLBACK_EMAIL = "norwayrob@outlook.com";

/* Oppfølgingsspørsmål som dukker opp pr. anledning.
   Legg til/endre fritt – "name" blir kolonneoverskrift i regnearket. */
const FOLLOWUPS = {
  "Utdrikningslag": [
    { name: "Hvem feires", label: "Hvem feires? (brudens/brudgommens navn)", placeholder: "F.eks. Kari (bruden)" },
    { name: "Overraskelse", label: "Skal vi overraske hovedpersonen?", optional: true, placeholder: "F.eks. ja, hun vet ingenting!" },
  ],
  "Fadderuke": [
    { name: "Linjeforening", label: "Hvilken linjeforening / studiested?", placeholder: "F.eks. HVL – ingeniør" },
    { name: "Fadderbarn", label: "Ca. antall fadderbarn?", optional: true, placeholder: "F.eks. 25" },
  ],
  "Blåtur": [
    { name: "Hvem planlegger", label: "Hvem planlegger (og hvem vet ingenting)?", placeholder: "F.eks. vennegjengen overrasker Per" },
    { name: "Overraskelsesnivå", label: "Skal ruta være hemmelig?", optional: true, placeholder: "F.eks. ja, helt hemmelig" },
  ],
  "Firma / julebord": [
    { name: "Firmanavn", label: "Firmanavn", placeholder: "F.eks. Bergen Bygg AS" },
    { name: "Faktura org.nr", label: "Org.nr for faktura", optional: true, placeholder: "F.eks. 999 888 777" },
  ],
  "Bursdag": [
    { name: "Hvem feires", label: "Hvem fyller år – og hvor mange?", placeholder: "F.eks. Jonas, 30 år" },
  ],
  "Event": [
    { name: "Type event", label: "Hva slags event?", placeholder: "F.eks. konsert, kickoff, bryllup" },
  ],
  "Annet": [
    { name: "Om anledningen", label: "Fortell kort hva det gjelder", placeholder: "F.eks. klassetur" },
  ],
};

/* ---------------- Anledning-chips ---------------- */
const chipsWrap = document.getElementById("occasion-chips");
const anledningInput = document.getElementById("anledning");
const followupWrap = document.getElementById("occasion-followup");

chipsWrap.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const value = chip.dataset.value;

  chipsWrap.querySelectorAll(".chip").forEach((c) => {
    const active = c === chip;
    c.classList.toggle("active", active);
    c.setAttribute("aria-checked", active ? "true" : "false");
  });

  anledningInput.value = value;
  renderFollowup(value);
});

function renderFollowup(value) {
  const fields = FOLLOWUPS[value];
  if (!fields || !fields.length) {
    followupWrap.hidden = true;
    followupWrap.innerHTML = "";
    return;
  }

  let html = `<p class="followup-title">Litt mer om <span>${value}</span></p>`;
  fields.forEach((f, i) => {
    const id = `fu-${i}`;
    const opt = f.optional ? ` <span class="opt">(valgfritt)</span>` : "";
    html += `
      <div class="field">
        <label for="${id}">${f.label}${opt}</label>
        <input type="text" id="${id}" name="${f.name}" placeholder="${f.placeholder || ""}" />
      </div>`;
  });
  followupWrap.innerHTML = html;
  followupWrap.hidden = false;
}

/* ---------------- Innsending ---------------- */
const form = document.getElementById("booking-form");
const submitBtn = document.getElementById("submit-btn");
/* Husk knappeteksten slik den står i HTML, så den kan settes tilbake etter sending */
const SUBMIT_TEKST = submitBtn.textContent;
const formError = document.getElementById("form-error");
const overlay = document.getElementById("success-overlay");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  if (!anledningInput.value) {
    showError("Velg en anledning før du sender.");
    return;
  }
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = collectData();

  submitBtn.disabled = true;
  submitBtn.textContent = "Sender…";

  try {
    if (BOOKING_ENDPOINT) {
      await sendToSheet(data);
    } else {
      openMailto(data);
    }
    form.reset();
    resetChips();
    overlay.hidden = false;
  } catch (err) {
    console.error(err);
    showError("Noe gikk galt. Prøv igjen, eller send oss en e-post til " + FALLBACK_EMAIL + ".");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_TEKST;
  }
});

function collectData() {
  const data = {};
  form.querySelectorAll("input, textarea, select").forEach((el) => {
    if (!el.name) return;
    data[el.name] = (el.value || "").trim();
  });
  return data;
}

async function sendToSheet(data) {
  // no-cors: Apps Script tar imot POST-en, vi viser suksess optimistisk.
  await fetch(BOOKING_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(data).toString(),
  });
}

function openMailto(data) {
  const lines = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);
  const subject = `Ny forespørsel – ${data["Anledning"] || "buss"} (${data["Navn"] || ""})`;
  const body = "Ny bussforespørsel fra nettsiden:\n\n" + lines.join("\n");
  window.location.href =
    `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function resetChips() {
  chipsWrap.querySelectorAll(".chip").forEach((c) => {
    c.classList.remove("active");
    c.setAttribute("aria-checked", "false");
  });
  anledningInput.value = "";
  followupWrap.hidden = true;
  followupWrap.innerHTML = "";
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------------- Success overlay ---------------- */
document.getElementById("success-close").addEventListener("click", () => {
  overlay.hidden = true;
});
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) overlay.hidden = true;
});

/* ---------------- Hint-knapp for antall ---------------- */
(function antallHint() {
  const btn = document.getElementById("antall-hint-btn");
  const hint = document.getElementById("antall-hint");
  if (!btn || !hint) return;
  function sett(open) {
    hint.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  }
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    sett(hint.hidden);
  });
  document.addEventListener("click", (e) => {
    if (!hint.hidden && !hint.contains(e.target)) sett(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !hint.hidden) sett(false);
  });
})();

/* ---------------- Klokkeslett fra–til → Tidsrom ---------------- */
(function tidsromFelt() {
  const fra = document.getElementById("tid-fra");
  const til = document.getElementById("tid-til");
  const tidsrom = document.getElementById("tid");
  if (!fra || !til || !tidsrom) return;
  function oppdater() {
    if (fra.value && til.value) tidsrom.value = "kl. " + fra.value + "–" + til.value;
    else if (fra.value) tidsrom.value = "fra kl. " + fra.value + " (sluttid ikke oppgitt)";
    else tidsrom.value = "";
  }
  fra.addEventListener("change", oppdater);
  til.addEventListener("change", oppdater);
})();

/* ---------------- Sett minimum-dato til i dag ---------------- */
(function setMinDates() {
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach((d) => (d.min = today));
})();

/* ---------------- Scroll-reveal ---------------- */
(function scrollReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll(
    ".section-eyebrow, .section-title, .section-lead, .step-card, .inc-card, .guarantee, .faq-item, .trust-strip li, .about-split"
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  targets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });
})();

/* ---------------- Flytende mobil-CTA ---------------- */
(function mobileCta() {
  const bar = document.getElementById("mobile-cta");
  const heroCta = document.querySelector(".hero .btn-primary");
  const booking = document.getElementById("booking");
  if (!bar || !heroCta || !booking || !("IntersectionObserver" in window)) return;
  bar.hidden = false;
  let heroVisible = true;
  let bookingVisible = false;
  const update = () => bar.classList.toggle("show", !heroVisible && !bookingVisible);
  new IntersectionObserver((es) => {
    es.forEach((e) => (heroVisible = e.isIntersecting));
    update();
  }).observe(heroCta);
  new IntersectionObserver(
    (es) => {
      es.forEach((e) => (bookingVisible = e.isIntersecting));
      update();
    },
    { threshold: 0.05 }
  ).observe(booking);
})();
