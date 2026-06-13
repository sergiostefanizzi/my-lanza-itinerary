import { useState, useLayoutEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

// Schermata di accesso (login / registrazione). Self-contained come
// LanzaroteItinerary: palette/CSS variables proprie nel suo <style> inline, stesso
// toggle sole/luna e stessa chiave localStorage('theme'), cosi' il tema persiste nel
// passaggio gate -> app. La registrazione passa SEMPRE da /api/register (limite
// MAX_USERS); il login va diretto a Supabase. Vedi sezione "Autenticazione" in CLAUDE.md.

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch (e) { /* localStorage non disponibile */ }
  if (typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export default function AuthGate() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* no-op */ }
  }, [theme]);

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  async function handleLogin() {
    const { error: e } = await supabase.auth.signInWithPassword({ email, password });
    if (e) {
      const m = (e.message || "").toLowerCase();
      if (m.includes("invalid")) setError("Email o password non corretti.");
      else setError("Accesso non riuscito. Riprova.");
    }
    // Al successo ci pensa App.jsx (onAuthStateChange) a mostrare l'itinerario.
  }

  async function handleRegister() {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name.trim() }),
    });
    let payload = null;
    try { payload = await res.json(); } catch (e) { /* risposta non-JSON */ }

    if (res.ok) {
      // Utente creato (email gia' confermata) -> login immediato.
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) {
        setError("Registrazione riuscita, ma l'accesso automatico è fallito. Prova ad accedere.");
        setMode("login");
      }
      return;
    }

    const code = payload?.error;
    if (res.status === 403) setError("Registrazioni chiuse: è stato raggiunto il numero massimo di utenti.");
    else if (res.status === 409) setError("Questa email è già registrata. Prova ad accedere.");
    else if (code === "invalid_email") setError("L'indirizzo email non è valido.");
    else if (code === "weak_password") setError("La password deve avere almeno 6 caratteri.");
    else if (code === "invalid_name") setError("Inserisci un nome (max 60 caratteri).");
    else if (res.status === 404) setError("La registrazione non è disponibile con «npm run dev»: richiede «vercel dev» o il deploy su Vercel.");
    else setError("Errore durante la registrazione. Riprova più tardi.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (mode === "register" && !name.trim()) { setError("Inserisci il tuo nome."); return; }
    if (!email || !password) { setError("Inserisci email e password."); return; }
    if (mode === "register" && password.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await handleLogin();
      else await handleRegister();
    } catch (err) {
      setError("Errore di connessione. Controlla la rete e riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Tema scuro (default) ── */
        :root {
          --bg: #0c0806;
          --title: #f5ede4;
          --title-em: #e8a86d;
          --gold: #c9913d;
          --gold-rgb: 201,145,61;
          --text-rgb: 240,232,223;
          --surface-rgb: 255,255,255;
          --glow-a: rgba(200,85,30,.14);
          --glow-b: rgba(65,179,176,.09);
        }
        /* ── Tema chiaro ── */
        :root[data-theme="light"] {
          --bg: #f7f1e8;
          --title: #2a2018;
          --title-em: #b96f2e;
          --gold: #a8761f;
          --gold-rgb: 168,118,31;
          --text-rgb: 44,34,24;
          --surface-rgb: 0,0,0;
          --glow-a: rgba(200,85,30,.10);
          --glow-b: rgba(65,179,176,.10);
        }

        body { background: var(--bg); }

        .auth-app {
          min-height: 100vh;
          background: var(--bg);
          color: rgb(var(--text-rgb));
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          transition: background-color .35s ease, color .35s ease;
        }
        .glow-a {
          position: fixed; top: -180px; left: -80px;
          width: 550px; height: 550px;
          background: radial-gradient(circle, var(--glow-a) 0%, transparent 70%);
          pointer-events: none;
        }
        .glow-b {
          position: fixed; bottom: -160px; right: -80px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, var(--glow-b) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Theme toggle (identico all'itinerario) */
        .theme-toggle {
          position: fixed; top: 18px; right: 18px; z-index: 10;
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; line-height: 1; cursor: pointer;
          background: rgba(var(--surface-rgb),.04);
          border: 1px solid rgba(var(--surface-rgb),.1);
          backdrop-filter: blur(6px);
          transition: background .2s, border-color .2s, transform .2s;
        }
        .theme-toggle:hover {
          background: rgba(var(--surface-rgb),.09);
          border-color: rgba(var(--surface-rgb),.18);
          transform: scale(1.06);
        }

        .auth-card {
          width: 100%; max-width: 380px;
          position: relative; z-index: 1;
        }

        .auth-head { text-align: center; margin-bottom: 30px; }
        .auth-eyebrow {
          font-size: 9.5px; letter-spacing: 5px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 14px;
        }
        .auth-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 14vw, 64px);
          font-weight: 400; line-height: .95; color: var(--title);
        }
        .auth-title em { font-style: italic; color: var(--title-em); }
        .auth-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-style: italic;
          color: rgba(var(--text-rgb),.5); margin-top: 8px;
        }

        .auth-tabs {
          display: flex;
          border-bottom: 1px solid rgba(var(--surface-rgb),.1);
          margin-bottom: 22px;
        }
        .auth-tab {
          flex: 1; padding: 12px 0;
          background: none; border: none; cursor: pointer;
          border-bottom: 2px solid transparent;
          color: rgba(var(--text-rgb),.45);
          font-family: 'DM Sans', sans-serif; font-size: 10.5px;
          letter-spacing: 2px; text-transform: uppercase;
          transition: color .2s, border-color .2s;
        }
        .auth-tab.on { color: var(--gold); border-bottom-color: var(--gold); }

        .field { margin-bottom: 16px; }
        .field label {
          display: block; font-size: 9.5px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 7px;
        }
        .field input {
          width: 100%; padding: 12px 14px;
          background: rgba(var(--surface-rgb),.04);
          border: 1px solid rgba(var(--surface-rgb),.12);
          border-radius: 10px;
          color: rgb(var(--text-rgb));
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
          transition: border-color .2s, background .2s;
        }
        .field input:focus {
          outline: none; border-color: var(--gold);
          background: rgba(var(--surface-rgb),.06);
        }
        .field input::placeholder { color: rgba(var(--text-rgb),.3); }

        .pw-wrap { position: relative; }
        .pw-toggle {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 15px; line-height: 1; padding: 6px; opacity: .55;
          transition: opacity .2s;
        }
        .pw-toggle:hover { opacity: .9; }

        .msg {
          font-size: 12.5px; padding: 10px 12px; border-radius: 8px;
          margin-bottom: 16px; line-height: 1.45;
        }
        .msg.error {
          background: rgba(224,82,82,.12); color: #e05252;
          border: 1px solid rgba(224,82,82,.28);
        }

        .submit {
          width: 100%; padding: 13px; margin-top: 4px;
          background: var(--gold); color: #fdf8f0;
          border: none; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 1px; cursor: pointer;
          transition: opacity .2s, transform .08s;
        }
        .submit:hover:not(:disabled) { opacity: .9; }
        .submit:active:not(:disabled) { transform: scale(.99); }
        .submit:disabled { opacity: .5; cursor: default; }

        .auth-foot {
          text-align: center; margin-top: 22px;
          font-size: 11px; line-height: 1.5;
          color: rgba(var(--text-rgb),.35);
        }

        @media (max-width: 560px) {
          .auth-card { max-width: 100%; }
        }
      `}</style>

      <div className="glow-a" />
      <div className="glow-b" />

      <button
        className="theme-toggle"
        onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
        aria-label={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
        title={theme === "dark" ? "Tema chiaro" : "Tema scuro"}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      <div className="auth-card">
        <div className="auth-head">
          <div className="auth-eyebrow">Accesso Riservato</div>
          <div className="auth-title">Lanza<em>rote</em></div>
          <div className="auth-sub">
            {mode === "login" ? "Accedi per consultare l'itinerario" : "Crea il tuo accesso"}
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={"auth-tab" + (mode === "login" ? " on" : "")}
            onClick={() => switchMode("login")}
          >
            Accedi
          </button>
          <button
            type="button"
            className={"auth-tab" + (mode === "register" ? " on" : "")}
            onClick={() => switchMode("register")}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="msg error">{error}</div>}

          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-name">Nome</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Come ti chiami"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                maxLength={60}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              placeholder="nome@esempio.it"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <div className="pw-wrap">
              <input
                id="auth-password"
                type={showPw ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "register" ? "Almeno 6 caratteri" : "••••••••"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(s => !s)}
                aria-label={showPw ? "Nascondi password" : "Mostra password"}
                title={showPw ? "Nascondi" : "Mostra"}
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="submit" disabled={loading}>
            {loading ? "Attendere…" : mode === "login" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <div className="auth-foot">
          App personale ad accesso riservato.
        </div>
      </div>
    </div>
  );
}
