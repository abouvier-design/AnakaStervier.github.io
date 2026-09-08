"use client";

import { useEffect, useState } from "react";
import { INK, CTA } from "@/lib/themes";
import { STATUTS } from "@/lib/commandes-communs";

const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };
const euros = (n) => `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
const nomMois = (m) => { const [a, mm] = m.split("-"); const t = new Date(Number(a), Number(mm) - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }); return t.charAt(0).toUpperCase() + t.slice(1); };

// Chiffre d'affaires : chiffres-clés, puis répartitions en tableaux (une seule teinte, pas de graphique décoratif).
function Repartition({ titre, lignes, cle }) {
  const max = Math.max(1, ...lignes.map((l) => l.total));
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>{titre}</div>
      {lignes.length === 0 ? <p className="text-xs opacity-60">Rien encore.</p> : (
        <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          <tbody>
            {lignes.map((l) => (
              <tr key={l[cle]} className="border-t" style={{ borderColor: "#EEF1F8" }}>
                <td className="py-2 pr-3">{cle === "mois" ? nomMois(l.mois) : l[cle]}</td>
                <td className="py-2 pr-3 w-1/3">
                  <div className="h-2 rounded-full" style={{ width: `${Math.max(3, (l.total / max) * 100)}%`, background: CTA, opacity: 0.8 }} />
                </td>
                <td className="py-2 pr-3 text-right opacity-70 whitespace-nowrap">{l.nombre} cmd</td>
                <td className="py-2 text-right font-bold whitespace-nowrap">{euros(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminChiffres({ client }) {
  const [donnees, setDonnees] = useState(null);
  useEffect(() => {
    let actif = true;
    client.listerCommandes().then((d) => { if (actif) setDonnees(d); }).catch(() => {});
    return () => { actif = false; };
  }, [client]);

  if (!donnees) return <div className="rounded-3xl bg-white p-5 shadow-sm text-sm opacity-60">Chargement…</div>;
  const ch = donnees.chiffres;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs opacity-60">Le chiffre d&apos;affaires compte les commandes payées, en production, expédiées et livrées. Les commandes annulées ou en attente de paiement sont exclues.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [euros(ch.total), "chiffre d'affaires total"],
          [euros(ch.moisCourant.total), `ce mois-ci · ${ch.moisCourant.nombre} commande${ch.moisCourant.nombre > 1 ? "s" : ""}`],
          [ch.nombre, "commandes encaissées"],
          [euros(ch.panierMoyen), "panier moyen"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold" style={{ ...uiDisplay, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div className="text-xs opacity-60">{l}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Repartition titre="Par format" lignes={ch.parFormat} cle="label" />
        <Repartition titre="Par univers" lignes={ch.parUnivers} cle="label" />
      </div>
      <Repartition titre="Par mois" lignes={ch.parMois} cle="mois" />
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CTA }}>Commandes par statut</div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUTS).map(([k, v]) => (
            <span key={k} className="text-xs rounded-full px-3 py-1.5" style={{ background: "#F0F3FA", color: INK }}><b>{ch.parStatut[k] || 0}</b> {v.label.toLowerCase()}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
