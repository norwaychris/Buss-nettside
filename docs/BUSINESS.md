# BUSINESS.md

**Forretningsmodellen, økonomien, kundereisen og de juridiske forpliktelsene.**
Dette er dokumentet som må stemme med virkeligheten. Hvis noe her er utdatert,
tar vi feil beslutninger på nettsiden.

Sist oppdatert: 1. august 2026

---

## 1. Selskapet

| | |
|---|---|
| Foretaksnavn | NorwayRob |
| Organisasjonsnummer | **931 870 106** |
| Selskapsform | Registrert norsk foretak |
| Løyve | **Søkt om, ikke innvilget ennå.** Se §2a |
| Forsikring | Kommer med bussen — kjøretøyforsikring finnes ikke før kjøretøyet gjør det |
| Ansatte | Én — Rob |
| E-post | `norwayrob@outlook.com` |
| Nettsted | `norwayrob.no` |

> **Løst 1. august 2026.** Organisasjonsnummeret er nå oppgitt i footeren på
> alle sider, i vilkårene, i personvernerklæringen og i `LocalBusiness`-schema,
> slik *e-handelsloven § 8* krever.

## 2a. Løyve — status

Løyvesøknaden er til behandling. **Ingen tur kjøres før løyvet er innvilget** —
det er en fast forutsetning for driften, ikke en vurderingssak.

Fram til da gjelder driftsstatusen i §2: nettsiden tar imot forespørsler, ikke
bookinger. Ingen dato bekreftes, og ingen betaling tas imot.

**Nettsiden nevner ikke løyve eller forsikring** (endret 1. august 2026). I
stedet står **organisasjonsnummeret**, som er sant i dag og som hvem som helst
kan slå opp i Brønnøysundregistrene. For en bedriftskunde er et oppslagbart
org.nr et sterkere signal enn ordet «løyve» uten nummer.

Prinsippet: **oppgi det som kan etterprøves, ikke det som må tros på.**

**Når løyvet innvilges:** legg løyvenummeret ved siden av org.nr i footeren og
i vilkårene. Da står det to etterprøvbare opplysninger der. Det samme gjelder
forsikring — den følger kjøretøyet og kan nevnes når kjøretøyet finnes.

## 2. Driftsstatus

**Bussen er ikke kjøpt.** Det betyr at vi per i dag ikke kan levere tjenesten.

Konsekvenser som gjelder til bussen står på gårdsplassen:

- Alle innsendte skjemaer behandles som **forespørsler**, ikke bookinger.
- Vi lover **aldri** at en dato er ledig, reservert eller sikret.
- Vi tar **ikke imot betaling**.
- Vi svarer med et personlig tilbud, med tydelig forbehold.
- Nettsiden står live for å **validere etterspørsel og lære hvordan kunder
  oppfører seg** før kapitalen bindes opp.

Første buss forventes å ha **35–49 godkjente sitteplasser**, men det er ikke
avgjort. Sitteplasser skal derfor aldri hardkodes noe sted — se
`ARCHITECTURE.md` §6.

## 3. Prismodell

**Kunden ser alltid ett fast tall.** Ingen timepriser, ingen tillegg, ingen
«fra»-priser i tilbudet. Internt regnes tallet ut fra en konsistent modell.

### Modellens komponenter

| Parameter | Rolle |
|---|---|
| **Timepris** | Grunnsatsen for tiden bussen er bundet opp, fra avreise fra base til retur |
| **Minimum antall timer** | Hindrer at korte turer blir ulønnsomme etter klargjøring og vask |
| **Avstandsjustering** | Tillegg når turen går vesentlig utenfor Bergensområdet (Voss, andre byer, fjellet) |
| **Sesong- eller helgejustering** | Valgfritt; høysesong og lørdagskvelder tåler høyere pris |

Satsene skal ligge i en egen **`Innstillinger`-fane i regnearket**, ikke i
koden, slik at Rob kan justere dem uten hjelp. Automasjonen foreslår en pris,
Rob overstyrer om nødvendig, og godkjenner før noe sendes.

### Hva som ikke er avklart

**Kostnadsgrunnlaget finnes ikke ennå.** Uten buss vet vi ikke hva en driftstime
faktisk koster i avdrag, forsikring, drivstoff, vedlikehold, dekk, verksted,
vask og bomavgift. Timeprisen kan derfor ikke settes forsvarlig i dag — den vil
være en gjetning. Å bygge en kostnadsmodell er `ROADMAP.md` prioritet 2, og
den må på plass **før** første ekte tilbud sendes.

### Hva som alltid er inkludert i prisen

Sjåfør · drivstoff · bompenger · vanlig vask etter turen · lydanlegg ·
henting fra ett sted og levering der gruppen vil.

Dette er et bevisst salgsargument: ingen skjulte tillegg er den vanligste
irritasjonen i bransjen.

## 4. Betaling

| Kundetype | Metode | Tidspunkt |
|---|---|---|
| **Privatperson** | Bankoverføring, hele beløpet | I forkant, innen frist oppgitt i tilbudet |
| **Bedrift** | Faktura mot organisasjonsnummer | Normalt forfall før avreisedato |

Ingen Vipps foreløpig — bevisst valg for å holde det enkelt til volumet
rettferdiggjør flere betalingsløsninger.

Kontonummer oppgis **kun i e-posten til kunden**, aldri i repoet, aldri på
nettsiden.

Ved kort varsel settes kort betalingsfrist, typisk 48 timer eller senest to
dager før avreise. Betales det ikke innen fristen, faller reservasjonen bort.

> **Gjelder inntil bussen er kjøpt:** ingen betaling kreves inn i det hele tatt.
> Tilbudet sendes som et prisanslag med forbehold om tilgjengelighet.

## 5. Kundereisen

Ni steg. Alt fra steg 3 og utover er i dag manuelt.

| # | Steg | Hvem | Status |
|---|---|---|---|
| 1 | Kunden fyller ut skjemaet | Kunde | Automatisk |
| 2 | Rad i regnearket + varsel til Rob + kvittering til kunden | System | **Automatisk** ✅ |
| 3 | Pris settes | Rob | **Menyen foreslår, Rob godkjenner** ✅ |
| 4 | Tilbud sendes | Rob | **Ett klikk + forhåndsvisning** ✅ |
| 5 | Betaling mottas og registreres | Rob | Manuelt — krever bankkontroll |
| 6 | Bekreftelse sendes | Rob | **Ett klikk + forhåndsvisning** ✅ |
| 7 | Påminnelse 2–3 dager før turen | Rob | **Ett klikk** ✅ (kan bli tidsstyrt) |
| 8 | Turen kjøres | Rob | — |
| 9 | Takk + anmeldelse dagen etter | Rob | **Ett klikk** ✅ (kan bli tidsstyrt) |

Seks manuelle handlinger per booking er blitt **fem klikk fra menyen
«NorwayRob»** i regnearket, hver med forhåndsvisning før sending. Kun steg 5 er
fortsatt ekte manuelt arbeid, fordi det krever at Rob ser i nettbanken.

**Automasjonsfilosofi:** systemet forbereder alt, Rob godkjenner hvert tilbud
før det sendes. Godkjenningssteget er én boolsk bryter
(`GODKJENNING_PAAKREVD`), ikke en ombygging — det kan slås av gradvis når
prismodellen er moden.

**Sikkerhetsbryter:** `TESTMODUS = true` sender all e-post til Rob selv i
stedet for kunden, med `[TEST → kunde@…]` i emnefeltet. Den står på til bussen
er kjøpt og løyvet innvilget, slik at hele flyten kan kjøres gjennom uten at
noen ekte kunde får en betalingsoppfordring vi ikke kan innfri.

## 6. Regnearket

Én fane per formål. Kolonnerekkefølgen i `Bestillinger` er en kontrakt mellom
nettsiden, Apps Script og en eventuell framtidig database — **den endres ikke,
det legges bare til på slutten.**

| Fane | Innhold | Status |
|---|---|---|
| `Bestillinger` | 16 kolonner, én rad per forespørsel | Finnes |
| `Innstillinger` | Prissatser, kapasitet, fraser, telefonnummer | Planlagt |
| `Trafikk` | Anonyme hendelser fra nettsiden | Planlagt |

Statusverdier: `Ny` → `Tilbud sendt` → `Betalt` → `Fullført`, eller `Avlyst`.

> **Risiko:** all kundedata og all omsetningshistorikk ligger i ett regneark på
> én privat Google-konto, uten sikkerhetskopi. Se `ROADMAP.md`.

## 7. Vilkårene, forretningsmessig lest

De juridiske formuleringene står i `vilkar.html`. Her er hva de faktisk
betyr for driften.

| Regel | Forretningsbegrunnelse |
|---|---|
| Tilbud gyldig i 7 dager | Hindrer at gamle priser og opptatte datoer spøker. |
| Bestiller må være fylt 18 | Avtalen skal være juridisk bindende. |
| Privat betaler i forkant | Én buss tåler ikke tap på ubetalte turer. |
| Datoen holdes ikke før betaling er mottatt | Beskytter mot at flere «reserverer» samme lørdag. |
| Gratis avbestilling ≥ 14 dager før | Fjerner den største bremsen på å booke tidlig. |
| Ingen refusjon < 14 dager før | Datoen har vært holdt av, andre er takket nei til. |
| Fri flytting av dato inntil 14 dager før | Rob ville ha romslighet her — det koster lite og selger mye. |
| Bestilt < 14 dager før: ingen gratis periode | Ellers kunne noen booke fredag og avbestille gratis dagen etter. |
| Angrerett gjelder ikke | Persontransport på fastsatt dato er unntatt angrerettloven. |
| Bussen venter, men ventetid går av leietiden | Rob avviste «bussen kjører etter 15 minutter» som dårlig merkevareoppførsel. Regelen beskytter tiden, ikke stemningen. |
| Noen ekstra er greit, innenfor godkjent antall plasser | Vennlig der det er trygt, absolutt der loven er absolutt. |
| Bestiller er ansvarlig for skade og ekstraordinær vask | Vanlig søl er inkludert; hærverk og oppkast er det ikke. |
| Vårt ansvar er begrenset til innbetalt beløp | Vi dekker ikke tapte konsertbilletter eller hotell. |

## 8. Sesongprofil og den strategiske svakheten

| Periode | Etterspørsel | Driver |
|---|---|---|
| Mai–juni | Høy | Utdrikningslag, russ, avslutninger |
| Juli | Middels | Ferie |
| August | **Topp** | Fadderuke — hele volumet på tre uker |
| September–oktober | Middels | Utdrikningslag, høstevents |
| November–desember | Høy | Julebord og firmaturer |
| **Januar–april** | **Lav** | Ingenting strukturelt |

Januar til april er hullet i modellen. Bussen har avdrag og forsikring uansett.
Bedriftsmarkedet — kickoff, kurs, transport til arrangement — er den eneste
etterspørselen som ikke følger festkalenderen, og er derfor den viktigste
veksthypotesen etter at grunndriften går rundt.

## 9. Juridiske forpliktelser

| Krav | Hjemmel | Status |
|---|---|---|
| Løyve for persontransport | Yrkestransportlova | ⏳ Søkt om — ingen kjøring før det er innvilget |
| Org.nr og kontaktinfo på nettsiden | E-handelsloven § 8 | ✅ Footer, vilkår, personvern, schema |
| Personvernerklæring | GDPR art. 13 | ✅ `personvern.html` |
| Behandlingsgrunnlag for kundedata | GDPR art. 6 | ✅ Avtale / berettiget interesse |
| Samtykke for cookies | Ekomloven § 2-7b | ✅ Ikke nødvendig — vi bruker ingen |
| Salgsvilkår tilgjengelig før kjøp | Angrerettloven / markedsføringsloven | ✅ `vilkar.html` |
| Markedsføring skal være dekkende | Markedsføringsloven § 6 | ✅ Gjennomgått 1. august — se §10 |
| Bokføring og fakturakrav | Bokføringsloven | Rob håndterer |

## 10. Gjennomgang av kundevendte påstander

Prinsippet er enkelt: nettsiden skal ikke love mer enn vi kan levere på det
tidspunktet en kunde leser den. Så lenge bussen ikke er kjøpt, betyr det at
ingenting kan antyde garantert tilgjengelighet eller automatisk reservasjon.

### Ryddet 1. august 2026 ✅

| Var | Er nå |
|---|---|
| Steg 03: «Betal og lås datoen» | «Passer det? Da bekrefter vi» — betaling nevnt, men ingen dato låses automatisk |
| Steg 02: «Få fast pris raskt» | «Vi går gjennom turen» — gjør den manuelle vurderingen eksplisitt |
| «Trygg booking-garanti» | «Ingen risiko for dere» — dekker både forespørsel og bekreftet tur |
| FAQ: «Datoen er sikret så snart betalingen er mottatt» | Innledes med «Først får dere en fast pris … Passer den, bekrefter vi turen sammen» |
| FAQ: «så hører dere fra oss raskt» | «Vi går gjennom hver eneste forespørsel selv, og svarer innen 24 timer» |
| Skjemanotis: «Du hører fra oss innen 24 timer» | «… Ingenting er bindende før dere har bekreftet» |
| Vilkår § Forespørsel og tilbud | Ny setning: «En forespørsel reserverer ingen dato i seg selv» |
| `priceRange: "$$"` i JSON-LD | Fjernet |
| «15+ års erfaring» vs «15 års erfaring» | «15 år bak rattet» overalt |
| Footer: «Løyve · forsikret» | «Org.nr 931 870 106» — etterprøvbart i stedet for upåviselig |
| FAQ: «sjåfør med løyve» | «sjåfør med 15 år bak rattet» (også i schema) |
| Om-siden: «kjører med løyve, er forsikret» | «registrert foretak med org.nr … og 15 år bak rattet» |
| Tilbudsmalene: «Forsikret & 100 % lovlig» | «Fast pris — ingen tillegg» |

### Fortsatt åpent

| Påstand | Problem | Løsning |
|---|---|---|
| «Svar innen 24 timer» | Løfte uten operasjonelt sikkerhetsnett | Behold, men bygg en påminnelse så det faktisk holdes |
| «Vasking inkludert», «lydanlegg» | Egenskaper ved en buss som ikke er kjøpt | Behold generisk, ikke spesifiser utstyr |

## 11. Nøkkeltall vi må begynne å måle

Ingen av disse måles i dag.

| Tall | Hvorfor |
|---|---|
| Besøkende per måned, fordelt på sosialt vs. søk | Vet vi hvilken kanal som virker? |
| Andel besøkende som starter skjemaet | Selger hero-en? |
| Andel som fullfører skjemaet | Er skjemaet for langt? |
| Hvilket steg folk faller av på | Hvor skal vi fikse noe? |
| Forespørsel → tilbud → booking | Hvor lekker salget? |
| Snittpris per tur | Grunnlag for lønnsomhet |
| Turer per måned | Nordstjernen |
| Andel gjenkjøp | Bærekraft i modellen |

Cookiefri egen logging til `Trafikk`-fanen dekker de fire første. De øvrige
kommer fra `Bestillinger` når statusfeltet brukes disiplinert.
