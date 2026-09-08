// Envoi d'e-mails aux clients (confirmation, suivi de commande).
// Avec RESEND_API_KEY : envoi réel via Resend. Sans clé : simulation (journal serveur),
// l'e-mail est quand même consigné dans la commande pour pouvoir le relire.
import { STATUTS } from "./commandes-store";

const CLE = () => process.env.RESEND_API_KEY || "";
const EXPEDITEUR = () => process.env.EMAIL_EXPEDITEUR || "Charabilla <onboarding@resend.dev>";
const SITE = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function modeEmail() {
  return CLE() ? "resend" : "simulation";
}

export async function envoyerEmail({ a, sujet, texte }) {
  if (!CLE()) {
    console.log(`[email simulé] à ${a} — ${sujet}\n${texte}`);
    return { mode: "simulation", date: Date.now(), a, sujet };
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${CLE()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EXPEDITEUR(), to: [a], subject: sujet, text: texte }),
  });
  if (!r.ok) throw new Error(`Envoi d'e-mail refusé (${r.status})`);
  return { mode: "resend", date: Date.now(), a, sujet };
}

const titreAffiche = (c) => {
  const n = c.affiche.childName || "…";
  return c.affiche.titleStyle === "dico" ? `Le dico de ${n}` : `L'imagier de ${n}`;
};

export function emailConfirmation(c) {
  const lien = `${SITE()}/commande/${c.id}`;
  return {
    a: c.client.email,
    sujet: `Commande ${c.numero} — ${titreAffiche(c)}`,
    texte: `Bonjour ${c.client.prenom},

Merci ! Votre commande ${c.numero} est bien enregistrée.

Affiche : « ${titreAffiche(c)} » — ${c.affiche.words.length} mot${c.affiche.words.length > 1 ? "s" : ""}
Format : ${c.format.label}${c.cadre && c.cadre.id !== "none" ? ` · ${c.cadre.label}` : ""}
Montant : ${c.total} €

Livraison à : ${c.client.prenom} ${c.client.nom}, ${c.client.adresse1}${c.client.adresse2 ? ", " + c.client.adresse2 : ""}, ${c.client.codePostal} ${c.client.ville}, ${c.client.pays}

Vous pouvez suivre votre commande à tout moment ici : ${lien}
Nous vous écrirons à chaque étape (production, expédition, livraison).

À bientôt,
L'équipe Charabilla`,
  };
}

export function emailStatut(c) {
  const lien = `${SITE()}/commande/${c.id}`;
  const label = STATUTS[c.statut]?.label || c.statut;
  const details = {
    payee: "Votre paiement est confirmé. Votre affiche part en fabrication.",
    en_production: "Votre affiche est en cours d'impression.",
    expediee: `Votre affiche est en route${c.suivi?.numero ? ` — suivi ${c.suivi.transporteur ? c.suivi.transporteur + " " : ""}${c.suivi.numero}` : ""}.`,
    livree: "Votre affiche est livrée. Nous espérons qu'elle vous plaît !",
    annulee: "Votre commande a été annulée. Si ce n'est pas attendu, répondez à cet e-mail.",
  }[c.statut] || "";
  return {
    a: c.client.email,
    sujet: `Commande ${c.numero} — ${label}`,
    texte: `Bonjour ${c.client.prenom},

${details}

Suivre ma commande : ${lien}

L'équipe Charabilla`,
  };
}
