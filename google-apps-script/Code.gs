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

// Automatisk kvittering til kunden (kun hvis de oppga e-postadresse):
var AUTOSVAR_PAA = true;            // sett til false for å skru av
var AVSENDER_NAVN = "NorwayRob";    // vises som avsendernavn hos kunden

// Navn på arkfanen som fylles ut:
var ARK_NAVN = "Bestillinger";

// Faste kolonner i ønsket rekkefølge:
var KOLONNER = [
  "Mottatt", "Status", "Navn", "Kontakt", "Anledning",
  "Dato", "Tidsrom", "Antall personer",
  "Hentested", "Rute", "Anledning-detaljer", "Ekstra ønsker",
  "Kilde", "Betalt (kr)", "Notat"
];

// Skjemafelt som har sin egen kolonne (resten samles i "Anledning-detaljer"):
var KJENTE_FELT = {
  "Navn": 1, "Kontakt": 1, "Anledning": 1, "Dato": 1,
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
    sendAutosvar(data);

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
    "Dato": 100, "Tidsrom": 190, "Antall personer": 80,
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
      "Dato: " + (data["Dato"] || ""),
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

// Automatisk kvittering til kunden – kun hvis "Kontakt" er en e-postadresse.
function sendAutosvar(data) {
  try {
    if (!AUTOSVAR_PAA) return;
    var kontakt = (data["Kontakt"] || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(kontakt)) return; // ser ikke ut som e-post → hopp over

    var fornavn = (data["Navn"] || "").trim().split(/\s+/)[0] || "";
    var emne = "Takk! Vi har mottatt forespørselen din – NorwayRob";

    function rad(l, v) {
      if (!v) return "";
      return '<tr><td style="padding:6px 0;color:#7a7a83;width:118px;">' + l +
        '</td><td style="padding:6px 0;font-weight:600;color:#0a0a0b;">' + v + '</td></tr>';
    }
    var detaljer =
      rad("Dato", data["Dato"]) +
      rad("Tidsrom", data["Tidsrom"]) +
      rad("Antall", data["Antall personer"]) +
      rad("Anledning", data["Anledning"]) +
      rad("Henting", data["Hentested"]) +
      rad("Rute", data["Rute"]);

    var html =
    '<div style="background:#f2f2f5;padding:28px 14px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 40px rgba(10,10,11,.12);">' +
        '<div style="background:#0a0a0b;padding:26px 30px;text-align:center;">' +
          '<div style="font-size:24px;font-weight:800;letter-spacing:1px;color:#ffffff;">NORWAY<span style="color:#ff3b3b;">ROB</span></div>' +
          '<div style="font-size:10px;letter-spacing:3px;color:#8a8a92;margin-top:4px;">BUSS TIL LEIE &middot; BERGEN</div>' +
        '</div>' +
        '<div style="height:3px;background:#ff3b3b;"></div>' +
        '<div style="padding:32px 30px 8px;">' +
          '<div style="text-align:center;margin-bottom:18px;"><span style="display:inline-block;background:#eafaf0;color:#177245;font-size:13px;font-weight:700;padding:7px 16px;border-radius:999px;">&#10003;&nbsp; Forespørselen er mottatt</span></div>' +
          '<h1 style="font-size:22px;color:#0a0a0b;margin:0 0 12px;text-align:center;">Takk' + (fornavn ? ", " + fornavn : "") + '!&nbsp;&#127881;</h1>' +
          '<p style="font-size:15px;line-height:1.7;color:#4a4a52;margin:0 0 22px;text-align:center;">Vi har mottatt forespørselen din og sender deg en <strong>fast pris innen 24 timer</strong> &mdash; helt uforpliktende.</p>' +
          (detaljer ?
          '<div style="background:#f7f7f9;border:1px solid #ececf0;border-radius:14px;padding:18px 22px;margin-bottom:22px;">' +
            '<div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#ff3b3b;margin-bottom:8px;">DIN FORESP&Oslash;RSEL</div>' +
            '<table style="width:100%;border-collapse:collapse;font-size:14.5px;">' + detaljer + '</table>' +
          '</div>' : '') +
          '<p style="font-size:14px;line-height:1.65;color:#4a4a52;margin:0 0 26px;text-align:center;">Spørsmål i mellomtiden? Bare svar på denne e-posten.</p>' +
        '</div>' +
        '<div style="border-top:1px solid #ececf0;padding:18px 30px 24px;text-align:center;">' +
          '<div style="font-size:13px;font-weight:800;color:#0a0a0b;">Vi sees i Bergen!&nbsp;&#128652;</div>' +
          '<div style="font-size:12.5px;color:#7a7a83;margin-top:5px;">Rob &mdash; NorwayRob &middot; norwayrob.no</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    var plain = "Takk" + (fornavn ? ", " + fornavn : "") + "!\n\n" +
      "Vi har mottatt forespørselen din og sender deg en fast pris innen 24 timer – helt uforpliktende.\n\n" +
      "Spørsmål i mellomtiden? Bare svar på denne e-posten.\n\n" +
      "Vi sees i Bergen!\nRob – NorwayRob\nnorwayrob.no";

    MailApp.sendEmail({
      to: kontakt,
      subject: emne,
      htmlBody: html,
      body: plain,
      name: AVSENDER_NAVN,
      replyTo: VARSEL_EPOST
    });
  } catch (err) {
    // Ikke stopp lagringen om autosvar feiler
  }
}

function svar(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
