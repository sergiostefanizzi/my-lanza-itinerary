import { useState, useLayoutEffect, useEffect } from "react";
import DayMap from "./DayMap.jsx";

// Base del viaggio (alloggio): punto di partenza/ritorno delle giornate.
const BASE = { label: "Casa Vera · Puerto del Carmen", coords: [28.918, -13.666] };

const days = [
  {
    day: 1, date: "Gio 18 Giugno", title: "Arrivo", accent: "#c9913d",
    subtitle: "Benvenuti sull'isola del fuoco",
    icon: "✈️",
    stops: [
      { label: "Aeroporto di Lanzarote", coords: [28.9455, -13.6052] },
      { label: "Lungomare di Puerto del Carmen", coords: [28.9215, -13.6720] },
      { label: "Cena: Mura · Puerto del Carmen", coords: [28.9170, -13.6635] },
    ],
    items: [
      { type: "logistica", icon: "🛬", text: "Atterraggio a Lanzarote" , time: "17:00"},
      { type: "logistica", icon: "🚗", text: "Ritiro auto Cicar 500X" , time: "18:00"},
      { type: "logistica", icon: "🏠", text: "Check-in Casa Vera, Puerto del Carmen" , time: "19:00"},
      { type: "vista", icon: "🌅", text: "Passeggiata sul lungomare di Puerto del Carmen" , time: "20:00"},
      { type: "cibo", icon: "🍽️", text: "Cena: Mura o Casa Carlos" , time: "21:00"},
    ]
  },
  {
    day: 2, date: "Ven 19 Giugno", title: "Relax a Papagayo", accent: "#41b3b0",
    subtitle: "Calette turchesi e dolce far niente",
    icon: "🏖️",
    stops: [
      { label: "Playa Mujeres", coords: [28.8430, -13.7965] },
      { label: "Playa de Papagayo", coords: [28.8360, -13.7900] },
      { label: "Playa de la Cera", coords: [28.8350, -13.7878] },
      { label: "Caleta del Congrio", coords: [28.8340, -13.7860] },
      { label: "Playa del Pozo", coords: [28.8332, -13.7838] },
      { label: "Tramonto: Playa Blanca", coords: [28.8617, -13.8300] },
    ],
    items: [
      { type: "vista", icon: "🏖️", text: "Calette di Papagayo — giornata in spiaggia", time: "10:00", cost: "free", note: "Accesso 9:00–19:00 · €3 a veicolo (solo carta) · 5 calette su un sentiero di 1,5 km: spostati liberamente. Uscita entro le 19:00" },
      { type: "attività", icon: "🤿", text: "Snorkeling in autonomia nelle calette turchesi", time: "11:00" },
      { type: "cibo", icon: "🥪", text: "Pranzo: picnic in spiaggia (a Papagayo non ci sono locali)", time: "13:30" },
      { type: "vista", icon: "🌅", text: "Tramonto a Playa Blanca", time: "21:00", note: "A giugno il sole tramonta verso le 21:00" },
      { type: "cibo", icon: "🍽️", text: "Cena: BePapagayo", time: "21:15", note: "Sul lungomare di Playa Blanca, vista mare" },
      { type: "vista", icon: "🏖️", text: "Playa Mujeres", optional: true, note: "La più ampia, sabbia dorata · vicino a Playa Blanca" },
      { type: "vista", icon: "🏖️", text: "Playa de Papagayo", optional: true, note: "La cartolina: cala riparata tra le falesie" },
      { type: "vista", icon: "🏖️", text: "Playa de la Cera", optional: true, note: "Piccola e tranquilla" },
      { type: "vista", icon: "🏖️", text: "Caleta del Congrio", optional: true, note: "Appartata (anche naturisti)" },
      { type: "vista", icon: "🏖️", text: "Playa del Pozo", optional: true, note: "Ampia e di solito meno affollata" },
    ]
  },
  {
    day: 3, date: "Sab 20 Giugno", title: "Haría e il Nord", accent: "#7cba6c",
    subtitle: "Mercato, grotte e piscine naturali",
    icon: "🌿",
    badge: "⚡ Solo sabato: Mercato di Haría!",
    stops: [
      { label: "Jardín de Cactus", coords: [29.0810, -13.4790] },
      { label: "Mercado Artesanal de Haría", coords: [29.1456, -13.5036] },
      { label: "Cueva de los Verdes", coords: [29.1564, -13.4380] },
      { label: "Jameos del Agua", coords: [29.1577, -13.4322] },
      { label: "Piscine naturali di Punta Mujeres", coords: [29.1490, -13.4490] },
    ],
    items: [
      { type: "vista", icon: "🌵", text: "Jardín de Cactus", time: "10:00", cost: "cact", price: "€9", note: "Apre 10:00 · ultimo ingresso 16:30" },
      { type: "vista", icon: "🕳️", text: "Cueva de los Verdes – tubo lavico da 6 km", time: "11:45", cost: "cact", price: "€17", note: "Visita guidata ~50 min · prenotazione online · chiude 16:15" },
      { type: "cibo", icon: "🍽️", text: "Pranzo: Arrieta (pesce fresco)", time: "13:00", note: "Villaggio di pescatori, accanto ai Jameos" },
      { type: "vista", icon: "💧", text: "Jameos del Agua", time: "14:15", cost: "cact", price: "€17", note: "Visita ~1–1,5 h · aperto fino alle 18:00" },
      { type: "cibo", icon: "🍽️", text: "Cena: Punta Mujeres (pesce sul mare)", time: "20:00" },
      { type: "attività", icon: "🛒", text: "Mercado Artesanal de Haría", cost: "free", optional: true, note: "Solo sabato, chiude alle 14:30 · da incastrare in mattinata" },
      { type: "vista", icon: "🏊", text: "Piscine naturali di Punta Mujeres", cost: "free", optional: true, note: "Nel pomeriggio dopo i Jameos · con la marea" },
    ]
  },
  {
    day: 4, date: "Dom 21 Giugno", title: "La Graciosa e l'estremo Nord", accent: "#e8a86d",
    subtitle: "L'ultimo paradiso vergine d'Europa",
    icon: "🏝️",
    stops: [
      { label: "Órzola (imbarco ferry)", coords: [29.2227, -13.4520] },
      { label: "Caleta de Sebo · La Graciosa", coords: [29.2298, -13.5034] },
      { label: "Playa de las Conchas", coords: [29.2685, -13.5170] },
      { label: "Playa Bermeja", coords: [29.2640, -13.5230] },
      { label: "Pranzo: Teleclub · Caleta de Sebo", coords: [29.2305, -13.5040] },
      { label: "Mirador del Río", coords: [29.2120, -13.4790] },
      { label: "Caletón Blanco (al rientro)", coords: [29.2110, -13.4670] },
    ],
    items: [
      { type: "attività", icon: "⛵", text: "Tour Jeep Safari – La Graciosa", time: "10:30", cost: "paid", price: "€77", note: "Traghetto incluso (25 min) · safari ~1h30 · slot 10:30 da Órzola" },
      { type: "vista", icon: "🏖️", text: "Playa de las Conchas – sabbia dorata e vulcano Bermeja", time: "11:30" },
      { type: "vista", icon: "🌋", text: "Playa Bermeja – la cartolina surrealista", time: "12:15" },
      { type: "cibo", icon: "🍽️", text: "Pranzo a Caleta de Sebo: Teleclub", time: "13:30" },
      { type: "vista", icon: "👁️", text: "Mirador del Río – panorama su La Graciosa", time: "16:15", cost: "cact", price: "€9", note: "~30 min · chiude 17:00 (ultimo ingresso 16:40) · rientra in tempo dal traghetto" },
      { type: "cibo", icon: "🍽️", text: "Cena: Casa Tino (al rientro)", time: "20:30" },
      { type: "vista", icon: "🏝️", text: "Caletón Blanco – lava nera e acqua smeraldo", cost: "free", optional: true, note: "Sosta-bagno tra Órzola e il Mirador, se hai tempo" },
    ]
  },
  {
    day: 5, date: "Lun 22 Giugno", title: "Timanfaya e il Sud vulcanico", accent: "#e05252",
    subtitle: "Marte è a Lanzarote",
    icon: "🔥",
    stops: [
      { label: "Parco di Timanfaya · El Diablo", coords: [28.9956, -13.7555] },
      { label: "Las Grietas", coords: [28.9850, -13.7090] },
      { label: "El Golfo · Charco de los Clicos", coords: [28.9603, -13.8285] },
      { label: "Salinas e Playa di Janubio", coords: [28.9347, -13.8200] },
    ],
    items: [
      { type: "attività", icon: "🌋", text: "Tour Parco Nazionale di Timanfaya", time: "08:00", cost: "paid", price: "€57", note: "5 ore (8:00–13:00) · prelievo e rientro a Puerto del Carmen" },
      { type: "cibo", icon: "🍽️", text: "Pranzo: El Diablo (nel parco)", time: "13:00", note: "Ristorante di Manrique nel parco, grill geotermico" },
      { type: "vista", icon: "🪨", text: "Las Grietas", time: "14:30", cost: "free", note: "Sosta breve ~30 min" },
      { type: "vista", icon: "🟢", text: "El Golfo e Charco de los Clicos – la laguna smeraldo", time: "15:30", cost: "free", note: "Passeggiata ~45 min" },
      { type: "vista", icon: "⬛", text: "Salinas e Playa di Janubio – sabbia nera e onde selvagge", time: "16:30", cost: "free" },
      { type: "cibo", icon: "🍽️", text: "Cena: Mirador de las Salinas", time: "21:00", note: "Tramonto sulle saline di Janubio" },
      { type: "cibo", icon: "🍷", text: "Pranzo alternativo: La Bodega de Santiago (Yaiza)", optional: true, note: "In alternativa a El Diablo, sulla strada verso la costa" },
    ]
  },
  {
    day: 6, date: "Mar 23 Giugno", title: "Manrique e il Centro", accent: "#a07cc5",
    subtitle: "Arte, architettura e panorami senza fine",
    icon: "🎨",
    stops: [
      { label: "Casa Museo del Campesino", coords: [29.0010, -13.6420] },
      { label: "Fundación César Manrique · Tahíche", coords: [29.0470, -13.5640] },
      { label: "Lagomar Museo · Nazaret", coords: [29.0530, -13.5560] },
      { label: "Teguise", coords: [29.0600, -13.5610] },
      { label: "Caleta de Famara", coords: [29.1150, -13.5640] },
    ],
    items: [
      { type: "vista", icon: "🏡", text: "Casa Museo del Campesino", time: "10:00", cost: "free", note: "Centro CACT a ingresso gratuito · 10:00–18:00 · ~30 min" },
      { type: "vista", icon: "🎨", text: "Fundación César Manrique", time: "11:00", cost: "paid", price: "€10", note: "10:00–17:30 (cassa fino 17:00) · ~1–1,5 h · non CACT" },
      { type: "vista", icon: "🏛️", text: "Lagomar – Casa Omar Sharif", time: "12:45", cost: "paid", price: "€10", note: "10:00–18:00 · ~45 min · non CACT" },
      { type: "cibo", icon: "🍽️", text: "Pranzo: La Tabla (Teguise)", time: "13:45" },
      { type: "vista", icon: "🏘️", text: "Teguise – l'antica capitale", time: "15:30", cost: "free", note: "Passeggiata nel centro storico (il mercato è la domenica) · ~1 h" },
      { type: "cibo", icon: "🍽️", text: "Cena: Barlovento (Teguise)", time: "21:00" },
      { type: "vista", icon: "🌊", text: "Caleta de Famara – onde, surf e la Scogliera", cost: "free", optional: true, note: "Spiaggia per il tardo pomeriggio/tramonto, se hai tempo" },
    ]
  },
  {
    day: 7, date: "Mer 24 Giugno", title: "Buggy, Arrecife e Vino", accent: "#f4a261",
    subtitle: "Adrenalina, capitale e tramonto in vigna",
    icon: "🏎️",
    stops: [
      { label: "Buggy Tour · Costa Teguise (DISA)", coords: [29.0005, -13.4995] },
      { label: "Arrecife · Charco de San Ginés", coords: [28.9630, -13.5470] },
      { label: "Islote de la Fermina · Arrecife", coords: [28.9620, -13.5340] },
      { label: "La Geria (vigneti)", coords: [28.9760, -13.7250] },
      { label: "Degustazione: Finca Testeina · La Geria", coords: [28.9850, -13.6800] },
    ],
    items: [
      { type: "attività", icon: "🚙", text: "Buggy Tour", time: "09:30", cost: "paid", price: "€65", note: "9:30–11:30 (~2 h) · €130 / coppia · ritrovo Costa Teguise" },
      { type: "vista", icon: "🏛️", text: "Arrecife: Charco de San Ginés e Islote de la Fermina", time: "12:00", cost: "free", note: "Passeggiata in città ~1–1,5 h" },
      { type: "cibo", icon: "🍣", text: "Pranzo: Oppa (Arrecife)", time: "13:30" },
      { type: "vista", icon: "🍇", text: "La Geria – i vigneti nei crateri vulcanici", time: "15:30", cost: "free", note: "Strada panoramica tra i vigneti" },
      { type: "attività", icon: "🍷", text: "Degustazione al tramonto – Finca Testeina", time: "18:30", cost: "paid", price: "€26", note: "18:30–20:00 (~1,5 h) · vino e cioccolato" },
      { type: "cibo", icon: "🍽️", text: "Cena d'addio: Meneo", time: "20:30" },
    ]
  },
  {
    day: 8, date: "Gio 25 Giugno", title: "Partenza", accent: "#7a8b99",
    subtitle: "Arrivederci, Lanzarote",
    icon: "🏠",
    stops: [
      { label: "Aeroporto di Lanzarote", coords: [28.9455, -13.6052] },
    ],
    items: [
      { type: "logistica", icon: "🚗", text: "Consegna auto Cicar", time: "06:00" },
      { type: "logistica", icon: "✈️", text: "Volo Lanzarote → Milano Bergamo", time: "08:30" },
      { type: "logistica", icon: "🛬", text: "Arrivo Milano Bergamo", time: "13:25" },
      { type: "logistica", icon: "✈️", text: "Volo Bergamo → Bari", time: "17:25" },
      { type: "logistica", icon: "🏠", text: "Arrivo Bari", time: "18:55" },
    ]
  },
];

const budget = [
  { label: "Noleggio auto (coppia, 7 giorni)", amount: 144.66 },
  { label: "Parcheggio Pinguino – Bari", amount: 40.00 },
  { label: "Tour La Graciosa (×2)", amount: 154.00 },
  { label: "Tour Timanfaya (×2)", amount: 114.00 },
  { label: "Buggy Tour (coppia)", amount: 130.00 },
  { label: "Degustazione Finca Testeina (×2)", amount: 52.00 },
  { label: "Jardín de Cactus · CACT (×2)", amount: 18.00 },
  { label: "Cueva de los Verdes · CACT (×2)", amount: 34.00 },
  { label: "Jameos del Agua · CACT (×2)", amount: 34.00 },
  { label: "Mirador del Río · CACT (×2)", amount: 18.00 },
  { label: "Fundación César Manrique (×2)", amount: 20.00 },
  { label: "Lagomar (×2)", amount: 20.00 },
  { label: "Accesso Papagayo (auto)", amount: 3.00 },
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

// Stato "attività completate": persistito in localStorage (solo questo dispositivo).
// Ogni attività è identificata da `${giorno}-${indice}`.
const DONE_KEY = "doneItems";
function getInitialDone() {
  try {
    const raw = localStorage.getItem(DONE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) { /* localStorage non disponibile / JSON invalido */ }
  return new Set();
}

const firstMapDay = days.find(d => d.stops)?.day ?? 1;

export default function LanzaroteItinerary() {
  const [openDay, setOpenDay] = useState(1);
  const [tab, setTab] = useState("itinerario");
  const [theme, setTheme] = useState(getInitialTheme);
  const [mapDay, setMapDay] = useState(firstMapDay);
  const [done, setDone] = useState(getInitialDone);

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (e) { /* no-op */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(DONE_KEY, JSON.stringify([...done])); } catch (e) { /* no-op */ }
  }, [done]);

  function toggleDone(key) {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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
          transition: border-color .25s, opacity .4s ease, filter .4s ease;
        }
        .day-card:hover { border-color: rgba(var(--surface-rgb),.11); }
        .day-card.open { background: rgba(var(--surface-rgb),.03); }

        /* Giorno interamente completato: card sbiadita */
        .day-card.completed { opacity: .5; filter: saturate(.55); }
        .day-card.completed:hover { opacity: .72; }
        .day-card.completed.open { opacity: .9; filter: saturate(.8); }

        .day-done-check {
          font-size: 15px; line-height: 1; flex-shrink: 0;
          opacity: .9; animation: tickpop .3s ease;
        }
        @keyframes tickpop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.25); }
          100% { transform: scale(1); opacity: .9; }
        }

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
          cursor: pointer;
          transition: opacity .35s ease, background .2s;
        }
        .item:hover { background: rgba(var(--surface-rgb),.05); }
        .item:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .item.done { opacity: .45; }

        /* Sezione opzionali */
        .opt-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 10px 2px 3px;
          font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(var(--text-rgb),.34);
        }
        .opt-divider::before, .opt-divider::after {
          content: ""; flex: 1; height: 1px;
          background: rgba(var(--surface-rgb),.09);
        }
        .item.optional {
          background: transparent;
          border: 1px dashed rgba(var(--surface-rgb),.14);
        }
        .item.optional:hover { background: rgba(var(--surface-rgb),.04); }

        /* Spunta circolare */
        .item-check {
          width: 21px; height: 21px; border-radius: 50%; flex-shrink: 0;
          margin-top: 1px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(var(--text-rgb),.28);
          color: #fff; font-size: 12px; line-height: 1;
          background: transparent;
          transition: background .25s, border-color .25s, transform .2s;
        }
        .item:hover .item-check { transform: scale(1.12); border-color: rgba(var(--text-rgb),.5); }
        .item.done .item-check {
          background: var(--accent); border-color: var(--accent);
        }
        .item-check-tick {
          transform: scale(0); transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .item.done .item-check-tick { transform: scale(1); }

        .item-time {
          flex-shrink: 0; min-width: 42px; text-align: right; margin-top: 2px;
          font-family: 'Cormorant Garamond', serif; font-size: 15px;
          line-height: 1.2; font-variant-numeric: tabular-nums;
          color: var(--accent); opacity: .92; white-space: nowrap;
        }
        .item-ico { font-size: 17px; flex-shrink: 0; margin-top: 1px; }
        .item-body { flex: 1; min-width: 0; }
        .item-txt {
          font-size: 13.5px; line-height: 1.45; color: rgba(var(--text-rgb),.82);
          display: inline;
          background-image: linear-gradient(currentColor, currentColor);
          background-position: 0 60%;
          background-repeat: no-repeat;
          background-size: 0% 1px;
          transition: background-size .35s ease;
        }
        .item.done .item-txt { background-size: 100% 1px; }
        .item-note { font-size: 11px; margin-top: 3px; color: var(--gold); }

        /* Marcatori costo / CACT */
        .item-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .cost-tag {
          font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
          padding: 2px 7px; border-radius: 4px; white-space: nowrap;
          border: 1px solid transparent;
        }
        .cost-cact { background: rgba(var(--gold-rgb),.14); color: var(--gold); border-color: rgba(var(--gold-rgb),.32); }
        .cost-paid { background: rgba(224,82,82,.12); color: #e05252; }
        .cost-free { background: rgba(124,186,108,.14); color: #7cba6c; }
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

        /* ── Mappa ── */
        .map-daysel {
          display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px;
        }
        .map-daysel-btn {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif; font-size: 19px;
          background: rgba(var(--surface-rgb),.03);
          border: 1px solid rgba(var(--surface-rgb),.08);
          color: rgba(var(--text-rgb),.55);
          cursor: pointer; transition: all .2s;
        }
        .map-daysel-btn:hover { border-color: rgba(var(--surface-rgb),.2); color: rgba(var(--text-rgb),.85); }
        .map-daysel-btn.on { background: rgba(var(--surface-rgb),.05); }
        .map-daysel-btn.disabled { opacity: .38; }

        .map-head { margin-bottom: 16px; }
        .map-head-date {
          font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
          opacity: .38; margin-bottom: 4px;
        }
        .map-head-ttl {
          font-family: 'Cormorant Garamond', serif; font-size: 32px;
          font-weight: 500; line-height: 1.05;
        }
        .map-head-sub { font-size: 12px; opacity: .42; margin-top: 2px; }

        .day-map-wrap {
          height: 440px; border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(var(--surface-rgb),.08);
        }
        .leaflet-container { background: var(--bg); font-family: 'DM Sans', sans-serif; }

        .map-stops {
          display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 16px;
        }
        .map-stop { display: flex; align-items: center; gap: 9px; font-size: 13px; }
        .map-stop-num {
          width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500;
        }
        .map-stop-lbl { color: rgba(var(--text-rgb),.72); }

        /* Leaflet DivIcon markers */
        .daymap-pin {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #fff; background: var(--pin);
          border: 2px solid rgba(255,255,255,.85);
          box-shadow: 0 2px 6px rgba(0,0,0,.4);
        }
        .daymap-home {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; background: rgba(12,8,6,.85);
          border: 2px solid rgba(255,255,255,.7);
          box-shadow: 0 2px 6px rgba(0,0,0,.4);
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
            {[
              ["itinerario", "Itinerario"],
              ["budget", "Budget"],
              ["mappa", "Mappa"],
            ].map(([t, label]) => (
              <button key={t} className={`tab-btn ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
                {label}
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
                  // Il giorno è "completato" solo quando tutte le voci OBBLIGATORIE sono spuntate.
                  const hasMandatory = d.items.some(it => !it.optional);
                  const dayDone = hasMandatory && d.items.every((it, i) => it.optional || done.has(`${d.day}-${i}`));
                  const indexed = d.items.map((item, i) => ({ item, i }));
                  const mandatoryItems = indexed.filter(x => !x.item.optional);
                  const optionalItems = indexed.filter(x => x.item.optional);
                  const renderItem = ({ item, i }) => {
                    const key = `${d.day}-${i}`;
                    const isDone = done.has(key);
                    return (
                      <div
                        key={i}
                        className={`item ${isDone ? "done" : ""} ${item.optional ? "optional" : ""}`}
                        style={{ "--accent": d.accent }}
                        onClick={() => toggleDone(key)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isDone}
                        aria-label={`${isDone ? "Segna come da fare" : "Segna come completata"}: ${item.text}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleDone(key);
                          }
                        }}
                      >
                        <div className="item-check">
                          <span className="item-check-tick">✓</span>
                        </div>
                        {item.time && <div className="item-time">{item.time}</div>}
                        <div className="item-ico">{item.icon}</div>
                        <div className="item-body">
                          <div className="item-txt">{item.text}</div>
                          {item.note && <div className="item-note">{item.note}</div>}
                          {item.cost && (
                            <div className="item-tags">
                              {item.cost === "cact" && <span className="cost-tag cost-cact">🎟️ CACT{item.price ? ` · ${item.price} a persona` : ""}</span>}
                              {item.cost === "paid" && <span className="cost-tag cost-paid">{item.price ? `${item.price} a persona` : "€ a pagamento"}</span>}
                              {item.cost === "free" && <span className="cost-tag cost-free">Gratis</span>}
                            </div>
                          )}
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
                    );
                  };
                  return (
                    <div
                      key={d.day}
                      className={`day-card ${isOpen ? "open" : ""} ${dayDone ? "completed" : ""}`}
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

                        {d.badge && !dayDone && <div className="badge">{d.badge}</div>}
                        {dayDone && <div className="day-done-check" style={{ color: d.accent }}>✓</div>}
                        <div className="chevron">▼</div>
                      </div>

                      <div className="day-body">
                        <div className="day-items">
                          {mandatoryItems.map(renderItem)}
                          {optionalItems.length > 0 && (
                            <>
                              <div className="opt-divider"><span>Opzionali</span></div>
                              {optionalItems.map(renderItem)}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="note-box" style={{ marginTop: 28 }}>
                🎟️ <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>Biglietti CACT</strong> — Le voci segnate <strong style={{ color: "var(--gold)" }}>🎟️ CACT</strong> (Jardín de Cactus, Cueva de los Verdes, Jameos del Agua, Mirador del Río, Timanfaya) sono i Centri d'Arte del Cabildo di Lanzarote: l'ingresso si acquista online su <a href="https://ventaonline.cactlanzarote.com" target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>ventaonline.cactlanzarote.com</a>, prenotando <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>data e ora</strong> (obbligatorio per la Cueva de los Verdes). Il vecchio <em>bono</em> combinato multi-centro non è più disponibile (dal 2024): si comprano biglietti singoli. La Casa Museo del Campesino è <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>gratuita</strong>; Fundación César Manrique e Lagomar hanno biglietti propri (non CACT).<br /><br />
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
                💡 Le cifre per attività e ingressi sono calcolate per 2 persone (ingressi CACT e musei inclusi).
                Esclusi voli, alloggio e pasti: considera circa <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>€40–70 al giorno a persona</strong> per pasti e spese varie.
                Prezzi e orari sono indicativi, da riverificare prima del viaggio.
              </div>
            </>
          )}

          {/* ── Mappa ── */}
          {tab === "mappa" && (() => {
            const selected = days.find(d => d.day === mapDay) || days[0];
            return (
              <>
                <div className="map-daysel">
                  {days.map(d => (
                    <button
                      key={d.day}
                      className={`map-daysel-btn ${d.day === mapDay ? "on" : ""} ${d.stops ? "" : "disabled"}`}
                      style={d.day === mapDay ? { borderColor: d.accent, color: d.accent } : undefined}
                      onClick={() => setMapDay(d.day)}
                      title={d.stops ? d.title : "Mappa non ancora disponibile"}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>

                <div className="map-head">
                  <div className="map-head-date">{selected.date}</div>
                  <div className="map-head-ttl" style={{ color: selected.accent }}>
                    {selected.icon} {selected.title}
                  </div>
                  <div className="map-head-sub">{selected.subtitle}</div>
                </div>

                {selected.stops ? (
                  <>
                    <div className="day-map-wrap">
                      <DayMap day={selected} base={BASE} theme={theme} />
                    </div>
                    <div className="map-stops">
                      {selected.stops.map((s, i) => (
                        <div key={i} className="map-stop">
                          <span className="map-stop-num" style={{ background: `${selected.accent}1e`, color: selected.accent }}>{i + 1}</span>
                          <span className="map-stop-lbl">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="note-box">
                    🗺️ La mappa di questo giorno non è ancora disponibile. Per ora è pronta solo quella del <strong style={{ color: "rgba(var(--text-rgb),.75)" }}>Giorno {firstMapDay}</strong>.
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
