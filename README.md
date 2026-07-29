# 🚌 NorwayRob — buss til leie i Bergen

Landingsside og bestillingsskjema for NorwayRob. Folk fyller ut en enkel
forespørsel (dato, hentested, antall, anledning …), og forespørselen havner
automatisk i et Google Sheets-regneark + som e-postvarsel til
**norwayrob@outlook.com**.

## Filer

| Fil | Hva |
|-----|-----|
| `index.html` | Selve nettsiden (hero, «slik booker du», skjema, anmeldelser) |
| `styles.css` | Design (mørkt tema med rød aksent) |
| `script.js` | Skjema-logikk + innsending til Google Sheets |
| `google-apps-script/Code.gs` | Koden som mottar forespørsler i regnearket |
| `SETUP.md` | **Steg-for-steg: koble skjemaet til Google Sheets** |
| `images/` | Legg bildet av Rob her (`images/rob.jpg`) |
| `kart.html` / `kart.css` / `kart.js` | Den gamle kart- og prisberegning-siden (bevart) |

## Kom i gang

1. **Koble bestillingene til Google Sheets** — følg [`SETUP.md`](SETUP.md) (~10 min).
   Før det er gjort virker skjemaet likevel: da åpnes e-post til
   norwayrob@outlook.com i stedet.
2. **Legg inn bilde** — legg `images/rob.jpg` (se [`images/README.md`](images/README.md)).
3. **Publiser** — pushes automatisk til GitHub Pages ved push til
   `claude/norwayrob-booking-site-kc64ih` (se `.github/workflows/deploy.yml`).
   Sørg for at GitHub Pages-kilden i repo-innstillingene står på **GitHub Actions**.

## Kjøre lokalt

Alt er statiske filer. Start en enkel server:

```bash
python3 -m http.server 8000
# åpne http://localhost:8000
```

## Tilpasse innhold

- **Tekst / tall / anmeldelser:** rediger direkte i `index.html`.
- **Anledninger og oppfølgingsspørsmål:** objektet `FOLLOWUPS` øverst i `script.js`.
  Feltnavnene der blir kolonneoverskrifter i regnearket.
- **Farger / font:** variablene øverst i `styles.css` (`:root`).
