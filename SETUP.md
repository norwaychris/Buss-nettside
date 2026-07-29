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
