# Skrifter

Anton og Inter, hentet fra Google Fonts og lagt her i stedet for å lastes
derfra. Begge er utgitt under **SIL Open Font License 1.1**, som tillater at
de hostes og distribueres videre.

- **Anton** — Vernon Adams, Cyreal · <https://fonts.google.com/specimen/Anton>
- **Inter** — Rasmus Andersson · <https://fonts.google.com/specimen/Inter>

## Hvorfor de ligger her

Google Fonts var den eneste eksterne forespørselen på nettsiden, og den
blokkerte visningen. Å hente dem herfra sparte tre ting:

| | |
|---|---|
| To ekstra vertsnavn å slå opp og koble til | `fonts.googleapis.com` + `fonts.gstatic.com` |
| ~94 KB | Se «hva som er med» under |
| En personvernopplysning | Besøkendes IP-adresse gikk til Google ved hver visning. Nå gjør den ikke det, og `personvern.html` slipper å opplyse om det. |

## Hva som er med, og hva som ikke er det

Bare **latin** (U+0000–00FF). Norske æ, ø og å ligger der — `latin-ext`
trengs ikke og er dobbelt så tungt.

Bare vektene som faktisk brukes i `styles.css`:

| Fil | Vekt | Størrelse |
|---|---|---|
| `anton-400.woff2` | 400 | 18 KB |
| `inter-400.woff2` | 400 | 47 KB |
| `inter-600.woff2` | 600 | 47 KB |
| `inter-700.woff2` | 700 | 47 KB |

**Inter 500 ble lastet før, men brukes ingen steder** — 47 KB kastet bort ved
hver førstegangsvisning. **Inter 800** ble brukt ett sted: hakemerket «✓» i
trygghetsraden, der 700 og 800 er umulig å skille. Begge er droppet.

## Hvis du legger til en ny vekt i CSS

Filen finnes ikke her. Nettleseren faller da tilbake på nærmeste vekt og
tegner den kunstig fetere — det ser nesten riktig ut, og er lett å overse.
Legg til `@font-face`-regelen **og** filen samtidig.
