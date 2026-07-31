# Tilbudsmal — svar på bussforespørsler

Internt dokument. Kopier teksten under, bytt ut [feltene], og send.
**Ikke legg ekte kontonummer inn i denne filen** — fyll det inn i e-posten hver gang.

---

---

## ✨ Premium HTML-versjon (anbefalt)

I mappen `tilbud/` ligger to ferdigdesignede e-poster som ser ut som en
premium ordrebekreftelse (svart merkevare-topp, prisboks, 1-2-3-steg):

- `tilbud/tilbud-epost.html` — standard (avreise MER enn 14 dager frem)
- `tilbud/tilbud-epost-kortvarsel.html` — kort varsel (UNDER 14 dager)

**Slik bruker du den (2 minutter):**

1. Åpne riktig fil i nettleseren (dobbeltklikk på fila).
2. Marker alt (Ctrl/Cmd + A) og kopier (Ctrl/Cmd + C).
3. Lim inn i en ny e-post i Outlook (Ctrl/Cmd + V) — designet blir med.
4. Bytt ut alle [feltene] direkte i e-posten: navn, dato, pris,
   kontonummer, frist osv. Søk etter «[» så finner du alle.
5. Send!

Tekstversjonen over fungerer alltid som backup hvis liming ikke ser bra ut.

---

## Standard tilbud (avreise MER enn 14 dager frem)

```
Emne: Tilbud – bussleie [dato] 🚌

Hei [navn]!

Takk for forespørselen — dette blir gøy! Her er tilbudet deres:

🚌 Dato: [lørdag 8. august]
🕗 Tid: [kl. 19:00–01:00] ([6] timer)
📍 Henting: [hentested] → [rute/mål]
👥 Antall: [25] personer
🎉 Anledning: [utdrikningslag]

💰 Fast pris: [8 500] kr
Alt inkludert — sjåfør, drivstoff, lydanlegg og vask.

SLIK BEKREFTER DERE DATOEN:
Betal til kontonummer [XXXX.XX.XXXXX] og merk betalingen
«[navn + dato]» — innen [frist].
Datoen er reservert dere så snart betalingen er mottatt.
Da sender jeg bekreftelse!

Gratis avbestilling og fri flytting av dato inntil 14 dager
før avreise. Fullstendige vilkår: norwayrob.no/vilkar.html

Gleder meg til å kjøre dere! 🎉
Rob — NorwayRob
norwayrob.no · TikTok @norwayrob
```

---

## Kort varsel (avreise MINDRE enn 14 dager frem)

Samme mal, men:

1. **Sett kort betalingsfrist** — f.eks. 48 timer, eller senest 2 dager før avreise.
2. **Bytt ut avbestillingslinjen** med denne (viktig, juridisk):

```
Merk: siden avreise er om under 14 dager, refunderes ikke
beløpet ved avbestilling etter betaling — se
norwayrob.no/vilkar.html
```

---

## Bedrift (faktura)

Samme mal, men bytt «Slik bekrefter dere»-delen med:

```
SLIK BEKREFTER DERE DATOEN:
Send meg organisasjonsnummer og fakturaadresse, så sender
jeg faktura med forfall [dato — før avreise]. Datoen er
reservert når fakturaen er akseptert.
```

---

## Når betalingen er mottatt — send bekreftelse

```
Emne: Bekreftet! Bussen er deres [dato] ✅

Hei [navn]!

Betalingen er mottatt — datoen er deres! 🎉

🚌 [Dato], [tid]
📍 Henting: [hentested]

Nærmere avreise tar jeg kontakt for å avtale siste detaljer.
Spørsmål i mellomtiden? Bare svar på denne e-posten.

Vi sees!
Rob — NorwayRob
```

---

---

## Etter turen — takk + anmeldelse (send dagen etter)

**HTML-versjon (anbefalt):** `tilbud/takk-epost.html` — åpne i nettleser,
kopier alt, lim inn i Outlook, bytt [Navn]. Anmeldelses-lenken er ferdig
lagt inn.

Tekstversjon (backup):

```
Emne: Takk for turen! 🎉

Hei [navn]!

Tusen takk for turen — håper kvelden ble akkurat så bra som
dere fortjente!

Én liten tjeneste? En anmeldelse på Google tar 30 sekunder og
betyr enormt mye for at flere gjenger finner oss:

⭐ https://g.page/r/CaOsA5S43vnjEBM/review

Har dere bilder eller videoer fra turen? Tagg @norwayrob på
TikTok eller Instagram — kanskje dere havner på kontoen! 📸

Neste tur? Dere vet hvor dere finner meg.

Vi sees i Bergen!
Rob — NorwayRob
norwayrob.no
```

Tips: send den dagen etter turen, mens stemningen fortsatt sitter.
Anmeldelser er det som løfter dere mest i «leie buss bergen»-søket.

---

## Huskeliste per booking

- [ ] Svar innen 24 timer (det lover nettsiden!)
- [ ] Riktig avbestillingslinje (over/under 14 dager)
- [ ] Frist satt (standard: 7 dager, kort varsel: 48 t)
- [ ] Oppdater Google-arket: Status + Betalt (kr) når pengene er inne
- [ ] Send bekreftelses-e-post
- [ ] Dagen etter turen: send takk-e-post med anmeldelses-lenken
