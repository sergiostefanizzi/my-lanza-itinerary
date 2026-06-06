# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stato del progetto

App React **personale** per consultare un itinerario di viaggio a Lanzarote (giugno 2026). Lingua dei contenuti: italiano. L'app è un single-page React senza routing né backend.

Milestone di scaffolding completate: **M0–M4** (CLAUDE.md, scaffolding Vite, migrazione in `src/`, verifica end-to-end, README + istruzioni deploy Vercel). Piano archiviato: `C:\Users\sergi\.claude\plans\voglio-costuire-un-app-rosy-cloud.md`.

Evolutive funzionali completate:
- **Tema scuro/chiaro** — toggle sole/luna fisso in alto a destra. Tema iniziale: `localStorage` → altrimenti `prefers-color-scheme` → fallback scuro. La scelta è persistita in `localStorage` (chiave `theme`).
- **Itinerario visuale su mappa** (tab "Mappa", Leaflet) — componente `DayMap` + tab Mappa con selettore giorno. Coordinate (`stops`) presenti per **tutti gli 8 giorni**. Vedi sezione "Mappa".
- **Spunta attività completate** — ogni attività dell'itinerario è cliccabile (spunta circolare a sinistra, o clic sull'intera riga) per marcarla/smarcarla come completata: testo barrato + riga sbiadita. Quando **tutte** le attività di un giorno sono completate, la card del giorno si sbiadisce (+ piccolo ✓ nell'accent del giorno). Niente contatori. Stato persistito in `localStorage` (chiave `doneItems`, array di chiavi `${giorno}-${indice}`). Vedi sezione "Spunta attività".

Contenuti itinerario allineati a `Lanzorote26.md` (tour confermati giugno 2026): **G2** relax/spiagge alle calette di Papagayo, **G4** La Graciosa (€77/pers, traghetto incluso) + Caletón Blanco, **G5** Timanfaya (8:00–13:00) + La Geria, **G7** buggy a Costa Teguise + Arrecife + degustazione al tramonto (Finca Testeina). Rimossi snorkeling guidato e kart (restano come extra opzionali nel breakdown budget). Budget totale stimato: **€634,66 / coppia**.

## Stack

- **Vite 5** + **React 18** (JS, no TypeScript)
- Deploy target: **Vercel** (auto-detection del preset Vite, no `vercel.json`)
- **Leaflet** + **react-leaflet** per la mappa (unica libreria UI esterna, introdotta su richiesta esplicita dell'utente per l'itinerario visuale). Tile CARTO (gratis, no API key).
- A parte la mappa, il componente itinerario resta self-contained con stili inline

## File chiave

- **`src/components/LanzaroteItinerary.jsx`** — componente React unico. Self-contained: `useState` per accordion/tab/tema/mappa/spunte (`done`), zero dipendenze UI esterne, stili interamente in un blocco `<style>{...}</style>` inline (no Tailwind, no shadcn/ui, no CSS esterno). Dati hardcoded nelle costanti `days[]`, `budget[]`, `typeColors`, `typeLabels`. Il tema è gestito via CSS variables (vedi sezione "Theming"). Lo stato delle attività completate è in `localStorage` (vedi sezione "Spunta attività").
- **`src/components/DayMap.jsx`** — mappa Leaflet di un singolo giorno: tile CARTO (chiaro/scuro in base al tema), polyline del percorso nell'accent del giorno, segnaposto numerati (`L.divIcon`, niente immagini), marker della base (alloggio). Props: `day`, `base`, `theme`.
- **`src/App.jsx`** — wrapper minimale che renderizza `<LanzaroteItinerary />`. Aggiungere qui eventuali provider/router globali in futuro.
- **`src/main.jsx`** — entry point: `createRoot` + `<StrictMode>` + import di `leaflet/dist/leaflet.css` e `./index.css`.
- **`src/index.css`** — reset minimo (`html, body { margin: 0 }`). Tutto il resto degli stili vive inline nel componente.
- **`Lanzorote26.md`** — appunti grezzi del viaggio (voli, alloggio, noleggio auto, attrazioni, ristoranti, tour). **Fonte di verità** per le evolutive future dei contenuti. Non viene importato dall'app: serve come reference per quando si aggiorneranno i dati dell'itinerario.
- **`README.md`** — descrizione progetto, comandi di sviluppo e istruzioni di deploy su Vercel.

## Struttura

```
├── index.html               # entry HTML in root (convenzione Vite)
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   └── components/
│       ├── LanzaroteItinerary.jsx
│       └── DayMap.jsx
├── _refs/                   # riferimenti locali (mockup/immagini), gitignored — mai pushato
├── Lanzorote26.md
└── CLAUDE.md
```

## Theming (tema scuro/chiaro)

I colori del componente vivono in **CSS custom properties** definite nel blocco `<style>` inline:
- `:root` → palette **scura** (default, identica al design originale).
- `:root[data-theme="light"]` → override della palette **chiara**.

L'attributo `data-theme` viene impostato su `document.documentElement` (l'`<html>`) da un `useLayoutEffect` nel componente, in base allo state `theme`. La funzione `getInitialTheme()` decide il valore iniziale (`localStorage` → `prefers-color-scheme` → `dark`).

Variabili chiave: `--bg`, `--title`, `--title-em`, `--gold`, `--gold-rgb`, `--text-rgb`, `--surface-rgb`, `--item-bg`, `--glow-a`, `--glow-b`. I colori translucidi sono composti con `rgba(var(--text-rgb), .XX)` / `rgba(var(--surface-rgb), .XX)`: i triplet RGB cambiano per tema, gli alpha restano costanti.

**Vincoli per future modifiche ai colori**: non reintrodurre colori hardcoded nelle regole CSS o negli stili inline JSX dipendenti dal tema — usare sempre le variabili. Restano hardcoded (uguali nei due temi) solo i colori "accent" per-giorno (`days[].accent`), i `typeColors` e i colori semantici +/- del budget (`#e05252` / `#7cba6c`).

## Mappa (itinerario visuale)

Tab "Mappa" con selettore del giorno (1–8) + `DayMap` per il giorno selezionato.

**Modello dati**: ogni giorno in `days[]` può avere un campo opzionale `stops`, array ordinato di tappe geolocalizzate:
```js
stops: [
  { label: "Playa Papagayo", coords: [lat, lng] },
  ...
]
```
L'ordine di `stops` definisce il percorso (polyline). I giorni **senza** `stops` mostrano un placeholder ("mappa non ancora disponibile"). La costante `BASE` (alloggio Puerto del Carmen) è il punto di partenza, mostrato come marker 🏠 e inizio della polyline.

**Stato attuale**: **tutti gli 8 giorni** hanno `stops`. Il branch placeholder ("mappa non ancora disponibile") resta come fallback di sicurezza per eventuali giorni futuri senza `stops`, ma al momento non viene mai mostrato.

**Tile / tema**: `DayMap` sceglie i tile CARTO `light_all` o `dark_all` in base alla prop `theme`. `MapContainer` ha `key={day-theme}` per rimontare al cambio giorno/tema. I marker sono `L.divIcon` stilizzati via CSS (`.daymap-pin`, `.daymap-home`) — nessuna immagine marker di Leaflet, così si evita il problema dei path icona con i bundler.

**Coordinate**: assegnate manualmente (approssimate sui luoghi reali), non c'è geocoding. `Lanzorote26.md` è il riferimento per i nomi dei luoghi.

## Spunta attività (completamento)

Nella tab "Itinerario" ogni voce di `days[].items` è marcabile come **completata** (clic sulla spunta circolare a sinistra **o** sull'intera riga; ri-clic per smarcare). Tastiera: l'item è `role="button"` / `tabIndex=0`, attivabile con `Enter`/`Spazio`.

**Modello dati**: lo stato è un `Set` di chiavi `${giorno}-${indice}` (es. `"2-0"`), tenuto nello state React `done`. L'identità di un'attività dipende quindi dalla sua **posizione (indice) in `items`**: riordinare/inserire voci in `items` rimescola le spunte già salvate (vincolo accettato, dati hardcoded).

**Persistenza**: `localStorage`, chiave `doneItems` (array serializzato del Set). È locale al singolo dispositivo/browser — **non** è condivisa tra utenti né tra device (scelta esplicita: niente backend/DB). `getInitialDone()` la rilegge al mount; un `useEffect` la riscrive a ogni cambio.

**UI**: attività completata → `.item.done` (testo barrato via `background-size` animato + opacità `.45`); la spunta `.item-check` si riempie con l'accent del giorno (passato via CSS var inline `--accent`). Quando **tutte** le voci di un giorno sono done → `.day-card.completed` (card sbiadita: `opacity`/`saturate` ridotti, attenuati su hover e da aperta) + `.day-done-check` (✓ nell'accent vicino al chevron, che sostituisce il `badge` se presente). **Niente contatori** per scelta esplicita.

## Deploy

Target: **Vercel** con auto-detection del preset Vite. Non serve `vercel.json`: Vercel rileva `vite` in `package.json`, usa `npm run build` come build command e `dist` come output directory.

Flusso (vedi `README.md` per dettagli):
- Importare il repo su [vercel.com/new](https://vercel.com/new) → preset Vite rilevato automaticamente → deploy.
- Push su `main` → Production Deployment.
- Push su altri branch (es. `dev`) → Preview Deployment.

Se in futuro l'app dovesse aggiungere un client-side router (React Router, ecc.), aggiungere `vercel.json` con un rewrite SPA: `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`.

## Comandi

- `npm install` — installa dipendenze
- `npm run dev` — dev server Vite (default `http://localhost:5173`)
- `npm run build` — build di produzione in `dist/`
- `npm run preview` — serve localmente la build di `dist/`

## Convenzioni e vincoli operativi

- **Lingua**: contenuti utente (UI, commit, doc interni di progetto come questo CLAUDE.md) in **italiano**. Codice (nomi variabili, funzioni) in inglese.
- **Stili**: gli stili del componente itinerario sono inline in `<style>{...}</style>` per scelta esplicita. Non introdurre Tailwind, CSS modules o librerie UI senza richiesta esplicita. Eccezione concordata: **Leaflet** per la mappa (più il suo CSS importato in `main.jsx`); i marker restano stilizzati via CSS inline del componente.
- **Dati itinerario**: `days`, `budget`, `typeColors`, `typeLabels` sono hardcoded nel componente. Non sostituire con fetch/API senza richiesta esplicita. Le evolutive sui contenuti vanno allineate con `Lanzorote26.md`.
- **Non modificare l'itinerario proposto** o la grafica esistente senza richiesta esplicita: il componente è frutto di scelte di design già validate dall'utente.
- **Ritmo di lavoro**: in questo repo, quando si lavora su un piano multi-milestone, eseguire **una milestone alla volta** e fermarsi a fine milestone in attesa di OK esplicito dall'utente. Aggiornare questo `CLAUDE.md` al termine di ciascuna milestone (struttura, comandi, convenzioni aggiunte).

## Git

- Branch principale: `main`. Branch di lavoro corrente: `dev`.
- Repository con remote già configurato.
