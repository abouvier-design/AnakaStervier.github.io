"use client";

import { useState } from "react";
import { INK, CTA } from "@/lib/themes";
import { LANGUES } from "@/lib/commandes-communs";

const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };

// Noms d'une illustration dans plusieurs langues : le français est obligatoire,
// on ajoute autant de langues qu'on veut. La recherche côté client utilise toutes les langues.
export default function ModaleNoms({ item, onClose, onSave }) {
  const [noms, setNoms] = useState(() => ({ fr: item.noms?.fr || item.mot || item.key, ...(item.noms || {}) }));
  const [ajout, setAjout] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const disponibles = LANGUES.filter(([code]) => !(code in noms));
  const libelle = (code) => (LANGUES.find(([c]) => c === code) || [code, code.toUpperCase()])[1];

  const enregistrer = async () => {
    if (!noms.fr?.trim()) { setErreur("Le nom français est obligatoire"); return; }
    setEnregistrement(true); setErreur("");
    try { await onSave(Object.fromEntries(Object.entries(noms).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()]))); }
    catch (e) { setErreur(e.message); setEnregistrement(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0" style={{ background: "#F7F9FD" }}>
            {item.url && <img src={item.url} alt="" className="w-full h-full object-contain" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight" style={uiDisplay}>Noms de l&apos;illustration</h3>
            <p className="text-[11px] opacity-60">Identifiant : {item.key}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button>
        </div>

        <div className="flex flex-col gap-2 mb-3">
          {Object.keys(noms).sort((a, b) => (a === "fr" ? -1 : b === "fr" ? 1 : a.localeCompare(b))).map((code) => (
            <div key={code} className="flex items-center gap-2">
              <span className="w-24 text-xs font-bold opacity-70">{libelle(code)}</span>
              <input value={noms[code]} onChange={(e) => setNoms({ ...noms, [code]: e.target.value })}
                className="flex-1 rounded-2xl border-2 px-3 py-2 outline-none text-sm" style={{ borderColor: code === "fr" ? "#F6C9DE" : "#DCE2F0" }} />
              {code !== "fr" && (
                <button onClick={() => { const n = { ...noms }; delete n[code]; setNoms(n); }} className="text-xs font-bold px-2" style={{ color: CTA }} title="Retirer">✕</button>
              )}
            </div>
          ))}
        </div>

        {disponibles.length > 0 && (
          <div className="flex gap-2 mb-4">
            <select value={ajout} onChange={(e) => setAjout(e.target.value)} className="flex-1 rounded-2xl border-2 px-3 py-2 text-sm outline-none" style={{ borderColor: "#DCE2F0" }}>
              <option value="">Ajouter une langue…</option>
              {disponibles.map(([code, nom]) => <option key={code} value={code}>{nom}</option>)}
            </select>
            <button onClick={() => { if (ajout) { setNoms({ ...noms, [ajout]: "" }); setAjout(""); } }} disabled={!ajout}
              className="rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-40" style={{ background: "#F0F3FA" }}>Ajouter</button>
          </div>
        )}

        {erreur && <p className="text-xs font-bold mb-2" style={{ color: "#B5443A" }}>{erreur}</p>}
        <button onClick={enregistrer} disabled={enregistrement} className="w-full rounded-2xl px-4 py-3 font-bold text-white disabled:opacity-40" style={{ background: INK, ...uiDisplay }}>
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
