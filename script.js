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

/* ---------------- Cookiefri måling ----------------

   Vi lagrer og leser INGENTING på brukerens enhet, og registrerer ingen
   IP-adresse, nettleser-signatur eller identifikator. Derfor kreves verken
   samtykke eller informasjonskapsel-banner etter ekomloven § 2-7b.

   Fire hendelser blir til en trakt: hvor mange kom, hvor mange begynte på
   skjemaet, hvor mange kom seg gjennom, hvor mange sendte inn.

   Målingen skal aldri kunne ødelegge noe. Alt ligger i try/catch, og
   sendingen er «fire and forget» – den bremser ikke siden.               */

const MAALING_PAA = true;

/* Kun sti sendes videre, aldri søkestrengen – den kan inneholde hva som helst. */
function maalKilde() {
  try {
    const utm = (new URLSearchParams(location.search).get("utm_source") || "")
      .toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);
    if (utm) return utm;
    if (!document.referrer) return "direkte";

    const vert = new URL(document.referrer).hostname.replace(/^www\./, "");
    if (vert === location.hostname) return "intern";
    if (/tiktok/.test(vert)) return "tiktok";
    if (/instagram/.test(vert)) return "instagram";
    if (/google/.test(vert)) return "google";
    if (/facebook|^fb\./.test(vert)) return "facebook";
    if (/snapchat/.test(vert)) return "snapchat";
    if (/bing|duckduckgo|yahoo|kvasir/.test(vert)) return "annet søk";
    return vert.slice(0, 32);
  } catch (e) {
    return "ukjent";
  }
}

let _kilde = null;

function maal(hendelse) {
  if (!MAALING_PAA || !BOOKING_ENDPOINT) return;
  try {
    if (_kilde === null) _kilde = maalKilde();
    const felt = new URLSearchParams({
      type: "hendelse",
      hendelse: hendelse,
      side: location.pathname,
      kilde: _kilde,
      enhet: window.innerWidth <= 700 ? "mobil" : "desktop",
    }).toString();

    if (navigator.sendBeacon) {
      const pakke = new Blob([felt], { type: "application/x-www-form-urlencoded" });
      if (navigator.sendBeacon(BOOKING_ENDPOINT, pakke)) return;
    }
    fetch(BOOKING_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: felt,
    }).catch(() => {});
  } catch (e) {
    /* måling skal aldri stå i veien for noe */
  }
}

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
  maal("anledning_valgt");
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

  // Bygg tidsrommet på nytt her. Stoler vi bare på change-hendelsen, kan
  // feltet være tomt eller utdatert hvis den aldri fyrte.
  oppdaterTidsrom();

  const data = collectData();
  const ref = lagRef();
  data["Ref"] = ref;

  submitBtn.disabled = true;
  submitBtn.textContent = "Sender…";
  meldStatus("Sender forespørselen …");

  try {
    if (!BOOKING_ENDPOINT) {
      openMailto(data);
      return;
    }

    await sendToSheet(data);

    // Kom den fram? Vi antar ikke – vi spør.
    if (await sjekkMottatt(ref, 6000)) {
      glemUbekreftet(ref);
      maal("innsendt");
      meldStatus("Forespørselen er sendt. Du hører fra oss innen 24 timer.");
      form.reset();
      resetChips();
      apneOverlay();
    } else {
      huskUbekreftet(ref, data);
      visIkkeBekreftet(data);
    }
  } catch (err) {
    console.error(err);
    huskUbekreftet(ref, data);
    visIkkeBekreftet(data);
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

/* ---------------- Bekreftet levering ----------------

   Nettleseren kan ikke lese svaret på POST-en («no-cors»), så vi kan ikke vite
   om innsendingen kom fram bare ved å sende den. Derfor:

     1. Hver innsending får en unik referanse som sendes med.
     2. Etterpå spør vi endepunktet om referansen finnes — via en <script>-tag,
        som ikke er underlagt CORS, så det svaret KAN vi lese.
     3. Får vi ikke bekreftelse, later vi ikke som. Da tilbyr vi e-post i
        stedet, og prøver stille på nytt neste gang kunden er innom.

   Referansen gjør også at det er trygt å prøve på nytt: Apps Script legger
   aldri inn samme referanse to ganger.                                       */

function lagRef() {
  return "nr-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

async function sendToSheet(data) {
  await fetch(BOOKING_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(data).toString(),
  });
}

/* Spør: «kom denne referansen fram?» Svarer alltid – false ved tidsavbrudd.
   Vi gjetter aldri «ja». */
function sjekkMottatt(ref, timeoutMs) {
  return new Promise((resolve) => {
    if (!BOOKING_ENDPOINT || !ref) return resolve(false);

    const navn = "nrSvar" + Math.random().toString(36).slice(2, 10);
    const el = document.createElement("script");
    let ferdig = false;

    const avslutt = (svar) => {
      if (ferdig) return;
      ferdig = true;
      clearTimeout(timer);
      try { delete window[navn]; } catch (e) { window[navn] = undefined; }
      if (el.parentNode) el.parentNode.removeChild(el);
      resolve(svar);
    };

    const timer = setTimeout(() => avslutt(false), timeoutMs || 6000);
    window[navn] = (res) => avslutt(!!(res && res.funnet));
    el.onerror = () => avslutt(false);
    el.src = BOOKING_ENDPOINT + "?sjekk=" + encodeURIComponent(ref) + "&callback=" + navn;
    document.head.appendChild(el);
  });
}

/* Ubekreftede innsendinger huskes lokalt og prøves på nytt senere. */
const UBEKREFTET_NOKKEL = "norwayrob_ubekreftet";
const UBEKREFTET_MAKS_ALDER = 7 * 24 * 60 * 60 * 1000;

function lesUbekreftet() {
  try {
    const liste = JSON.parse(localStorage.getItem(UBEKREFTET_NOKKEL) || "[]");
    if (!Array.isArray(liste)) return [];
    const grense = Date.now() - UBEKREFTET_MAKS_ALDER;
    return liste.filter((x) => x && x.ref && x.data && x.tid > grense);
  } catch (e) {
    return [];
  }
}

function skrivUbekreftet(liste) {
  try {
    localStorage.setItem(UBEKREFTET_NOKKEL, JSON.stringify(liste.slice(-5)));
  } catch (e) {
    /* privat modus eller full lagring – da mister vi bare sikkerhetsnettet */
  }
}

function huskUbekreftet(ref, data) {
  skrivUbekreftet(lesUbekreftet().concat([{ ref, data, tid: Date.now() }]));
}

function glemUbekreftet(ref) {
  skrivUbekreftet(lesUbekreftet().filter((x) => x.ref !== ref));
}

/* Ærlig melding når vi ikke fikk bekreftelse – med ferdig utfylt e-post,
   så forespørselen når fram likevel. Skjemaet nullstilles ikke. */
function visIkkeBekreftet(data) {
  meldStatus("Vi fikk ikke bekreftet at forespørselen kom fram.");
  formError.textContent =
    "Vi fikk ikke bekreftet at forespørselen kom fram. Send den på e-post i stedet — alt du fylte ut ligger klart: ";
  const lenke = document.createElement("a");
  lenke.href = mailtoLenke(data);
  lenke.textContent = "åpne e-post";
  lenke.style.textDecoration = "underline";
  formError.appendChild(lenke);
  formError.hidden = false;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

function mailtoLenke(data) {
  const lines = Object.entries(data)
    .filter(([k, v]) => v && k !== "Ref")
    .map(([k, v]) => `${k}: ${v}`);
  const subject = `Ny forespørsel – ${data["Anledning"] || "buss"} (${data["Navn"] || ""})`;
  const body = "Ny bussforespørsel fra nettsiden:\n\n" + lines.join("\n");
  return `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function openMailto(data) {
  window.location.href = mailtoLenke(data);
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

/* Sendetilstanden endrer seg visuelt i knappeteksten, men det leses ikke opp
   av seg selv. Denne regionen annonserer den for skjermlesere. */
function meldStatus(tekst) {
  const el = document.getElementById("form-status");
  if (el) el.textContent = tekst;
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------------- Success overlay ----------------
   Markupen lover aria-modal="true", altså at alt bak dialogen er utilgjengelig.
   Uten fokusstyring var det en tom lovnad: fokus ble stående på siden bak, Tab
   vandret rett ut, og Escape gjorde ingenting. For en som bruker tastatur eller
   skjermleser betydde det at innsendingen endte i ingenting.                  */
const lukkKnapp = document.getElementById("success-close");
let fokusFoerOverlay = null;

function fokuserbare() {
  return overlay.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
}

function overlayTaster(e) {
  if (e.key === "Escape") { lukkOverlay(); return; }
  if (e.key !== "Tab") return;
  const f = fokuserbare();
  if (!f.length) return;
  const forste = f[0], siste = f[f.length - 1];
  if (e.shiftKey && document.activeElement === forste) { e.preventDefault(); siste.focus(); }
  else if (!e.shiftKey && document.activeElement === siste) { e.preventDefault(); forste.focus(); }
}

function apneOverlay() {
  fokusFoerOverlay = document.activeElement;
  overlay.hidden = false;
  lukkKnapp.focus();
  document.addEventListener("keydown", overlayTaster);
}

function lukkOverlay() {
  overlay.hidden = true;
  document.removeEventListener("keydown", overlayTaster);
  if (fokusFoerOverlay && fokusFoerOverlay.focus) fokusFoerOverlay.focus();
}

lukkKnapp.addEventListener("click", lukkOverlay);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) lukkOverlay();
});

/* ---------------- Anledning: tastaturnavigasjon ----------------
   Chipsene er merket role="radiogroup"/role="radio". Det lover piltast-
   navigasjon og ÉN tabulator-stopp for hele gruppen. Uten det var løftet
   verre enn ingen ARIA: en skjermleserbruker fikk beskjed om at dette var en
   radiogruppe, og oppdaget at den ikke oppførte seg som en.                  */
(function chipsTastatur() {
  const chips = () => Array.from(chipsWrap.querySelectorAll(".chip"));

  function settTabstopp(aktiv) {
    chips().forEach((c) => c.setAttribute("tabindex", c === aktiv ? "0" : "-1"));
  }
  settTabstopp(chips()[0]);

  chipsWrap.addEventListener("keydown", (e) => {
    const liste = chips();
    const naa = liste.indexOf(document.activeElement);
    if (naa === -1) return;

    let ny = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") ny = (naa + 1) % liste.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") ny = (naa - 1 + liste.length) % liste.length;
    else if (e.key === "Home") ny = 0;
    else if (e.key === "End") ny = liste.length - 1;
    else return;

    e.preventDefault();
    liste[ny].focus();
    liste[ny].click();          // i en radiogruppe velger piltasten, den flytter ikke bare fokus
  });

  chipsWrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) settTabstopp(chip);
  });
})();

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

/* ---------------- Klokkeslett fra–til → Tidsrom ----------------
   Merk: sluttid FØR starttid er helt normalt her – en tur 19:00–01:00 går
   over midnatt. Vi validerer derfor ikke rekkefølgen, bare at feltet aldri
   blir tomt.                                                              */
function oppdaterTidsrom() {
  const fra = document.getElementById("tid-fra");
  const til = document.getElementById("tid-til");
  const tidsrom = document.getElementById("tid");
  if (!fra || !til || !tidsrom) return;
  if (fra.value && til.value) tidsrom.value = "kl. " + fra.value + "–" + til.value;
  else if (fra.value) tidsrom.value = "fra kl. " + fra.value + " (sluttid ikke oppgitt)";
  else tidsrom.value = "";
}

(function tidsromFelt() {
  const fra = document.getElementById("tid-fra");
  const til = document.getElementById("tid-til");
  if (!fra || !til) return;
  fra.addEventListener("change", oppdaterTidsrom);
  til.addEventListener("change", oppdaterTidsrom);
  fra.addEventListener("input", oppdaterTidsrom);
  til.addEventListener("input", oppdaterTidsrom);
})();

/* ---------------- Valgfri blokk ----------------
   Skjult til man ber om den, så skjemaet ser kortere ut der folk bestemmer
   seg for om de orker å begynne. */
(function valgfriBlokk() {
  const knapp = document.getElementById("vis-valgfritt");
  const felt = document.getElementById("valgfrie-felt");
  if (!knapp || !felt) return;
  knapp.addEventListener("click", () => {
    const apen = knapp.getAttribute("aria-expanded") === "true";
    knapp.setAttribute("aria-expanded", String(!apen));
    felt.hidden = apen;
    if (!apen) {
      const forste = felt.querySelector("textarea, input, select");
      if (forste) forste.focus();
    }
  });
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

/* ---------------- Nytt forsøk på ubekreftede innsendinger ----------------
   Kjører sist i fila, etter at alt den bruker er deklarert. Stille for
   kunden. Referansen gjør at ingenting kan havne to ganger i arket.        */
(function proevUbekreftetPaaNytt() {
  if (!BOOKING_ENDPOINT) return;
  lesUbekreftet().forEach(async (post) => {
    try {
      if (await sjekkMottatt(post.ref, 6000)) return glemUbekreftet(post.ref);
      await sendToSheet(post.data);
      if (await sjekkMottatt(post.ref, 6000)) glemUbekreftet(post.ref);
    } catch (e) {
      /* fortsatt nede – vi prøver igjen neste gang */
    }
  });
})();

/* ---------------- Måling: sidevisning og skjema-start ----------------
   Ligger sist, etter at alt den bruker er deklarert.                   */
(function maalOppstart() {
  maal("sidevisning");

  if (!form) return;
  const start = () => {
    form.removeEventListener("input", start);
    form.removeEventListener("focusin", start);
    maal("skjema_start");
  };
  form.addEventListener("input", start);
  form.addEventListener("focusin", start);
})();
