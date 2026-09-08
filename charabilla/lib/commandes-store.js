// Stockage serveur des commandes — Phase 1 : fichier bibliotheque/commandes.json.
// Phase 2 : remplacer par Supabase en gardant les mêmes fonctions.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { THEMES } from "./themes";
import { STATUTS, STATUTS_ENCAISSES, calculerTotal, calculerChiffres } from "./commandes-communs";

const RACINE = process.env.BIBLIOTHEQUE_DIR || path.join(process.cwd(), "bibliotheque");
const chemin = () => path.join(/*turbopackIgnore: true*/ RACINE, "commandes.json");

export { STATUTS, STATUTS_ENCAISSES, calculerTotal, calculerChiffres };

async function lire() {
  try { return JSON.parse(await fs.readFile(chemin(), "utf8")); } catch { return []; }
}
async function ecrire(liste) {
  await fs.mkdir(path.dirname(chemin()), { recursive: true });
  await fs.writeFile(chemin(), JSON.stringify(liste, null, 2));
}

const propre = (v, max) => String(v ?? "").trim().slice(0, max);

export function validerClient(c = {}) {
  const client = {
    prenom: propre(c.prenom, 60), nom: propre(c.nom, 60), email: propre(c.email, 120).toLowerCase(),
    adresse1: propre(c.adresse1, 120), adresse2: propre(c.adresse2, 120),
    codePostal: propre(c.codePostal, 12), ville: propre(c.ville, 80), pays: propre(c.pays, 60) || "France",
  };
  if (!client.prenom || !client.nom) throw new Error("Prénom et nom sont obligatoires");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) throw new Error("Adresse e-mail invalide");
  if (!client.adresse1 || !client.codePostal || !client.ville) throw new Error("Adresse de livraison incomplète");
  return client;
}

export function validerAffiche(a = {}) {
  if (!THEMES[a.themeKey]) throw new Error("Univers inconnu");
  const words = Array.isArray(a.words) ? a.words.slice(0, 16) : [];
  if (words.length === 0) throw new Error("L'affiche ne contient aucun mot");
  return {
    childName: propre(a.childName, 40), ageLine: propre(a.ageLine, 60),
    titleStyle: a.titleStyle === "imagier" ? "imagier" : "dico", themeKey: a.themeKey,
    words: words.map((w) => ({ real: propre(w.real, 40), child: propre(w.child, 40), art: w.art })),
  };
}

export async function creerCommande({ affiche, formatId, cadreId, client, paiement }) {
  const liste = await lire();
  const { format, cadre, total } = calculerTotal(formatId, cadreId);
  const annee = new Date().getFullYear();
  const numero = `CH-${annee}-${String(liste.filter((c) => c.numero.startsWith(`CH-${annee}-`)).length + 1).padStart(4, "0")}`;
  const statut = paiement?.mode === "stripe" ? "en_attente_paiement" : "payee";
  const commande = {
    id: randomBytes(12).toString("hex"), numero, date: Date.now(), statut,
    affiche: validerAffiche(affiche),
    format: { id: format.id, label: format.label, price: format.price },
    cadre: format.frame ? { id: cadre.id, label: cadre.label, price: cadre.price } : null,
    total, client: validerClient(client),
    paiement: { mode: paiement?.mode || "demo", payeLe: statut === "payee" ? Date.now() : null },
    suivi: { transporteur: "", numero: "" }, notes: "",
    historique: [{ date: Date.now(), statut, message: statut === "payee" ? "Commande enregistrée (paiement de démonstration)" : "Commande créée, en attente du paiement" }],
    emails: [],
  };
  liste.push(commande);
  await ecrire(liste);
  return commande;
}

export async function listerCommandes() {
  return (await lire()).sort((a, b) => b.date - a.date);
}

export async function lireCommande(id) {
  return (await lire()).find((c) => c.id === id) || null;
}

export async function mettreAJourCommande(id, champs) {
  const liste = await lire();
  const c = liste.find((x) => x.id === id);
  if (!c) throw new Error("Commande introuvable");
  let statutChange = false;
  if (champs.statut && STATUTS[champs.statut] && champs.statut !== c.statut) {
    c.statut = champs.statut; statutChange = true;
    if (champs.statut === "payee" && !c.paiement.payeLe) c.paiement.payeLe = Date.now();
    c.historique.push({ date: Date.now(), statut: champs.statut, message: champs.message || STATUTS[champs.statut].label });
  }
  if (champs.suivi) c.suivi = { transporteur: propre(champs.suivi.transporteur, 60), numero: propre(champs.suivi.numero, 60) };
  if (typeof champs.notes === "string") c.notes = propre(champs.notes, 2000);
  if (champs.paiement) c.paiement = { ...c.paiement, ...champs.paiement };
  if (champs.email) c.emails.push(champs.email);
  await ecrire(liste);
  return { commande: c, statutChange };
}

// Vue client : on ne renvoie pas les notes internes.
export function vueClient(c) {
  if (!c) return null;
  const { notes, emails, ...reste } = c; // eslint-disable-line no-unused-vars
  return reste;
}

