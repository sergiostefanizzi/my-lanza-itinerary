# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stato del progetto

App React **personale** per consultare un itinerario di viaggio a Lanzarote (giugno 2026). Lingua dei contenuti: italiano. L'app è un single-page React senza routing né backend.

Al momento (Milestone 0) il repo è **pre-scaffolding**: contiene il solo componente React standalone e gli appunti di viaggio. Lo scaffolding Vite verrà aggiunto nelle milestone successive (vedi `C:\Users\sergi\.claude\plans\voglio-costuire-un-app-rosy-cloud.md`).

## File chiave

- **`lanzarote-itinerario.jsx`** — componente React unico, ~523 righe, attualmente in root. Self-contained: `useState` per accordion/tab, zero dipendenze UI esterne, stili interamente in un blocco `<style>{...}</style>` inline (no Tailwind, no shadcn/ui, no CSS esterno). Dati hardcoded nelle costanti `days[]`, `budget[]`, `typeColors`, `typeLabels`. Questo file verrà spostato in `src/components/LanzaroteItinerary.jsx` in Milestone 2.
- **`Lanzorote26.md`** — appunti grezzi del viaggio (voli, alloggio, noleggio auto, attrazioni, ristoranti, tour). **Fonte di verità** per le evolutive future dei contenuti. Non viene importato dall'app: serve come reference per quando si aggiorneranno i dati dell'itinerario.
- **`README.md`** — al momento contiene solo il titolo; verrà completato in Milestone 4 con istruzioni di sviluppo e deploy.

## Architettura prevista (post-scaffolding)

Stack target: **Vite + React (JS, no TypeScript)**, deploy su **Vercel** con auto-detection (no `vercel.json`).

Struttura finale:

```
├── index.html               # entry HTML in root (convenzione Vite)
├── package.json
├── vite.config.js
├── public/                  # asset statici (creata quando servirà)
├── src/
│   ├── main.jsx             # entry: createRoot + StrictMode
│   ├── App.jsx              # wrapper minimale, renderizza <LanzaroteItinerary />
│   ├── index.css            # reset minimo; il resto degli stili resta inline
│   └── components/
│       └── LanzaroteItinerary.jsx
├── Lanzorote26.md           # appunti, non importato dall'app
└── CLAUDE.md
```

## Comandi

Pre-scaffolding (Milestone 0): nessun comando disponibile, il progetto non è ancora un app Node.

Post-Milestone 1 saranno disponibili (verranno documentati qui quando creati):
- `npm install` — installa dipendenze
- `npm run dev` — dev server su `http://localhost:5173`
- `npm run build` — build di produzione in `dist/`
- `npm run preview` — serve la build prodotta

## Convenzioni e vincoli operativi

- **Lingua**: contenuti utente (UI, commit, doc interni di progetto come questo CLAUDE.md) in **italiano**. Codice (nomi variabili, funzioni) in inglese.
- **Stili**: gli stili del componente itinerario sono inline in `<style>{...}</style>` per scelta esplicita. Non introdurre Tailwind, CSS modules o librerie UI senza richiesta esplicita.
- **Dati itinerario**: `days`, `budget`, `typeColors`, `typeLabels` sono hardcoded nel componente. Non sostituire con fetch/API senza richiesta esplicita. Le evolutive sui contenuti vanno allineate con `Lanzorote26.md`.
- **Non modificare l'itinerario proposto** o la grafica esistente senza richiesta esplicita: il componente è frutto di scelte di design già validate dall'utente.
- **Ritmo di lavoro**: in questo repo, quando si lavora su un piano multi-milestone, eseguire **una milestone alla volta** e fermarsi a fine milestone in attesa di OK esplicito dall'utente. Aggiornare questo `CLAUDE.md` al termine di ciascuna milestone (struttura, comandi, convenzioni aggiunte).

## Git

- Branch principale: `main`. Branch di lavoro corrente: `dev`.
- Repository con remote già configurato.
