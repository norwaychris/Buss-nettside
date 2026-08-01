/**
 * NorwayRob – bookingsystem i Google Sheets
 * ==========================================================================
 * Limes inn i Google Apps Script (Utvidelser → Apps Script) i regnearket ditt.
 * Se ../SETUP.md for førstegangsoppsett.
 *
 * Denne fila gjør tre ting:
 *
 *   1. Tar imot forespørsler fra nettsiden  → ny rad + varsel til deg
 *                                             + automatisk kvittering til kunden
 *   2. Gir deg en «NorwayRob»-meny øverst i regnearket, der du sender
 *      hver e-post i kundereisen med ett klikk fra den raden du står i.
 *   3. Foreslår pris ut fra satsene i fanen «Innstillinger».
 *
 * VIKTIG – to brytere øverst styrer hvor forsiktig systemet er:
 *
 *   TESTMODUS            true  = ALL e-post går til deg selv, aldri til kunden.
 *   GODKJENNING_PAAKREVD true  = du ser e-posten før den sendes.
 *
 * Etter enhver endring i denne fila:
 *   Deploy → Manage deployments → blyanten → Version: New version → Deploy
 * ==========================================================================
 */

/* ========================== BRYTERE ========================== */

// Din e-post. Varsler går hit, og kunden svarer hit.
var VARSEL_EPOST = "norwayrob@outlook.com";

// Vises som avsendernavn hos kunden.
var AVSENDER_NAVN = "NorwayRob";

// TESTMODUS: all e-post går til VARSEL_EPOST i stedet for kunden, med
// «[TEST → kunde@…]» foran emnet. La den stå på til bussen og løyvet er på
// plass. Da kan du kjøre gjennom hele flyten uten at en ekte kunde får noe.
var TESTMODUS = true;

// Vis e-posten og la deg trykke «Send» selv. Sett til false den dagen du
// stoler på malene og vil at menyen skal sende direkte.
var GODKJENNING_PAAKREVD = true;

// Automatisk kvittering når noen sender inn skjemaet.
var AUTOSVAR_PAA = true;

// Vises av doGet() så du kan sjekke hvilken versjon som faktisk kjører.
var VERSJON = "2026-08-01";

/* ========================== ARK OG KOLONNER ========================== */

var ARK_NAVN = "Bestillinger";
var ARK_INNSTILLINGER = "Innstillinger";
var ARK_TRAFIKK = "Trafikk";

// Cookiefri måling. Kun disse hendelsene godtas – alt annet ignoreres.
var TRAFIKK_KOLONNER = ["Tidspunkt", "Hendelse", "Side", "Kilde", "Enhet"];
var TRAFIKK_HENDELSER = {
  "sidevisning": 1, "skjema_start": 1, "anledning_valgt": 1, "innsendt": 1
};

// Rekkefølgen er en kontrakt mot nettsiden. Endre aldri rekkefølgen –
// legg kun nye kolonner til på slutten.
var KOLONNER = [
  "Mottatt", "Status", "Navn", "Telefon", "E-post", "Anledning",
  "Dato", "Tidsrom", "Antall personer",
  "Hentested", "Rute", "Anledning-detaljer", "Ekstra ønsker",
  "Kilde", "Betalt (kr)", "Notat",
  "Pris (kr)", "Timer", "Sendt", "Ref"
];

// Skjemafelt som har sin egen kolonne (resten samles i "Anledning-detaljer"):
var KJENTE_FELT = {
  "Navn": 1, "Telefon": 1, "E-post": 1, "Anledning": 1, "Dato": 1,
  "Tidsrom": 1, "Antall personer": 1, "Hentested": 1, "Rute": 1,
  "Ekstra ønsker": 1, "Kilde": 1, "Ref": 1
};

// Kolonner som alltid starter tomme ved ny forespørsel:
var TOMME_VED_START = { "Betalt (kr)": 1, "Notat": 1, "Pris (kr)": 1, "Sendt": 1 };

var STATUS_VALG = ["Ny", "Tilbud sendt", "Betalt", "Fullført", "Avlyst"];

// Standardinnhold i «Innstillinger». Opprettes automatisk første gang.
// Kontonummer og telefon står bevisst tomme – de skal aldri ligge i koden.
var STANDARD_INNSTILLINGER = [
  ["Innstilling", "Verdi", "Forklaring"],
  ["Timepris (kr)", 1500, "Grunnpris per time bussen er bundet opp. MÅ justeres når du kjenner kostnadene dine."],
  ["Minimum timer", 4, "Korteste tur vi priser. Kortere turer prises som om de varte så lenge."],
  ["Tillegg lang tur (kr)", 0, "Fast tillegg du kan legge på turer utenfor Bergensområdet. 0 = av."],
  ["Kontonummer", "", "FYLLES INN. Vises i tilbud og betalingspåminnelse."],
  ["Telefon ved booking", "", "FYLLES INN. Vises KUN i bekreftelse og påminnelse før tur – aldri på nettsiden."],
  ["Sitteplasser", "", "Fylles inn når bussen er kjøpt."],
  ["Tilbud gyldig (dager)", 7, "Hvor lenge et tilbud står ved lag."],
  ["Gratis avbestilling (dager)", 14, "Grensen for gratis avbestilling og fri flytting av dato."],
  ["Betalingsfrist normal (dager)", 7, "Frist i tilbudet når det er god tid til avreise."],
  ["Betalingsfrist kort varsel (dager)", 2, "Frist når avreise er nærmere enn grensen over."],
  ["Anmeldelseslenke", "https://g.page/r/CaOsA5S43vnjEBM/review", "Lenken i takke-e-posten."]
];

/* ========================== MENYEN ========================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("NorwayRob")
    .addItem("① Foreslå pris for valgt rad", "foreslaaPris")
    .addSeparator()
    .addItem("② Send tilbud", "sendTilbud")
    .addItem("③ Send betalingspåminnelse", "sendBetalingspaminnelse")
    .addItem("④ Send bekreftelse (betalt)", "sendBekreftelse")
    .addSeparator()
    .addItem("⑤ Send påminnelse før tur", "sendTurpaminnelse")
    .addItem("⑥ Send takk + anmeldelse", "sendTakk")
    .addSeparator()
    .addItem("Trafikk – siste 30 dager", "visTrafikk")
    .addItem("Sett opp / reparer arkene", "settOppAlt")
    .addItem("Status for systemet", "visStatus")
    .addToUi();
}

function sendTilbud()              { kjoerSteg("tilbud"); }
function sendBetalingspaminnelse() { kjoerSteg("betalingspaminnelse"); }
function sendBekreftelse()         { kjoerSteg("bekreftelse"); }
function sendTurpaminnelse()       { kjoerSteg("turpaminnelse"); }
function sendTakk()                { kjoerSteg("takk"); }

var STEG_NAVN = {
  tilbud: "Tilbud",
  betalingspaminnelse: "Betalingspåminnelse",
  bekreftelse: "Bekreftelse",
  turpaminnelse: "Påminnelse før tur",
  takk: "Takk + anmeldelse"
};

/* ========================== MOTTAK FRA NETTSIDEN ========================== */

function doPost(e) {
  var innkommende = (e && e.parameter) ? e.parameter : {};

  // Trafikkhendelser går UTENOM låsen, og ut av funksjonen med en gang.
  // En ekte booking skal aldri stå i kø bak en sidevisning – én viral video
  // ville ellers kunne låse ute en betalende kunde. En tapt trafikkrad er
  // derimot helt uproblematisk.
  if (innkommende.type === "hendelse") {
    try { loggHendelse(innkommende); } catch (err) {}
    return svar({ status: "ok" });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = hentEllerLagArk();
    var data = innkommende;

    // Har vi sett denne referansen før? Da er forespørselen allerede lagret,
    // og vi svarer greit uten å legge inn en dublett. Det gjør det trygt for
    // nettsiden å prøve på nytt når den ikke fikk bekreftelse.
    var ref = String(data["Ref"] || "").trim();
    if (ref && finnRadForRef(sheet, ref)) {
      return svar({ status: "ok", duplikat: true });
    }

    // Samle ukjente felt (anledning-oppfølging) i én lesbar tekst
    var detaljer = [];
    for (var key in data) {
      if (!KJENTE_FELT[key] && key !== "Anledning" && data[key]) {
        detaljer.push(key + ": " + data[key]);
      }
    }

    var timer = beregnTimer(data["Tidsrom"]);

    var rad = KOLONNER.map(function (kol) {
      if (kol === "Mottatt") return new Date();
      if (kol === "Status") return "Ny";
      if (kol === "Anledning-detaljer") return detaljer.join("  ·  ");
      if (kol === "Timer") return timer || "";
      if (TOMME_VED_START[kol]) return "";
      return data[kol] || "";
    });

    sheet.appendRow(rad);
    formaterRad(sheet, sheet.getLastRow());
    sendVarsel(data, detaljer);
    sendAutosvar(data);

    return svar({ status: "ok" });
  } catch (err) {
    return svar({ status: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Svarer nettsiden på «kom forespørsel <ref> fram?».
 *
 * Nettleseren kan ikke lese svaret på POST-en vi mottar (Apps Script svarer
 * uten CORS-headere), så nettsiden stiller spørsmålet på nytt via en
 * <script>-tag i stedet. Script-tagger er ikke underlagt CORS, og da får den
 * faktisk lese svaret. Derfor JSONP her.
 *
 *   ?sjekk=<ref>&callback=<funksjonsnavn>   → callback({"funnet":true})
 *   uten parametre                          → status og versjon
 */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var callback = String(p.callback || "").trim();

  if (p.sjekk) {
    var funnet = false;
    try {
      // Bevisst enkelt oppslag: ingen arkoppsett eller migrering på lesevei.
      var ark = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ARK_NAVN);
      if (ark) funnet = finnRadForRef(ark, String(p.sjekk).trim()) > 0;
    } catch (err) {}
    return svarJsonp({ funnet: funnet }, callback);
  }

  return svarJsonp({
    status: "ok",
    message: "NorwayRob booking-endepunkt er live.",
    versjon: VERSJON,
    testmodus: TESTMODUS
  }, callback);
}

/** Radnummeret referansen står på, eller 0 hvis den ikke finnes. */
function finnRadForRef(sheet, ref) {
  if (!ref) return 0;
  var k = kol("Ref");
  var siste = sheet.getLastRow();
  if (!k || siste < 2 || sheet.getLastColumn() < k) return 0;
  var verdier = sheet.getRange(2, k, siste - 1, 1).getValues();
  for (var i = 0; i < verdier.length; i++) {
    if (String(verdier[i][0]).trim() === ref) return i + 2;
  }
  return 0;
}

/* ========================== ARKOPPSETT OG MIGRERING ========================== */

function settOppAlt() {
  hentEllerLagArk();
  hentInnstillingsark();
  hentTrafikkArk();
  SpreadsheetApp.getUi().alert("Klart", "Arkene er satt opp og oppdatert.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function hentEllerLagArk() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ARK_NAVN);

  if (!sheet) {
    sheet = ss.insertSheet(ARK_NAVN);
    settOppArk(sheet);
    return sheet;
  }
  if (sheet.getLastRow() === 0) {
    settOppArk(sheet);
    return sheet;
  }

  var status = headerStatus(sheet);

  // Overskriftene stemmer allerede.
  if (status === "lik") return sheet;

  // Arket har en ELDRE versjon av de samme kolonnene. Da utvider vi i stedet
  // for å arkivere – ellers ville eksisterende bookinger blitt flyttet vekk.
  if (status === "eldre") {
    utvidKolonner(sheet);
    return sheet;
  }

  // Helt annet oppsett: flytt til side, som før.
  var nyttNavn = ARK_NAVN + " (gammel)";
  var n = 2;
  while (ss.getSheetByName(nyttNavn)) { nyttNavn = ARK_NAVN + " (gammel " + (n++) + ")"; }
  sheet.setName(nyttNavn);
  sheet = ss.insertSheet(ARK_NAVN);
  settOppArk(sheet);
  return sheet;
}

/**
 * "lik"    – overskriftene er nøyaktig som KOLONNER
 * "eldre"  – overskriftene er starten på KOLONNER (færre kolonner enn nå)
 * "ukjent" – noe annet
 */
function headerStatus(sheet) {
  var bredde = sheet.getLastColumn();
  var rad = sheet.getRange(1, 1, 1, bredde).getValues()[0]
    .map(function (v) { return String(v).trim(); });
  while (rad.length && rad[rad.length - 1] === "") rad.pop();

  if (rad.length === KOLONNER.length && rad.join("|") === KOLONNER.join("|")) return "lik";
  if (rad.length > 0 && rad.length < KOLONNER.length &&
      rad.join("|") === KOLONNER.slice(0, rad.length).join("|")) return "eldre";
  return "ukjent";
}

/** Legger til de nye kolonnene bakerst uten å røre eksisterende data. */
function utvidKolonner(sheet) {
  var rad = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (v) { return String(v).trim(); });
  while (rad.length && rad[rad.length - 1] === "") rad.pop();

  var fraIndeks = rad.length;
  var nye = KOLONNER.slice(fraIndeks);
  if (!nye.length) return;

  if (sheet.getMaxColumns() < KOLONNER.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), KOLONNER.length - sheet.getMaxColumns());
  }

  sheet.getRange(1, fraIndeks + 1, 1, nye.length)
    .setValues([nye])
    .setBackground("#ff3b3b").setFontColor("#ffffff")
    .setFontWeight("bold").setVerticalAlignment("middle");

  settKolonnebredder(sheet);
  settFormater(sheet);

  // Fyll inn Timer for rader som allerede finnes, der vi kan regne det ut.
  var sisteRad = sheet.getLastRow();
  if (sisteRad > 1 && kol("Timer") && kol("Tidsrom")) {
    var tidsrom = sheet.getRange(2, kol("Tidsrom"), sisteRad - 1, 1).getValues();
    var timer = tidsrom.map(function (r) {
      var t = beregnTimer(r[0]);
      return [t || ""];
    });
    sheet.getRange(2, kol("Timer"), sisteRad - 1, 1).setValues(timer);
  }
}

function settOppArk(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 1, KOLONNER.length).setValues([KOLONNER]);
  sheet.getRange(1, 1, 1, KOLONNER.length)
    .setBackground("#ff3b3b").setFontColor("#ffffff")
    .setFontWeight("bold").setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);
  settKolonnebredder(sheet);
  settFormater(sheet);

  try {
    sheet.getRange(1, 1, sheet.getMaxRows(), KOLONNER.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  } catch (e) {}
}

function settKolonnebredder(sheet) {
  var bredder = {
    "Mottatt": 140, "Status": 110, "Navn": 150, "Telefon": 120, "E-post": 180,
    "Anledning": 140, "Dato": 100, "Tidsrom": 190, "Antall personer": 80,
    "Hentested": 170, "Rute": 200, "Anledning-detaljer": 260, "Ekstra ønsker": 220,
    "Kilde": 120, "Betalt (kr)": 100, "Notat": 200,
    "Pris (kr)": 100, "Timer": 70, "Sendt": 230, "Ref": 130
  };
  for (var i = 0; i < KOLONNER.length; i++) {
    if (bredder[KOLONNER[i]]) sheet.setColumnWidth(i + 1, bredder[KOLONNER[i]]);
  }
}

function settFormater(sheet) {
  var maxRader = sheet.getMaxRows() - 1;
  if (maxRader < 1) return;

  sheet.getRange(2, kol("Mottatt"), maxRader, 1).setNumberFormat("dd.MM.yyyy  HH:mm");
  sheet.getRange(2, kol("Betalt (kr)"), maxRader, 1).setNumberFormat("#,##0 \"kr\"");
  sheet.getRange(2, kol("Pris (kr)"), maxRader, 1).setNumberFormat("#,##0 \"kr\"");
  sheet.getRange(2, kol("Timer"), maxRader, 1).setNumberFormat("0.#");

  var regel = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_VALG, true).setAllowInvalid(false).build();
  sheet.getRange(2, kol("Status"), maxRader, 1).setDataValidation(regel);
}

function formaterRad(sheet, r) {
  sheet.getRange(r, 1, 1, KOLONNER.length).setVerticalAlignment("top").setWrap(true);
}

function kol(navn) { return KOLONNER.indexOf(navn) + 1; }

/* ========================== TRAFIKKMÅLING ==========================
   Cookiefri og uten samtykke: vi lagrer og leser ingenting på brukerens
   enhet, og registrerer ingen IP, nettleser-signatur eller identifikator.
   Tidsstempelet settes her på serveren, aldri i nettleseren – da kan det
   heller ikke brukes til å gjenkjenne noen.                              */

function hentTrafikkArk() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ark = ss.getSheetByName(ARK_TRAFIKK);
  if (ark) return ark;

  ark = ss.insertSheet(ARK_TRAFIKK);
  ark.getRange(1, 1, 1, TRAFIKK_KOLONNER.length).setValues([TRAFIKK_KOLONNER])
    .setBackground("#ff3b3b").setFontColor("#ffffff").setFontWeight("bold");
  ark.setFrozenRows(1);
  ark.setColumnWidth(1, 150); ark.setColumnWidth(2, 150);
  ark.setColumnWidth(3, 180); ark.setColumnWidth(4, 130); ark.setColumnWidth(5, 90);
  ark.getRange(2, 1, ark.getMaxRows() - 1, 1).setNumberFormat("dd.MM.yyyy  HH:mm");
  return ark;
}

function loggHendelse(d) {
  var hendelse = String(d.hendelse || "").trim();
  if (!TRAFIKK_HENDELSER[hendelse]) return;   // ukjent hendelse: ignorer stille

  hentTrafikkArk().appendRow([
    new Date(),
    hendelse,
    kortTekst(d.side, 80),
    kortTekst(d.kilde, 40) || "direkte",
    String(d.enhet) === "mobil" ? "mobil" : "desktop"
  ]);
}

function kortTekst(v, maks) {
  var s = String(v == null ? "" : v).replace(/[\r\n\t]/g, " ").trim();
  return s.length > maks ? s.substring(0, maks) : s;
}

/** Trakten for de siste 30 dagene, lesbart. */
function visTrafikk() {
  var ui = SpreadsheetApp.getUi();
  var ark = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ARK_TRAFIKK);
  if (!ark || ark.getLastRow() < 2) {
    ui.alert("Trafikk",
      "Ingen tall ennå.\n\nMålingen begynner å samle data så snart nettsiden er " +
      "publisert med den nye koden, og noen har vært innom.", ui.ButtonSet.OK);
    return;
  }

  var grense = new Date();
  grense.setDate(grense.getDate() - 30);

  var rader = ark.getRange(2, 1, ark.getLastRow() - 1, TRAFIKK_KOLONNER.length)
    .getValues()
    .filter(function (r) { return (r[0] instanceof Date) && r[0] >= grense; });

  var tell = {}, kilder = {}, enheter = {};
  rader.forEach(function (r) {
    tell[r[1]] = (tell[r[1]] || 0) + 1;
    if (r[1] === "sidevisning") {
      var k = r[3] || "direkte", e = r[4] || "ukjent";
      kilder[k] = (kilder[k] || 0) + 1;
      enheter[e] = (enheter[e] || 0) + 1;
    }
  });

  var besok = tell["sidevisning"] || 0;
  function andel(n) { return besok ? "  (" + Math.round((n / besok) * 100) + " %)" : ""; }

  ui.alert("Trafikk – siste 30 dager",
    "Besøk: " + besok + "\n" +
    "Begynte på skjemaet: " + (tell["skjema_start"] || 0) + andel(tell["skjema_start"] || 0) + "\n" +
    "Valgte anledning: " + (tell["anledning_valgt"] || 0) + andel(tell["anledning_valgt"] || 0) + "\n" +
    "Sendte inn: " + (tell["innsendt"] || 0) + andel(tell["innsendt"] || 0) + "\n\n" +
    "HVOR DE KOM FRA\n" + sortertListe(kilder) + "\n" +
    "ENHET\n" + sortertListe(enheter) + "\n" +
    "Totalt " + rader.length + " hendelser i perioden.",
    ui.ButtonSet.OK);
}

function sortertListe(o) {
  var navn = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; });
  if (!navn.length) return "  (ingen)\n";
  return navn.map(function (k) { return "  " + k + ": " + o[k]; }).join("\n") + "\n";
}

/* ========================== INNSTILLINGER ========================== */

function hentInnstillingsark() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ark = ss.getSheetByName(ARK_INNSTILLINGER);
  if (ark) return ark;

  ark = ss.insertSheet(ARK_INNSTILLINGER);
  ark.getRange(1, 1, STANDARD_INNSTILLINGER.length, 3).setValues(STANDARD_INNSTILLINGER);
  ark.getRange(1, 1, 1, 3)
    .setBackground("#ff3b3b").setFontColor("#ffffff").setFontWeight("bold");
  ark.setFrozenRows(1);
  ark.setColumnWidth(1, 260);
  ark.setColumnWidth(2, 200);
  ark.setColumnWidth(3, 520);
  ark.getRange(2, 3, STANDARD_INNSTILLINGER.length - 1, 1).setWrap(true);
  return ark;
}

var _innstillingerCache = null;

function hentInnstilling(navn, standard) {
  if (!_innstillingerCache) {
    _innstillingerCache = {};
    var ark = hentInnstillingsark();
    var siste = ark.getLastRow();
    if (siste > 1) {
      var verdier = ark.getRange(2, 1, siste - 1, 2).getValues();
      for (var i = 0; i < verdier.length; i++) {
        var n = String(verdier[i][0]).trim();
        if (n) _innstillingerCache[n] = verdier[i][1];
      }
    }
  }
  var v = _innstillingerCache[navn];
  if (v === undefined || v === null || String(v).trim() === "") {
    return (standard === undefined) ? "" : standard;
  }
  return v;
}

/* ========================== PRISFORSLAG ========================== */

function foreslaaPris() {
  var ui = SpreadsheetApp.getUi();
  var funn = finnValgtRad();
  if (!funn) return;
  var sheet = funn.ark, r = funn.rad;
  var d = radData(sheet, r);

  var timer = Number(d["Timer"]) || beregnTimer(d["Tidsrom"]);
  if (!timer) {
    ui.alert("Mangler tidsbruk",
      "Klarte ikke å regne ut hvor lenge turen varer.\n\n" +
      "Tidsrom står som: «" + (d["Tidsrom"] || "(tomt)") + "»\n\n" +
      "Skriv antall timer selv i kolonnen «Timer», så prøv igjen.",
      ui.ButtonSet.OK);
    return;
  }

  var timepris = Number(hentInnstilling("Timepris (kr)", 0));
  if (!timepris) {
    ui.alert("Timepris mangler",
      "Fyll inn «Timepris (kr)» i fanen «Innstillinger» først.", ui.ButtonSet.OK);
    return;
  }

  var minTimer = Number(hentInnstilling("Minimum timer", 0)) || 0;
  var fakturerte = Math.max(timer, minTimer);
  var tillegg = Number(hentInnstilling("Tillegg lang tur (kr)", 0)) || 0;
  var forslag = Math.round((fakturerte * timepris + tillegg) / 100) * 100;

  var eksisterende = d["Pris (kr)"];
  var forklaring =
    "Turen varer " + tallTekst(timer) + " timer.\n" +
    (minTimer && fakturerte > timer ? "Minimum er " + minTimer + " timer, så vi regner " + fakturerte + ".\n" : "") +
    fakturerte + " timer × " + timepris + " kr" + (tillegg ? " + " + tillegg + " kr i tillegg" : "") + "\n" +
    "Forslag, avrundet: " + forslag + " kr";

  if (eksisterende !== "" && eksisterende !== null && Number(eksisterende) > 0) {
    var svarKnapp = ui.alert("Pris finnes allerede",
      forklaring + "\n\nRaden har allerede " + eksisterende + " kr.\nVil du erstatte den?",
      ui.ButtonSet.YES_NO);
    if (svarKnapp !== ui.Button.YES) return;
  } else {
    ui.alert("Prisforslag", forklaring + "\n\nLegges inn i «Pris (kr)». Du kan endre den fritt.", ui.ButtonSet.OK);
  }

  sheet.getRange(r, kol("Pris (kr)")).setValue(forslag);
  if (kol("Timer")) sheet.getRange(r, kol("Timer")).setValue(timer);
}

/* ========================== SENDEFLYTEN ========================== */

function kjoerSteg(type) {
  var ui = SpreadsheetApp.getUi();
  var funn = finnValgtRad();
  if (!funn) return;
  var d = radData(funn.ark, funn.rad);

  var problemer = valider(type, d);
  if (problemer.length) {
    ui.alert("Kan ikke sende " + STEG_NAVN[type].toLowerCase(),
      "Dette mangler i rad " + funn.rad + ":\n\n• " + problemer.join("\n• "),
      ui.ButtonSet.OK);
    return;
  }

  var alleredeSendt = sendtTidligere(d, type);
  if (alleredeSendt) {
    var s = ui.alert("Allerede sendt",
      STEG_NAVN[type] + " ble sendt til denne raden " + alleredeSendt + ".\n\nSende på nytt?",
      ui.ButtonSet.YES_NO);
    if (s !== ui.Button.YES) return;
  }

  var e = byggEpost(type, d);
  var mottaker = TESTMODUS ? VARSEL_EPOST : String(d["E-post"]).trim();

  if (GODKJENNING_PAAKREVD) {
    visForhaandsvisning(funn.rad, type, e, mottaker, String(d["E-post"]).trim());
  } else {
    utfoerSending(funn.rad, type);
    ui.alert("Sendt", STEG_NAVN[type] + " er sendt til " + mottaker + ".", ui.ButtonSet.OK);
  }
}

/** Kalles fra «Send»-knappen i forhåndsvisningen. */
function bekreftSending(rad, type) {
  utfoerSending(rad, type);
  return true;
}

function utfoerSending(rad, type) {
  var sheet = hentEllerLagArk();
  var d = radData(sheet, rad);

  var problemer = valider(type, d);
  if (problemer.length) throw new Error("Raden mangler: " + problemer.join(", "));

  var e = byggEpost(type, d);
  var ekteMottaker = String(d["E-post"]).trim();
  var mottaker = TESTMODUS ? VARSEL_EPOST : ekteMottaker;
  var emne = TESTMODUS ? "[TEST → " + ekteMottaker + "] " + e.emne : e.emne;

  MailApp.sendEmail({
    to: mottaker,
    subject: emne,
    htmlBody: e.html,
    body: e.tekst,
    name: AVSENDER_NAVN,
    replyTo: VARSEL_EPOST
  });

  loggSending(sheet, rad, type);
  settStatusEtterSending(sheet, rad, type);
}

function loggSending(sheet, rad, type) {
  if (!kol("Sendt")) return;
  var celle = sheet.getRange(rad, kol("Sendt"));
  var naa = Utilities.formatDate(new Date(), tidssone(), "dd.MM.yyyy HH:mm");
  var linje = STEG_NAVN[type] + " · " + naa + (TESTMODUS ? " (TEST)" : "");
  var gammel = String(celle.getValue() || "").trim();
  celle.setValue(gammel ? gammel + "\n" + linje : linje);
}

function settStatusEtterSending(sheet, rad, type) {
  var ny = null;
  if (type === "tilbud") ny = "Tilbud sendt";
  if (type === "bekreftelse") ny = "Betalt";
  if (type === "takk") ny = "Fullført";
  if (!ny) return;
  sheet.getRange(rad, kol("Status")).setValue(ny);
}

function sendtTidligere(d, type) {
  var logg = String(d["Sendt"] || "");
  var linjer = logg.split("\n");
  for (var i = 0; i < linjer.length; i++) {
    if (linjer[i].indexOf(STEG_NAVN[type] + " ·") === 0) {
      return linjer[i].replace(STEG_NAVN[type] + " · ", "");
    }
  }
  return null;
}

/* ========================== VALIDERING ========================== */

function valider(type, d) {
  var p = [];
  var epost = String(d["E-post"] || "").trim();
  if (!/^\S+@\S+\.\S+$/.test(epost)) p.push("Gyldig e-postadresse");
  if (!String(d["Navn"] || "").trim()) p.push("Navn");

  if (type === "tilbud" || type === "betalingspaminnelse") {
    if (!(Number(d["Pris (kr)"]) > 0)) p.push("Pris (kr) – kjør «Foreslå pris» eller skriv den selv");
    if (!parseDato(d["Dato"])) p.push("Dato");
    if (!String(hentInnstilling("Kontonummer", "")).trim()) {
      p.push("Kontonummer i fanen «Innstillinger»");
    }
  }
  if (type === "bekreftelse" || type === "turpaminnelse") {
    if (!parseDato(d["Dato"])) p.push("Dato");
    if (!String(d["Hentested"] || "").trim()) p.push("Hentested");
  }
  if (type === "takk") {
    if (!parseDato(d["Dato"])) p.push("Dato");
  }
  return p;
}

/* ========================== E-POSTMALER ========================== */

function byggEpost(type, d) {
  if (type === "tilbud")               return malTilbud(d);
  if (type === "betalingspaminnelse")  return malBetalingspaminnelse(d);
  if (type === "bekreftelse")          return malBekreftelse(d);
  if (type === "turpaminnelse")        return malTurpaminnelse(d);
  if (type === "takk")                 return malTakk(d);
  throw new Error("Ukjent e-posttype: " + type);
}

/** Felles ramme rundt alle e-poster: svart merketopp, rød strek, hvitt kort. */
function epostSkall(innhold) {
  return '' +
  '<div style="background:#f2f2f5;padding:28px 14px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">' +
    '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px rgba(10,10,11,.12);">' +
      '<div style="background:#0a0a0b;padding:26px 30px;text-align:center;">' +
        '<div style="font-size:24px;font-weight:800;letter-spacing:1px;color:#ffffff;">NORWAY<span style="color:#ff3b3b;">ROB</span></div>' +
        '<div style="font-size:10px;letter-spacing:3px;color:#8a8a92;margin-top:4px;">BUSS TIL LEIE &middot; BERGEN</div>' +
      '</div>' +
      '<div style="height:3px;background:#ff3b3b;"></div>' +
      '<div style="padding:32px 30px 8px;">' + innhold + '</div>' +
      '<div style="border-top:1px solid #ececf0;padding:18px 30px 24px;text-align:center;">' +
        '<div style="font-style:italic;font-size:13.5px;color:#4a4a52;">«I\'m not a hero, I\'m just a bus driver.»</div>' +
        '<div style="font-size:12.5px;color:#7a7a83;margin-top:8px;">Rob &mdash; NorwayRob &middot; norwayrob.no</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function detaljboks(tittel, rader) {
  var innhold = rader.filter(function (r) { return r[1]; }).map(function (r) {
    return '<tr><td style="padding:6px 0;color:#7a7a83;width:118px;">' + r[0] +
           '</td><td style="padding:6px 0;font-weight:600;color:#0a0a0b;">' + r[1] + '</td></tr>';
  }).join("");
  if (!innhold) return "";
  return '<div style="background:#f7f7f9;border:1px solid #ececf0;border-radius:14px;padding:18px 22px;margin-bottom:22px;">' +
    '<div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#ff3b3b;margin-bottom:8px;">' + tittel + '</div>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14.5px;">' + innhold + '</table></div>';
}

function overskrift(tekst) {
  return '<h1 style="font-size:22px;color:#0a0a0b;margin:0 0 12px;text-align:center;">' + tekst + '</h1>';
}

function avsnitt(tekst) {
  return '<p style="font-size:15px;line-height:1.7;color:#4a4a52;margin:0 0 20px;">' + tekst + '</p>';
}

function merke(tekst, bakgrunn, farge) {
  return '<div style="text-align:center;margin-bottom:18px;"><span style="display:inline-block;background:' + bakgrunn +
    ';color:' + farge + ';font-size:13px;font-weight:700;padding:7px 16px;border-radius:999px;">' + tekst + '</span></div>';
}

/* ---- ② Tilbud ---- */

function malTilbud(d) {
  var fornavn = hentFornavn(d);
  var dato = parseDato(d["Dato"]);
  var dagerTil = dagerFraIdag(dato);
  var gratisGrense = Number(hentInnstilling("Gratis avbestilling (dager)", 14));
  var kortVarsel = dagerTil !== null && dagerTil < gratisGrense;

  var fristDager = Number(hentInnstilling(
    kortVarsel ? "Betalingsfrist kort varsel (dager)" : "Betalingsfrist normal (dager)",
    kortVarsel ? 2 : 7));
  var frist = new Date();
  frist.setDate(frist.getDate() + fristDager);
  if (dato && frist > dato) frist = new Date(dato.getTime() - 86400000);

  var konto = String(hentInnstilling("Kontonummer", "")).trim();
  var pris = Number(d["Pris (kr)"]);
  var merking = (String(d["Navn"] || "").split(/\s+/)[0] || "Booking") + " " + kortDato(dato);

  var vilkaarlinje = kortVarsel
    ? '<div style="background:#fff8e6;border:1px solid #f2dfa8;border-radius:12px;padding:14px 18px;margin-bottom:22px;font-size:14px;line-height:1.6;color:#6b5a1f;">' +
      '<strong>Kort varsel:</strong> siden det er under ' + gratisGrense + ' dager til avreise, refunderes ikke beløpet ved avbestilling etter at betalingen er gjennomført. ' +
      'Fullstendige vilkår: <a href="https://norwayrob.no/vilkar.html" style="color:#6b5a1f;">norwayrob.no/vilkar.html</a></div>'
    : avsnitt('Gratis avbestilling og fri flytting av dato inntil <strong>' + gratisGrense + ' dager</strong> før avreise. ' +
      'Fullstendige vilkår: <a href="https://norwayrob.no/vilkar.html" style="color:#ff3b3b;">norwayrob.no/vilkar.html</a>');

  var html = epostSkall(
    merke("Tilbud til dere", "#f7f7f9", "#0a0a0b") +
    overskrift("Hei" + (fornavn ? " " + fornavn : "") + "! Her er tilbudet") +
    avsnitt("Takk for forespørselen — dette blir gøy. Her er hva turen koster, alt inkludert.") +
    detaljboks("TUREN", [
      ["Dato", langDato(dato)],
      ["Tid", d["Tidsrom"]],
      ["Henting", d["Hentested"]],
      ["Antall", d["Antall personer"] ? d["Antall personer"] + " personer" : ""],
      ["Anledning", d["Anledning"]]
    ]) +
    '<div style="background:#0a0a0b;border-radius:14px;padding:22px;text-align:center;margin-bottom:22px;">' +
      '<div style="font-size:11px;letter-spacing:2px;color:#8a8a92;margin-bottom:6px;">FAST PRIS</div>' +
      '<div style="font-size:34px;font-weight:800;color:#ffffff;">' + kroner(pris) + '</div>' +
      '<div style="font-size:12.5px;color:#8a8a92;margin-top:6px;">Sjåfør, drivstoff, bom, lydanlegg og vask er inkludert</div>' +
    '</div>' +
    detaljboks("SLIK BEKREFTER DERE", [
      ["Konto", konto],
      ["Merk med", merking],
      ["Frist", langDato(frist)]
    ]) +
    avsnitt("Datoen er deres så snart betalingen er registrert — da sender jeg bekreftelse med en gang.") +
    vilkaarlinje +
    avsnitt("Spørsmål før dere bestemmer dere? Bare svar på denne e-posten.")
  );

  var tekst = "Hei" + (fornavn ? " " + fornavn : "") + "!\n\n" +
    "Takk for forespørselen — dette blir gøy. Her er tilbudet:\n\n" +
    "Dato: " + langDato(dato) + "\n" +
    "Tid: " + (d["Tidsrom"] || "") + "\n" +
    "Henting: " + (d["Hentested"] || "") + "\n" +
    "Antall: " + (d["Antall personer"] || "") + " personer\n\n" +
    "FAST PRIS: " + kroner(pris) + "\n" +
    "Sjåfør, drivstoff, bom, lydanlegg og vask er inkludert.\n\n" +
    "SLIK BEKREFTER DERE\n" +
    "Betal til " + konto + ", merk «" + merking + "», innen " + langDato(frist) + ".\n" +
    "Datoen er deres så snart betalingen er registrert.\n\n" +
    (kortVarsel
      ? "Merk: siden det er under " + gratisGrense + " dager til avreise, refunderes ikke beløpet ved avbestilling etter betaling.\n"
      : "Gratis avbestilling og fri flytting av dato inntil " + gratisGrense + " dager før avreise.\n") +
    "Vilkår: norwayrob.no/vilkar.html\n\n" +
    "Spørsmål? Bare svar på denne e-posten.\n\n" +
    "Rob — NorwayRob\nnorwayrob.no";

  return { emne: "Tilbud – bussleie " + kortDato(dato), html: html, tekst: tekst };
}

/* ---- ③ Betalingspåminnelse ---- */

function malBetalingspaminnelse(d) {
  var fornavn = hentFornavn(d);
  var dato = parseDato(d["Dato"]);
  var konto = String(hentInnstilling("Kontonummer", "")).trim();
  var merking = (String(d["Navn"] || "").split(/\s+/)[0] || "Booking") + " " + kortDato(dato);

  var html = epostSkall(
    overskrift("Hei" + (fornavn ? " " + fornavn : "") + "!") +
    avsnitt("Bare en vennlig påminnelse: bussen " + langDato(dato) + " står fortsatt åpen for dere, men datoen er ikke låst før betalingen er registrert.") +
    detaljboks("BETALING", [
      ["Beløp", kroner(Number(d["Pris (kr)"]))],
      ["Konto", konto],
      ["Merk med", merking]
    ]) +
    avsnitt("Så snart beløpet er inne, sender jeg bekreftelse.") +
    avsnitt("Er det noe dere lurer på før dere bestemmer dere? Bare svar på denne e-posten.")
  );

  var tekst = "Hei" + (fornavn ? " " + fornavn : "") + "!\n\n" +
    "Bare en vennlig påminnelse: bussen " + langDato(dato) + " står fortsatt åpen for dere, " +
    "men datoen er ikke låst før betalingen er registrert.\n\n" +
    "Beløp: " + kroner(Number(d["Pris (kr)"])) + "\n" +
    "Konto: " + konto + "\n" +
    "Merk med: " + merking + "\n\n" +
    "Så snart beløpet er inne, sender jeg bekreftelse.\n\n" +
    "Rob — NorwayRob";

  return { emne: "Påminnelse – bussen " + kortDato(dato) + " venter på dere", html: html, tekst: tekst };
}

/* ---- ④ Bekreftelse ---- */

function malBekreftelse(d) {
  var fornavn = hentFornavn(d);
  var dato = parseDato(d["Dato"]);
  var telefon = String(hentInnstilling("Telefon ved booking", "")).trim();

  var html = epostSkall(
    merke("&#10003;&nbsp; Bekreftet", "#eafaf0", "#177245") +
    overskrift("Bussen er deres" + (fornavn ? ", " + fornavn : "") + "!") +
    avsnitt("Betalingen er mottatt, og datoen er låst. Nå er det bare å glede seg.") +
    detaljboks("DIN BOOKING", [
      ["Dato", langDato(dato)],
      ["Tid", d["Tidsrom"]],
      ["Henting", d["Hentested"]],
      ["Antall", d["Antall personer"] ? d["Antall personer"] + " personer" : ""],
      ["Betalt", d["Betalt (kr)"] ? kroner(Number(d["Betalt (kr)"])) : kroner(Number(d["Pris (kr)"]))]
    ]) +
    avsnitt("Noen dager før turen tar jeg kontakt igjen for å avtale de siste detaljene." +
      (telefon ? " Trenger dere meg før det, når dere meg på <strong>" + telefon + "</strong>." : "")) +
    avsnitt("Gleder meg til å kjøre dere!")
  );

  var tekst = "Hei" + (fornavn ? " " + fornavn : "") + "!\n\n" +
    "Betalingen er mottatt — datoen er deres!\n\n" +
    "Dato: " + langDato(dato) + "\n" +
    "Tid: " + (d["Tidsrom"] || "") + "\n" +
    "Henting: " + (d["Hentested"] || "") + "\n\n" +
    "Noen dager før turen tar jeg kontakt for å avtale siste detaljer." +
    (telefon ? "\nTrenger dere meg før det: " + telefon : "") + "\n\n" +
    "Gleder meg til å kjøre dere!\nRob — NorwayRob";

  return { emne: "Bekreftet! Bussen er deres " + kortDato(dato), html: html, tekst: tekst };
}

/* ---- ⑤ Påminnelse før tur ---- */

function malTurpaminnelse(d) {
  var fornavn = hentFornavn(d);
  var dato = parseDato(d["Dato"]);
  var telefon = String(hentInnstilling("Telefon ved booking", "")).trim();

  var html = epostSkall(
    merke("Snart klart", "#f7f7f9", "#0a0a0b") +
    overskrift("Hei" + (fornavn ? " " + fornavn : "") + "! Da nærmer det seg") +
    avsnitt("Her er alt dere trenger å vite før turen.") +
    detaljboks("TURKORTET", [
      ["Dato", langDato(dato)],
      ["Tid", d["Tidsrom"]],
      ["Hentested", d["Hentested"]],
      ["Antall", d["Antall personer"] ? d["Antall personer"] + " personer" : ""]
    ]) +
    avsnitt("<strong>Verdt å huske:</strong><br>" +
      "• Noen ekstra i gjengen? Helt greit — så lenge dere er innenfor bussens antall plasser.<br>" +
      "• Ha playlisten klar, så kobler vi til når dere er om bord.") +
    avsnitt("Endringer i siste liten, eller spørsmål på selve dagen?" +
      (telefon ? " Ring meg på <strong>" + telefon + "</strong>." : " Bare svar på denne e-posten.")) +
    avsnitt("Gled dere — vi fikser kvelden!")
  );

  var tekst = "Hei" + (fornavn ? " " + fornavn : "") + "!\n\n" +
    "Da nærmer det seg. Her er alt dere trenger å vite:\n\n" +
    "Dato: " + langDato(dato) + "\n" +
    "Tid: " + (d["Tidsrom"] || "") + "\n" +
    "Hentested: " + (d["Hentested"] || "") + "\n" +
    "Antall: " + (d["Antall personer"] || "") + " personer\n\n" +
    "Verdt å huske:\n" +
    "- Noen ekstra i gjengen? Helt greit, så lenge dere er innenfor bussens antall plasser.\n" +
    "- Ha playlisten klar, så kobler vi til når dere er om bord.\n\n" +
    "Spørsmål på selve dagen?" + (telefon ? " Ring meg på " + telefon + "." : " Svar på denne e-posten.") + "\n\n" +
    "Gled dere — vi fikser kvelden!\nRob — NorwayRob";

  return { emne: "Snart klart! Bussen kommer " + kortDato(dato), html: html, tekst: tekst };
}

/* ---- ⑥ Takk + anmeldelse ---- */

function malTakk(d) {
  var fornavn = hentFornavn(d);
  var lenke = String(hentInnstilling("Anmeldelseslenke", "")).trim();

  var knapp = lenke
    ? '<div style="text-align:center;margin:0 0 24px;">' +
      '<a href="' + lenke + '" style="display:inline-block;background:#ff3b3b;color:#ffffff;text-decoration:none;' +
      'font-weight:700;font-size:16px;padding:15px 30px;border-radius:10px;">Legg igjen en anmeldelse</a>' +
      '<div style="font-size:12.5px;color:#7a7a83;margin-top:10px;">Tar 30 sekunder</div></div>'
    : "";

  var html = epostSkall(
    overskrift("Takk for turen" + (fornavn ? ", " + fornavn : "") + "!") +
    avsnitt("Håper kvelden ble akkurat så bra som dere fortjente.") +
    avsnitt("Én liten tjeneste? En anmeldelse på Google betyr enormt mye for at flere gjenger finner oss.") +
    knapp +
    avsnitt("Har dere bilder eller videoer fra turen? Tagg <strong>@norwayrob</strong> på TikTok eller Instagram — kanskje dere havner på kontoen.") +
    avsnitt("Neste tur? Dere vet hvor dere finner meg.")
  );

  var tekst = "Hei" + (fornavn ? " " + fornavn : "") + "!\n\n" +
    "Tusen takk for turen — håper kvelden ble akkurat så bra som dere fortjente.\n\n" +
    "Én liten tjeneste? En anmeldelse på Google tar 30 sekunder og betyr enormt mye:\n" +
    lenke + "\n\n" +
    "Har dere bilder fra turen? Tagg @norwayrob på TikTok eller Instagram.\n\n" +
    "Vi sees i Bergen!\nRob — NorwayRob\nnorwayrob.no";

  return { emne: "Takk for turen!", html: html, tekst: tekst };
}

/* ========================== FORHÅNDSVISNING ========================== */

function visForhaandsvisning(rad, type, e, mottaker, ekteMottaker) {
  var advarsel = TESTMODUS
    ? '<div class="test">TESTMODUS – sendes til deg selv (' + esc(mottaker) +
      '), ikke til ' + esc(ekteMottaker) + '</div>'
    : '';

  var html = '<!DOCTYPE html><html><head><base target="_top"><meta charset="utf-8"><style>' +
    'body{margin:0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#e9e9ee;}' +
    '.topp{position:sticky;top:0;background:#fff;border-bottom:1px solid #dcdce2;padding:14px 18px;z-index:2;}' +
    '.felt{font-size:13px;color:#4a4a52;margin-bottom:4px;}' +
    '.felt b{color:#0a0a0b;}' +
    '.test{background:#fff8e6;border:1px solid #f2dfa8;color:#6b5a1f;font-size:12.5px;' +
    'padding:8px 12px;border-radius:8px;margin:8px 0;font-weight:600;}' +
    '.knapper{margin-top:12px;display:flex;gap:10px;align-items:center;}' +
    'button{font-family:inherit;font-size:14px;font-weight:700;border:0;border-radius:8px;' +
    'padding:11px 20px;cursor:pointer;}' +
    '.send{background:#ff3b3b;color:#fff;} .send:disabled{opacity:.5;cursor:default;}' +
    '.avbryt{background:#e4e4ea;color:#0a0a0b;}' +
    '#status{font-size:13px;color:#4a4a52;}' +
    '</style></head><body>' +
    '<div class="topp">' +
      '<div class="felt"><b>Til:</b> ' + esc(mottaker) + '</div>' +
      '<div class="felt"><b>Emne:</b> ' + esc(e.emne) + '</div>' +
      advarsel +
      '<div class="knapper">' +
        '<button class="send" id="sendKnapp" onclick="send()">Send nå</button>' +
        '<button class="avbryt" onclick="google.script.host.close()">Avbryt</button>' +
        '<span id="status"></span>' +
      '</div>' +
    '</div>' +
    '<div>' + e.html + '</div>' +
    '<script>' +
    'function send(){' +
      'document.getElementById("sendKnapp").disabled=true;' +
      'document.getElementById("status").textContent="Sender…";' +
      'google.script.run' +
        '.withSuccessHandler(function(){google.script.host.close();})' +
        '.withFailureHandler(function(f){' +
          'document.getElementById("sendKnapp").disabled=false;' +
          'document.getElementById("status").textContent="Feil: "+f.message;})' +
        '.bekreftSending(' + rad + ',"' + type + '");' +
    '}' +
    '<\/script></body></html>';

  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(720).setHeight(760),
    "Forhåndsvisning – " + STEG_NAVN[type] + " (rad " + rad + ")"
  );
}

/* ========================== STATUSOVERSIKT ========================== */

function visStatus() {
  var ui = SpreadsheetApp.getUi();
  var mangler = [];
  if (!String(hentInnstilling("Kontonummer", "")).trim()) mangler.push("Kontonummer");
  if (!String(hentInnstilling("Telefon ved booking", "")).trim()) mangler.push("Telefon ved booking");
  if (!Number(hentInnstilling("Timepris (kr)", 0))) mangler.push("Timepris (kr)");

  var kvote = "ukjent";
  try { kvote = MailApp.getRemainingDailyQuota() + " e-poster igjen i dag"; } catch (e) {}

  ui.alert("NorwayRob – systemstatus",
    "Versjon: " + VERSJON + "\n\n" +
    "TESTMODUS: " + (TESTMODUS ? "PÅ – all e-post går til " + VARSEL_EPOST : "AV – e-post går til kunden") + "\n" +
    "Godkjenning før sending: " + (GODKJENNING_PAAKREVD ? "PÅ" : "AV") + "\n" +
    "Automatisk kvittering: " + (AUTOSVAR_PAA ? "PÅ" : "AV") + "\n\n" +
    "E-postkvote: " + kvote + "\n\n" +
    (mangler.length
      ? "MANGLER i fanen «Innstillinger»:\n• " + mangler.join("\n• ")
      : "Alle nødvendige innstillinger er fylt ut."),
    ui.ButtonSet.OK);
}

/* ========================== VARSEL OG AUTOSVAR ========================== */

function sendVarsel(data, detaljer) {
  try {
    var navn = data["Navn"] || "Ukjent";
    var anledning = data["Anledning"] || "buss";
    var linjer = [
      "Navn: " + (data["Navn"] || ""),
      "Telefon: " + (data["Telefon"] || ""),
      "E-post: " + (data["E-post"] || ""),
      "Anledning: " + (data["Anledning"] || ""),
      "Dato: " + (data["Dato"] || ""),
      "Tidsrom: " + (data["Tidsrom"] || ""),
      "Antall: " + (data["Antall personer"] || ""),
      "Hentested: " + (data["Hentested"] || ""),
      "Rute: " + (data["Rute"] || ""),
      "Ekstra ønsker: " + (data["Ekstra ønsker"] || ""),
      "Kilde: " + (data["Kilde"] || "")
    ];
    if (detaljer && detaljer.length) linjer.push("Detaljer: " + detaljer.join("  ·  "));

    MailApp.sendEmail(VARSEL_EPOST, "Ny forespørsel: " + anledning + " – " + navn,
      "Ny bussforespørsel fra nettsiden:\n\n" + linjer.join("\n") +
      "\n\nNeste steg: åpne regnearket, still deg i raden, og bruk menyen «NorwayRob».");
  } catch (err) {
    // Aldri stopp lagringen fordi e-post feiler
  }
}

function sendAutosvar(data) {
  try {
    if (!AUTOSVAR_PAA) return;
    var kontakt = String(data["E-post"] || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(kontakt)) return;

    var fornavn = String(data["Navn"] || "").trim().split(/\s+/)[0] || "";

    var html = epostSkall(
      merke("&#10003;&nbsp; Forespørselen er mottatt", "#eafaf0", "#177245") +
      overskrift("Takk" + (fornavn ? ", " + fornavn : "") + "!") +
      avsnitt("Vi går gjennom hver forespørsel selv, og sender deg en <strong>fast pris innen 24 timer</strong> — helt uforpliktende. Ingenting er bindende før du har bekreftet.") +
      detaljboks("DIN FORESPØRSEL", [
        ["Dato", data["Dato"]],
        ["Tidsrom", data["Tidsrom"]],
        ["Antall", data["Antall personer"]],
        ["Anledning", data["Anledning"]],
        ["Henting", data["Hentested"]],
        ["Rute", data["Rute"]]
      ]) +
      avsnitt("Spørsmål i mellomtiden? Bare svar på denne e-posten.")
    );

    var plain = "Takk" + (fornavn ? ", " + fornavn : "") + "!\n\n" +
      "Vi går gjennom hver forespørsel selv, og sender deg en fast pris innen 24 timer " +
      "– helt uforpliktende. Ingenting er bindende før du har bekreftet.\n\n" +
      "Spørsmål i mellomtiden? Bare svar på denne e-posten.\n\n" +
      "Vi sees i Bergen!\nRob – NorwayRob\nnorwayrob.no";

    MailApp.sendEmail({
      to: TESTMODUS ? VARSEL_EPOST : kontakt,
      subject: (TESTMODUS ? "[TEST → " + kontakt + "] " : "") + "Takk! Vi har mottatt forespørselen din – NorwayRob",
      htmlBody: html,
      body: plain,
      name: AVSENDER_NAVN,
      replyTo: VARSEL_EPOST
    });
  } catch (err) {
    // Aldri stopp lagringen fordi autosvar feiler
  }
}

/* ========================== HJELPERE ========================== */

function finnValgtRad() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ark = ss.getActiveSheet();

  if (ark.getName() !== ARK_NAVN) {
    ui.alert("Feil fane",
      "Gå til fanen «" + ARK_NAVN + "» og still deg i raden du vil sende for.",
      ui.ButtonSet.OK);
    return null;
  }
  var rad = ark.getActiveRange().getRow();
  if (rad < 2) {
    ui.alert("Velg en rad",
      "Klikk i raden til bookingen du vil sende for, og prøv igjen.",
      ui.ButtonSet.OK);
    return null;
  }
  if (!String(ark.getRange(rad, kol("Navn")).getValue() || "").trim()) {
    ui.alert("Tom rad", "Rad " + rad + " ser tom ut.", ui.ButtonSet.OK);
    return null;
  }
  return { ark: ark, rad: rad };
}

function radData(sheet, rad) {
  var verdier = sheet.getRange(rad, 1, 1, KOLONNER.length).getValues()[0];
  var d = {};
  for (var i = 0; i < KOLONNER.length; i++) d[KOLONNER[i]] = verdier[i];
  return d;
}

function hentFornavn(d) {
  return String(d["Navn"] || "").trim().split(/\s+/)[0] || "";
}

/** "kl. 19:00–01:00" → 6.  Returnerer 0 hvis sluttid mangler. */
function beregnTimer(tidsrom) {
  var s = String(tidsrom || "");
  var treff = s.match(/(\d{1,2}):(\d{2})/g);
  if (!treff || treff.length < 2) return 0;
  var a = treff[0].split(":"), b = treff[1].split(":");
  var start = Number(a[0]) * 60 + Number(a[1]);
  var slutt = Number(b[0]) * 60 + Number(b[1]);
  if (slutt <= start) slutt += 24 * 60;          // turen krysser midnatt
  return Math.round(((slutt - start) / 60) * 10) / 10;
}

function parseDato(v) {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  var s = String(v || "").trim();
  if (!s) return null;
  var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})$/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

var DAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
var MAANEDER = ["januar", "februar", "mars", "april", "mai", "juni",
                "juli", "august", "september", "oktober", "november", "desember"];

function langDato(d) {
  if (!d) return "";
  return DAGER[d.getDay()] + " " + d.getDate() + ". " + MAANEDER[d.getMonth()] + " " + d.getFullYear();
}

function kortDato(d) {
  if (!d) return "";
  return d.getDate() + ". " + MAANEDER[d.getMonth()];
}

function dagerFraIdag(d) {
  if (!d) return null;
  var idag = new Date();
  idag.setHours(0, 0, 0, 0);
  var m = new Date(d.getTime());
  m.setHours(0, 0, 0, 0);
  return Math.round((m - idag) / 86400000);
}

function kroner(n) {
  if (!n && n !== 0) return "";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}

function tallTekst(n) {
  return String(Math.round(n * 10) / 10).replace(".", ",");
}

function tidssone() {
  try { return SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(); }
  catch (e) { return "Europe/Oslo"; }
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function svar(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Samme svar som svar(), men pakket i et funksjonskall når nettsiden ber om
 * det. Funksjonsnavnet valideres strengt — vi setter aldri fritekst fra
 * spørringen inn i noe som kjøres som JavaScript.
 */
function svarJsonp(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback && /^[A-Za-z0-9_]{1,40}$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return svar(obj);
}
