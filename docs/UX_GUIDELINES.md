# UX_GUIDELINES.md

**Hvordan siden skal oppføre seg mot kunden.** Dette dokumentet handler om
kundereisen og skjemaet — de to tingene som avgjør om en besøkende blir en
forespørsel.

Sist oppdatert: 1. august 2026

---

## 1. Sidens eneste jobb

> Gjøre det så enkelt og trygt som mulig å be om pris.

Alt annet på siden er støtte for den ene handlingen. Hvis en endring ikke gjør
det lettere eller tryggere å sende inn skjemaet, må den forsvares på andre
grunnlag.

## 2. To besøkende, én side

| | Den varme | Den kalde |
|---|---|---|
| Kommer fra | TikTok, Instagram | Google |
| Kjenner Rob | Ja | Nei |
| Enhet | Nesten alltid mobil | Blandet |
| Trenger | Rask vei til skjemaet | Bevis, pris, kapasitet, trygghet |
| Tåler | Lite tekst | Mye tekst |

**Løsningen:** handlingen ligger øverst for den varme; bevisene ligger rett
under, i den rekkefølgen den kalde stiller spørsmålene sine. Ingen av dem må
scrolle forbi noe de ikke bryr seg om for å komme videre.

## 3. Rekkefølgen på forsiden, og hvorfor

| # | Seksjon | Spørsmålet den svarer på |
|---|---|---|
| 1 | Hero | «Hva er dette, og hva gjør jeg?» |
| 2 | Tillitsstripe | «Er dette ekte folk?» |
| 3 | Intro | «Kjører dere der jeg er, til det jeg skal?» |
| 4 | Slik booker du | «Hva skjer hvis jeg fyller ut?» |
| 5 | **Skjemaet** | Handlingen |
| 6 | Alt dette — uansett anledning | «Hva får jeg egentlig?» |
| 7 | Garanti | «Hva om planene endrer seg?» |
| 8 | FAQ | Alt som gjenstår |
| 9 | Footer | Juss, kontakt, navigasjon |

**Skjemaet ligger midt på siden, ikke nederst.** Det er bevisst: den som er
overbevist skal slippe å lese resten, og den som ikke er det, finner
argumentene under. Seksjon 6–8 er der for dem som scroller *forbi* skjemaet —
og alle tre ender med en vei tilbake til det.

## 4. Skjemaets struktur

Tre blokker, i denne rekkefølgen. Rekkefølgen er valgt etter hvor lett
spørsmålene er å svare på.

**1. Om dere** — Navn, Telefon, E-post
De letteste feltene først. Man vet svaret uten å tenke. Å komme i gang er den
største barrieren; tre trivielle felt bygger fart.

**2. Turen** — Dato, Klokkeslett, Hentested, Plan, Antall, Anledning
Her ligger den faktiske jobben. Brukeren har allerede investert, og fullfører
derfor heller enn å gi opp.

**3. Til slutt** — Ekstra ønsker, Hvordan hørte du om oss
Begge valgfrie. Slutten skal føles som en nedtrapping, ikke som nok en hindring.

De nummererte blokkene gjør framdrift synlig. Uten dem er skjemaet en vegg av
felt.

## 5. De fem beslutningene i skjemaet som er tatt bevisst

### Sluttid er valgfri

Rob spurte: *«hva om de skal fra Bergen til Voss? De vet jo ikke hvor lang tid
det tar?»* Å tvinge fram en sluttid ber kunden gjøre en beregning hun ikke kan
gjøre — og et felt man ikke kan svare på, er et felt man forlater siden på.

Løsningen: `fra` er påkrevd, `til` er valgfritt, og hjelpeteksten sier eksplisitt
at *vi* regner ut tidsbruken. Feltene kombineres til `Tidsrom`:

| Inndata | Sendt til regnearket |
|---|---|
| 19:00 og 01:00 | `kl. 19:00–01:00` |
| kun 19:00 | `fra kl. 19:00 (sluttid ikke oppgitt)` |

### «?»-hjelpen på antall

Rob: *«kan være vanskelig å være sikker på om de blir 32 eller 34»*. En gruppe
som ikke vet det eksakte tallet, utsetter å sende skjemaet.

Hjelpen fjerner bekymringen — «et avvik på et par personer gjør ingenting» — og
den ligger i en **flytende boks**, ikke som en seksjon i skjemaet. Det var et
eksplisitt krav: informasjon som bare noen trenger, skal ikke gjøre skjemaet
lengre for alle.

### Fritekst i stedet for rutefelt

«Hva er planen for turen?» med en invitasjon: *«skal dere direkte fra A til B,
ha stopp underveis, eller bare rulle fritt rundt i Bergen sentrum?»*

Strukturerte rutefelt ville tvunget kunden til å planlegge før hun har lyst til
å planlegge. Fritekst gir Rob mer nyttig informasjon og krever mindre av kunden.

### Anledning som chips, ikke nedtrekksliste

Ett trykk i stedet for tre. Alle valgene synlige samtidig, så man ser at sin
egen anledning finnes. Og valget tilpasser skjemaet — det føles som at siden
svarer på deg.

### Telefon **og** e-post, begge påkrevd

Redundans i kontakt. Bounce på e-post eller feiltastet adresse skal ikke koste
en kunde. E-post brukes til alt automatisk; telefon er sikkerhetsnettet.

## 6. Progressiv utdyping

Skjemaet stiller aldri et spørsmål som ikke er relevant ennå.

- Oppfølgingsspørsmål vises først **etter** at anledning er valgt, og bare de
  som gjelder. Velger man «Fadderuke», spør vi om linjeforening. Velger man
  «Bursdag», gjør vi ikke det.
- Hjelpeteksten på antall vises bare til den som lurer.
- Sluttid er der for den som vet den.

**Prinsippet:** hvert felt en bruker ser og ikke trenger, er en grunn til å
lukke fanen.

## 7. Trygghet ved hvert beslutningspunkt

Hver gang vi ber om noe, sier vi hva det koster å si ja.

| Sted | Trygghet |
|---|---|
| Under hovedknappen | «Tar under 2 min · Gratis og uforpliktende · Svar innen 24 timer» |
| Over skjemaet | «Skjemaet tar under 2 minutter — og du får fast pris innen 24 timer, helt uforpliktende» |
| Under sendeknappen | «Du hører fra oss innen 24 timer med en fast pris» |
| Etter innsending | Kvittering på skjermen **og** på e-post innen sekunder |

Den siste er viktigst. En bekreftelses-e-post som kommer med én gang, er det
tydeligste signalet på at det finnes noen i den andre enden.

## 8. Feilhåndtering

| Situasjon | Oppførsel |
|---|---|
| Anledning ikke valgt | Rød melding over skjemaet, scroller til seg selv, `role="alert"` |
| Påkrevd felt tomt | Nettleserens egen `reportValidity()` |
| Innsending feiler | Melding med e-postadresse som reserveløsning |
| Innsending lykkes | Overlegg + skjemaet nullstilles |

**Den store svakheten:** `mode: "no-cors"` gjør at vi ikke kan lese svaret fra
serveren. Vi viser suksess uansett. Hvis Apps Script er nede, får kunden takk —
og forespørselen forsvinner. Dette er den alvorligste UX-feilen på siden, fordi
den er usynlig for begge parter. Se `ROADMAP.md` prioritet 4.

## 9. Mobil

Nesten all sosial trafikk er mobil. Mobil er ikke en tilpasning, det er
hovedtilfellet.

- Skjemafelt er minst 16px — alt mindre gir iOS-zoom ved fokus.
- Trykkflater er minst 44 × 44px.
- Ett felt per rad under 760px.
- `type="date"`, `type="time"`, `type="tel"`, `type="email"`,
  `inputmode="numeric"` — riktig tastatur hver gang.
- `autocomplete="name" | "tel" | "email"` — utfylling med ett trykk.
- Flytende knapp i vinduet mellom hero og skjema.
- Ingen hover-avhengig informasjon noe sted.

## 10. Ytelse er brukeropplevelse

Den varme kommer fra en app med umiddelbar respons. En treg side føles som at
noe er galt med bedriften.

Bilder er komprimert til under 300 KB, hero forhåndslastes, ingen
tredjepartsskript. Se `PERFORMANCE.md`.

## 11. Det vi bevisst ikke gjør

| Ikke | Fordi |
|---|---|
| Flerstegs-skjema med «Neste» | Skjuler hvor langt det er igjen; ett synlig skjema med nummererte blokker er ærligere |
| Chatbot | Rob er differensieringen — en bot undergraver hele posisjonen |
| Nyhetsbrev-popup | Vi har ett mål på denne siden |
| Nedtelling eller «kun 2 igjen» | Falsk knapphet, og vi har ingen kalender som kunne begrunnet det |
| Sanntids priskalkulator | Prismodellen er ikke moden; feil pris ut er dyrere enn ett døgns ventetid |
| Obligatorisk innlogging eller konto | Absurd for en engangstjeneste |

## 12. Kjente UX-hull

I prioritert rekkefølge. Alle står i `ROADMAP.md`.

1. **Ingen ser innsiden av bussen.** Vi selger et festkjøretøy uten å vise det.
2. **Ingen video.** Hele grunnlaget for tillit til Rob er videoene hans.
3. **Ingen kapasitet oppgitt.** Det første folk lurer på, står ikke noe sted.
4. **Ingen prisindikasjon.** Ni felt uten et eneste anker.
5. **Ingen sosialt bevis.** Riktig at det fake ble fjernet — men hullet står åpent.
6. **`value="20"` forhåndsutfylt på antall.** Kan sendes inn uendret og gi feil tilbud.
7. **Suksess-overlegget fanger ikke fokus.** Tastaturbrukere blir stående bak det.
8. **Chipsene mangler piltast-navigasjon** til tross for `role="radiogroup"`.

## 13. Sjekklisten før en UX-endring

```
[ ] Gjør den det lettere eller tryggere å sende inn skjemaet?
[ ] Legger den til et felt? Kan det fjernes, gjøres valgfritt eller utsettes?
[ ] Fungerer den med tommelen på 375px?
[ ] Er det tydelig hva som skjer etterpå?
[ ] Lover den noe vi kan holde i dag?
[ ] Kan den fullføres uten mus?
[ ] Hva skjer hvis den feiler — ser brukeren det?
```
