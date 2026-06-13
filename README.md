# my-lanza-itinerary

App React personale per consultare un itinerario di viaggio a Lanzarote (18–25 giugno 2026): timeline degli 8 giorni con attività, viste e logistica, più una tab budget con spese pianificate.

L'app è ad **accesso riservato**: per usarla bisogna registrarsi/accedere con **email + password** (autenticazione Supabase). Il numero massimo di utenti registrabili è configurabile via variabile d'ambiente.

Stack: **Vite 5 + React 18** (JS) · **Supabase** (auth) · **Leaflet** (mappa). Deploy su **Vercel**.

## Prerequisiti

- Node.js ≥ 18
- Un progetto **Supabase** (free tier) per l'autenticazione

## Configurazione (variabili d'ambiente)

Copia `.env.example` in `.env` (gitignored) e compila i valori; imposta le stesse variabili anche su **Vercel** (Project → Settings → Environment Variables):

| Variabile | Dove | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | client + server | URL del progetto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client + server | publishable key (`sb_publishable_…`, pubblica per design) |
| `SUPABASE_SECRET_KEY` | **solo** server | secret key (`sb_secret_…`) — crea/conta utenti; **mai** esposta al client |
| `MAX_USERS` | solo server | tetto registrazioni |

## Setup Supabase (una tantum)

1. Crea un progetto su [supabase.com](https://supabase.com).
2. **Authentication → Providers → Email**: abilitato, con **"Confirm email" OFF**.
3. **Authentication → settings**: **"Allow new users to sign up" OFF** (l'unico modo per creare utenti è la funzione `/api/register`, che applica il limite).
4. **SQL Editor**: crea la funzione di conteggio usata dal limite:
   ```sql
   create or replace function public.count_users()
   returns integer language sql security definer set search_path = '' as $$
     select count(*)::int from auth.users;
   $$;
   ```
5. **Settings → API Keys**: copia Project URL, Publishable key e Secret key nelle variabili d'ambiente (`.env` locale + Vercel) e imposta `MAX_USERS`.

## Sviluppo locale

```bash
npm install
npm run dev      # dev server Vite su http://localhost:5173
npm run build    # build di produzione in dist/
npm run preview  # serve localmente la build prodotta
```

> ⚠️ `npm run dev` (Vite) **non** serve la cartella `api/`: login e gate si provano normalmente, ma la **registrazione** (funzione serverless `/api/register`) richiede `vercel dev` o un preview deploy su Vercel.

## Deploy su Vercel

Vercel rileva automaticamente Vite (build `npm run build`, output `dist`) e serve la cartella `api/` come funzioni serverless. Non serve `vercel.json`.

1. Importa il repository su [vercel.com/new](https://vercel.com/new) (preset **Vite** rilevato).
2. Imposta le **Environment Variables** (vedi tabella sopra).
3. Deploy.

Ogni push su `main` triggera un Production Deployment; ogni push su altri branch (es. `dev`) genera un Preview Deployment. Per cambiare il tetto registrazioni basta modificare `MAX_USERS` su Vercel (nessuna modifica al codice).

## Struttura

```
api/
└── register.js                       # funzione serverless: crea utenti + limite MAX_USERS
src/
├── main.jsx                          # entry: createRoot + StrictMode
├── App.jsx                           # gate auth: AuthGate oppure itinerario + "Esci"
├── index.css                         # reset minimo
├── lib/
│   └── supabaseClient.js             # client Supabase (browser)
└── components/
    ├── LanzaroteItinerary.jsx        # componente unico, dati + stili inline
    ├── AuthGate.jsx                  # schermata login/registrazione
    └── DayMap.jsx                    # mappa Leaflet di un giorno
```

Gli appunti grezzi del viaggio (voli, alloggio, attrazioni, ristoranti) sono in `Lanzorote26.md`.
