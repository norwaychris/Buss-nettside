/**
 * NorwayRob – mottak av bussforespørsler i Google Sheets
 * -------------------------------------------------------
 * Denne koden limes inn i Google Apps Script (script.google.com),
 * knyttet til regnearket ditt. Se ../SETUP.md for full oppskrift.
 *
 * Hver forespørsel legges som en ny rad, og du får e-postvarsel.
 */

// E-post som skal varsles ved nye forespørsler:
var VARSEL_EPOST = "norwayrob@outlook.com";

// Navn på arkfanen som fylles ut:
var ARK_NAVN = "Bestillinger";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // unngå at to samtidige innsendinger krasjer

  try {
    var sheet = hentEllerLagArk();
    var data = (e && e.parameter) ? e.parameter : {};

    // Bygg/oppdater kolonneoverskrifter dynamisk
    var headers = hentHeaders(sheet);
    var felt = Object.keys(data);
    var nyeHeaders = false;

    felt.forEach(function (key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        nyeHeaders = true;
      }
    });
    if (headers.indexOf("Mottatt") === -1) {
      headers.unshift("Mottatt");
      nyeHeaders = true;
    }
    if (nyeHeaders || sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Bygg rad i riktig kolonnerekkefølge
    var rad = headers.map(function (h) {
      if (h === "Mottatt") return new Date();
      return data[h] || "";
    });
    sheet.appendRow(rad);

    sendVarsel(data);

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
  if (!sheet) sheet = ss.insertSheet(ARK_NAVN);
  return sheet;
}

function hentHeaders(sheet) {
  if (sheet.getLastRow() === 0) return [];
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String);
}

function sendVarsel(data) {
  try {
    var navn = data["Navn"] || "Ukjent";
    var anledning = data["Anledning"] || "buss";
    var emne = "Ny forespørsel: " + anledning + " – " + navn;

    var linjer = Object.keys(data).map(function (k) {
      return k + ": " + data[k];
    });
    var melding =
      "Ny bussforespørsel fra nettsiden:\n\n" +
      linjer.join("\n") +
      "\n\n(Registrert automatisk i regnearket.)";

    MailApp.sendEmail(VARSEL_EPOST, emne, melding);
  } catch (err) {
    // Ikke stopp lagringen om e-post feiler
  }
}

function svar(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
