// Stockage serveur de la bibliothèque d'illustrations et des demandes — Phase 1 : fichiers.
//
// Arborescence : bibliotheque/{univers}/manifest.json + bibliotheque/{univers}/{key}.{ext}
//                bibliotheque/demandes.json
// Phase 2 : remplacer ce module par Supabase Storage en gardant les mêmes fonctions.
import { promises as fs } from "node:fs";
import path from "node:path";
import { THEMES } from "./themes";

export const UNIVERS_VALIDES = Object.keys(THEMES);
const RACINE = process.env.BIBLIOTHEQUE_DIR || path.join(process.cwd(), "bibliotheque");
// Chemin dans la bibliothèque (le commentaire évite que Next embarque tout le projet dans le déploiement).
const chemin = (...p) => path.join(/*turbopackIgnore: true*/ RACINE, ...p);
const EXTENSIONS = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" };
export const TYPES_MIME = Object.fromEntries(Object.entries(EXTENSIONS).map(([m, e]) => [e, m]));

const cleValide = (key) => /^[a-z0-9-]{1,60}$/.test(key);

function verifierUnivers(univers) {
  if (!UNIVERS_VALIDES.includes(univers)) throw new Error("Univers inconnu");
}
function verifierKey(key) {
  if (!cleValide(key)) throw new Error("Identifiant de mot invalide");
}

async function lireJson(chemin, defaut) {
  try { return JSON.parse(await fs.readFile(chemin, "utf8")); } catch { return defaut; }
}
async function ecrireJson(chemin, valeur) {
  await fs.mkdir(path.dirname(chemin), { recursive: true });
  await fs.writeFile(chemin, JSON.stringify(valeur, null, 2));
}

const cheminManifest = (univers) => chemin( univers, "manifest.json");
const urlImage = (univers, it) => `/api/images/${univers}/${it.key}.${it.ext}?v=${it.date}`;

// Dossier des illustrations livrées avec le site : public/images/{univers}/{mot}.png
// (adaptation n°2 de DEMARRAGE.md). Le nom du fichier = le mot.
const DOSSIER_PUBLIC = path.join(process.cwd(), "public", "images");
const cheminPublic = (...p) => path.join(/*turbopackIgnore: true*/ DOSSIER_PUBLIC, ...p);
const keyifyFichier = (nom) => nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function listerFichiersPublics(univers) {
  let noms = [];
  try { noms = await fs.readdir(cheminPublic(univers)); } catch { return []; }
  const items = [];
  for (const nom of noms) {
    const m = /^(.+)\.(png|jpe?g|webp|svg)$/i.exec(nom);
    if (!m) continue;
    const key = keyifyFichier(m[1]);
    if (!cleValide(key)) continue;
    const stat = await fs.stat(cheminPublic(univers, nom)).catch(() => null);
    items.push({
      key, mot: m[1], en: "", ext: m[2].toLowerCase(), fichier: nom, source: "fichier", statut: "valide",
      date: stat ? Math.floor(stat.mtimeMs) : 0, url: `/images/${univers}/${encodeURIComponent(nom)}`,
    });
  }
  return items;
}

export async function lister(univers) {
  verifierUnivers(univers);
  const manifest = await lireJson(cheminManifest(univers), {});
  const parKey = {};
  for (const it of await listerFichiersPublics(univers)) parKey[it.key] = it;
  // Ce qui a été ajouté depuis le back-office a priorité sur le fichier livré.
  for (const it of Object.values(manifest)) parKey[it.key] = { ...it, url: urlImage(univers, it) };
  return Object.values(parKey).sort((a, b) => a.key.localeCompare(b.key));
}

// Décode une data URL en { buffer, ext }.
export function decoderDataUrl(dataUrl) {
  const m = /^data:([a-z+/.-]+);base64,(.+)$/is.exec(dataUrl || "");
  if (m) {
    const ext = EXTENSIONS[m[1].toLowerCase()];
    if (!ext) throw new Error("Format d'image non pris en charge");
    return { buffer: Buffer.from(m[2], "base64"), ext };
  }
  const s = /^data:image\/svg\+xml;utf8,(.+)$/is.exec(dataUrl || "");
  if (s) return { buffer: Buffer.from(decodeURIComponent(s[1]), "utf8"), ext: "svg" };
  throw new Error("Image illisible");
}

export async function enregistrer({ univers, key, mot, en, image, source, statut }) {
  verifierUnivers(univers); verifierKey(key);
  const { buffer, ext } = decoderDataUrl(image);
  if (buffer.length > 12 * 1024 * 1024) throw new Error("Image trop lourde (12 Mo maximum)");
  const dossier = chemin( univers);
  await fs.mkdir(dossier, { recursive: true });
  const manifest = await lireJson(cheminManifest(univers), {});
  const ancien = manifest[key];
  if (ancien && ancien.ext !== ext) await fs.rm(path.join(dossier, `${ancien.key}.${ancien.ext}`), { force: true });
  await fs.writeFile(path.join(dossier, `${key}.${ext}`), buffer);
  const item = {
    key, mot: mot || key, en: en || "", ext,
    source: source === "utilisateur" ? "utilisateur" : "admin",
    statut: statut === "valide" ? "valide" : "a_valider",
    date: Date.now(),
  };
  manifest[key] = item;
  await ecrireJson(cheminManifest(univers), manifest);
  return { ...item, url: urlImage(univers, item) };
}

export async function supprimer(univers, key) {
  verifierUnivers(univers); verifierKey(key);
  const manifest = await lireJson(cheminManifest(univers), {});
  const it = manifest[key];
  if (it) {
    await fs.rm(chemin( univers, `${it.key}.${it.ext}`), { force: true });
    delete manifest[key];
    await ecrireJson(cheminManifest(univers), manifest);
  }
  const livre = (await listerFichiersPublics(univers)).find((f) => f.key === key);
  if (livre) await fs.rm(cheminPublic(univers, livre.fichier), { force: true });
  return { ok: true };
}

export async function changerStatut(univers, key, statut) {
  verifierUnivers(univers); verifierKey(key);
  const manifest = await lireJson(cheminManifest(univers), {});
  const it = manifest[key];
  if (!it) throw new Error("Illustration introuvable");
  it.statut = statut === "valide" ? "valide" : "a_valider";
  await ecrireJson(cheminManifest(univers), manifest);
  return { ...it, url: urlImage(univers, it) };
}

export async function lireFichier(univers, nomFichier) {
  verifierUnivers(univers);
  const m = /^([a-z0-9-]{1,60})\.(png|jpg|webp|svg)$/.exec(nomFichier || "");
  if (!m) throw new Error("Fichier invalide");
  const buffer = await fs.readFile(chemin( univers, nomFichier));
  return { buffer, type: TYPES_MIME[m[2]] };
}

// ---------- Signalements (utilisateur -> back-office) ----------
// « Le mot X n'a pas d'illustration qui convient » : l'administrateur ajoute l'image
// dans la bibliothèque puis raye le signalement.
const cheminSignalements = () => chemin( "signalements.json");

export async function listerSignalements() {
  const s = await lireJson(cheminSignalements(), []);
  return s.sort((a, b) => b.date - a.date);
}

export async function creerSignalement({ univers, key, mot, en }) {
  verifierUnivers(univers); verifierKey(key);
  const signalements = await lireJson(cheminSignalements(), []);
  const existant = signalements.find((x) => x.univers === univers && x.key === key);
  if (existant) { existant.nombre = (existant.nombre || 1) + 1; existant.date = Date.now(); }
  else signalements.push({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    univers, key, mot: (mot || key).slice(0, 60), en: (en || "").slice(0, 200), nombre: 1, date: Date.now(),
  });
  await ecrireJson(cheminSignalements(), signalements);
  return { ok: true };
}

export async function supprimerSignalement(id) {
  const signalements = await lireJson(cheminSignalements(), []);
  await ecrireJson(cheminSignalements(), signalements.filter((x) => x.id !== id));
  return { ok: true };
}
