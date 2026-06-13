import { createClient } from '@supabase/supabase-js'

// Funzione serverless Vercel: UNICO punto di creazione utenti.
// Le registrazioni pubbliche su Supabase sono disattivate ("Allow new users to
// sign up" OFF), quindi il client non puo' bypassare il limite chiamando signUp:
// deve passare di qui. Qui si applica il tetto MAX_USERS e si crea l'utente con
// la secret key (privilegi elevati, mai esposta al browser).
// Vedi sezione "Autenticazione" in CLAUDE.md.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  // Solo POST.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  // Config server (le VITE_* sono disponibili anche lato server su Vercel).
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY
  const maxUsers = Number.parseInt(process.env.MAX_USERS, 10)

  if (!supabaseUrl || !secretKey || !Number.isInteger(maxUsers)) {
    console.error(
      'Config /api/register incompleta: servono VITE_SUPABASE_URL, SUPABASE_SECRET_KEY e MAX_USERS (intero).'
    )
    return res.status(500).json({ error: 'server_misconfigured' })
  }

  // Body robusto: su Vercel req.body e' gia' parsato per application/json,
  // ma gestiamo anche il caso stringa.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid_email' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'weak_password' })
  }

  // Client con secret key: niente sessione, niente refresh (uso server one-shot).
  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Conteggio utenti via RPC (funzione SQL count_users, security definer).
  const { data: count, error: countError } = await supabase.rpc('count_users')
  if (countError) {
    console.error('Errore conteggio utenti:', countError)
    return res.status(500).json({ error: 'count_failed' })
  }
  if (Number(count) >= maxUsers) {
    return res.status(403).json({ error: 'limit' })
  }

  // Creazione utente con email gia' confermata -> login immediato.
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    // Email gia' registrata -> 409 (Supabase usa code 'email_exists' / status 422).
    const code = createError.code
    const msg = String(createError.message ?? '').toLowerCase()
    if (code === 'email_exists' || msg.includes('already')) {
      return res.status(409).json({ error: 'email_exists' })
    }
    console.error('Errore creazione utente:', createError)
    return res.status(500).json({ error: 'create_failed' })
  }

  return res.status(200).json({ ok: true })
}
