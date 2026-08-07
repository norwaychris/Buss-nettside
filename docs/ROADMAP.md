# ROADMAP.md

**Hva som skal gjøres, i hvilken rekkefølge, og hvorfor akkurat den.**

Alt måles mot nordstjernen i `PRODUCT_VISION.md`:

> Innen 12 måneder: bevist lønnsom drift med jevn etterspørsel.

Rekkefølgen er ikke etter hvor gøy noe er å bygge, men etter hva som blokkerer
mest. Juridisk risiko først, deretter det som gjør driften mulig, deretter det
som gjør den lønnsom, deretter det som gjør den større.

Sist oppdatert: 1. august 2026

---

## Fase 0 — Rydde opp før mer trafikk kommer ✅ FERDIG 1. august 2026

### 0.1 Organisasjonsnummer på siden ✅

Org.nr **931 870 106** lagt inn i footeren på alle fire sider med footer, i
`vilkar.html` (egen seksjon «Kontakt og selskapsopplysninger»), i
`personvern.html` (behandlingsansvarlig) og som `identifier` i
`LocalBusiness`-schema. Oppfyller *e-handelsloven § 8*.

Samtidig ble omtalen av løyve og forsikring tatt ut av siden (footer, FAQ,
om-siden, vilkårene og tilbudsmalene). Prinsippet er beskrevet i `BUSINESS.md`
§2a: **oppgi det som kan etterprøves, ikke det som må tros på.**

> **Gjenstår:** løyvenummeret legges inn ved siden av org.nr når løyvet
> innvilges. Da står det to oppslagbare opplysninger i footeren.

### 0.2 Fjerne påstander vi ikke kan holde ✅

Alle formuleringer som impliserte garantert tilgjengelighet eller automatisk
reservasjon er omskrevet. Full oversikt over før/etter i `BUSINESS.md` §10.
`priceRange: "$$"` er fjernet fra JSON-LD.

### 0.3 Rydde interne motsigelser ✅

- `README.md` skrevet om — den påsto at push til utkast-grenen publiserer, og
  viste til slettede kart-filer
- «15+ års erfaring» → «15 år bak rattet» overalt
- «svarer raskt» → «innen 24 timer» i FAQ og JSON-LD
- `sitemap.xml` `lastmod` oppdatert til 2026-08-01
- Knappeteksten etter innsending (`script.js`) rettet — leses nå fra HTML i
  stedet for å være hardkodet feil

---

## Fase 1 — Gjøre driften mulig

Uten disse kan ikke første ekte kunde håndteres forsvarlig.

### 1.0 Løyvet innvilget 🔴

Forutsetningen for all drift — ingen tur kjøres før det er på plass. Blokkerer
resten av fase 1. **Blokkert på:** saksbehandling.

Når det kommer: løyvenummer inn ved siden av org.nr i footeren og vilkårene.

### 1.1 Kostnads- og prismodell 🔴

**Den største åpne posten i hele prosjektet.** Uten den er «fast pris» en
gjetning, og vi vet ikke om en tur er lønnsom.

- Kartlegg kostnad per driftstime: avdrag, forsikring, drivstoff, vedlikehold,
  dekk, verksted, vask, bom
- Sett timepris, minimum antall timer, avstandsjustering
- Legg satsene i en `Innstillinger`-fane i regnearket
- Regn gjennom tre eksempeltype-turer og sjekk marginen
- **Må være på plass før første ekte tilbud sendes**
- **Blokkert på:** kjøp av buss

### 1.2 Regneark-automasjon, godkjenningsstyrt ✅ FERDIG 1. august 2026

Bygget, enhetstestet og **verifisert i drift i det ekte regnearket 1. august**:
migreringen beholdt begge eksisterende bookinger, `Timer` ble fylt inn bakover,
`Innstillinger`-fanen ble opprettet, og tilbud er sendt gjennom
forhåndsvisningen i testmodus.

`NorwayRob`-meny i regnearket med seks handlinger,
forhåndsvisning før hver sending, automatisk statusoppdatering og
sendingslogg. Malene ligger nå i `Code.gs` som funksjoner, ikke som filer som
må kopieres for hånd.

**`TESTMODUS = true`** til bussen er kjøpt og løyvet innvilget — all e-post går
til Rob selv, aldri til kunden.

**Gjenstår i denne delen:** tidsstyrte utløsere for påminnelse før tur og takk
etter tur (de to som ikke handler om penger). Krever at `Sendt`-loggen har vært
i bruk en stund så vi vet at den er til å stole på.

<details><summary>Opprinnelig kravspesifikasjon</summary>

Det du eksplisitt ba om: skriv prisen i regnearket, trykk send, e-posten går ut.

Design i `ARCHITECTURE.md` §8. Omfang:

- `onOpen()` med en `NorwayRob`-meny
- Handlinger: Send tilbud · Send bekreftelse · Send betalingspåminnelse ·
  Send påminnelse før tur · Send takk + anmeldelse
- Ny kolonne `Pris (kr)` og `Sendt`
- Malene flyttes fra `tilbud/`-filene inn i `Code.gs` som funksjoner
- Automatisk valg mellom standard- og kortvarsel-mal ut fra dato
- Forhåndsvisning før sending, styrt av `GODKJENNING_PAAKREVD = true`
- Statusen oppdateres automatisk etter sending
- Vakthund: sender aldri fra en rad uten pris og gyldig e-post

**Effekt:** seks manuelle handlinger per booking blir fem klikk.

</details>

### 1.3 Bekreftet levering av skjemainnsendinger ✅ FERDIG 1. august 2026

Kvitteringen til kunden vises ikke lenger optimistisk. Hver innsending får en
referanse, og nettsiden spør endepunktet om den kom fram før den sier «Takk!».
Får vi ikke bekreftelse, sier vi det som det er og tilbyr e-post med alt ferdig
utfylt. Ubekreftede innsendinger prøves stille på nytt ved neste besøk, og
referansen gjør at ingenting kan havne to ganger i arket.

Mekanismen er beskrevet i `ARCHITECTURE.md` §5. Verifisert med 15 automatiske
sjekker i ekte nettleser mot en etterlignet backend: normal flyt, backend nede,
backend tilbake, og tre identiske innsendinger som gir én rad.

### 1.4 Sikkerhetskopi av regnearket 🟠

Kundedata og omsetningshistorikk bør finnes flere steder enn i ett dokument. En
tidsstyrt trigger som eksporterer til Drive ukentlig løser det på et kvarter.

---

## Fase 2 — Gjøre driften målbar og lønnsom

### 2.1 Konfigurerbare forretningsfakta 🟠

Kapasitet, svartid, avbestillingsfrist og tilbudets gyldighet settes ett sted og
propagerer. Design i `ARCHITECTURE.md` §6.

**Dette er et eksplisitt krav fra deg**, og det blokkerer 2.2 og alt som handler
om å oppgi antall plasser.

### 2.2 Kapasitet synlig på siden 🟠

Det første folk lurer på. Krever 2.1 og at bussen er kjøpt. Når begge er på
plass: tallet inn i tillitsstripen, FAQ og skjemaets `max`.

### 2.3 Cookiefri måling ✅ FERDIG 1. august 2026

`Trafikk`-fane med fire hendelser (`sidevisning` · `skjema_start` ·
`anledning_valgt` · `innsendt`), kilde og enhet. Menypunktet **Trafikk – siste
30 dager** viser trakten. Ingen cookies, ingen identifikator, ingen
samtykkebanner. Design i `ARCHITECTURE.md` §7.

**Gjenstår:** undersidene måles ikke, fordi `script.js` bare lastes på
forsiden. Å laste den overalt krever at koden på toppnivå tåler at
`#booking-form` mangler — den kaster i dag. Liten jobb, men gjøres for seg.

### 2.4 Filtrering av automatiserte innsendinger 🟠

Et offentlig skjemaendepunkt vil før eller siden få automatisk trafikk. Hver
slike innsending koster e-postkvote og gjør arket mindre oversiktlig. Standard
mottiltak implementeres i Apps Script og i skjemaet — detaljene holdes utenfor
dokumentasjonen med vilje.

### 2.5 Varsling når e-post feiler 🟡

`sendVarsel` og `sendAutosvar` svelger alle feil for å beskytte skrivingen til
arket. Riktig for datasikkerhet, men det betyr at kvotesprekk er usynlig. Logg
feil i en kolonne, slik at det i det minste er synlig i etterkant.

---

## Fase 3 — Gjøre siden bedre til å selge

### 3.1 Bilder av bussen 🔴

**Det tydeligste konverteringshullet på hele siden.** Vi selger et festkjøretøy
som ingen får se. Interiør, seter, lys, lydanlegg, gruppe om bord.
**Blokkert på:** kjøp av buss.

### 3.2 Video 🟠

Hele grunnlaget for at folk stoler på Rob er videoene hans, og siden har ikke
ett bevegelig bilde. En kort klipp-collage øverst, eller et TikTok-innebygd
klipp med plakatbilde. Må ikke koste ytelsesbudsjettet — se `PERFORMANCE.md` §9.

### 3.3 Prisanker 🟠

Ni felt uten et eneste hint om størrelsesorden. «Fra X kr» eller tre
eksempelturer med pris fjerner den største usikkerheten før skjemaet.
**Blokkert på:** 1.1.

### 3.4 Ekte anmeldelser 🟠

Vi har ingen, og det er riktig. Takke-e-posten ber om én dagen etter hver tur.
De ti første anmeldelsene er verdt mer for lokal synlighet enn all
teksten på siden til sammen. **Aldri finn på noen.**

### 3.5 Google Bedriftsprofil ferdigstilles 🟠

For en lokal tjenestebedrift gir profilen mer lokal trafikk enn nettsiden.
Beskrivelse, tjenester, område, bilder, åpningstider, kategori, org.nr.

---

## Fase 4 — Rette feil og gjeld

### Feil 🟠

| Feil | Hvor |
|---|---|
| ~~Knappeteksten blir «Send forespørsel» etter første innsending~~ ✅ rettet 1. aug | `script.js` |
| `Tidsrom` er skjult og uten validering — tom verdi kan nå regnearket hvis JS feiler | `index.html:187` |
| Ingen sjekk på at sluttid er etter starttid | `script.js` |
| `required` på et `type="hidden"`-felt gjør ingenting | `index.html:218` |
| `value="20"` forhåndsutfylt på antall kan sendes uendret | `index.html:203` |
| ~~`apple-touch-icon` peker på en SVG — iOS støtter det ikke~~ ✅ rettet 1. aug | alle sider |
| `onerror`-plassholderen viser utviklertekst til en ekte besøkende | `index.html:65` |

### Tilgjengelighet 🟠

| Sak | Prioritet |
|---|---|
| Suksess-overlegget flytter ikke fokus, fanger ikke fokus, lukkes ikke med `Escape` | **Høyest** |
| Chipsene har `role="radiogroup"` uten piltast-navigasjon eller roving tabindex | Høy |
| Skip-lenke mangler på undersidene | Middels |

Detaljer og ferdig kode i `ACCESSIBILITY.md` §4–6.

### Teknisk gjeld 🟡

| Sak |
|---|
| Manuell cache-busting i fem filer — bør automatiseres eller sjekkes i CI |
| Apps Script deployes ved kopier–lim, uten versjonskobling til repoet |
| Dødt CSS: `.why-card`, `.review-card`, `.stars` fra fjernede seksjoner |
| `sitemap.xml` vedlikeholdes for hånd |
| Ingen avstandstokens — rå px-verdier i hele stilarket |
| Grenen `claude/bus-booking-website-xyve0m` lever fortsatt på origin |
| Ingen lenkesjekk, HTML-validering eller linting i CI |
| E-postmalene finnes i to implementasjoner (`tilbud/` og `Code.gs`) som ikke følger hverandre |

---

## ⏰ Datoavhengig tekst som må ryddes

| Hvor | Hva som står | Når det må endres |
|---|---|---|
| `index.html`, varselet over skjemaet | «forespørsler for turer **fra oktober**» | Når dere faktisk kjører — eller straks, hvis oktober glipper |
| `index.html`, FAQ «Hvor lenge i forveien» | «Bussen er ikke i drift ennå» | Samme |
| `utdrikningslag.html`, «Når bør dere booke?» | Samme to setningene | Samme |

Rob sa 2. august 2026 at han **håper** å være i gang innen oktober. Teksten er
skrevet så den tåler at det glir: vi lover å ta imot forespørsler, ikke å kjøre
en bestemt dato. Men står den uendret i desember, leser den feil uansett.

**Sjekk denne lista hver gang du åpner repoet etter en pause.**

## Fase 5 — Vekst

Ikke før grunndriften går rundt.

### 5.1 Landingssider per anledning 🟠 — én av fire ute

Mindre konkurranse enn «leie buss bergen» og bedre konvertering. **Må ha ekte,
særegent innhold** — fire tynne kopier er verre enn én god side. Se
`SEO_GUIDE.md` §7.

| Side | Status |
|---|---|
| `/utdrikningslag.html` | ✅ Publisert 2. august 2026, 653 ord, egen FAQ og `Service`-skjema |
| `/fadderuke.html` | Åpen — **bør ligge ute innen juni** for å rekke augustsesongen |
| `/firmatur.html` | Åpen |
| `/blatur.html` | Åpen |

**Mønsteret er satt av den første siden, og bør gjenbrukes:** egen `<h1>`,
400–600 ord som faktisk handler om anledningen, 4–5 spørsmål som bare gjelder
den, `Service`-skjema, og lenker begge veier med forsiden. Knappene peker på
`/?anledning=<Anledning>#booking`, slik at skjemaet på forsiden står ferdig
utfylt med riktig anledning. Da finnes skjemaet fortsatt bare ett sted.

Merk at forhåndsvalget bevisst **ikke** teller som `anledning_valgt` i
trakten — det er ikke et valg kunden har tatt.

### 5.2 Bedriftsmarkedet 🟠

Den eneste etterspørselen som ikke følger festkalenderen, og derfor den eneste
som løser hullet januar–april. Egen side, fakturaflyt, og oppsøkende kontakt mot
bedrifter i Bergen.

### 5.3 Profesjonell e-postadresse 🟡

`rob@norwayrob.no` via Google Workspace, ca. 80 kr/mnd. Du utsatte dette
bevisst: *«vi kan heller vente å bytte til en mer proff email når vi begynner å
få kunder»*. Tas opp igjen ved første ekte kunde.

### 5.4 Kalender og tilgjengelighet 🟡

I dag hindrer ingenting at to grupper får tilbud på samme lørdag. Med én buss er
det en reell risiko første travle helg. En `Kalender`-fane med bekreftede
datoer, sjekket før tilbud sendes.

### 5.5 Engelsk versjon 🟡

`/en/` med `hreflang`. Beslutningen er utsatt, ikke avvist — se
`PRODUCT_VISION.md` §6. Revurderes når minst 15 % av forespørslene er på
engelsk, eller en turoperatør tar kontakt.

### 5.6 Flere busser og sjåfører 🟢

Arkitekturen skal tåle det uten ombygging: `Buss`- og `Sjåfør`-kolonne i
regnearket, kapasitet allerede konfigurerbar. Se `ARCHITECTURE.md` §12.

---

## Rekkefølgen, kort

```
FERDIG      0.1 org.nr · 0.2 rydde påstander · 0.3 README + motsigelser
NÅ          1.3 skjemaet mister ikke kunder · 1.4 backup · 2.4 spamsikring
NÅR BUSSEN  1.1 kostnadsmodell → 1.2 automasjon → 2.1 config → 2.2 kapasitet
ER KJØPT    → 3.1 bilder av bussen → 3.3 prisanker
PARALLELT   2.3 måling · 3.2 video · 3.5 Bedriftsprofil · Fase 4-feil
SENERE      Fase 5
```

---

## Hvordan dette dokumentet vedlikeholdes

- Hver endring som lukker et punkt, stryker det i **samme commit**.
- Hver feil eller idé som dukker opp, skrives inn med én gang — også når den
  ikke skal fikses nå.
- Prioritet settes mot nordstjernen, ikke mot hvor enkelt noe er.
- 🔴 blokkerende · 🟠 viktig · 🟡 bør gjøres · 🟢 senere
