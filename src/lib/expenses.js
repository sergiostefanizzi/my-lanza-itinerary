import { supabase } from "./supabaseClient.js";

// Accesso dati + logica della "cassa comune" (spese condivise stile Splitwise).
// Due tabelle Supabase: `profiles` (id utente + nome, per attribuire spese e
// listare i partecipanti) ed `expenses` (spese con payer, importo, categoria e
// l'elenco dei partecipanti tra cui dividere). Accesso via publishable key + RLS
// (solo `authenticated`). Vedi sezione "Spese condivise" in CLAUDE.md.

// ── Profili ────────────────────────────────────────────────────────────────

// Tutti i profili (id + nome), per il selettore partecipanti e il settle-up.
export async function fetchProfiles() {
  const { data, error } = await supabase.from("profiles").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

// Nome del profilo dell'utente corrente (null se non ancora impostato).
export async function getMyName() {
  const { data: auth } = await supabase.auth.getUser();
  const id = auth?.user?.id;
  if (!id) return null;
  const { data, error } = await supabase.from("profiles").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}

// Imposta/aggiorna il proprio nome (upsert della propria riga profiles).
export async function setMyName(name) {
  const { data: auth } = await supabase.auth.getUser();
  const id = auth?.user?.id;
  if (!id) throw new Error("Utente non autenticato");
  const { error } = await supabase
    .from("profiles")
    .upsert({ id, name, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── Spese ──────────────────────────────────────────────────────────────────

// Tutte le spese, dalla più recente.
export async function fetchExpenses() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Inserisce una spesa. `participantIds` = utenti tra cui dividere (>= 1).
// `payerName` denormalizzato per mostrare il nome nel feed senza join.
export async function addExpense({ name, amount, category, participantIds, payerName }) {
  const { data: auth } = await supabase.auth.getUser();
  const payerId = auth?.user?.id;
  const { error } = await supabase.from("expenses").insert({
    name,
    amount,
    category,
    payer_id: payerId,
    payer_name: payerName,
    participant_ids: participantIds,
  });
  if (error) throw error;
}

// Elimina una spesa (RLS: solo la propria).
export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

// Sottoscrive le spese in tempo reale. `onInsert(row)` con la riga completa
// (serve al feed), `onDelete(id)` con l'id. Ritorna il channel per il cleanup.
export function subscribeExpenses({ onInsert, onDelete }) {
  const channel = supabase
    .channel("expenses")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "expenses" },
      (payload) => onInsert?.(payload.new)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "expenses" },
      (payload) => onDelete?.(payload.old.id)
    )
    .subscribe();
  return channel;
}

export function unsubscribeExpenses(channel) {
  if (channel) supabase.removeChannel(channel);
}

// ── Logica settle-up (pura, niente rete) ─────────────────────────────────────

// Saldo netto per utente: + per chi ha pagato, − per la quota dovuta come
// partecipante. Ritorna { [userId]: saldoEuro } arrotondato ai centesimi.
export function computeBalances(expenses) {
  const balances = {};
  const add = (id, delta) => {
    if (!id) return;
    balances[id] = (balances[id] || 0) + delta;
  };
  for (const e of expenses) {
    const amount = Number(e.amount);
    const parts = e.participant_ids || [];
    if (!parts.length || !Number.isFinite(amount)) continue;
    add(e.payer_id, amount); // il payer ha anticipato l'intero importo
    const share = amount / parts.length;
    for (const p of parts) add(p, -share);
  }
  for (const id of Object.keys(balances)) {
    balances[id] = Math.round(balances[id] * 100) / 100;
  }
  return balances;
}

// Dai saldi netti, la lista minima di trasferimenti "from deve `amount` a to".
// Greedy: abbina il maggior debitore col maggior creditore finché tutto è a zero.
export function computeSettlement(balances) {
  const eps = 0.005;
  const creditors = [];
  const debtors = [];
  for (const [id, bal] of Object.entries(balances)) {
    if (bal > eps) creditors.push({ id, amount: bal });
    else if (bal < -eps) debtors.push({ id, amount: -bal });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    result.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay * 100) / 100 });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount <= eps) i++;
    if (creditors[j].amount <= eps) j++;
  }
  return result.filter((t) => t.amount > 0);
}
