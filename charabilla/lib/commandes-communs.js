// Règles de gestion des commandes utilisables partout (serveur, navigateur, page de recette).
import { FORMATS, FRAMES, THEMES } from "./themes";

export const STATUTS = {
  en_attente_paiement: { label: "En attente de paiement", ordre: 0 },
  payee: { label: "Payée", ordre: 1 },
  en_production: { label: "En production", ordre: 2 },
  expediee: { label: "Expédiée", ordre: 3 },
  livree: { label: "Livrée", ordre: 4 },
  annulee: { label: "Annulée", ordre: 9 },
};
// Statuts qui comptent dans le chiffre d'affaires : argent encaissé, commande non annulée.
export const STATUTS_ENCAISSES = ["payee", "en_production", "expediee", "livree"];
// Étapes affichées au client, dans l'ordre.
export const ETAPES_SUIVI = ["payee", "en_production", "expediee", "livree"];

export const LANGUES = [
  ["fr", "Français"], ["en", "Anglais"], ["es", "Espagnol"], ["de", "Allemand"], ["it", "Italien"],
  ["pt", "Portugais"], ["nl", "Néerlandais"], ["ar", "Arabe"], ["tr", "Turc"], ["pl", "Polonais"],
];

export function calculerTotal(formatId, cadreId) {
  const format = FORMATS.find((f) => f.id === formatId);
  if (!format) throw new Error("Format inconnu");
  const cadre = (format.frame && FRAMES.find((f) => f.id === cadreId)) || FRAMES[0];
  return { format, cadre, total: format.price + (format.frame ? cadre.price : 0) };
}

export function titreAffiche(affiche) {
  const n = (affiche.childName || "").trim() || "…";
  return affiche.titleStyle === "dico" ? `Le dico de ${n}` : `L'imagier de ${n}`;
}

export function calculerChiffres(commandes) {
  const encaissees = commandes.filter((c) => STATUTS_ENCAISSES.includes(c.statut));
  const maintenant = new Date();
  const moisCourant = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, "0")}`;
  const cumul = (dico, cle, total) => { dico[cle] = dico[cle] || { nombre: 0, total: 0 }; dico[cle].nombre++; dico[cle].total += total; };
  const parMois = {}, parFormat = {}, parUnivers = {};
  for (const c of encaissees) {
    const d = new Date(c.paiement?.payeLe || c.date);
    cumul(parMois, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, c.total);
    cumul(parFormat, c.format.label, c.total);
    cumul(parUnivers, THEMES[c.affiche.themeKey]?.label || c.affiche.themeKey, c.total);
  }
  const total = encaissees.reduce((s, c) => s + c.total, 0);
  return {
    total, nombre: encaissees.length, panierMoyen: encaissees.length ? total / encaissees.length : 0,
    moisCourant: parMois[moisCourant] || { nombre: 0, total: 0 },
    parMois: Object.entries(parMois).sort(([a], [b]) => b.localeCompare(a)).map(([mois, v]) => ({ mois, ...v })),
    parFormat: Object.entries(parFormat).sort((a, b) => b[1].total - a[1].total).map(([label, v]) => ({ label, ...v })),
    parUnivers: Object.entries(parUnivers).sort((a, b) => b[1].total - a[1].total).map(([label, v]) => ({ label, ...v })),
    parStatut: Object.fromEntries(Object.keys(STATUTS).map((s) => [s, commandes.filter((c) => c.statut === s).length])),
  };
}
