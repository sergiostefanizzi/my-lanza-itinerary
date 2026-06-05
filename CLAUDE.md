# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stato del progetto

App React **personale** per consultare un itinerario di viaggio a Lanzarote (giugno 2026). Lingua dei contenuti: italiano. L'app è un single-page React senza routing né backend.

Milestone correnti completate: **M0** (CLAUDE.md), **M1** (scaffolding Vite), **M2** (componente migrato in `src/components/`). Il file originale `lanzarote-itinerario.jsx` resta ancora in root come backup fino al completamento della verifica end-to-end in M3. Piano completo: `C:\Users\sergi\.claude\plans\voglio-costuire-un-app-rosy-cloud.md`.

## Stack

- **Vite 5** + **React 18** (JS, no TypeScript)
- Deploy target: **Vercel** (auto-detection del preset Vite, no `vercel.json`)
- Nessuna libreria UI esterna: il componente itinerario è self-contained con stili inline

## File chiave

- **`src/components/LanzaroteItinerary.jsx`** — componente React unico, ~523 righe. Self-contained: `useState` per accordion/tab, zero dipendenze UI esterne, stili interamente in un blocco `<style>{...}</style>` inline (no Tailwind, no shadcn/ui, no CSS esterno). Dati hardcoded nelle costanti `days[]`, `budget[]`, `typeColors`, `typeLabels`.
- **`src/App.jsx`** — wrapper minimale che renderizza `<LanzaroteItinerary />`. Aggiungere qui eventuali provider/router globali in futuro.
- **`src/main.jsx`** — entry point: `createRoot` + `<StrictMode>` + import di `./index.css`.
- **`src/index.css`** — reset minimo (`html, body { margin: 0 }`). Tutto il resto degli stili vive inline nel componente.
- **`lanzarote-itinerario.jsx`** (root) — **copia originale**, mantenuta come backup fino a fine M3. Da eliminare dopo verifica end-to-end.
- **`Lanzorote26.md`** — appunti grezzi del viaggio (voli, alloggio, noleggio auto, attrazioni, ristoranti, tour). **Fonte di verità** per le evolutive future dei contenuti. Non viene importato dall'app: serve come reference per quando si aggiorneranno i dati dell'itinerario.
- **`README.md`** — al momento contiene solo il titolo; verrà completato in Milestone 4 con istruzioni di sviluppo e deploy.

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
│       └── LanzaroteItinerary.jsx
├── lanzarote-itinerario.jsx # backup originale (rimosso a fine M3)
├── Lanzorote26.md
└── CLAUDE.md
```

Deploy target: **Vercel** con auto-detection del preset Vite (no `vercel.json`).

## Comandi

- `npm install` — installa dipendenze
- `npm run dev` — dev server Vite (default `http://localhost:5173`)
- `npm run build` — build di produzione in `dist/`
- `npm run preview` — serve localmente la build di `dist/`

## Convenzioni e vincoli operativi

- **Lingua**: contenuti utente (UI, commit, doc interni di progetto come questo CLAUDE.md) in **italiano**. Codice (nomi variabili, funzioni) in inglese.
- **Stili**: gli stili del componente itinerario sono inline in `<style>{...}</style>` per scelta esplicita. Non introdurre Tailwind, CSS modules o librerie UI senza richiesta esplicita.
- **Dati itinerario**: `days`, `budget`, `typeColors`, `typeLabels` sono hardcoded nel componente. Non sostituire con fetch/API senza richiesta esplicita. Le evolutive sui contenuti vanno allineate con `Lanzorote26.md`.
- **Non modificare l'itinerario proposto** o la grafica esistente senza richiesta esplicita: il componente è frutto di scelte di design già validate dall'utente.
- **Ritmo di lavoro**: in questo repo, quando si lavora su un piano multi-milestone, eseguire **una milestone alla volta** e fermarsi a fine milestone in attesa di OK esplicito dall'utente. Aggiornare questo `CLAUDE.md` al termine di ciascuna milestone (struttura, comandi, convenzioni aggiunte).

## Git

- Branch principale: `main`. Branch di lavoro corrente: `dev`.
- Repository con remote già configurato.
