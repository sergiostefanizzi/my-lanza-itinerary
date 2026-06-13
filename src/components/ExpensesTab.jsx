import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";
import {
  fetchProfiles,
  getMyName,
  setMyName,
  fetchExpenses,
  addExpense,
  deleteExpense,
  subscribeExpenses,
  unsubscribeExpenses,
  computeBalances,
  computeSettlement,
} from "../lib/expenses.js";

// Tab "Spese": cassa comune del viaggio (stile Splitwise). Inserimento spese con
// partecipanti scelti, feed a fumetti in tempo reale, eliminazione della propria
// spesa. Il bottone "Chi deve a chi?" arriva in M4. Self-contained con <style>
// inline che usa le CSS var del tema (definite da LanzaroteItinerary su :root).

const CATEGORIES = [
  { key: "cibo", label: "Cibo", color: "#c9913d" },
  { key: "trasporti", label: "Trasporti", color: "#41b3b0" },
  { key: "alloggio", label: "Alloggio", color: "#7c6cba" },
  { key: "attivita", label: "Attività", color: "#e05252" },
  { key: "spesa", label: "Spesa", color: "#6cba6c" },
  { key: "altro", label: "Altro", color: "#6b7280" },
];
const catOf = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

// Colore avatar deterministico dal payer_id (così ogni persona ha un colore stabile).
const AVATAR_COLORS = ["#c9913d", "#41b3b0", "#7c6cba", "#e05252", "#6cba6c", "#d2774f"];
function avatarColor(id) {
  let h = 0;
  for (const ch of String(id)) h = (h + ch.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
const initial = (name) => (name || "?").trim().charAt(0).toUpperCase() || "?";

export default function ExpensesTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myId, setMyId] = useState(null);
  const [myName, setMyNameState] = useState(null);
  const [needName, setNeedName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [profiles, setProfiles] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Form
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState(null);
  const [selected, setSelected] = useState(() => new Set()); // partecipanti
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showSettle, setShowSettle] = useState(false);

  const profileName = useMemo(() => {
    const m = {};
    for (const p of profiles) m[p.id] = p.name;
    return (id) => m[id] || "—";
  }, [profiles]);

  // Settle-up: saldi netti e trasferimenti minimi, ricalcolati a ogni cambio spese.
  const balances = useMemo(() => computeBalances(expenses), [expenses]);
  const settlement = useMemo(() => computeSettlement(balances), [balances]);

  // Carica i partecipanti tutti pre-selezionati ogni volta che cambia l'elenco profili.
  function preselectAll(list) {
    setSelected(new Set(list.map((p) => p.id)));
  }

  async function loadAll() {
    const [profs, exps] = await Promise.all([fetchProfiles(), fetchExpenses()]);
    setProfiles(profs);
    preselectAll(profs);
    setExpenses(exps);
  }

  useEffect(() => {
    let channel = null;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        setMyId(auth?.user?.id ?? null);
        const nm = await getMyName();
        if (!nm) {
          setNeedName(true);
          setLoading(false);
          return; // mostriamo prima il prompt nome
        }
        setMyNameState(nm);
        await loadAll();
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare le spese. Hai eseguito l'SQL su Supabase (tabelle profiles/expenses)?");
      } finally {
        setLoading(false);
      }
    })();

    channel = subscribeExpenses({
      onInsert: (row) => setExpenses((prev) => (prev.some((e) => e.id === row.id) ? prev : [row, ...prev])),
      onDelete: (id) => setExpenses((prev) => prev.filter((e) => e.id !== id)),
    });
    return () => unsubscribeExpenses(channel);
  }, []);

  async function handleSaveName(e) {
    e.preventDefault();
    const nm = nameInput.trim();
    if (!nm) return;
    setSubmitting(true);
    try {
      await setMyName(nm);
      setMyNameState(nm);
      setNeedName(false);
      setLoading(true);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Salvataggio del nome non riuscito. Riprova.");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  }

  function toggleParticipant(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd(e) {
    e.preventDefault();
    setFormError(null);
    const name = expName.trim();
    const amount = Math.round(parseFloat(expAmount.replace(",", ".")) * 100) / 100;
    if (!name) return setFormError("Dai un nome alla spesa.");
    if (!Number.isFinite(amount) || amount <= 0) return setFormError("Inserisci un importo valido (> 0).");
    if (!expCategory) return setFormError("Scegli una categoria.");
    if (selected.size < 1) return setFormError("Seleziona almeno un partecipante.");

    setSubmitting(true);
    try {
      const row = await addExpense({
        name,
        amount,
        category: expCategory,
        participantIds: [...selected],
        payerName: myName,
      });
      // Mostra subito il fumetto (l'eco realtime farà dedup per id).
      if (row) setExpenses((prev) => (prev.some((x) => x.id === row.id) ? prev : [row, ...prev]));
      setExpName("");
      setExpAmount("");
      setExpCategory(null);
      preselectAll(profiles);
    } catch (err) {
      console.error(err);
      setFormError("Salvataggio della spesa non riuscito. Riprova.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id)); // ottimistico
    try {
      await deleteExpense(id);
    } catch (err) {
      console.error(err);
      setError("Eliminazione non riuscita. Ricarica la pagina.");
    }
  }

  const styles = (
    <style>{`
      .exp { position: relative; z-index: 1; }
      .exp-card {
        background: rgba(var(--surface-rgb),.04);
        border: 1px solid rgba(var(--surface-rgb),.1);
        border-radius: 16px; padding: 20px; margin-bottom: 24px;
      }
      .exp-card-title {
        font-family: 'Cormorant Garamond', serif; font-size: 24px;
        color: var(--title); margin-bottom: 16px;
      }
      .exp-label {
        display: block; font-size: 9.5px; letter-spacing: 2px;
        text-transform: uppercase; color: var(--gold); margin-bottom: 7px;
      }
      .exp-field { margin-bottom: 15px; }
      .exp-input {
        width: 100%; padding: 11px 13px;
        background: rgba(var(--surface-rgb),.05);
        border: 1px solid rgba(var(--surface-rgb),.13);
        border-radius: 10px; color: rgb(var(--text-rgb));
        font-family: 'DM Sans', sans-serif; font-size: 14px;
        transition: border-color .2s, background .2s;
      }
      .exp-input:focus { outline: none; border-color: var(--gold); background: rgba(var(--surface-rgb),.07); }
      .exp-input::placeholder { color: rgba(var(--text-rgb),.3); }
      .exp-amount-wrap { position: relative; }
      .exp-amount-wrap .cur {
        position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
        color: var(--gold); font-size: 14px; pointer-events: none;
      }
      .exp-amount-wrap .exp-input { padding-left: 28px; }

      .exp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
      .exp-chip {
        padding: 6px 13px; border-radius: 20px; cursor: pointer;
        border: 1px solid rgba(var(--surface-rgb),.16);
        background: transparent; color: rgba(var(--text-rgb),.6);
        font-family: 'DM Sans', sans-serif; font-size: 12px;
        transition: all .15s;
      }
      .exp-chip:hover { border-color: rgba(var(--surface-rgb),.3); }
      .exp-chip.on { color: #fff; border-color: transparent; }
      .exp-part.on {
        background: rgba(var(--gold-rgb),.16) !important; color: var(--gold) !important;
        border-color: rgba(var(--gold-rgb),.42) !important;
      }
      .exp-part .pcheck { margin-right: 5px; opacity: .8; }

      .exp-submit {
        width: 100%; padding: 12px; margin-top: 6px;
        background: var(--gold); color: #fdf8f0; border: none; border-radius: 10px;
        font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
        letter-spacing: 1px; cursor: pointer; transition: opacity .2s, transform .08s;
      }
      .exp-submit:hover:not(:disabled) { opacity: .9; }
      .exp-submit:active:not(:disabled) { transform: scale(.99); }
      .exp-submit:disabled { opacity: .5; cursor: default; }

      .exp-form-msg {
        font-size: 12.5px; padding: 9px 12px; border-radius: 8px; margin-bottom: 14px;
        background: rgba(224,82,82,.12); color: #e05252; border: 1px solid rgba(224,82,82,.28);
      }

      .exp-feed-title {
        font-family: 'Cormorant Garamond', serif; font-size: 20px;
        color: var(--gold); margin-bottom: 14px;
      }
      .exp-empty {
        text-align: center; color: rgba(var(--text-rgb),.4);
        font-style: italic; padding: 24px 0; font-family: 'Cormorant Garamond', serif; font-size: 18px;
      }
      .exp-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
      .exp-avatar {
        width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: #fff;
      }
      .exp-bubble {
        position: relative; flex: 1;
        background: rgba(var(--surface-rgb),.055);
        border: 1px solid rgba(var(--surface-rgb),.09);
        border-radius: 4px 12px 12px 12px; padding: 9px 12px;
      }
      .exp-bubble::before {
        content: ""; position: absolute; left: -6px; top: 9px; width: 0; height: 0;
        border-top: 6px solid transparent; border-bottom: 6px solid transparent;
        border-right: 7px solid rgba(var(--surface-rgb),.09);
      }
      .exp-bubble-text { font-size: 13.5px; line-height: 1.4; color: rgb(var(--text-rgb)); }
      .exp-bubble-text b { font-weight: 600; }
      .exp-bubble-text .amt { color: var(--gold); font-weight: 600; }
      .exp-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
      .exp-cat-chip {
        font-size: 10px; padding: 2px 8px; border-radius: 10px; color: #fff; font-weight: 500;
      }
      .exp-split { font-size: 11px; color: rgba(var(--text-rgb),.45); }
      .exp-time { font-size: 11px; color: rgba(var(--text-rgb),.3); margin-left: auto; }
      .exp-del {
        background: none; border: none; cursor: pointer; padding: 2px 4px;
        color: rgba(var(--text-rgb),.35); font-size: 14px; line-height: 1;
        transition: color .2s;
      }
      .exp-del:hover { color: #e05252; }

      .exp-state { text-align: center; padding: 40px 0; color: rgba(var(--text-rgb),.5); }

      .exp-settle { margin-bottom: 24px; }
      .exp-settle-btn {
        width: 100%; padding: 12px; border-radius: 10px; cursor: pointer;
        background: transparent; border: 1px solid rgba(var(--gold-rgb),.45);
        color: var(--gold); font-family: 'DM Sans', sans-serif; font-size: 13px;
        font-weight: 600; letter-spacing: 1px; transition: background .2s;
      }
      .exp-settle-btn:hover { background: rgba(var(--gold-rgb),.1); }
      .exp-settle-btn.on { background: rgba(var(--gold-rgb),.12); }
      .exp-settle-card {
        margin-top: 12px; padding: 16px 18px; border-radius: 12px;
        background: rgba(var(--gold-rgb),.06); border: 1px solid rgba(var(--gold-rgb),.18);
      }
      .exp-settle-ok {
        text-align: center; font-family: 'Cormorant Garamond', serif; font-size: 19px; color: var(--gold);
      }
      .exp-settle-row {
        display: flex; align-items: center; gap: 7px; padding: 7px 0; font-size: 14px;
        border-bottom: 1px solid rgba(var(--surface-rgb),.06);
      }
      .exp-settle-row:last-of-type { border-bottom: none; }
      .exp-settle-row b { font-weight: 600; color: var(--title); }
      .exp-settle-row .sep { color: rgba(var(--text-rgb),.45); font-size: 12px; }
      .exp-settle-amt { color: var(--gold); font-weight: 600; }
      .exp-balances {
        display: flex; flex-wrap: wrap; gap: 8px;
        margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(var(--surface-rgb),.08);
      }
      .exp-bal { font-size: 11.5px; padding: 3px 9px; border-radius: 10px; }
      .exp-bal.pos { background: rgba(124,186,108,.14); color: #7cba6c; }
      .exp-bal.neg { background: rgba(224,82,82,.13); color: #e05252; }

      @media (max-width: 560px) {
        .exp-card { padding: 16px; }
        .exp-time { display: none; }
      }
    `}</style>
  );

  if (loading) {
    return <div className="exp">{styles}<div className="exp-state">Caricamento…</div></div>;
  }

  if (needName) {
    return (
      <div className="exp">
        {styles}
        <div className="exp-card">
          <div className="exp-card-title">Come ti chiami?</div>
          <p style={{ fontSize: 13, color: "rgba(var(--text-rgb),.6)", marginBottom: 16, lineHeight: 1.5 }}>
            Per usare la cassa comune serve un nome con cui comparire nelle spese.
          </p>
          <form onSubmit={handleSaveName}>
            <div className="exp-field">
              <input
                className="exp-input"
                type="text"
                maxLength={60}
                placeholder="Il tuo nome"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
              />
            </div>
            <button className="exp-submit" type="submit" disabled={submitting || !nameInput.trim()}>
              {submitting ? "Salvataggio…" : "Salva"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="exp">{styles}<div className="exp-form-msg">{error}</div></div>;
  }

  return (
    <div className="exp">
      {styles}

      {/* ── Form inserimento ── */}
      <div className="exp-card">
        <div className="exp-card-title">Aggiungi una spesa</div>
        <form onSubmit={handleAdd}>
          {formError && <div className="exp-form-msg">{formError}</div>}

          <div className="exp-field">
            <label className="exp-label" htmlFor="exp-name">Cosa</label>
            <input
              id="exp-name" className="exp-input" type="text" maxLength={80}
              placeholder="Es. Cena al Mirador"
              value={expName} onChange={(e) => setExpName(e.target.value)} disabled={submitting}
            />
          </div>

          <div className="exp-field">
            <label className="exp-label" htmlFor="exp-amount">Importo</label>
            <div className="exp-amount-wrap">
              <span className="cur">€</span>
              <input
                id="exp-amount" className="exp-input" type="text" inputMode="decimal"
                placeholder="0,00"
                value={expAmount} onChange={(e) => setExpAmount(e.target.value)} disabled={submitting}
              />
            </div>
          </div>

          <div className="exp-field">
            <label className="exp-label">Categoria</label>
            <div className="exp-chips">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key} type="button"
                  className={"exp-chip" + (expCategory === c.key ? " on" : "")}
                  style={expCategory === c.key ? { background: c.color } : undefined}
                  onClick={() => setExpCategory(c.key)} disabled={submitting}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="exp-field">
            <label className="exp-label">Chi ha partecipato (si divide tra loro)</label>
            <div className="exp-chips">
              {profiles.map((p) => (
                <button
                  key={p.id} type="button"
                  className={"exp-chip exp-part" + (selected.has(p.id) ? " on" : "")}
                  onClick={() => toggleParticipant(p.id)} disabled={submitting}
                >
                  <span className="pcheck">{selected.has(p.id) ? "✓" : "+"}</span>
                  {p.name}{p.id === myId ? " (tu)" : ""}
                </button>
              ))}
            </div>
          </div>

          <button className="exp-submit" type="submit" disabled={submitting}>
            {submitting ? "Aggiungo…" : "Aggiungi spesa"}
          </button>
        </form>
      </div>

      {/* ── Chi deve a chi? (settle-up) ── */}
      {expenses.length > 0 && (
        <div className="exp-settle">
          <button
            className={"exp-settle-btn" + (showSettle ? " on" : "")}
            onClick={() => setShowSettle((s) => !s)}
          >
            {showSettle ? "Nascondi conti" : "Chi deve a chi?"}
          </button>

          {showSettle && (
            <div className="exp-settle-card">
              {settlement.length === 0 ? (
                <div className="exp-settle-ok">Siete in pari — nessun debito da saldare 🎉</div>
              ) : (
                <>
                  {settlement.map((t, i) => (
                    <div className="exp-settle-row" key={i}>
                      <b>{profileName(t.from)}</b>
                      <span className="sep">deve</span>
                      <span className="exp-settle-amt">€{t.amount.toFixed(2)}</span>
                      <span className="sep">a</span>
                      <b>{profileName(t.to)}</b>
                    </div>
                  ))}
                  <div className="exp-balances">
                    {Object.entries(balances)
                      .filter(([, v]) => Math.abs(v) >= 0.005)
                      .sort((a, b) => b[1] - a[1])
                      .map(([id, v]) => (
                        <span key={id} className={"exp-bal " + (v >= 0 ? "pos" : "neg")}>
                          {profileName(id)} {v >= 0 ? "+" : "−"}€{Math.abs(v).toFixed(2)}
                        </span>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Feed a fumetti ── */}
      <div className="exp-feed-title">Spese del viaggio</div>
      {expenses.length === 0 ? (
        <div className="exp-empty">Nessuna spesa ancora. Aggiungi la prima!</div>
      ) : (
        expenses.map((e) => {
          const cat = catOf(e.category);
          const n = (e.participant_ids || []).length;
          const when = e.created_at
            ? new Date(e.created_at).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "";
          const partsTitle = (e.participant_ids || []).map(profileName).join(", ");
          return (
            <div className="exp-row" key={e.id}>
              <div className="exp-avatar" style={{ background: avatarColor(e.payer_id) }} title={e.payer_name}>
                {initial(e.payer_name)}
              </div>
              <div className="exp-bubble">
                <div className="exp-bubble-text">
                  <b>{e.payer_name}</b> ha pagato <span className="amt">€{Number(e.amount).toFixed(2)}</span> per <b>{e.name}</b>
                </div>
                <div className="exp-meta">
                  <span className="exp-cat-chip" style={{ background: cat.color }}>{cat.label}</span>
                  <span className="exp-split" title={partsTitle}>diviso tra {n} {n === 1 ? "persona" : "persone"}</span>
                  {when && <span className="exp-time">{when}</span>}
                  {e.payer_id === myId && (
                    <button className="exp-del" onClick={() => handleDelete(e.id)} title="Elimina questa spesa" aria-label="Elimina">✕</button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
