# 🚌 NorwayRob — buss til leie i Bergen

Nettsiden på **[norwayrob.no](https://norwayrob.no)**. Folk fyller ut en enkel
forespørsel (dato, tidsrom, hentested, antall, anledning …), og forespørselen
havner automatisk i et Google Sheets-regneark, med e-postvarsel til
**norwayrob@outlook.com** og en automatisk kvittering til kunden.

Statisk nettside — ren HTML, CSS og JavaScript. Ingen byggesteg, ingen
rammeverk, ingen avhengigheter.

---

## 📚 Prosjektets kunnskapsbase

**Start her.** Alt om hvorfor prosjektet er som det er, ligger i
[`docs/`](docs/):

| Dokument | Innhold |
|---|---|
| [`docs/MASTER_CONTEXT.md`](docs/MASTER_CONTEXT.md) | Kilden til sannhet — hva som finnes og hva som er sant nå |
| [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) | Hva vi bygger, for hvem, og hvorfor |
| [`docs/BUSINESS.md`](docs/BUSINESS.md) | Forretningsmodell, priser, kundereise, juss |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Hva som skal gjøres, i rekkefølge |
| [`docs/BRAND_GUIDE.md`](docs/BRAND_GUIDE.md) | Farger, font, tone, stemme |
| [`docs/COPYWRITING_GUIDE.md`](docs/COPYWRITING_GUIDE.md) | Hvordan vi skriver |
| [`docs/UX_GUIDELINES.md`](docs/UX_GUIDELINES.md) | Kundereisen og skjemaet |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Tokens og verdier |
| [`docs/UI_GUIDELINES.md`](docs/UI_GUIDELINES.md) | Hvordan tokens brukes |
| [`docs/COMPONENT_GUIDE.md`](docs/COMPONENT_GUIDE.md) | Alle komponenter |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Hvordan systemet henger sammen |
| [`docs/CODE_STYLE.md`](docs/CODE_STYLE.md) | Kodekonvensjoner |
| [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) | Grener, commits, publisering |
| [`docs/SEO_GUIDE.md`](docs/SEO_GUIDE.md) | Søkeord, schema, teknisk SEO |
| [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) | Ytelsesbudsjetter og bilderegler |
| [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md) | WCAG 2.1 AA |
| [`docs/PROJECT_INSTRUCTIONS.md`](docs/PROJECT_INSTRUCTIONS.md) | Hvordan man jobber i dette prosjektet |
| [`docs/AI_RULES.md`](docs/AI_RULES.md) | Faste regler for AI-agenter |

[`CLAUDE.md`](CLAUDE.md) i roten lastes automatisk av Claude Code ved hver økt.

---

## ⚠️ Publisering — les dette først

Det finnes **to grener**, og de gjør ulike ting:

| Gren | Hva som skjer ved push |
|---|---|
| `live` | **Publiseres til norwayrob.no** via GitHub Actions |
| `claude/norwayrob-booking-site-kc64ih` | **Publiseres ikke.** Her utvikles alt. |

Endringer går aldri live med én gang. De utvikles på utkast-grenen, vurderes, og
publiseres først når Rob eksplisitt ber om det:

```bash
git checkout live
git merge claude/norwayrob-booking-site-kc64ih
git push -u origin live
git checkout claude/norwayrob-booking-site-kc64ih
```

> **Viktig:** GitHub Pages viser kun den *sist* publiserte versjonen i hele
> repoet, uansett gren. Det må derfor aldri finnes mer enn én deploy-workflow.
> Se [`docs/DEVELOPMENT_WORKFLOW.md`](docs/DEVELOPMENT_WORKFLOW.md) §6.

---

## Filer

| Fil / mappe | Hva |
|---|---|
| `index.html` | Forsiden — hero, tillitsstripe, skjema, FAQ |
| `om.html` | Om Rob |
| `vilkar.html` | Vilkår og avbestilling |
| `personvern.html` | Personvernerklæring |
| `404.html` | Egen 404-side |
| `styles.css` | Alt design (mørkt tema med rød aksent) |
| `script.js` | Skjemalogikk og innsending |
| `google-apps-script/Code.gs` | Koden som tar imot forespørsler i regnearket |
| `tilbud/` | Ferdige HTML-e-poster (tilbud, påminnelse, takk) |
| `TILBUDSMAL.md` | Alle e-postmaler som ren tekst + huskeliste |
| `SETUP.md` | Engangsoppsett: koble skjemaet til Google Sheets |
| `images/` | `hero.jpg` og `rob.jpg` |
| `googleb42a97d75978e695.html` | Google Search Console — **må aldri slettes** |
| `CNAME` | Domenet norwayrob.no — **må aldri slettes** |

---

## Kjøre lokalt

```bash
python3 -m http.server 8000
# åpne http://localhost:8000
```

Bruk en server, ikke åpne filene direkte — `file://` gir feil oppførsel på
lenker, skjema og fonter.

---

## Vanlige oppgaver

**Endre tekst, tall eller spørsmål** — rediger direkte i HTML-filene. Husk at
FAQ-spørsmålene finnes to steder: i markupen og i `FAQPage`-blokken nederst i
`index.html`. Begge må endres.

**Endre farger eller font** — variablene øverst i `styles.css` (`:root`).

**Legge til en anledning** — legg til en chip i `index.html` og en tilsvarende
nøkkel i `FOLLOWUPS` øverst i `script.js`. Regnearket trenger ingen endring.

**Etter endring i `styles.css` eller `script.js`** — øk versjonsnummeret
(`?v=N`) i **alle fem** HTML-filene, ellers ser folk den gamle versjonen:

```bash
grep -o 'styles.css?v=[0-9]*' *.html | cut -d: -f2 | sort -u   # skal gi én linje
```

**Etter endring i `Code.gs`** — Rob må lime inn koden på nytt i Apps Script og
kjøre *Deploy → Manage deployments → blyant → New version → Deploy*.
Se [`SETUP.md`](SETUP.md).
