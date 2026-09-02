// Client d'accès à la bibliothèque et à la génération, côté navigateur.
//
// Deux modes, même interface :
//  - "serveur" : appelle les routes /api du site (bibliothèque partagée, IA réelle).
//  - "local"   : tout reste dans le navigateur (localStorage) et « générer » produit le
//                croquis provisoire du mot. C'est le mode de la page de recette statique.
import { keyify, THEMES, toEnglish } from "./themes";
import { croquisEnDataUrl, idCroquisPour } from "./croquis-svg";

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
    return Object.values(parKey).sort((a, b) => a.key.localeCompare(b.key));
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
    const item = { key, mot, en, image, source, statut, date: Date.now(), ext: "svg" };
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
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
