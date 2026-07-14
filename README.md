# 🚌 BussBestill

En enkel nettside for å bestille buss. Brukeren søker eller klikker i kartet for
å legge til hentested, mellomstopp og reisemål – og nettsiden regner ut prisen
automatisk basert på kjørt distanse, antall stopp og passasjerer.

## Funksjoner

- **Interaktivt kart** (Leaflet + OpenStreetMap) – klikk for å legge til stopp.
- **Adressesøk** via Nominatim (søk på f.eks. «Oslo S»).
- **Stoppested-liste** – første stopp = hentested, siste = reisemål. Dra for å
  endre rekkefølge, klikk × for å fjerne. Markører kan også dras i kartet.
- **Ekte kjørerute og distanse** via OSRM (med luftlinje-fallback hvis
  rutetjenesten ikke svarer).
- **Automatisk prisberegning** med grunnpris, km-pris, tillegg per ekstra stopp
  og per passasjer. Støtter tur/retur.
- **Bestilling** med oppsummering og bekreftelse.

## Prismodell

Justeres i toppen av `script.js` (`PRICING`):

| Ledd | Standard |
|------|----------|
| Grunnpris | 900 kr |
| Per km | 22 kr |
| Per ekstra stopp | 150 kr |
| Per passasjer over 10 | 35 kr |

Formel: `grunnpris + km × kmpris + ekstra_stopp × stopp­pris + ekstra_passasjerer × passasjerpris`
(distanse dobles ved tur/retur).

## Kjøre lokalt

Alt er statiske filer. Åpne `index.html` direkte, eller start en enkel server:

```bash
python3 -m http.server 8000
# åpne http://localhost:8000
```

En lokal server anbefales fordi kart-, søke- og rutetjenestene lastes over nett.

## Teknologi

Ren HTML/CSS/JavaScript uten byggesteg. Eksterne tjenester:

- [Leaflet](https://leafletjs.com/) – kartvisning
- [OpenStreetMap](https://www.openstreetmap.org/) – kartdata
- [Nominatim](https://nominatim.org/) – adressesøk
- [OSRM](http://project-osrm.org/) – ruteberegning

> Merk: Nominatim og OSRM sine offentlige demo-tjenester har bruksgrenser og er
> ment for utvikling/testing. For produksjon bør du bruke egne instanser eller
> en betalt leverandør.
