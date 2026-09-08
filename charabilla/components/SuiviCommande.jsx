"use client";

import { useEffect, useMemo, useState } from "react";
import { INK, CTA, THEMES } from "@/lib/themes";
import { creerClient } from "@/lib/api-client";
import { STATUTS, ETAPES_SUIVI, titreAffiche } from "@/lib/commandes-communs";

const ui = { fontFamily: "var(--font-nunito), sans-serif" };
const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };
const dateLongue = (t) => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function Cadre({ children }) {
  return (
    <div className="min-h-screen" style={{ background: "#EEF1F8", ...ui, color: INK }}>
      <header className="px-5 pt-8 pb-4 max-w-2xl mx-auto flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm" style={{ background: CTA }}>💬</div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={uiDisplay}>charabilla</h1>
          <p className="text-sm opacity-75">Suivi de votre commande</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-5 pb-16 flex flex-col gap-4">{children}</main>
    </div>
  );
}

// Page de suivi d'une commande, accessible au client par le lien reçu par e-mail.
export default function SuiviCommande({ id, lienAccueil = "/" }) {
  const client = useMemo(() => creerClient(), []);
  const [commande, setCommande] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let actif = true;
    client.lireCommande(id)
      .then((c) => { if (actif) setCommande(c); })
      .catch((e) => { if (actif) setErreur(e.message); });
    return () => { actif = false; };
  }, [client, id]);


  if (erreur) return <Cadre><div className="rounded-3xl bg-white p-6 shadow-sm"><p className="font-bold">{erreur}</p><a href={lienAccueil} className="text-sm underline opacity-70">← retour au site</a></div></Cadre>;
  if (!commande) return <Cadre><div className="rounded-3xl bg-white p-6 shadow-sm text-sm opacity-60">Chargement…</div></Cadre>;

  const theme = THEMES[commande.affiche.themeKey];
  const annulee = commande.statut === "annulee";
  const attente = commande.statut === "en_attente_paiement";
  const indexCourant = ETAPES_SUIVI.indexOf(commande.statut);

  return (
    <Cadre>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Commande {commande.numero}</div>
            <h2 className="text-2xl font-bold mt-1" style={uiDisplay}>« {titreAffiche(commande.affiche)} »</h2>
            <p className="text-xs opacity-60">Passée le {dateLongue(commande.date)}</p>
          </div>
          <span className="text-xs font-bold rounded-full px-3 py-1.5 text-white" style={{ background: annulee ? "#B5443A" : INK }}>{STATUTS[commande.statut]?.label}</span>
        </div>

        {attente && <p className="mt-4 text-sm rounded-2xl p-3" style={{ background: "#FFF4D6" }}>Nous attendons la confirmation de votre paiement. Cette page se mettra à jour toute seule ; vous recevrez aussi un e-mail.</p>}

        {!annulee && (
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {ETAPES_SUIVI.map((etape, i) => {
              const fait = i <= indexCourant;
              return (
                <li key={etape} className="text-center">
                  <div className="mx-auto w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: fait ? CTA : "#F0F3FA", color: fait ? "#fff" : INK }}>{fait ? "✓" : i + 1}</div>
                  <div className="text-[11px] font-bold mt-1" style={{ opacity: fait ? 1 : 0.5 }}>{STATUTS[etape].label}</div>
                </li>
              );
            })}
          </ol>
        )}

        {commande.suivi?.numero && (
          <p className="mt-4 text-sm rounded-2xl p-3" style={{ background: "#F7F9FD" }}>
            Colis {commande.suivi.transporteur ? `${commande.suivi.transporteur} · ` : ""}<b>{commande.suivi.numero}</b>
          </p>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm grid sm:grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Votre affiche</div>
          <p className="text-sm"><b>{theme?.label}</b> · {commande.affiche.words.length} mot{commande.affiche.words.length > 1 ? "s" : ""}{commande.affiche.ageLine ? ` · ${commande.affiche.ageLine}` : ""}</p>
          <p className="text-sm mt-1">{commande.format.label}{commande.cadre && commande.cadre.id !== "none" ? ` · ${commande.cadre.label}` : ""}</p>
          <p className="text-sm font-bold mt-1">{commande.total} €</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {commande.affiche.words.map((w, i) => <span key={i} className="text-[11px] font-bold rounded-full px-2 py-0.5" style={{ background: theme?.bg, color: INK }}>{w.child}</span>)}
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Livraison</div>
          <p className="text-sm">{commande.client.prenom} {commande.client.nom}<br />{commande.client.adresse1}{commande.client.adresse2 ? <><br />{commande.client.adresse2}</> : null}<br />{commande.client.codePostal} {commande.client.ville}<br />{commande.client.pays}</p>
          <p className="text-xs opacity-60 mt-2">Les e-mails de suivi sont envoyés à {commande.client.email}.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Historique</div>
        <ul className="flex flex-col gap-1.5">
          {[...commande.historique].reverse().map((h, i) => (
            <li key={i} className="text-sm flex gap-3"><span className="opacity-50 w-24 flex-shrink-0">{dateLongue(h.date)}</span><span>{h.message}</span></li>
          ))}
        </ul>
      </div>

      <a href={lienAccueil} className="text-sm underline opacity-70 text-center">← Créer une autre affiche</a>
    </Cadre>
  );
}
