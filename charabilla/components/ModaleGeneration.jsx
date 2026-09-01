"use client";

import { useState } from "react";
import { THEMES, INK, CTA, keyify, toEnglish } from "@/lib/themes";

const MAX_REGENERATIONS = 3;

function Bouton({ children, className = "", ...p }) {
  return <button {...p} className={`rounded-2xl px-4 py-3 font-bold disabled:opacity-40 ${className}`}>{children}</button>;
}

// Modale « Générer une illustration », partagée entre l'utilisateur et le back-office.
//  - admin=false : l'utilisateur génère, régénère au plus 3 fois, puis peut signaler le mot.
//  - admin=true  : terme anglais modifiable, prompt visible, enregistrement direct en « valide ».
export default function ModaleGeneration({ client, mot, univers, en, admin = false, onClose, onValide, onSignale }) {
  const theme = THEMES[univers];
  const key = keyify(mot);
  const [enEdit, setEnEdit] = useState(en || toEnglish(mot));
  const [etat, setEtat] = useState("pret"); // pret | encours | apercu | erreur | signale
  const [image, setImage] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essais, setEssais] = useState(0);
  const [enregistrement, setEnregistrement] = useState(false);
  const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };

  const regenerationsRestantes = MAX_REGENERATIONS - Math.max(0, essais - 1);
  const peutRegenerer = admin || regenerationsRestantes > 0;

  const generer = async () => {
    setEtat("encours"); setErreur("");
    try {
      const r = await client.generer({ mot, univers, en: admin ? enEdit : undefined });
      setImage(r.image); setEnEdit(r.en); setEssais((n) => n + 1); setEtat("apercu");
    } catch (e) {
      setErreur(e.message || "La génération a échoué"); setEtat("erreur");
    }
  };

  const valider = async () => {
    setEnregistrement(true); setErreur("");
    try {
      const item = await client.enregistrer({
        univers, key, mot, en: enEdit, image,
        source: admin ? "admin" : "utilisateur", statut: admin ? "valide" : "a_valider",
      });
      onValide(item);
    } catch (e) {
      setErreur(e.message || "Enregistrement impossible"); setEnregistrement(false);
    }
  };

  const signaler = async () => {
    try {
      await client.signaler({ univers, key, mot, en: enEdit });
      setEtat("signale");
    } catch (e) { setErreur(e.message || "Signalement impossible"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-3xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg" style={uiDisplay}>Illustration « {mot} »</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button>
        </div>
        <p className="text-[11px] opacity-60 mb-4">Univers {theme.label}. L&apos;illustration est créée dans le style de l&apos;univers, sur le même fond que l&apos;affiche.</p>

        {admin && (
          <>
            <label className="text-xs font-bold opacity-70">Objet à illustrer (en anglais)</label>
            <input value={enEdit} onChange={(e) => setEnEdit(e.target.value)} disabled={etat === "encours"}
              className="w-full mt-1 mb-3 rounded-2xl border-2 px-3 py-2.5 outline-none text-sm" style={{ borderColor: "#DCE2F0" }} />
            <details className="mb-3">
              <summary className="text-xs font-bold opacity-70 cursor-pointer">Prompt verrouillé de l&apos;univers</summary>
              <textarea readOnly value={theme.prompt(enEdit)} rows={5}
                className="w-full mt-1 rounded-2xl border-2 px-3 py-2.5 outline-none text-[11px] leading-relaxed" style={{ borderColor: "#DCE2F0", background: "#F7F9FD" }} />
            </details>
          </>
        )}

        {etat === "pret" && (
          <Bouton onClick={generer} className="w-full text-white" style={{ background: CTA, ...uiDisplay }}>✨ Générer une illustration</Bouton>
        )}

        {etat === "encours" && (
          <div className="text-center py-8">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: "#F0F3FA", borderTopColor: CTA }} />
            <p className="text-sm font-bold">Génération en cours…</p>
            <p className="text-xs opacity-60 mt-1">Une dizaine de secondes, parfois trente.</p>
          </div>
        )}

        {etat === "erreur" && (
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: "#B5443A" }}>{erreur}</p>
            <div className="flex gap-2">
              <Bouton onClick={generer} className="flex-1 border-2" style={{ borderColor: "#DCE2F0" }}>Réessayer</Bouton>
              {!admin && <Bouton onClick={signaler} className="flex-1 text-white" style={{ background: INK, ...uiDisplay }}>Signaler ce mot</Bouton>}
            </div>
          </div>
        )}

        {etat === "apercu" && image && (
          <>
            <div className="rounded-3xl overflow-hidden mb-4 mx-auto" style={{ maxWidth: 260, background: theme.bg }}>
              <img src={image} alt={mot} className="w-full aspect-square object-contain" draggable={false} />
            </div>
            <p className="text-sm font-bold text-center mb-3">Cette illustration convient-elle ?</p>
            {erreur && <p className="text-xs font-bold text-center mb-2" style={{ color: "#B5443A" }}>{erreur}</p>}
            <div className="flex gap-2">
              <Bouton onClick={generer} disabled={!peutRegenerer || enregistrement} className="flex-1 border-2" style={{ borderColor: "#DCE2F0" }}>
                ↻ Régénérer{!admin && <span className="block text-[10px] font-normal opacity-60">{regenerationsRestantes} essai{regenerationsRestantes > 1 ? "s" : ""} restant{regenerationsRestantes > 1 ? "s" : ""}</span>}
              </Bouton>
              <Bouton onClick={valider} disabled={enregistrement} className="flex-1 text-white" style={{ background: CTA, ...uiDisplay }}>
                {enregistrement ? "Enregistrement…" : admin ? "✓ Enregistrer" : "✓ Oui, l'utiliser"}
              </Bouton>
            </div>
            {!admin && !peutRegenerer && (
              <div className="mt-4 rounded-2xl p-3" style={{ background: "#F7F9FD" }}>
                <p className="text-xs font-bold mb-2">Aucune ne convient ?</p>
                <p className="text-[11px] opacity-70 mb-2">Signale le mot : notre équipe ajoutera l&apos;illustration de « {mot} » à la bibliothèque. Elle apparaîtra automatiquement dans ton affiche dès qu&apos;elle sera prête.</p>
                <Bouton onClick={signaler} className="w-full text-white text-sm" style={{ background: INK, ...uiDisplay }}>Signaler ce mot</Bouton>
              </div>
            )}
          </>
        )}

        {etat === "signale" && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">🙏</div>
            <p className="text-sm font-bold mb-1">Merci, c&apos;est noté.</p>
            <p className="text-xs opacity-70 mb-4">Le mot « {mot} » garde sa place dans l&apos;affiche ; son illustration se mettra en place dès qu&apos;elle sera dans la bibliothèque.</p>
            <Bouton onClick={() => onSignale?.()} className="text-white" style={{ background: INK, ...uiDisplay }}>Fermer</Bouton>
          </div>
        )}
      </div>
    </div>
  );
}
