import { useState, useLayoutEffect } from "react";

const days = [
  {
    day: 1, date: "Gio 18 Giugno", title: "Arrivo", accent: "#c9913d",
    subtitle: "Benvenuti sull'isola del fuoco",
    icon: "✈️",
    items: [
      { type: "logistica", icon: "🛬", text: "17:00 – Atterraggio a Lanzarote" },
      { type: "logistica", icon: "🚗", text: "18:00 – Ritiro auto Cicar 500X" },
      { type: "logistica", icon: "🏠", text: "Check-in Casa Vera, Puerto del Carmen" },
      { type: "vista", icon: "🌅", text: "Passeggiata sul lungomare di Puerto del Carmen" },
      { type: "cibo", icon: "🍽️", text: "Cena: Mura o Casa Carlos" },
    ]
  },
  {
    day: 2, date: "Ven 19 Giugno", title: "Il Sud Selvaggio", accent: "#41b3b0",
    subtitle: "Smeraldo, sale e Papagayo",
    icon: "🌊",
    items: [
      { type: "attività", icon: "🤿", text: "Snorkeling e kayak – Playa Papagayo", note: "€50 / persona" },
      { type: "vista", icon: "🟢", text: "El Golfo e Charco Verde – la laguna smeraldo" },
      { type: "vista", icon: "⬛", text: "Salinas di Janubio e Playa Janubio (sabbia nera vulcanica)" },
      { type: "vista", icon: "🏖️", text: "Playa Blanca" },
      { type: "cibo", icon: "🍽️", text: "Cena: BePapagayo" },
    ]
  },
  {
    day: 3, date: "Sab 20 Giugno", title: "Haría e il Nord", accent: "#7cba6c",
    subtitle: "Mercato, grotte e piscine naturali",
    icon: "🌿",
    badge: "⚡ Solo sabato: Mercato di Haría!",
    items: [
      { type: "attività", icon: "🛒", text: "Mercado Artesanal de Haría", note: "Solo il sabato!" },
      { type: "vista", icon: "🌵", text: "Jardín de Cactus" },
      { type: "vista", icon: "💧", text: "Jameos del Agua" },
      { type: "vista", icon: "🕳️", text: "Cueva de las Verdes – tubo lavico da 6 km" },
      { type: "vista", icon: "🏊", text: "Piscine naturali di Punta Mujeres" },
      { type: "cibo", icon: "🍽️", text: "Cena: Kamezi" },
    ]
  },
  {
    day: 4, date: "Dom 21 Giugno", title: "La Graciosa", accent: "#e8a86d",
    subtitle: "L'ultimo paradiso vergine d'Europa",
    icon: "🏝️",
    items: [
      { type: "attività", icon: "⛵", text: "Tour Jeep Safari – La Graciosa (giornata intera)", note: "€45 / persona" },
      { type: "vista", icon: "🏖️", text: "Playa de las Conchas – sabbia dorata e vulcano Bermeja" },
      { type: "vista", icon: "🌋", text: "Playa Bermeja – la cartolina surrealista" },
      { type: "cibo", icon: "🍽️", text: "Cena: Teleclub" },
    ]
  },
  {
    day: 5, date: "Lun 22 Giugno", title: "Fuoco e Vino", accent: "#e05252",
    subtitle: "Timanfaya, lava e Malvasía",
    icon: "🔥",
    items: [
      { type: "attività", icon: "🌋", text: "Tour Parco Nazionale di Timanfaya", note: "€57 / persona" },
      { type: "vista", icon: "🍇", text: "La Geria – i vigneti nei crateri vulcanici" },
      { type: "attività", icon: "🍷", text: "Degustazione vini – Bodega El Grifo o Vega de Yuco", note: "€24–50 / persona" },
      { type: "vista", icon: "🏡", text: "Casa Museo del Campesino" },
      { type: "cibo", icon: "🍽️", text: "Cena: El Diablo (ristorante nel parco!)" },
    ]
  },
  {
    day: 6, date: "Mar 23 Giugno", title: "Manrique e il Centro", accent: "#a07cc5",
    subtitle: "Arte, architettura e panorami senza fine",
    icon: "🎨",
    items: [
      { type: "vista", icon: "🎨", text: "Fundación César Manrique" },
      { type: "vista", icon: "🏛️", text: "Lagomar Museo" },
      { type: "vista", icon: "🏘️", text: "Teguise – l'antica capitale" },
      { type: "vista", icon: "🪨", text: "Las Grietas" },
      { type: "vista", icon: "🌊", text: "Caleta de Famara e Mirador del Rio" },
      { type: "cibo", icon: "🍽️", text: "Cena: La Tabla o Barlovento" },
    ]
  },
  {
    day: 7, date: "Mer 24 Giugno", title: "Adrenalina", accent: "#f4a261",
    subtitle: "L'ultima avventura sull'isola",
    icon: "🏎️",
    items: [
      { type: "attività", icon: "🚙", text: "Buggy Tour – 3 ore", note: "€130 / coppia" },
      { type: "attività", icon: "🏎️", text: "Kart a San Bartolomé (400cc)", note: "€42 / persona" },
      { type: "vista", icon: "🌅", text: "Tramonto finale a Puerto del Carmen" },
      { type: "cibo", icon: "🍽️", text: "Cena d'addio: Meneo o La Bodega de Santiago" },
    ]
  },
  {
    day: 8, date: "Gio 25 Giugno", title: "Partenza", accent: "#7a8b99",
    subtitle: "Arrivederci, Lanzarote",
    icon: "🏠",
    items: [
      { type: "logistica", icon: "🚗", text: "06:00 – Consegna auto Cicar" },
      { type: "logistica", icon: "✈️", text: "08:30 – Volo Lanzarote → Milano Bergamo" },
      { type: "logistica", icon: "🛬", text: "13:25 – Arrivo Milano Bergamo" },
      { type: "logistica", icon: "✈️", text: "17:25 – Volo Bergamo → Bari" },
      { type: "logistica", icon: "🏠", text: "18:55 – Arrivo Bari" },
    ]
  },
];

const budget = [
  { label: "Noleggio auto (coppia, 7 giorni)", amount: 144.66 },
  { label: "Parcheggio Pinguino – Bari", amount: 40.00 },
  { label: "Snorkeling e kayak – Papagayo", amount: 100.00 },
  { label: "Tour La Graciosa (×2)", amount: 90.00 },
  { label: "Tour Timanfaya (×2)", amount: 114.00 },
  { label: "Degustazione vini – Vega de Yuco (×2)", amount: 48.00 },
  { label: "Buggy Tour (coppia)", amount: 130.00 },
  { label: "Kart San Bartolomé (×2)", amount: 84.00 },
];

const typeColors = {
  logistica: "#6b7280",
  attività: "#e05252",
  vista: "#41b3b0",
  cibo: "#c9913d",
};

const typeLabels = {
  logistica: "Logistica",
  attività: "Attività",
  vista: "Vista",
  cibo: "Cibo",
};

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

export default function LanzaroteItinerary() {
  const [openDay, setOpenDay] = useState(1);
  const [tab, setTab] = useState("itinerario");
  const [theme, setTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* no-op */ }
  }, [theme]);

  const total = budget.reduce((s, b) => s + b.amount, 0);

  return (
    <>
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
          --item-bg: rgba(0,0,0,.22);
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
          --item-bg: rgba(0,0,0,.035);
          --glow-a: rgba(200,85,30,.10);
          --glow-b: rgba(65,179,176,.10);
        }

        body { background: var(--bg); }

        .app {
          min-height: 100vh;
          background: var(--bg);
          color: rgb(var(--text-rgb));
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          position: relative;
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
        .wrap {
          max-width: 680px; margin: 0 auto;
          padding: 0 20px 80px;
          position: relative; z-index: 1;
        }

        /* Theme toggle */
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

        /* Header */
        .hdr { padding: 56px 0 44px; text-align: center; }
        .eyebrow {
          font-size: 9.5px; letter-spacing: 5px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 18px;
        }
        .big-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(58px, 10vw, 92px);
          font-weight: 400; line-height: .95; color: var(--title);
        }
        .big-title em { font-style: italic; color: var(--title-em); }
        .year {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 5vw, 44px); font-weight: 400;
          color: rgba(var(--text-rgb),.22); letter-spacing: 10px; margin-top: 4px;
        }
        .meta {
          display: flex; justify-content: center; gap: 36px;
          margin-top: 32px; padding-top: 30px;
          border-top: 1px solid rgba(var(--surface-rgb),.07);
        }
        .stat-val {
          display: block;
          font-family: 'Cormorant Garamond', serif; font-size: 30px; color: var(--gold);
        }
        .stat-lbl {
          display: block; font-size: 9px; letter-spacing: 2.5px;
          text-transform: uppercase; color: rgba(var(--text-rgb),.35); margin-top: 2px;
        }

        /* Tabs */
        .tabs {
          display: flex; border-bottom: 1px solid rgba(var(--surface-rgb),.08);
          margin-bottom: 36px;
        }
        .tab-btn {
          background: none; border: none; border-bottom: 2px solid transparent;
          padding: 13px 26px; margin-bottom: -1px;
          font-family: 'DM Sans', sans-serif; font-size: 10.5px;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(var(--text-rgb),.32); cursor: pointer; transition: all .2s;
        }
        .tab-btn:hover { color: rgba(var(--text-rgb),.7); }
        .tab-btn.on { color: var(--gold); border-bottom-color: var(--gold); }

        /* Timeline */
        .timeline { display: flex; flex-direction: column; gap: 10px; }

        .day-card {
          border-radius: 12px;
          border: 1px solid rgba(var(--surface-rgb),.06);
          background: rgba(var(--surface-rgb),.02);
          overflow: hidden;
          transition: border-color .25s;
        }
        .day-card:hover { border-color: rgba(var(--surface-rgb),.11); }
        .day-card.open { background: rgba(var(--surface-rgb),.03); }

        .day-head {
          display: flex; align-items: center; gap: 18px;
          padding: 19px 22px; cursor: pointer; user-select: none;
        }

        .day-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 34px; font-weight: 400;
          line-height: 1; opacity: .25; min-width: 28px;
          flex-shrink: 0;
        }

        .day-ico {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }

        .day-info { flex: 1; min-width: 0; }
        .day-date {
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          opacity: .38; margin-bottom: 3px;
        }
        .day-ttl {
          font-family: 'Cormorant Garamond', serif;
          font-size: 23px; font-weight: 500; line-height: 1.1;
          transition: color .2s;
        }
        .day-sub { font-size: 11.5px; opacity: .4; margin-top: 1px; }

        .badge {
          font-size: 9.5px; padding: 3px 10px; border-radius: 20px;
          background: rgba(var(--gold-rgb),.13); color: var(--gold);
          white-space: nowrap; flex-shrink: 0;
        }

        .chevron {
          color: rgba(var(--text-rgb),.28); font-size: 11px;
          flex-shrink: 0; transition: transform .3s;
        }
        .day-card.open .chevron { transform: rotate(180deg); }

        /* Animated body */
        .day-body { overflow: hidden; max-height: 0; transition: max-height .4s ease; }
        .day-card.open .day-body { max-height: 900px; }

        .day-items {
          padding: 4px 22px 22px;
          border-top: 1px solid rgba(var(--surface-rgb),.05);
          padding-top: 14px; margin-top: 0;
          display: flex; flex-direction: column; gap: 9px;
        }

        .item {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 11px 15px; border-radius: 8px;
          background: var(--item-bg);
        }
        .item-ico { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
        .item-body { flex: 1; min-width: 0; }
        .item-txt { font-size: 13.5px; line-height: 1.45; color: rgba(var(--text-rgb),.82); }
        .item-note { font-size: 11px; margin-top: 3px; color: var(--gold); }
        .item-chip {
          font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase;
          padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
          align-self: flex-start; margin-top: 3px; white-space: nowrap;
        }

        /* Legend */
        .legend {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin-bottom: 24px;
        }
        .leg-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(var(--text-rgb),.4);
        }
        .leg-dot { width: 8px; height: 8px; border-radius: 50%; }

        /* Budget */
        .budget-card {
          border: 1px solid rgba(var(--surface-rgb),.06);
          border-radius: 12px; overflow: hidden;
          background: rgba(var(--surface-rgb),.02);
        }
        .budget-hdr {
          padding: 24px; border-bottom: 1px solid rgba(var(--surface-rgb),.05);
        }
        .budget-title {
          font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400;
        }
        .budget-sub { font-size: 11px; color: rgba(var(--text-rgb),.38); margin-top: 4px; }
        .budget-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 13px 24px; border-bottom: 1px solid rgba(var(--surface-rgb),.04);
          font-size: 13px;
        }
        .budget-row:last-child { border-bottom: none; }
        .budget-lbl { color: rgba(var(--text-rgb),.58); }
        .budget-amt {
          font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--gold);
        }
        .budget-total {
          padding: 20px 24px;
          background: rgba(var(--gold-rgb),.07);
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid rgba(var(--gold-rgb),.15);
        }
        .total-lbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(var(--text-rgb),.45); }
        .total-amt { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: var(--gold); }

        .note-box {
          margin-top: 14px; padding: 16px 18px;
          background: rgba(var(--surface-rgb),.025);
          border: 1px solid rgba(var(--surface-rgb),.06);
          border-left: 3px solid var(--gold); border-radius: 8px;
          font-size: 12.5px; color: rgba(var(--text-rgb),.5); line-height: 1.65;
        }

        /* Per-day accent bar */
        .accent-bar {
          width: 3px; align-self: stretch; border-radius: 2px;
          flex-shrink: 0; transition: opacity .25s;
        }
      `}</style>

      <div className="app">
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

        <div className="wrap">
          {/* ── Header ── */}
          <div className="hdr">
            <div className="eyebrow">Itinerario di Viaggio</div>
            <div className="big-title">Lanza<em>rote</em></div>
            <div className="year">2 0 2 6</div>
            <div className="meta">
              <div>
                <span className="stat-val">7</span>
                <span className="stat-lbl">Notti</span>
              </div>
              <div>
                <span className="stat-val">8</span>
                <span className="stat-lbl">Attività</span>
              </div>
              <div>
                <span className="stat-val">18 – 25</span>
                <span className="stat-lbl">Giugno</span>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="tabs">
            {["itinerario", "budget"].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
                {t === "itinerario" ? "Itinerario" : "Budget"}
              </button>
            ))}
          </div>

          {/* ── Itinerario ── */}
          {tab === "itinerario" && (
            <>
              <div className="legend" style={{ marginBottom: 20 }}>
                {Object.entries(typeColors).map(([k, c]) => (
                  <div key={k} className="leg-item">
                    <div className="leg-dot" style={{ background: c }} />
                    {typeLabels[k]}
                  </div>
                ))}
              </div>

              <div className="timeline">
                {days.map(d => {
                  const isOpen = openDay === d.day;
                  return (
                    <div
                      key={d.day}
                      className={`day-card ${isOpen ? "open" : ""}`}
                      style={{ borderColor: isOpen ? `${d.accent}40` : undefined }}
                    >
                      <div className="day-head" onClick={() => setOpenDay(isOpen ? null : d.day)}>
                        {/* Accent strip */}
                        <div
                          className="accent-bar"
                          style={{ background: d.accent, opacity: isOpen ? 1 : 0 }}
                        />

                        <div className="day-num" style={{ color: d.accent, opacity: isOpen ? .55 : .22 }}>
                          {d.day}
                        </div>

                        <div className="day-ico" style={{ background: `${d.accent}1a` }}>
                          {d.icon}
                        </div>

                        <div className="day-info">
                          <div className="day-date">{d.date}</div>
                          <div className="day-ttl" style={{ color: isOpen ? d.accent : "var(--title)" }}>
                            {d.title}
                          </div>
                          <div className="day-sub">{d.subtitle}</div>
                        </div>

                        {d.badge && <div className="badge">{d.badge}</div>}
                        <div className="chevron">▼</div>
                      </div>

                      <div className="day-body">
                        <div className="day-items">
                          {d.items.map((item, i) => (
                            <div key={i} className="item">
                              <div className="item-ico">{item.icon}</div>
                              <div className="item-body">
                                <div className="item-txt">{item.text}</div>
                                {item.note && <div className="item-note">{item.note}</div>}
                              </div>
                              <div
                                className="item-chip"
                                style={{
                                  background: `${typeColors[item.type]}1e`,
                                  color: typeColors[item.type],
                                }}
                              >
                                {typeLabels[item.type]}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="note-box" style={{ marginTop: 28 }}>
                🎟️ <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>CATS Ticket</strong> — Considera l'acquisto del biglietto combinato CATS per accedere alle principali attrazioni di César Manrique (Jameos del Agua, Cueva de las Verdes, Jardín de Cactus, Fundación, ecc.) a prezzo ridotto.<br /><br />
                🚗 <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>Auto</strong> — Ritiro Cicar: 18/06 ore 18:00 · Consegna: 25/06 ore 06:00.
              </div>
            </>
          )}

          {/* ── Budget ── */}
          {tab === "budget" && (
            <>
              <div className="budget-card">
                <div className="budget-hdr">
                  <div className="budget-title">Spese Pianificate</div>
                  <div className="budget-sub">Per coppia · esclusi voli, alloggio e pasti</div>
                </div>
                {budget.map((b, i) => (
                  <div key={i} className="budget-row">
                    <span className="budget-lbl">{b.label}</span>
                    <span className="budget-amt">€{b.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="budget-total">
                  <span className="total-lbl">Totale Stimato</span>
                  <span className="total-amt">€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="note-box">
                💡 Le cifre per attività (Timanfaya, La Graciosa, degustazione) sono calcolate per 2 persone.
                Il budget reale varierà in base a pasti, ingressi singoli, souvenir e scelte finali sulle attività.
                Considera circa <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>€40–70 al giorno a persona</strong> per pasti e spese varie.
              </div>

              {/* Mini cost breakdown per activity */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(var(--text-rgb),.3)", marginBottom: 14 }}>
                  Alternative disponibili
                </div>
                {[
                  ["Degustazione El Grifo (vs Vega de Yuco)", "+€52 coppia"],
                  ["Tour Timanfaya + Jameos + Cueva (Tour 3)", "+€84 coppia"],
                  ["Parcheggio Bari (vs taxi €56)", "−€16 coppia"],
                ].map(([label, diff], i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "11px 0", borderBottom: "1px solid rgba(var(--surface-rgb),.04)",
                    fontSize: 13,
                  }}>
                    <span style={{ color: "rgba(var(--text-rgb),.5)" }}>{label}</span>
                    <span style={{ color: diff.startsWith("+") ? "#e05252" : "#7cba6c", fontFamily: "Cormorant Garamond, serif", fontSize: 17 }}>{diff}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
