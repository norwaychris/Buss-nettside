# BRAND_GUIDE.md

**Hva NorwayRob ser ut som, høres ut som og oppfører seg som.** Merkevaren er
fastsatt. Den skal ikke redesignes — den skal beskyttes.

Sist oppdatert: 1. august 2026

---

## 1. Merkevareløftet

> **Vi fikser kvelden.**

Ikke «vi frakter dere». Ikke «trygg og pålitelig transport». Løftet er at
kvelden blir bedre fordi vi er med — og at ingen i gjengen må ofre sin egen
kveld for å kjøre.

## 2. Personligheten

NorwayRob er **en person, ikke et selskap**. Det er hele forretningsmodellen.
Enhver endring som får siden til å høres ut som en bedrift, gjør den svakere —
uansett hvor «profesjonell» den ser ut.

| Vi er | Vi er ikke |
|---|---|
| Selvsikker | Skrytete |
| Varm | Klissete |
| Direkte | Brysk |
| Morsom uten å prøve | Vitsete |
| Proff der det teller | Formell |
| Lokal og bergensk | Nasjonal og anonym |

**Referansepunktet:** Rob sier selv *«I'm not a hero, I'm just a bus driver.»*
Det er hele tonen i én setning — folk kaller ham superhelt, han trekker på
skuldrene. Selvsikkerhet uten selvhøytidelighet. Hvis en tekst du har skrevet
ikke kunne stått ved siden av det sitatet, er den feil.

## 3. Visuell identitet — fastsatt, ikke opp til diskusjon

Disse er låst. De ble valgt bevisst og skal bevares gjennom enhver redesign:

- **Mørkt premium.** Svart bakgrunn, ikke mørkegrå, ikke marineblå.
- **Rød handlingsfarge.** Én farge, én betydning: handling.
- **Hvit typografi.** Høy kontrast, ingen pastelltoner.
- **Anton som display-font.** Tett, høy, kondensert, store bokstaver.
- **Kinematisk følelse.** Store bilder, dybde, glød, rom rundt ting.
- **Premium transportselskap**, ikke «lokal buss til leie».

## 4. Farger

| Rolle | Token | Verdi | Bruk |
|---|---|---|---|
| Bakgrunn | `--bg` | `#0a0a0b` | Sidens grunnflate. Nesten svart, aldri helt. |
| Bakgrunn, alternativ | `--bg-2` | `#101012` | Seksjoner som skal løftes svakt fra grunnflaten |
| Kort | `--card` | `#141417` | Kort, skjema, paneler |
| Kort, alternativ | `--card-2` | `#17171b` | Nøstede flater inni kort |
| Kantlinje | `--border` | `#232327` | Standard skille |
| Kantlinje, sterk | `--border-2` | `#2c2c32` | Ved hover eller fokus |
| Tekst | `--ink` | `#f5f5f6` | All primærtekst |
| Tekst, dempet | `--muted` | `#a1a1aa` | Brødtekst i kort, sekundær informasjon |
| Tekst, svakest | `--muted-2` | `#7a7a83` | Etiketter, hjelpetekst, fotnoter |
| **Aksent** | `--red` | `#ff3b3b` | **Kun handling og aksent** |
| Aksent, mørk | `--red-dark` | `#e12b2b` | Hover på primærknapp |
| Aksent, svak | `--red-soft` | `rgba(255,59,59,.12)` | Bakgrunn bak røde ikoner og tall |

### Regelen for rødt

Rødt betyr **handling eller viktighet**. Ingenting annet.

✅ Primærknapper · aktive chips · ikoner · tall i tillitsstripen · understrek
i navigasjon · den røde linjen i e-postmalene · det ene ordet i en overskrift
som bærer meningen

❌ Store flater · brødtekst · kantlinjer generelt · dekorasjon uten betydning ·
to røde konkurrerende elementer i samme synsfelt

Hvis alt er rødt, betyr rødt ingenting.

## 5. Typografi

| | Font | Bruk |
|---|---|---|
| Display | **Anton** | Logo, alle overskrifter, store tall, stegnummer. Kun én vekt finnes. |
| Brødtekst | **Inter** | All løpende tekst, knapper, etiketter, skjemafelt |

Fallback: `"Arial Narrow", sans-serif` for Anton, `system-ui, -apple-system, "Segoe UI", Roboto` for Inter.

### Skala

| Element | Størrelse |
|---|---|
| Hero-overskrift | `clamp(52px, 7vw, 96px)` |
| Seksjonsoverskrift | `clamp(34px, 5vw, 54px)` |
| Undersideoverskrift | `clamp(34px, 6vw, 60px)` |
| Ingress | 19px (hero), 17px (underside) |
| Brødtekst | 17px, linjehøyde 1.6 |
| Brødtekst i kort | 15px |
| Etiketter og hjelpetekst | 12.5–14px |
| Eyebrow | 13px, `letter-spacing: 3–4px`, versaler |

**Regelen:** Anton bærer stemmen, Inter bærer informasjonen. Aldri Anton på
noe lengre enn en kort setning — den er ulesbar i lengre partier.

## 6. Logoen

```
NORWAY ROB     →  NORWAY<span class="brand-accent">ROB</span>
BUSS TIL LEIE · BERGEN
```

- Anton, 26px, `letter-spacing: .5px`, ett ord uten mellomrom.
- «NORWAY» i `--ink`, «ROB» i `--red`. Aldri motsatt, aldri ensfarget.
- Undertittelen «BUSS TIL LEIE · BERGEN»: 11px, versaler,
  `letter-spacing: 2.5px`, i `--muted-2`.
- Skalerer til 21px under 460px bredde.

Logoen er ren tekst — ingen bildefil, ingen SVG. Det er bevisst: den er alltid
skarp, alltid tilgjengelig for søkemotorer, og veier ingenting.

## 6a. Ikonmerket (NR)

Ved siden av ordmerket finnes et **sirkelmerke**: svart flate, rød ring,
hvit «N» og rød «R». Det brukes der det ikke er plass til hele navnet —
favicon, fane i nettleseren, Google-treff, ikon på hjemskjerm, profilbilder.

| Fil | Størrelse | Brukes til |
|---|---|---|
| `favicon.svg` | vektor | Nettleserfane, Google-treff, alt moderne |
| `favicon.ico` | 16 · 32 · 48 | Eldre nettlesere, og Googles reservevei |
| `apple-touch-icon.png` | 180 × 180, ugjennomsiktig | iOS hjemskjerm (iOS runder hjørnene selv) |

**Merket er tegnet som ren vektor, ikke hentet fra 3D-renderen.** Renderen med
dekkmønster og dybde er riktig som profilbilde og i store flater, men på 16–32
piksler forsvinner all detaljen og blir til grøt. Vektorversjonen er samme merke
renset for alt som ikke er lesbart i den størrelsen.

**Regler:**

- Endre aldri `favicon.svg` uten å se den rendret på **16 px**. Det er der den
  faktisk brukes.
- Bakgrunnen må forbli mørk, men aldri helt ren `#000` — `#0a0a0b` gir så vidt
  kant mot ekte svart i mørk modus.
- Ringen må ikke bli tynnere enn `stroke-width: 3` av 100. Under det forsvinner
  den under 24 px.
- Genererer du `.ico` og PNG på nytt, gjør det fra SVG-en — den er kilden.

## 7. Bildespråk

| Skal | Skal ikke |
|---|---|
| Ekte bilder av Rob og bussen | Sjablongbilder |
| Kveldslys, byens lys, fjord og fjell | Dagslys uten stemning |
| Bevegelse og energi | Statiske produktbilder |
| Bergen som gjenkjennelig sted | Anonyme veistrekninger |
| Mennesker som har det gøy | Tomme seter |

Alle bilder legges på mørk bakgrunn med gradient-overlegg slik at hvit tekst
alltid har kontrast. Hero-bildet lastes med `fetchpriority="high"`.

**Det største hullet i bildespråket i dag:** ingen ser innsiden av bussen, og
det finnes ingen video. Se `ROADMAP.md`.

## 8. Bevegelse

Bevegelse skal antyde kvalitet, ikke kreve oppmerksomhet.

| Effekt | Verdi |
|---|---|
| Knapp, hover | `translateY(-2px)` + sterkere rød glød, 150 ms |
| Knapp, trykk | `translateY(1px)`, 60 ms |
| Kort, hover | `translateY(-4px)` + skygge, 200 ms |
| Navigasjon, hover | Rød understrek som vokser fra venstre, 200 ms |
| Innfelling ved scroll | 18px opp + fade, 600 ms, `cubic-bezier(.22,.61,.36,1)`, 70 ms forsinkelse mellom naboer |

**Absolutt krav:** all bevegelse respekterer `prefers-reduced-motion: reduce`.
Ingen unntak.

## 9. Form og dybde

- Radius: `16px` på kort og seksjoner, `10px` på knapper og felt, `20–24px`
  på store flater som skjemaet og hero-bildet, `999px` på piller og merker.
- Skygger er dype og mørke: `0 30px 70px rgba(0,0,0,.4)` på skjemaet.
- Rød glød brukes kun der noe skal handles på:
  `0 8px 24px rgba(255,59,59,.28)`.
- Glassmorfisme (`backdrop-filter: blur()`) brukes på tre steder og ikke flere:
  header, hero-boksen med ✓-punktene, og merket på om-siden.

## 10. Stemmen — de faste frasene

Disse er merkevaren i tekst. Bruk dem, ikke omskriv dem.

| Frase | Hvor |
|---|---|
| «Vi fikser kvelden.» | Hero, slagord i schema |
| «Vi henter hele gjengen, dere fester — vi kjører.» | Footer |
| «Dere fester, vi tar rattet.» | FAQ |
| «Fast pris — ingen skjulte tillegg» | Gjennomgående |
| «Gratis og uforpliktende» | Ved hver oppfordring til å sende skjema |
| «I'm not a hero, I'm just a bus driver.» | Om-siden, e-postmaler |
| «Vi sees i Bergen!» | Avslutning i e-post |

## 11. Merkevarens grenser

Ting som ville brutt merkevaren, uansett hvor godt de konverterer:

- Lys bakgrunn eller «rent og luftig» design
- En annen aksentfarge, eller flere aksentfarger
- Illustrasjoner eller tegnede maskoter
- Emoji i overskrifter på nettsiden (i e-post er det greit — der er tonen mer personlig)
- Nedtellinger, «kun 2 igjen!», falsk knapphet
- Oppfunnede anmeldelser, stjerner eller kundetall
- En chatbot som later som den er Rob
- Sjablongbilder av smilende mennesker i dress
