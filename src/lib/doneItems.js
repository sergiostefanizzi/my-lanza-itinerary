import { supabase } from "./supabaseClient.js";

// Accesso dati alle spunte CONDIVISE dell'itinerario (tabella `done_items` su
// Supabase). Una riga = una voce barrata; la PK `key` e' la chiave
// `${giorno}-${indice}` gia' usata nel componente. Lo stato e' condiviso da tutti
// gli utenti loggati e si propaga in tempo reale (Realtime). L'accesso passa dalla
// publishable key + RLS (solo `authenticated`). Vedi sezione "Spunta attività" in CLAUDE.md.

// Legge tutte le chiavi barrate. Ritorna string[] (es. ["2-0", "3-1"]).
export async function fetchDoneKeys() {
  const { data, error } = await supabase.from("done_items").select("key");
  if (error) throw error;
  return (data ?? []).map((r) => r.key);
}

// Barra una voce. Idempotente: se la riga esiste gia' non fa nulla (no errore).
export async function addDone(key) {
  const { error } = await supabase
    .from("done_items")
    .upsert({ key }, { onConflict: "key", ignoreDuplicates: true });
  if (error) throw error;
}

// Sbarra una voce. Idempotente: cancellare una chiave assente non e' un errore.
export async function removeDone(key) {
  const { error } = await supabase.from("done_items").delete().eq("key", key);
  if (error) throw error;
}

// Sottoscrive le modifiche in tempo reale. `onInsert(key)` quando qualcuno barra,
// `onDelete(key)` quando qualcuno sbarra. Ritorna il channel: passarlo a
// `unsubscribeDoneItems(channel)` nel cleanup dell'effetto.
export function subscribeDoneItems({ onInsert, onDelete }) {
  const channel = supabase
    .channel("done_items")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "done_items" },
      (payload) => onInsert?.(payload.new.key)
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "done_items" },
      (payload) => onDelete?.(payload.old.key)
    )
    .subscribe();
  return channel;
}

// Chiude la subscription Realtime (cleanup dell'effetto).
export function unsubscribeDoneItems(channel) {
  if (channel) supabase.removeChannel(channel);
}
