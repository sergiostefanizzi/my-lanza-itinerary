import { createClient } from '@supabase/supabase-js'

// Client Supabase per il browser: usa la *publishable key* (pubblica per design,
// privilegi bassi). Le operazioni privilegiate (creazione utenti, conteggio per il
// limite registrazioni) NON passano da qui: vivono nella funzione serverless
// `/api/register` con la secret key. Vedi sezione "Autenticazione" in CLAUDE.md.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  // Messaggio chiaro invece del criptico "supabaseUrl is required" di createClient.
  console.error(
    'Variabili Supabase mancanti: imposta VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY ' +
      'nel file .env (vedi .env.example) e, in produzione, nelle Environment Variables di Vercel.'
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Sessione persistita su localStorage e auto-rinnovata: con i default di
    // Supabase il login dura ben oltre le 3 settimane richieste.
    persistSession: true,
    autoRefreshToken: true,
    // Niente OAuth/redirect: non c'è alcun token da leggere nell'URL.
    detectSessionInUrl: false,
  },
})
