"use client";

import { useEffect, useMemo, useState } from "react";
import { INK, CTA, THEMES, FORMATS } from "@/lib/themes";
import { STATUTS, titreAffiche } from "@/lib/commandes-communs";

const uiDisplay = { fontFamily: "var(--font-fredoka), sans-serif" };
const dateCourte = (t) => new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateHeure = (t) => new Date(t).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const euros = (n) => `${Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;

// Statuts qu'on peut donner ensuite, depuis chaque statut.
const SUIVANTS = {
  en_attente_paiement: ["payee", "annulee"],
  payee: ["en_production", "annulee"],
  en_production: ["expediee", "annulee"],
  expediee: ["livree"],
  livree: [],
  annulee: ["payee"],
};

function Pastille({ statut }) {
  const couleurs = { en_attente_paiement: "#FFF4D6", payee: "#E6F4EA", en_production: "#E3ECFB", expediee: "#EDE7F3", livree: "#F0F3FA", annulee: "#FBE3E0" };
  return <span className="text-[11px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap" style={{ background: couleurs[statut] || "#F0F3FA", color: INK }}>{STATUTS[statut]?.label || statut}</span>;
}

export default function AdminCommandes({ client, flash }) {
  const [donnees, setDonnees] = useState(null);
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreFormat, setFiltreFormat] = useState("");
  const [selection, setSelection] = useState(null);
  const [suivi, setSuivi] = useState({ transporteur: "", numero: "" });
  const [notes, setNotes] = useState("");
  const [enCours, setEnCours] = useState(false);

  const charger = async () => {
    try { setDonnees(await client.listerCommandes()); } catch (e) { flash?.(e.message); }
  };
  useEffect(() => {
    let actif = true;
    client.listerCommandes().then((d) => { if (actif) setDonnees(d); }).catch(() => {});
    return () => { actif = false; };
  }, [client]);

  const commandes = donnees?.commandes || [];
  const filtrees = useMemo(() => commandes.filter((c) => (!filtreStatut || c.statut === filtreStatut) && (!filtreFormat || c.format.id === filtreFormat)), [commandes, filtreStatut, filtreFormat]);
  const courante = commandes.find((c) => c.id === selection) || null;

  const ouvrir = (c) => { setSelection(c.id); setSuivi({ transporteur: c.suivi?.transporteur || "", numero: c.suivi?.numero || "" }); setNotes(c.notes || ""); };
  const appliquer = async (champs, message) => {
    setEnCours(true);
    try { await client.mettreAJourCommande(courante.id, champs); await charger(); flash?.(message); }
    catch (e) { flash?.(e.message); }
    setEnCours(false);
  };

  if (!donnees) return <div className="rounded-3xl bg-white p-5 shadow-sm text-sm opacity-60">Chargement des commandes…</div>;

  const enCoursDeTraitement = commandes.filter((c) => ["payee", "en_production"].includes(c.statut)).length;

  return (
    <div className="flex flex-col gap-5">
      {(donnees.modes?.paiement === "demo" || donnees.modes?.email === "simulation") && (
        <div className="rounded-2xl px-4 py-2.5 text-xs font-bold" style={{ background: "#FFF4D6" }}>
          {donnees.modes.paiement === "demo" ? "Paiement en mode démonstration (aucune clé Stripe) : les commandes sont marquées payées directement. " : ""}
          {donnees.modes.email === "simulation" ? "E-mails en simulation (aucune clé d'envoi) : ils sont consignés dans chaque commande sans être envoyés." : ""}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[[enCoursDeTraitement, "à traiter (payées, en production)"], [donnees.chiffres.parStatut.expediee, "expédiées"], [donnees.chiffres.parStatut.livree, "livrées"]].map(([n, l]) => (
          <div key={l} className="rounded-3xl bg-white p-4 shadow-sm"><div className="text-2xl font-bold" style={uiDisplay}>{n}</div><div className="text-xs opacity-60">{l}</div></div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Commandes · {filtrees.length}</div>
          <span className="flex-1" />
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="rounded-2xl border-2 px-3 py-1.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label} ({donnees.chiffres.parStatut[k] || 0})</option>)}
          </select>
          <select value={filtreFormat} onChange={(e) => setFiltreFormat(e.target.value)} className="rounded-2xl border-2 px-3 py-1.5 text-sm outline-none" style={{ borderColor: "#DCE2F0" }}>
            <option value="">Tous les formats</option>
            {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        {filtrees.length === 0 ? (
          <p className="text-xs opacity-60">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider opacity-60">
                  <th className="py-2 pr-3">N°</th><th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Client</th><th className="py-2 pr-3">Affiche</th><th className="py-2 pr-3">Format</th><th className="py-2 pr-3 text-right">Total</th><th className="py-2 pr-3">Statut</th><th />
                </tr>
              </thead>
              <tbody>
                {filtrees.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: "#EEF1F8" }}>
                    <td className="py-2 pr-3 font-bold whitespace-nowrap">{c.numero}</td>
                    <td className="py-2 pr-3 whitespace-nowrap opacity-70">{dateCourte(c.date)}</td>
                    <td className="py-2 pr-3">{c.client.prenom} {c.client.nom}<div className="text-[11px] opacity-60">{c.client.email}</div></td>
                    <td className="py-2 pr-3">{titreAffiche(c.affiche)}<div className="text-[11px] opacity-60">{THEMES[c.affiche.themeKey]?.label} · {c.affiche.words.length} mots</div></td>
                    <td className="py-2 pr-3 whitespace-nowrap">{c.format.label.split(" · ")[0]}{c.cadre && c.cadre.id !== "none" ? <div className="text-[11px] opacity-60">{c.cadre.label}</div> : null}</td>
                    <td className="py-2 pr-3 text-right font-bold whitespace-nowrap">{euros(c.total)}</td>
                    <td className="py-2 pr-3"><Pastille statut={c.statut} /></td>
                    <td className="py-2"><button onClick={() => ouvrir(c)} className="text-xs font-bold rounded-full px-3 py-1 text-white" style={{ background: INK }}>Voir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {courante && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(51,50,78,0.5)" }} onClick={() => setSelection(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: CTA }}>Commande {courante.numero}</div>
                <h3 className="font-bold text-xl" style={uiDisplay}>« {titreAffiche(courante.affiche)} »</h3>
                <p className="text-xs opacity-60">{dateHeure(courante.date)} · paiement {courante.paiement?.mode === "stripe" ? "Stripe" : "démonstration"}</p>
              </div>
              <div className="flex items-center gap-2"><Pastille statut={courante.statut} /><button onClick={() => setSelection(null)} className="w-8 h-8 rounded-full font-bold" style={{ background: "#F0F3FA" }}>✕</button></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl p-4" style={{ background: "#F7F9FD" }}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Client (SAV)</div>
                <p className="text-sm font-bold">{courante.client.prenom} {courante.client.nom}</p>
                <p className="text-sm"><a href={`mailto:${courante.client.email}?subject=Commande ${courante.numero}`} className="underline">{courante.client.email}</a></p>
                <p className="text-sm mt-2">{courante.client.adresse1}{courante.client.adresse2 ? <><br />{courante.client.adresse2}</> : null}<br />{courante.client.codePostal} {courante.client.ville}<br />{courante.client.pays}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "#F7F9FD" }}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Affiche</div>
                <p className="text-sm"><b>{THEMES[courante.affiche.themeKey]?.label}</b>{courante.affiche.ageLine ? ` · ${courante.affiche.ageLine}` : ""}</p>
                <p className="text-sm">{courante.format.label}{courante.cadre && courante.cadre.id !== "none" ? ` · ${courante.cadre.label}` : ""} · <b>{euros(courante.total)}</b></p>
                <ul className="mt-2 text-xs grid grid-cols-2 gap-x-3 gap-y-0.5">
                  {courante.affiche.words.map((w, i) => <li key={i}><span className="opacity-60">{w.real}</span> → <b>{w.child}</b></li>)}
                </ul>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Faire avancer la commande</div>
              <div className="flex gap-2 flex-wrap">
                {(SUIVANTS[courante.statut] || []).map((s) => (
                  <button key={s} onClick={() => appliquer({ statut: s, suivi }, `Commande ${courante.numero} : ${STATUTS[s].label}`)} disabled={enCours}
                    className="rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-40" style={s === "annulee" ? { background: "#FBE3E0", color: "#B5443A" } : { background: INK, color: "#fff", ...uiDisplay }}>
                    {s === "annulee" ? "Annuler la commande" : `→ ${STATUTS[s].label}`}
                  </button>
                ))}
                {(SUIVANTS[courante.statut] || []).length === 0 && <span className="text-xs opacity-60">Commande terminée.</span>}
              </div>
              <p className="text-[11px] opacity-60 mt-2">Chaque changement de statut envoie un e-mail au client.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Suivi colis</div>
                <input value={suivi.transporteur} onChange={(e) => setSuivi({ ...suivi, transporteur: e.target.value })} placeholder="Transporteur (ex. Colissimo)" className="w-full mb-2 rounded-2xl border-2 px-3 py-2 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                <input value={suivi.numero} onChange={(e) => setSuivi({ ...suivi, numero: e.target.value })} placeholder="Numéro de suivi" className="w-full mb-2 rounded-2xl border-2 px-3 py-2 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                <button onClick={() => appliquer({ suivi }, "Suivi enregistré")} disabled={enCours} className="rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-40" style={{ background: "#F0F3FA" }}>Enregistrer le suivi</button>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Notes internes (SAV)</div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Échanges avec le client, réclamation, réimpression…" className="w-full mb-2 rounded-2xl border-2 px-3 py-2 text-sm outline-none" style={{ borderColor: "#DCE2F0" }} />
                <button onClick={() => appliquer({ notes }, "Notes enregistrées")} disabled={enCours} className="rounded-2xl px-4 py-2 text-sm font-bold disabled:opacity-40" style={{ background: "#F0F3FA" }}>Enregistrer les notes</button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">Historique</div>
                <ul className="text-xs flex flex-col gap-1">{[...courante.historique].reverse().map((h, i) => <li key={i}><span className="opacity-50">{dateHeure(h.date)}</span> · {h.message}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-60">E-mails au client</div>
                {courante.emails?.length ? (
                  <ul className="text-xs flex flex-col gap-1">{[...courante.emails].reverse().map((m, i) => <li key={i}><span className="opacity-50">{dateHeure(m.date)}</span> · {m.sujet} <span className="opacity-50">({m.mode === "resend" ? "envoyé" : m.mode === "echec" ? "échec" : "simulé"})</span></li>)}</ul>
                ) : <p className="text-xs opacity-60">Aucun e-mail pour l&apos;instant.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
