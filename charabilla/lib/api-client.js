// Client d'accès à la bibliothèque et à la génération, côté navigateur.
//
// Deux modes, même interface :
//  - "serveur" : appelle les routes /api du site (bibliothèque partagée, IA réelle).
//  - "local"   : tout reste dans le navigateur (localStorage) et « générer » produit le
//                croquis provisoire du mot. C'est le mode de la page de recette statique.
import { keyify, THEMES, toEnglish } from "./themes";
import { croquisEnDataUrl, idCroquisPour } from "./croquis-svg";
import { STATUTS, calculerTotal, calculerChiffres } from "./commandes-communs";

export function detecterMode() {
  if (typeof window !== "undefined" && window.CHARABILLA_MODE === "local") return "local";
  if (process.env.NEXT_PUBLIC_MODE_LOCAL === "1") return "local";
  return "serveur";
}

async function lireJson(reponse) {
  const texte = await reponse.text();
  let corps = {};
  try { corps = texte ? JSON.parse(texte) : {}; } catch { corps = { erreur: texte }; }
  if (!reponse.ok) throw new Error(corps.erreur || `Erreur ${reponse.status}`);
  return corps;
}

// ---------- Mode serveur ----------
const clientServeur = {
  mode: "serveur",
  async listerBibliotheque(univers) {
    const r = await fetch(`/api/bibliotheque?univers=${encodeURIComponent(univers)}`, { cache: "no-store" });
    return (await lireJson(r)).items;
  },
  async generer({ mot, univers, en }) {
    const r = await fetch("/api/generer", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mot, univers, en }),
    });
    return lireJson(r);
  },
  async enregistrer(entree) {
    const r = await fetch("/api/bibliotheque", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entree),
    });
    return (await lireJson(r)).item;
  },
  async supprimer(univers, key) {
    const r = await fetch(`/api/bibliotheque?univers=${encodeURIComponent(univers)}&key=${encodeURIComponent(key)}`, { method: "DELETE" });
    return lireJson(r);
  },
  async valider(univers, key) {
    const r = await fetch("/api/bibliotheque", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ univers, key, statut: "valide" }),
    });
    return (await lireJson(r)).item;
  },
  async mettreAJourNoms(univers, key, noms) {
    const r = await fetch("/api/bibliotheque", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ univers, key, noms }),
    });
    return (await lireJson(r)).item;
  },
  lienSuivi(id) { return `/commande/${id}`; },
  async creerCommande(donnees) {
    const r = await fetch("/api/commandes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donnees),
    });
    return lireJson(r);
  },
  async lireCommande(id) {
    return (await lireJson(await fetch(`/api/commandes?id=${encodeURIComponent(id)}`, { cache: "no-store" }))).commande;
  },
  async listerCommandes() {
    return lireJson(await fetch("/api/commandes", { cache: "no-store" }));
  },
  async mettreAJourCommande(id, champs) {
    const r = await fetch("/api/commandes", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...champs }),
    });
    return (await lireJson(r)).commande;
  },
  async signaler({ univers, key, mot, en }) {
    const r = await fetch("/api/signalements", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ univers, key, mot, en }),
    });
    return lireJson(r);
  },
  async listerSignalements() {
    return (await lireJson(await fetch("/api/signalements", { cache: "no-store" }))).items;
  },
  async supprimerSignalement(id) {
    return lireJson(await fetch(`/api/signalements?id=${encodeURIComponent(id)}`, { method: "DELETE" }));
  },
  admin: {
    async session() { return lireJson(await fetch("/api/admin/connexion", { cache: "no-store" })); },
    async connexion(motDePasse) {
      const r = await fetch("/api/admin/connexion", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ motDePasse }),
      });
      return lireJson(r);
    },
    async deconnexion() { return lireJson(await fetch("/api/admin/connexion", { method: "DELETE" })); },
  },
};

// ---------- Mode local (démonstration, tout dans le navigateur) ----------
const CLE_BIBLIO = (u) => `charabilla-biblio-${u}`;
const CLE_ADMIN = "charabilla-admin-demo";
const CLE_SIGNALEMENTS = "charabilla-signalements";
const CLE_META = (u) => `charabilla-meta-${u}`;
const CLE_COMMANDES = "charabilla-commandes";

function lireMetaLocales(univers) {
  try { return JSON.parse(window.localStorage.getItem(CLE_META(univers)) || "{}"); } catch { return {}; }
}
function lireCommandesLocales() {
  try { return JSON.parse(window.localStorage.getItem(CLE_COMMANDES) || "[]"); } catch { return []; }
}
export const MOT_DE_PASSE_DEMO = "charabilla";

function lireSignalementsLocaux() {
  try { return JSON.parse(window.localStorage.getItem(CLE_SIGNALEMENTS) || "[]"); } catch { return []; }
}

function lireLocal(univers) {
  try { return JSON.parse(window.localStorage.getItem(CLE_BIBLIO(univers)) || "[]"); } catch { return []; }
}
function ecrireLocal(univers, items) {
  window.localStorage.setItem(CLE_BIBLIO(univers), JSON.stringify(items));
}

const clientLocal = {
  mode: "local",
  async listerBibliotheque(univers) {
    // Images livrées avec la page (public/images/{univers}/), puis ce qui a été ajouté ici.
    const parKey = {};
    for (const it of (window.CHARABILLA_IMAGES && window.CHARABILLA_IMAGES[univers]) || []) {
      parKey[it.key] = { ...it, source: "fichier", statut: "valide", ext: "png", date: 0 };
    }
    for (const it of lireLocal(univers)) parKey[it.key] = { ...it, url: it.image };
    const meta = lireMetaLocales(univers);
    return Object.values(parKey).map((it) => {
      const noms = { ...(it.noms || {}), ...((meta[it.key] || {}).noms || {}) };
      if (!noms.fr) noms.fr = it.mot || it.key;
      return { ...it, noms, mot: noms.fr };
    }).sort((a, b) => a.key.localeCompare(b.key));
  },
  async mettreAJourNoms(univers, key, noms) {
    const meta = lireMetaLocales(univers);
    meta[key] = { noms };
    window.localStorage.setItem(CLE_META(univers), JSON.stringify(meta));
    return (await this.listerBibliotheque(univers)).find((it) => it.key === key);
  },
  lienSuivi(id) { return `#commande=${id}`; },
  async creerCommande({ affiche, formatId, cadreId, client }) {
    const { format, cadre, total } = calculerTotal(formatId, cadreId);
    const liste = lireCommandesLocales();
    const annee = new Date().getFullYear();
    const numero = `CH-${annee}-${String(liste.length + 1).padStart(4, "0")}`;
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const commande = {
      id, numero, date: Date.now(), statut: "payee", affiche, total,
      format: { id: format.id, label: format.label, price: format.price },
      cadre: format.frame ? { id: cadre.id, label: cadre.label, price: cadre.price } : null,
      client, paiement: { mode: "demo", payeLe: Date.now() }, suivi: { transporteur: "", numero: "" }, notes: "",
      historique: [{ date: Date.now(), statut: "payee", message: "Commande enregistrée (démonstration)" }],
      emails: [{ mode: "simulation", date: Date.now(), a: client.email, sujet: `Commande ${numero}` }],
    };
    liste.push(commande);
    window.localStorage.setItem(CLE_COMMANDES, JSON.stringify(liste));
    return { id, numero };
  },
  async lireCommande(id) {
    const c = lireCommandesLocales().find((x) => x.id === id);
    if (!c) throw new Error("Commande introuvable");
    return c;
  },
  async listerCommandes() {
    const commandes = lireCommandesLocales().sort((a, b) => b.date - a.date);
    return { commandes, chiffres: calculerChiffres(commandes), statuts: STATUTS, modes: { paiement: "demo", email: "simulation" } };
  },
  async mettreAJourCommande(id, champs) {
    const liste = lireCommandesLocales();
    const c = liste.find((x) => x.id === id);
    if (!c) throw new Error("Commande introuvable");
    if (champs.statut && champs.statut !== c.statut) {
      c.statut = champs.statut;
      c.historique.push({ date: Date.now(), statut: champs.statut, message: STATUTS[champs.statut]?.label || champs.statut });
      c.emails.push({ mode: "simulation", date: Date.now(), a: c.client.email, sujet: `Commande ${c.numero} — ${champs.statut}` });
    }
    if (champs.suivi) c.suivi = champs.suivi;
    if (typeof champs.notes === "string") c.notes = champs.notes;
    window.localStorage.setItem(CLE_COMMANDES, JSON.stringify(liste));
    return c;
  },
  async generer({ mot, univers, en }) {
    await new Promise((r) => setTimeout(r, 900));
    const enFinal = en || toEnglish(mot);
    return {
      image: croquisEnDataUrl(idCroquisPour(keyify(mot)), univers),
      en: enFinal, prompt: THEMES[univers].prompt(enFinal), mode: "demo",
    };
  },
  async enregistrer({ univers, key, mot, en, image, source, statut }) {
    const items = lireLocal(univers).filter((it) => it.key !== key);
    const item = { key, mot, en, image, source, statut, date: Date.now(), ext: image.startsWith("data:image/png") ? "png" : "svg" };
    items.push(item);
    items.sort((a, b) => a.key.localeCompare(b.key));
    try { ecrireLocal(univers, items); } catch { throw new Error("Espace de stockage du navigateur plein"); }
    return { ...item, url: image };
  },
  async supprimer(univers, key) {
    ecrireLocal(univers, lireLocal(univers).filter((it) => it.key !== key));
    return { ok: true };
  },
  async valider(univers, key) {
    const items = lireLocal(univers).map((it) => (it.key === key ? { ...it, statut: "valide" } : it));
    ecrireLocal(univers, items);
    return items.find((it) => it.key === key);
  },
  async signaler({ univers, key, mot, en }) {
    const liste = lireSignalementsLocaux();
    const existant = liste.find((x) => x.univers === univers && x.key === key);
    if (existant) { existant.nombre += 1; existant.date = Date.now(); }
    else liste.push({ id: String(Date.now()), univers, key, mot, en, nombre: 1, date: Date.now() });
    window.localStorage.setItem(CLE_SIGNALEMENTS, JSON.stringify(liste));
    return { ok: true };
  },
  async listerSignalements() { return lireSignalementsLocaux().sort((a, b) => b.date - a.date); },
  async supprimerSignalement(id) {
    window.localStorage.setItem(CLE_SIGNALEMENTS, JSON.stringify(lireSignalementsLocaux().filter((x) => x.id !== id)));
    return { ok: true };
  },
  admin: {
    async session() { return { connecte: window.localStorage.getItem(CLE_ADMIN) === "1", demo: true, generation: "demo" }; },
    async connexion(motDePasse) {
      if (motDePasse !== MOT_DE_PASSE_DEMO) throw new Error("Mot de passe incorrect");
      window.localStorage.setItem(CLE_ADMIN, "1");
      return { connecte: true, demo: true };
    },
    async deconnexion() { window.localStorage.removeItem(CLE_ADMIN); return { connecte: false }; },
  },
};

export function creerClient(mode = detecterMode()) {
  return mode === "local" ? clientLocal : clientServeur;
}

// Lit un fichier image du navigateur et le renvoie en data URL, éventuellement réduit.
export function lireFichierImage(file, tailleMax = 0) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!tailleMax) return resolve(reader.result);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tailleMax; canvas.height = tailleMax;
        const ctx = canvas.getContext("2d");
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, tailleMax, tailleMax);
        // PNG : la transparence des images détourées est conservée (le JPEG la rendrait noire).
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
