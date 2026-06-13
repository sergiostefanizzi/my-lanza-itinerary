import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient.js";
import LanzaroteItinerary from "./components/LanzaroteItinerary.jsx";
import AuthGate from "./components/AuthGate.jsx";

// Cancello di autenticazione davanti all'app. Osserva la sessione Supabase:
// senza sessione -> <AuthGate />, con sessione -> <LanzaroteItinerary /> + "Esci".
// LanzaroteItinerary.jsx resta intatto (l'auth e' un livello esterno).
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Mentre leggiamo la sessione (sincrono da localStorage, istantaneo) non
  // mostriamo nulla, per evitare un flash della schermata di login.
  if (loading) return null;

  if (!session) return <AuthGate />;

  return (
    <>
      <LanzaroteItinerary />
      <button
        className="logout-btn"
        onClick={() => supabase.auth.signOut()}
        title="Esci dall'account"
      >
        Esci
      </button>
      <style>{`
        .logout-btn {
          position: fixed; top: 18px; left: 18px; z-index: 10;
          height: 40px; padding: 0 16px; border-radius: 20px;
          display: flex; align-items: center; line-height: 1; cursor: pointer;
          background: rgba(var(--surface-rgb),.04);
          border: 1px solid rgba(var(--surface-rgb),.1);
          color: rgb(var(--text-rgb));
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 500; letter-spacing: 1px;
          backdrop-filter: blur(6px);
          transition: background .2s, border-color .2s, transform .2s;
        }
        .logout-btn:hover {
          background: rgba(var(--surface-rgb),.09);
          border-color: rgba(var(--surface-rgb),.18);
          transform: scale(1.04);
        }
      `}</style>
    </>
  );
}
