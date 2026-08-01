# Oppsett — slik får du bestillingene inn i Google Sheets

Nettsiden er ferdig. For at forespørslene skal havne i et regneark (og du får
e-postvarsel til **norwayrob@outlook.com**), gjør du dette **én gang**. Tar ~10 min.

> Før du er ferdig med stegene fungerer skjemaet likevel — da åpner det e-post
> til norwayrob@outlook.com i stedet. Etter oppsettet går alt rett i regnearket.

---

## Steg 1 — Lag regnearket
1. Gå til [sheets.google.com](https://sheets.google.com) og lag et nytt, tomt regneark.
2. Kall det f.eks. **«NorwayRob bestillinger»**.

## Steg 2 — Lim inn scriptet
1. I regnearket: **Utvidelser → Apps Script**.
2. Slett all eksempelkode i editoren.
3. Åpne fila [`google-apps-script/Code.gs`](google-apps-script/Code.gs) her i prosjektet,
   kopier **alt** innholdet, og lim det inn i Apps Script-editoren.
4. Trykk **Lagre** (diskett-ikonet).

## Steg 3 — Publiser som web-app
1. Trykk **Deploy → New deployment** (øverst til høyre).
2. Ved «Select type» (tannhjulet) → velg **Web app**.
3. Fyll inn:
   - **Description:** NorwayRob booking
   - **Execute as:** *Me* (deg selv)
   - **Who has access:** **Anyone**  ← viktig, ellers blokkeres skjemaet
4. Trykk **Deploy**.
5. Godkjenn tilgangene når Google spør (velg kontoen din → *Advanced* →
   *Go to … (unsafe)* → *Allow*). Dette er trygt — det er ditt eget script.
6. Kopier **Web app URL**-en (ser ut som
   `https://script.google.com/macros/s/AKfyc.../exec`).

## Steg 4 — Koble lenken til nettsiden
1. Åpne [`script.js`](script.js) her i prosjektet.
2. Helt øverst, lim URL-en inn mellom anførselstegnene:
   ```js
   const BOOKING_ENDPOINT = "https://script.google.com/macros/s/AKfyc.../exec";
   ```
3. Lagre, commit og push. Ferdig! ✅

## Slik virker det
- Hver forespørsel blir en ny rad i arkfanen **«Bestillinger»**.
- Overskriftene lages automatisk ut fra feltene i skjemaet.
- Du får e-postvarsel til **norwayrob@outlook.com** for hver forespørsel.
- Kunden får automatisk kvittering med en gang.

---

# Slik driver du bookingen fra regnearket

Etter at scriptet er limt inn og publisert, får du en egen meny som heter
**NorwayRob** øverst i regnearket, ved siden av «Hjelp».

> Ser du den ikke? Last siden på nytt (F5). Menyen lages når regnearket åpnes.

## Steg 0 — engangsoppsett

1. Trykk **NorwayRob → Sett opp / reparer arkene**.
   Da lages fanen **«Innstillinger»**, og «Bestillinger» får tre nye kolonner:
   `Pris (kr)`, `Timer` og `Sendt`. **Eksisterende bookinger blir stående** —
   ingenting slettes eller flyttes.
2. Gå til fanen **«Innstillinger»** og fyll ut minst disse tre:

   | Innstilling | Hva du skriver |
   |---|---|
   | `Timepris (kr)` | Hva én time skal koste kunden |
   | `Kontonummer` | Kontoen kundene skal betale til |
   | `Telefon ved booking` | Nummeret ditt — vises **kun** i bekreftelse og påminnelse, aldri på nettsiden |

   De øvrige har fornuftige standardverdier du kan justere når du vil.
3. Trykk **NorwayRob → Status for systemet** for å sjekke at alt er på plass.

## Slik sender du en e-post

**Klikk i raden** til bookingen det gjelder, og velg fra menyen. Alt går ut fra
raden du står i.

| Meny | Når | Krever |
|---|---|---|
| ① Foreslå pris | Når du skal prise en ny forespørsel | Timepris + at «Timer» er utfylt |
| ② Send tilbud | Når prisen er satt | Pris, dato, e-post, kontonummer |
| ③ Send betalingspåminnelse | Når halve fristen har gått uten betaling | Samme som tilbud |
| ④ Send bekreftelse | Når pengene er på konto | Dato og hentested |
| ⑤ Send påminnelse før tur | 2–3 dager før turen | Dato og hentested |
| ⑥ Send takk + anmeldelse | Dagen etter turen | Dato |

Du får alltid **se e-posten før den sendes**, med en «Send nå»-knapp.
Etter sending oppdateres `Status` automatisk, og `Sendt`-kolonnen får en linje
med hva som ble sendt og når — så du aldri er i tvil om hva kunden har fått.

### Om prisforslaget

Systemet regner ut `Timer` fra tidsrommet kunden oppga, og ganger med timeprisen
din (minst «Minimum timer»). **Det er bare et forslag** — du kan overskrive tallet
i `Pris (kr)` fritt før du sender.

Lot kunden sluttiden stå tom (f.eks. tur til Voss), står `Timer` tom. Skriv inn
antall timer selv, så virker prisforslaget.

### Tilbudet tilpasser seg selv

Er det **under 14 dager** til avreise, bytter tilbudet automatisk til kortvarsel-
utgaven: kortere betalingsfrist og en tydelig boks om at beløpet ikke refunderes.
Du trenger ikke velge mal.

## De to bryterne du må kjenne til

Helt øverst i `Code.gs`:

```js
var TESTMODUS = true;              // all e-post går til deg selv
var GODKJENNING_PAAKREVD = true;   // du ser e-posten før den sendes
```

**`TESTMODUS`** er sikkerhetsnettet. Så lenge den er `true`, går **all** e-post
til deg — også den automatiske kvitteringen — med `[TEST → kunde@…]` foran emnet.
Kunden får ingenting. Slik kan du kjøre gjennom hele flyten på en ekte rad uten
at noen får en betalingsoppfordring.

> **La den stå på `true` til bussen er kjøpt og løyvet innvilget.** Et tilbud ber
> om penger til kontoen din. Går det til en ekte kunde før vi kan levere, sitter
> du med andres penger uten buss.

Når du er klar: sett den til `false`, lagre, og **Deploy → Manage deployments →
blyant → New version → Deploy**.

**`GODKJENNING_PAAKREVD`** styrer forhåndsvisningen. Sett den til `false` den
dagen du stoler på malene og vil at menyen skal sende direkte.

## Kontonummer og telefonnummer

De ligger **kun** i fanen «Innstillinger» — aldri i koden, aldri på nettsiden,
aldri på GitHub. Trenger du å endre dem, gjør du det i regnearket, og det virker
med en gang uten ny publisering.

## Endre varsel-adressen
Øverst i `google-apps-script/Code.gs`:
```js
var VARSEL_EPOST = "norwayrob@outlook.com";
```
Bytt adresse, lagre, og lag en **ny deployment** (Deploy → Manage deployments →
blyant → Version: *New version* → Deploy).

## Hvis du endrer scriptet senere
Apps Script bruker den versjonen du publiserte. Etter endringer:
**Deploy → Manage deployments → (blyant) → New version → Deploy.**
URL-en holder seg lik, så du trenger ikke bytte den i `script.js`.
