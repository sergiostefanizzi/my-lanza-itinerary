# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stato del progetto

App React **personale** per consultare un itinerario di viaggio a Lanzarote (giugno 2026). Lingua dei contenuti: italiano. L'app è un single-page React senza routing né backend.

Milestone di scaffolding completate: **M0–M4** (CLAUDE.md, scaffolding Vite, migrazione in `src/`, verifica end-to-end, README + istruzioni deploy Vercel). Piano archiviato: `C:\Users\sergi\.claude\plans\voglio-costuire-un-app-rosy-cloud.md`.

Evolutive funzionali completate:
- **Tema scuro/chiaro** — toggle sole/luna fisso in alto a destra. Tema iniziale: `localStorage` → altrimenti `prefers-color-scheme` → fallback scuro. La scelta è persistita in `localStorage` (chiave `theme`).
- **Itinerario visuale su mappa** (tab "Mappa", Leaflet) — componente `DayMap` + tab Mappa con selettore giorno. Coordinate (`stops`) presenti per **tutti gli 8 giorni**. Vedi sezione "Mappa".
- **Spunta attività completate** — ogni attività dell'itinerario è cliccabile (spunta circolare a sinistra, o clic sull'intera riga) per marcarla/smarcarla come completata: testo barrato + riga sbiadita. Quando **tutte** le attività di un giorno sono completate, la card del giorno si sbiadisce (+ piccolo ✓ nell'accent del giorno). Niente contatori. Stato persistito in `localStorage` (chiave `doneItems`, array di chiavi `${giorno}-${indice}`). Vedi sezione "Spunta attività".

Contenuti itinerario allineati a `Lanzorote26.md` (tour confermati giugno 2026, costruiti sulla sezione "Cose da vedere"): **G2** relax/spiagge alle calette di Papagayo · **G3** Haría e Nord + Mercato (solo sabato, Jameos incluso) · **G4** Mirador del Río + La Graciosa (€77/pers, traghetto incluso) + Caletón Blanco · **G5** Timanfaya (8:00–13:00) + Sud vulcanico (Las Grietas, El Golfo, Janubio) · **G6** Manrique e Centro (Casa Museo del Campesino, Fundación, Lagomar, Teguise, Famara) · **G7** buggy a Costa Teguise + Arrecife + La Geria + degustazione al tramonto (Finca Testeina). Vincoli: i vini stanno **solo** su G7 (non sul giorno di Timanfaya); Mirador del Río è **insieme** a La Graciosa; **Bodega El Grifo** e **Sentiero Vulcano del Corvo** esclusi (non desiderati); snorkeling guidato e kart rimossi. Ogni giornata (tranne arrivo G1 e partenza G8) ha **pranzo e cena** come voci `cibo` separate, con locali dalla sezione "Posti interessanti per mangiare" del file. Nel tab Budget **non** c'è più la sezione "Alternative disponibili". Il budget include ora tour **e** ingressi (CACT, musei, accesso Papagayo). Budget totale stimato: **€781,66 / coppia**.

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

**Convenzione di coerenza**: l'ordine di `stops` deve seguire l'ordine di visita degli `items` del giorno (i pasti negli `items` non sempre sono `stops`, ma le tappe geolocalizzate devono comparire nella stessa sequenza). Se si riordinano gli `items`, riallineare i `stops` corrispondenti, altrimenti la polyline sulla mappa non rispecchia il percorso reale.

**Stato attuale**: **tutti gli 8 giorni** hanno `stops`. Il branch placeholder ("mappa non ancora disponibile") resta come fallback di sicurezza per eventuali giorni futuri senza `stops`, ma al momento non viene mai mostrato.

**Tile / tema**: `DayMap` sceglie i tile CARTO `light_all` o `dark_all` in base alla prop `theme`. `MapContainer` ha `key={day-theme}` per rimontare al cambio giorno/tema. I marker sono `L.divIcon` stilizzati via CSS (`.daymap-pin`, `.daymap-home`) — nessuna immagine marker di Leaflet, così si evita il problema dei path icona con i bundler.

**Coordinate**: assegnate manualmente (approssimate sui luoghi reali), non c'è geocoding. `Lanzorote26.md` è il riferimento per i nomi dei luoghi.

## Orari / timeline (campo `time`)

Ogni voce di `days[].items` può avere un campo opzionale **`time`** (stringa, es. `"10:00"`): l'orario pianificato dell'attività, mostrato come etichetta a sinistra della riga (`.item-time`, font Cormorant nell'accent del giorno). Gli **orari di apertura/chiusura** delle attrazioni (vincoli) vanno nel campo `note` (es. `"Solo sabato · chiude alle 14:30"`).

**Fonte orari**: verificati sul web (centri CACT Lanzarote = `cactlanzarote.com/horarios-y-precios`, validi tutto l'anno; mercato di Haría = sabato ~10:00–14:30). Da riverificare prima del viaggio: gli orari possono cambiare. Vincoli noti che condizionano l'ordine: **Mercado de Haría chiude 14:30**, **Cueva de los Verdes 9:30–16:15** (chiude prima di Jameos, va visitata prima), **Timanfaya accesso 09:00–15:45 solo con prenotazione online**, Jardín de Cactus / Mirador del Río 10:00–17:00, Jameos del Agua 10:00–18:00.

**Stato milestone "informazioni temporali"** (una per giorno, G2→G7): **TUTTE COMPLETATE.** Ogni giorno ha timeline oraria (`time`), orari/durate nei `note` e costi (`cost`/`price`). Note per giorno: G2 Papagayo (cancello 9–19, €3/veicolo, tramonto ~21:00, 5 calette tra gli opzionali). G3 Haría (Cueva prima di Jameos; opzionali Mercado/Punta Mujeres; pranzo Arrieta, cena Punta Mujeres). G4 La Graciosa (traghetto 25 min, Mirador del Río €9 con rientro stretto, Caletón Blanco opzionale). G5 Timanfaya (tour 8–13 rientro a PdC; pranzo El Diablo nel parco, con La Bodega de Santiago come **opzionale**). G6 Manrique (Fundación €10, Lagomar €10, Campesino gratis; Famara opzionale). G7 buggy (€65 p.p.) + Arrecife + La Geria + degustazione €26.

## Costo / biglietti CACT (campo `cost`)

Ogni voce di `days[].items` può avere un campo opzionale **`cost`** con tre valori, reso come pill colorata sotto il testo (`.cost-tag`):
- `"cact"` → **🎟️ CACT · {price} a persona** (oro): centro CACT del Cabildo, biglietto da comprare sul sito ufficiale.
- `"paid"` → **{price} a persona** (rosso) se c'è `price`, altrimenti **€ a pagamento**: tour/ingresso esterno (es. Timanfaya €57, La Graciosa €77, buggy €65/pers, degustazione €26, Fundación €10, Lagomar €10).
- `"free"` → **Gratis** (verde): es. mercato, spiagge, Casa Museo del Campesino, piscine di Punta Mujeres.
- Assente → nessuna pill (pasti `cibo`, logistica).

Le voci con `cost` hanno un campo **`price`** (solo importo, es. `"€9"`) col prezzo **a persona**, mostrato nella pill (sia `cact` sia `paid`). Prezzi ufficiali verificati 2026 (da riverificare prima del viaggio): Jardín de Cactus €9, Cueva de los Verdes €17, Jameos del Agua €17, Mirador del Río €9, Fundación César Manrique €10 (non CACT), Lagomar €10 (non CACT), Casa Museo del Campesino gratis (CACT). Tour (dal file): Timanfaya €57/pers, La Graciosa €77/pers (traghetto 25 min incluso), buggy €130/coppia (= `price: "€65"` p.p.), degustazione Finca Testeina €26/pers. Le voci per-coppia mettono il totale nel `note` e il per-persona in `price`.

**Fatti CACT (verificati 2026)**: il **bono combinato multi-centro è stato eliminato dal 2024**; si comprano **biglietti singoli online** su `ventaonline.cactlanzarote.com`, prenotando data e ora (obbligatorio per la Cueva de los Verdes). Centri CACT: Jardín de Cactus, Cueva de los Verdes, Jameos del Agua, Mirador del Río, Montañas del Fuego (Timanfaya), Castillo de San José, Casa Museo del Campesino (quest'ultima **gratuita**). **Non** sono CACT: Fundación César Manrique e Lagomar (biglietti propri). Queste info stanno nella note-box "Biglietti CACT" del tab Itinerario (con link al sito).

Il campo `cost` va aggiunto a ogni giorno nella sua milestone "informazioni temporali" (per ora applicato solo a **G3**).

## Spunta attività (completamento)

Nella tab "Itinerario" ogni voce di `days[].items` è marcabile come **completata** (clic sulla spunta circolare a sinistra **o** sull'intera riga; ri-clic per smarcare). Tastiera: l'item è `role="button"` / `tabIndex=0`, attivabile con `Enter`/`Spazio`.

**Modello dati**: lo stato è un `Set` di chiavi `${giorno}-${indice}` (es. `"2-0"`), tenuto nello state React `done`. L'identità di un'attività dipende quindi dalla sua **posizione (indice) in `items`**: riordinare/inserire voci in `items` rimescola le spunte già salvate (vincolo accettato, dati hardcoded).

**Persistenza**: `localStorage`, chiave `doneItems` (array serializzato del Set). È locale al singolo dispositivo/browser — **non** è condivisa tra utenti né tra device (scelta esplicita: niente backend/DB). `getInitialDone()` la rilegge al mount; un `useEffect` la riscrive a ogni cambio.

**UI**: attività completata → `.item.done` (testo barrato via `background-size` animato + opacità `.45`); la spunta `.item-check` si riempie con l'accent del giorno (passato via CSS var inline `--accent`). Quando tutte le voci **obbligatorie** di un giorno sono done → `.day-card.completed` (card sbiadita: `opacity`/`saturate` ridotti, attenuati su hover e da aperta) + `.day-done-check` (✓ nell'accent vicino al chevron, che sostituisce il `badge` se presente). **Niente contatori** per scelta esplicita.

**Attività opzionali** (campo `optional: true`): le voci marcate `optional` sono renderizzate in una **sezione separata "Opzionali"** (divisore `.opt-divider`) sotto le obbligatorie, con stile a bordo tratteggiato (`.item.optional`). **Non** contano per il completamento del giorno: `dayDone = hasMandatory && d.items.every((it, i) => it.optional || done.has(...))`. Restano comunque spuntabili individualmente. Il render è estratto in una funzione locale `renderItem({item, i})` (l'indice `i` resta quello originale in `d.items`, per coerenza con le chiavi `done`); gli item si partizionano in `mandatoryItems` / `optionalItems`. Esempio G3: Mercado de Haría e Piscine di Punta Mujeres sono opzionali.

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
