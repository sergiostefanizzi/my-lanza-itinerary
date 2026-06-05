# my-lanza-itinerary

App React personale per consultare un itinerario di viaggio a Lanzarote (18–25 giugno 2026): timeline degli 8 giorni con attività, viste e logistica, più una tab budget con spese pianificate.

Stack: **Vite 5 + React 18** (JS). Deploy su **Vercel**.

## Prerequisiti

- Node.js ≥ 18

## Sviluppo locale

```bash
npm install
npm run dev      # dev server su http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # serve localmente la build prodotta
```

## Deploy su Vercel

Vercel rileva automaticamente Vite e configura framework preset, build command (`npm run build`) e output directory (`dist`). Non serve `vercel.json`.

1. Importa il repository GitHub su [vercel.com/new](https://vercel.com/new).
2. Lascia tutte le impostazioni di default (preset rilevato: **Vite**).
3. Deploy.

Ogni push su `main` triggera un Production Deployment; ogni push su altri branch (es. `dev`) genera un Preview Deployment.

## Struttura

```
src/
├── main.jsx                          # entry: createRoot + StrictMode
├── App.jsx                           # wrapper che renderizza l'itinerario
├── index.css                         # reset minimo
└── components/
    └── LanzaroteItinerary.jsx        # componente unico, dati + stili inline
```

Gli appunti grezzi del viaggio (voli, alloggio, attrazioni, ristoranti) sono in `Lanzorote26.md`.
