/**
 * NorwayRob – mottak av bussforespørsler i Google Sheets
 * -------------------------------------------------------
 * Limes inn i Google Apps Script (Utvidelser → Apps Script) i regnearket ditt.
 * Se ../SETUP.md for full oppskrift.
 *
 * Hver forespørsel legges som en ny, ferdig formatert rad – og du får e-postvarsel.
 */

// E-post som skal varsles ved nye forespørsler:
var VARSEL_EPOST = "norwayrob@outlook.com";

// Navn på arkfanen som fylles ut:
var ARK_NAVN = "Bestillinger";

// Faste kolonner i ønsket rekkefølge:
var KOLONNER = [
  "Mottatt", "Status", "Navn", "Kontakt", "Anledning",
  "Dato", "Alternativ dato", "Tidsrom", "Antall personer",
  "Hentested", "Rute", "Anledning-detaljer", "Ekstra ønsker",
  "Kilde", "Betalt (kr)", "Notat"
];

// Skjemafelt som har sin egen kolonne (resten samles i "Anledning-detaljer"):
var KJENTE_FELT = {
  "Navn": 1, "Kontakt": 1, "Anledning": 1, "Dato": 1, "Alternativ dato": 1,
  "Tidsrom": 1, "Antall personer": 1, "Hentested": 1, "Rute": 1,
  "Ekstra ønsker": 1, "Kilde": 1
};

// Valg i Status-nedtrekkslista:
var STATUS_VALG = ["Ny", "Tilbud sendt", "Betalt", "Fullført", "Avlyst"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var sheet = hentEllerLagArk();
    var data = (e && e.parameter) ? e.parameter : {};

    // Samle ukjente felt (anledning-oppfølging) i én lesbar tekst
    var detaljer = [];
    for (var key in data) {
      if (!KJENTE_FELT[key] && key !== "Anledning" && data[key]) {
        detaljer.push(key + ": " + data[key]);
      }
    }

    var rad = KOLONNER.map(function (kol) {
      if (kol === "Mottatt") return new Date();
      if (kol === "Status") return "Ny";
      if (kol === "Anledning-detaljer") return detaljer.join("  ·  ");
      if (kol === "Betalt (kr)" || kol === "Notat") return "";
      return data[kol] || "";
    });

    sheet.appendRow(rad);
    formaterRad(sheet, sheet.getLastRow());
    sendVarsel(data, detaljer);

    return svar({ status: "ok" });
  } catch (err) {
    return svar({ status: "error", message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Enkel test-side hvis du åpner URL-en i nettleseren
function doGet() {
  return svar({ status: "ok", message: "NorwayRob booking-endpoint er live." });
}

function hentEllerLagArk() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ARK_NAVN);

  // Har vi et ark med gammelt/annet oppsett? Flytt det trygt til side.
  if (sheet && sheet.getLastRow() > 0 && !headerStemmer(sheet)) {
    var nyttNavn = ARK_NAVN + " (gammel)";
    var n = 2;
    while (ss.getSheetByName(nyttNavn)) { nyttNavn = ARK_NAVN + " (gammel " + (n++) + ")"; }
    sheet.setName(nyttNavn);
    sheet = null;
  }

  if (!sheet) sheet = ss.getSheetByName(ARK_NAVN) || ss.insertSheet(ARK_NAVN);
  if (sheet.getLastRow() === 0) settOppArk(sheet);
  return sheet;
}

function headerStemmer(sheet) {
  var rad = sheet.getRange(1, 1, 1, KOLONNER.length).getValues()[0];
  return rad.join("|") === KOLONNER.join("|");
}

function settOppArk(sheet) {
  sheet.clear();

  // Overskrifter
  sheet.getRange(1, 1, 1, KOLONNER.length).setValues([KOLONNER]);
  sheet.getRange(1, 1, 1, KOLONNER.length)
    .setBackground("#ff3b3b").setFontColor("#ffffff")
    .setFontWeight("bold").setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);

  // Kolonnebredder
  var bredder = {
    "Mottatt": 140, "Status": 110, "Navn": 150, "Kontakt": 160, "Anledning": 140,
    "Dato": 100, "Alternativ dato": 110, "Tidsrom": 190, "Antall personer": 80,
    "Hentested": 170, "Rute": 200, "Anledning-detaljer": 260, "Ekstra ønsker": 220,
    "Kilde": 120, "Betalt (kr)": 100, "Notat": 200
  };
  for (var i = 0; i < KOLONNER.length; i++) {
    if (bredder[KOLONNER[i]]) sheet.setColumnWidth(i + 1, bredder[KOLONNER[i]]);
  }

  var maxRader = sheet.getMaxRows() - 1;

  // Dato + tid-format på "Mottatt"
  sheet.getRange(2, kol("Mottatt"), maxRader, 1).setNumberFormat("dd.MM.yyyy  HH:mm");
  // Valuta på "Betalt (kr)"
  sheet.getRange(2, kol("Betalt (kr)"), maxRader, 1).setNumberFormat("#,##0 \"kr\"");

  // Nedtrekksliste for Status
  var regel = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUS_VALG, true).setAllowInvalid(false).build();
  sheet.getRange(2, kol("Status"), maxRader, 1).setDataValidation(regel);

  // Vekslende radfarger for lesbarhet
  try {
    sheet.getRange(1, 1, sheet.getMaxRows(), KOLONNER.length)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  } catch (e) {}
}

function formaterRad(sheet, r) {
  sheet.getRange(r, 1, 1, KOLONNER.length).setVerticalAlignment("top").setWrap(true);
}

function kol(navn) {
  return KOLONNER.indexOf(navn) + 1;
}

function sendVarsel(data, detaljer) {
  try {
    var navn = data["Navn"] || "Ukjent";
    var anledning = data["Anledning"] || "buss";
    var emne = "Ny forespørsel: " + anledning + " – " + navn;

    var linjer = [
      "Navn: " + (data["Navn"] || ""),
      "Kontakt: " + (data["Kontakt"] || ""),
      "Anledning: " + (data["Anledning"] || ""),
      "Dato: " + (data["Dato"] || "") +
        (data["Alternativ dato"] ? "  (alt: " + data["Alternativ dato"] + ")" : ""),
      "Tidsrom: " + (data["Tidsrom"] || ""),
      "Antall: " + (data["Antall personer"] || ""),
      "Hentested: " + (data["Hentested"] || ""),
      "Rute: " + (data["Rute"] || ""),
      "Ekstra ønsker: " + (data["Ekstra ønsker"] || ""),
      "Kilde: " + (data["Kilde"] || "")
    ];
    if (detaljer && detaljer.length) linjer.push("Detaljer: " + detaljer.join("  ·  "));

    MailApp.sendEmail(VARSEL_EPOST, emne,
      "Ny bussforespørsel fra nettsiden:\n\n" + linjer.join("\n") +
      "\n\nRegistrert i regnearket (fane: " + ARK_NAVN + ").");
  } catch (err) {
    // Ikke stopp lagringen om e-post feiler
  }
}

function svar(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
