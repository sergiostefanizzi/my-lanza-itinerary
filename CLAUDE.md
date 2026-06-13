# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stato del progetto

App React **personale** per consultare un itinerario di viaggio a Lanzarote (giugno 2026). Lingua dei contenuti: italiano. L'app è un single-page React senza routing. **Accesso riservato**: è protetta da autenticazione email/password (Supabase). Il "backend" è Supabase (auth + una funzione serverless Vercel per il limite registrazioni) e una tabella `done_items` per le **spunte condivise tra utenti in tempo reale**. Vedi sezioni "Autenticazione" e "Spunta attività".

Milestone di scaffolding completate: **M0–M4** (CLAUDE.md, scaffolding Vite, migrazione in `src/`, verifica end-to-end, README + istruzioni deploy Vercel). Piano archiviato: `C:\Users\sergi\.claude\plans\voglio-costuire-un-app-rosy-cloud.md`.

Evolutive funzionali completate:
- **Tema scuro/chiaro** — toggle sole/luna fisso in alto a destra. Tema iniziale: `localStorage` → altrimenti `prefers-color-scheme` → fallback scuro. La scelta è persistita in `localStorage` (chiave `theme`).
- **Itinerario visuale su mappa** (tab "Mappa", Leaflet) — componente `DayMap` + tab Mappa con selettore giorno. Coordinate (`stops`) presenti per **tutti gli 8 giorni**. Vedi sezione "Mappa".
- **Spunta attività completate** — ogni attività si marca/smarca come completata cliccando **la spunta circolare** a sinistra (testo barrato + riga sbiadita). Quando **tutte** le attività obbligatorie di un giorno sono completate, la card del giorno si sbiadisce (+ piccolo ✓ nell'accent del giorno). Niente contatori. Stato persistito in `localStorage` (chiave `doneItems`, array di chiavi `${giorno}-${indice}`). Vedi sezione "Spunta attività".
- **Espansione voci** — le voci `vista`/`attività` con contenuto sono cliccabili (clic sull'intera riga, triangolino ▼) per aprire un pannello con immagine del luogo + breve descrizione (cosa si fa · perché visitarlo). Apertura **a fisarmonica** (una alla volta), stato effimero. Immagini da Wikimedia Commons. Applicato a **tutti i giorni** (G1–G7; G8 è solo logistica). Vedi sezione "Espansione voci".
- **Layout responsive** — media query `@media (max-width: 560px)` per lo smartphone in verticale (desktop/iPad invariati). Vedi sezione "Responsive".

Contenuti itinerario allineati a `Lanzorote26.md` (tour confermati giugno 2026, costruiti sulla sezione "Cose da vedere"): **G2** relax/spiagge alle calette di Papagayo · **G3** Haría e Nord + Mercato (solo sabato, Jameos incluso) · **G4** Mirador del Río + La Graciosa (€77/pers, traghetto incluso) + Caletón Blanco · **G5** Timanfaya (8:00–13:00) + Sud vulcanico (Las Grietas, El Golfo, Janubio) · **G6** Manrique e Centro (Casa Museo del Campesino, Fundación, Lagomar, Teguise, Famara) · **G7** buggy a Costa Teguise + Arrecife + La Geria + degustazione al tramonto (Finca Testeina). Vincoli: i vini stanno **solo** su G7 (non sul giorno di Timanfaya); Mirador del Río è **insieme** a La Graciosa; **Bodega El Grifo** e **Sentiero Vulcano del Corvo** esclusi (non desiderati); snorkeling guidato e kart rimossi. Ogni giornata (tranne arrivo G1 e partenza G8) ha **pranzo e cena** come voci `cibo` separate, con locali dalla sezione "Posti interessanti per mangiare" del file. Nel tab Budget **non** c'è più la sezione "Alternative disponibili". Il budget include ora tour **e** ingressi (CACT, musei, accesso Papagayo). Budget totale stimato: **€781,66 / coppia**.

## Stack

- **Vite 5** + **React 18** (JS, no TypeScript)
- Deploy target: **Vercel** (auto-detection del preset Vite, no `vercel.json`)
- **Leaflet** + **react-leaflet** per la mappa (unica libreria UI esterna, introdotta su richiesta esplicita dell'utente per l'itinerario visuale). Tile CARTO (gratis, no API key).
- A parte la mappa, il componente itinerario resta self-contained con stili inline
- **Supabase** (`@supabase/supabase-js`) per l'autenticazione email/password (accesso protetto). Vedi sezione "Autenticazione".

## Autenticazione (accesso protetto)

L'app è ad **accesso riservato**: per usarla bisogna **registrarsi/loggarsi con email + password**. Deroga esplicita al "no backend" originale (app personale, pochi utenti fidati). Niente Google/Apple, **niente conferma email** (si entra subito).

**Provider**: Supabase Auth. Si usano le **nuove API keys** (non le legacy `anon`/`service_role`, in dismissione a fine 2026):
- **publishable key** (`sb_publishable_...`) → client browser, pubblica per design (`src/lib/supabaseClient.js`).
- **secret key** (`sb_secret_...`) → **solo** lato server, nella funzione `/api/register`; mai esposta al client.

**Configurazione Supabase** (dashboard): provider Email ON, **Confirm email OFF**, **registrazioni pubbliche OFF** (Authentication → settings: "Allow new users to sign up" disattivato). Così l'**unico** modo per creare utenti è la funzione serverless con la secret key → il client non può bypassare il limite chiamando `signUp`. Funzione SQL per il conteggio (chiamata via RPC dal server):
```sql
create or replace function public.count_users()
returns integer language sql security definer set search_path = '' as $$
  select count(*)::int from auth.users;
$$;
```

**Limite registrazioni** (`MAX_USERS`): la funzione serverless `api/register.js` accetta solo **POST**, valida email/password (password ≥ 6 → `400 invalid_email`/`weak_password`), legge `process.env.MAX_USERS`, conta gli utenti con `rpc('count_users')` (secret key) e risponde **403 `limit`** oltre soglia; altrimenti crea l'utente con `admin.createUser({ email, password, email_confirm: true })` (email già confermata → login immediato), **409 `email_exists`** se l'email esiste già, **200 `{ ok: true }`** al successo. Config mancante (`VITE_SUPABASE_URL`/`SUPABASE_SECRET_KEY`/`MAX_USERS` intero) → **500 `server_misconfigured`** (fail-closed). Nessun segreto nel corpo della risposta. Il numero si cambia da **Vercel** (env var) senza toccare il codice.

**Flussi**: registrazione → `POST /api/register` poi `signInWithPassword`; login → `signInWithPassword` (diretto a Supabase).

**Sessione ≥3 settimane**: comportamento **di default** di Supabase (`persistSession` + `autoRefreshToken` su localStorage, refresh token che non scade). Non abilitare timeout di inattività/time-box.

**Gate UI**: `App.jsx` osserva la sessione (`getSession` + `onAuthStateChange`); senza sessione mostra `<AuthGate />` (login/registrazione a tema), altrimenti `<LanzaroteItinerary />` + pulsante "Esci". `LanzaroteItinerary.jsx` **non si tocca** (l'auth è un cancello davanti).

**Variabili d'ambiente** (`.env` locale gitignored + Vercel → Settings → Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (client, pubbliche); `SUPABASE_SECRET_KEY`, `MAX_USERS` (solo server). Template in **`.env.example`**. La funzione serverless legge anche le `VITE_*` da `process.env` (su Vercel sono disponibili lato server; il prefisso governa solo l'esposizione al bundle client).

**Dev locale**: `npm run dev` (Vite) **non** serve `/api`. Login e gate si provano con `npm run dev`; la **registrazione** (funzione serverless) richiede `vercel dev` o un preview deploy su Vercel.

**Sicurezza**: la secret key sta **solo** nelle env della funzione serverless (revocabile/rigenerabile singolarmente se trapela, senza ruotare il JWT secret). Il client espone **una sola** tabella, `done_items` (spunte condivise, vedi "Spunta attività"), protetta da **RLS** (solo `authenticated`) → l'avviso Supabase "publishable safe in browser **se** RLS abilitato" è rispettato. La funzione `count_users()` è chiamata solo lato server con la secret key. Reset password "dimenticata" è **fuori scope** (richiede invio email).

**Stato milestone**: **TUTTE COMPLETATE.** M1 (dipendenza `@supabase/supabase-js`, `src/lib/supabaseClient.js`, `.env.example`, doc); M2 (funzione `api/register.js` + limite `MAX_USERS`); M3 (`src/components/AuthGate.jsx` + gate/logout in `App.jsx`, README aggiornato). Restano azioni manuali dell'utente lato Supabase (provider Email ON, Confirm email OFF, signup pubblico OFF, funzione `count_users()`) e le env su Vercel.

## File chiave

- **`src/components/LanzaroteItinerary.jsx`** — componente React unico. Self-contained: `useState` per accordion/tab/tema/mappa/spunte (`done`), zero dipendenze UI esterne, stili interamente in un blocco `<style>{...}</style>` inline (no Tailwind, no shadcn/ui, no CSS esterno). Dati hardcoded nelle costanti `days[]`, `budget[]`, `typeColors`, `typeLabels`. Il tema è gestito via CSS variables (vedi sezione "Theming"). Lo stato delle attività completate è in `localStorage` (vedi sezione "Spunta attività").
- **`src/components/DayMap.jsx`** — mappa Leaflet di un singolo giorno: tile CARTO (chiaro/scuro in base al tema), polyline del percorso nell'accent del giorno, segnaposto numerati (`L.divIcon`, niente immagini), marker della base (alloggio). Props: `day`, `base`, `theme`.
- **`src/App.jsx`** — gate di autenticazione: osserva la sessione Supabase (`getSession` + `onAuthStateChange`); senza sessione renderizza `<AuthGate />`, con sessione `<LanzaroteItinerary />` + pulsante "Esci" (overlay fisso in alto a **sinistra**, stile a pillola con piccolo `<style>` proprio, usa le CSS var del tema). Non tocca `LanzaroteItinerary.jsx`. Vedi sezione "Autenticazione".
- **`src/components/AuthGate.jsx`** — schermata login/registrazione, self-contained con `<style>` inline e palette propria (copia delle CSS var dei due temi), stesso toggle sole/luna e chiave `localStorage('theme')` dell'itinerario. Tab Accedi/Registrati, campi email+password (con mostra/nascondi), messaggi d'errore in italiano. Login → `signInWithPassword`; registrazione → `POST /api/register` poi `signInWithPassword`. Vedi sezione "Autenticazione".
- **`src/main.jsx`** — entry point: `createRoot` + `<StrictMode>` + import di `leaflet/dist/leaflet.css` e `./index.css`.
- **`src/index.css`** — reset minimo (`html, body { margin: 0 }`). Tutto il resto degli stili vive inline nel componente.
- **`src/lib/supabaseClient.js`** — client Supabase per il browser (publishable key, sessione persistente/auto-refresh). Vedi sezione "Autenticazione".
- **`src/lib/doneItems.js`** — accesso dati alle **spunte condivise** (tabella `done_items` su Supabase): `fetchDoneKeys()`, `addDone(key)`, `removeDone(key)`, `subscribeDoneItems({onInsert,onDelete})` (Realtime). Accesso via publishable key + RLS (solo `authenticated`). Vedi sezione "Spunta attività".
- **`src/lib/expenses.js`** — accesso dati + logica della **cassa comune** (spese condivise stile Splitwise). Tabelle `profiles` (id+nome) ed `expenses` su Supabase. Profili: `fetchProfiles`/`getMyName`/`setMyName`. Spese: `fetchExpenses`/`addExpense`/`deleteExpense`/`subscribeExpenses`/`unsubscribeExpenses` (Realtime). Logica pura (no rete): `computeBalances(expenses)` → saldi netti, `computeSettlement(balances)` → trasferimenti minimi "chi deve a chi". RLS (solo `authenticated`). Vedi sezione "Spese condivise".
- **`Lanzorote26.md`** — appunti grezzi del viaggio (voli, alloggio, noleggio auto, attrazioni, ristoranti, tour). **Fonte di verità** per le evolutive future dei contenuti. Non viene importato dall'app: serve come reference per quando si aggiorneranno i dati dell'itinerario.
- **`README.md`** — descrizione progetto, comandi di sviluppo e istruzioni di deploy su Vercel.

## Struttura

```
├── index.html               # entry HTML in root (convenzione Vite)
├── .env.example             # template variabili Supabase (copiare in .env)
├── package.json
├── vite.config.js
├── api/
│   └── register.js          # funzione serverless Vercel: crea utenti + limite MAX_USERS
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   ├── supabaseClient.js # client Supabase (browser)
│   │   ├── doneItems.js      # accesso dati spunte condivise (tabella + realtime)
│   │   └── expenses.js       # cassa comune: dati spese/profili + logica settle-up
│   └── components/
│       ├── LanzaroteItinerary.jsx
│       ├── AuthGate.jsx      # schermata login/registrazione (gate)
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

## Responsive (smartphone in verticale)

Il layout base è tarato su `.wrap { max-width: 680px }` e va bene così su **desktop e tablet** (es. iPad portrait, 768px). Per lo **smartphone in verticale** c'è un'unica media query `@media (max-width: 560px)` in fondo al blocco `<style>` inline (sopra la chiusura `` `}</style> ``). Breakpoint scelto a **560px**: sotto i telefoni più larghi in portrait (~430px) e sopra l'iPad portrait (768px), così tablet/desktop restano intatti.

Cosa adatta la media query (solo dimensioni/spaziature, nessun colore o ridisegno): padding di `.wrap`/header/`.day-head`/`.day-items`/`.item`, dimensioni di `.big-title`/`.year`/`.stat-val`/`.day-ico`/`.day-num`/`.day-ttl`, tab a larghezza piena (`.tab-btn { flex: 1 }`), `.badge` che va a capo con `max-width`, mappa più bassa (`.day-map-wrap` 360px) e budget compatto. **Scelta chiave**: sul telefono la chip del tipo (`.item-chip`) è `display: none` (ridondante con la legenda in alto e l'icona della voce), per restituire larghezza al testo della voce. Se in futuro si aggiungono elementi alle righe, verificarne il comportamento entro questa media query.

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

Nella tab "Itinerario" ogni voce di `days[].items` è marcabile come **completata** cliccando **solo la spunta circolare** a sinistra (`.item-check`, ora un `<button>`; ri-clic per smarcare). Il clic sull'intera riga **non** barra più: è riservato all'espansione (vedi sezione "Espansione voci"). La spunta usa `e.stopPropagation()` sul clic e sul keydown `Enter`/`Spazio`, così non attiva anche l'espansione; ha un'area di tocco allargata (`.item-check::after { inset: -9px }`) per il mobile.

**Modello dati**: lo stato è un `Set` di chiavi `${giorno}-${indice}` (es. `"2-0"`), tenuto nello state React `done`. L'identità di un'attività dipende quindi dalla sua **posizione (indice) in `items`**: riordinare/inserire voci in `items` rimescola le spunte già salvate (vincolo accettato, dati hardcoded).

**Persistenza (CONDIVISA tra utenti, via Supabase + Realtime)**: lo stato è salvato nella tabella `public.done_items` su Supabase (una riga per chiave barrata) ed è **condiviso da tutti gli utenti loggati**: quando uno barra/sbarra, la modifica si propaga a tutti **in tempo reale**. L'accesso passa dal modulo `src/lib/doneItems.js` (`fetchDoneKeys`/`addDone`/`removeDone`/`subscribeDoneItems`), con publishable key + **RLS** (solo `authenticated`; policy SELECT/INSERT/DELETE su tutto — lista condivisa tra utenti fidati). Flusso nel componente: al mount `fetchDoneKeys()` popola `done` (sovrascrivendo la cache); un `useEffect` apre la subscription Realtime (INSERT→add, DELETE→delete sul `Set`) con cleanup `unsubscribeDoneItems`; `toggleDone` fa un **update ottimistico** del `Set` poi scrive sul server, con **rollback** su errore. `localStorage` (chiave `doneItems`) resta **solo come cache** per il primo paint / lettura offline: `getInitialDone()` la rilegge al mount (prima del fetch) e un `useEffect` la riscrive a ogni cambio. Modello a chiavi position-based invariato. Coda offline persistente = fuori scope (spunte offline che non riescono a scrivere vengono annullate).

**UI**: attività completata → `.item.done` (testo barrato via `background-size` animato; l'opacità `.45` si applica a `.item-main`, **non** all'intera `.item`, così il pannello dettagli espanso resta leggibile); la spunta `.item-check` si riempie con l'accent del giorno (passato via CSS var inline `--accent`). Quando tutte le voci **obbligatorie** di un giorno sono done → `.day-card.completed` (card sbiadita: `opacity`/`saturate` ridotti, attenuati su hover e da aperta) + `.day-done-check` (✓ nell'accent vicino al chevron, che sostituisce il `badge` se presente). **Niente contatori** per scelta esplicita.

**Attività opzionali** (campo `optional: true`): le voci marcate `optional` sono renderizzate in una **sezione separata "Opzionali"** (divisore `.opt-divider`) sotto le obbligatorie, con stile a bordo tratteggiato (`.item.optional`). **Non** contano per il completamento del giorno: `dayDone = hasMandatory && d.items.every((it, i) => it.optional || done.has(...))`. Restano comunque spuntabili individualmente. Il render è estratto in una funzione locale `renderItem({item, i})` (l'indice `i` resta quello originale in `d.items`, per coerenza con le chiavi `done`); gli item si partizionano in `mandatoryItems` / `optionalItems`. Esempio G3: Mercado de Haría e Piscine di Punta Mujeres sono opzionali.

## Espansione voci (immagine + descrizione)

Le voci di tipo **`vista`**, **`attività`** e **`cibo`** che hanno contenuto (`image` e/o `desc`) sono **espandibili**: clic sull'intera riga → si apre un pannello con **immagine** (del luogo o del ristorante/zona, oppure un piatto canario per i pasti senza posizione precisa) + **descrizione breve** (cosa si fa/mangia · perché). Un **triangolino ▼** a destra della riga (`.item-chevron`, ruota di 180° all'apertura, come il chevron dei giorni) segnala l'espandibilità. Le voci `logistica` (e qualsiasi voce senza `image`/`desc`) non si espandono e non hanno triangolino.

**Espandibilità**: `const expandable = !!(item.desc || item.image)` — basata sul contenuto, non sul tipo, così aggiungendo `image`/`desc` ad altri giorni si "accendono" da sé. Solo quando `expandable` la `.item-main` riceve `role="button"`, `tabIndex=0`, `aria-expanded` e l'handler tastiera (`Enter`/`Spazio`).

**Stato (a fisarmonica)**: `expandedItem` (state React, **una sola voce aperta alla volta** in tutta l'app, come `openDay` per i giorni). Chiave `${giorno}-${indice}`. È **effimero**: non persistito in `localStorage` (a differenza di `done`/`theme`). `toggleExpand(key)` apre/chiude.

**Struttura DOM**: la `.item` è ora un contenitore (background/bordo/raggio, `overflow:hidden`) che impila `.item-main` (la riga flex: spunta, ora, icona, testo, chip, chevron) e `.item-detail` (il pannello, animato via `max-height` come `.day-body`). `.item-detail-inner` contiene `<img class="item-img">` (`object-fit:cover`, `loading="lazy"`, `alt`=testo voce) e `<p class="item-desc">`.

**Max-height del day-body (clip delle espansioni)**: `.day-body` usa `overflow:hidden` + `max-height` per l'animazione apri/chiudi del giorno. A giorno aperto il limite è `900px`; quando una voce è espansa il contenuto cresce e supererebbe il limite, tagliando il pannello (si notava sulle **opzionali**, che stanno in fondo alla lista). Fix: il giorno che contiene la voce espansa riceve la classe **`has-expanded`** (calcolata in `days.map` come `expandedItem` appartenente a `d.day`) e `.day-card.open.has-expanded .day-body` sale a `3000px`. Si alza il limite **solo** in quel caso, così l'animazione normale del giorno resta stretta/reattiva.

**Auto-scroll in alto (giorno/voce)**: aprendo un giorno o espandendo una voce, la pagina scrolla per portare l'elemento il più in alto possibile (margine 12px). Implementato con due `useRef` (`dayRefs`, `itemRefs`, ref-callback per chiave `d.day` / `${giorno}-${indice}`) e due `useEffect` su `openDay` / `expandedItem`: lo scroll (`window.scrollTo`, `behavior:"smooth"`) parte con un `setTimeout(~420ms)` per attendere che l'animazione apri/chiudi (0.4s) si assesti — necessario perché chiudendo un giorno/voce *sopra* la posizione finale del target cambia. Non scrolla in chiusura (`openDay`/`expandedItem` null) né al primo render (`skipFirstDayScroll`).

**Immagini**: URL remoti da **Wikimedia Commons** (scelta esplicita: niente file locali per ora → servono connessione; offline non si vedono). Sono thumbnail `upload.wikimedia.org/.../thumb/.../1280px-...` ottenuti via API `imageinfo`/`pageimages` di Commons (URL stabili, accenti URL-encoded). Il campo `image` è una semplice stringa: per passare a file locali in futuro basta cambiare il path. **Stato**: applicato a **tutte** le voci `vista`/`attività`/`cibo` (G1–G7; G8 solo logistica). Voci con sola `desc` (nessuna immagine adatta su Commons), comunque espandibili: **Playa de la Cera** (G2), **Pranzo picnic** (G2), **Cena Casa Tino** (G4). Immagini "rappresentative" più deboli da rivedere se non piacciono: **Buggy** (Costa Teguise), **Degustazione** (vigneti La Geria), **cene/pranzi senza locale Commons** che usano un piatto canario (mojo + papas: Teleclub G4, Mirador de las Salinas G5, Barlovento G6) o la zona (es. Puerto del Carmen per Mura G1 e Meneo G7). Procedura per aggiungerne/sostituirne: cercare il file su Commons via API `imageinfo` e incollare il `thumburl`.

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
