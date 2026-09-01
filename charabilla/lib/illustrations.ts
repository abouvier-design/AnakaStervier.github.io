// Bibliothèque d'illustrations — PLACEHOLDER Phase 1.
//
// En attendant l'import du fichier `charabilla-100-mots-prompts.csv` et des
// vraies images générées par univers (voir PROJET.md, "Bibliothèque
// d'illustrations"), chaque mot est associé à un simple pictogramme.
// Le mot réel ne sert QUE à choisir l'illustration : il n'apparaît jamais
// sur l'affiche (décision produit ferme).
const BIBLIOTHEQUE_PLACEHOLDER: Record<string, string> = {
  chat: "🐱",
  chien: "🐶",
  lapin: "🐰",
  banane: "🍌",
  "ours en peluche": "🧸",
  doudou: "🧸",
  voiture: "🚗",
  biberon: "🍼",
  fleur: "🌸",
  ballon: "🎈",
  soleil: "☀️",
  chaussure: "👟",
  compote: "🍎",
  eau: "💧",
  lait: "🥛",
  pain: "🍞",
  gateau: "🎂",
  gâteau: "🎂",
  livre: "📖",
  oiseau: "🐦",
  poisson: "🐟",
  lune: "🌙",
  etoile: "⭐",
  étoile: "⭐",
  arbre: "🌳",
  maison: "🏠",
  canard: "🦆",
  mouton: "🐑",
  vache: "🐮",
};

function normaliser(mot: string): string {
  return mot
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Suggère une illustration pour un mot réel donné : correspondance exacte,
 * puis par préfixe (≥ 3 lettres), sinon pictogramme générique.
 */
export function suggererIllustration(motReel: string): string {
  const cible = normaliser(motReel);
  if (!cible) return "❔";

  const entrees = Object.entries(BIBLIOTHEQUE_PLACEHOLDER);

  for (const [mot, pictogramme] of entrees) {
    if (normaliser(mot) === cible) return pictogramme;
  }

  if (cible.length >= 3) {
    for (const [mot, pictogramme] of entrees) {
      const motNormalise = normaliser(mot);
      if (motNormalise.startsWith(cible) || cible.startsWith(motNormalise)) {
        return pictogramme;
      }
    }
  }

  return "❔";
}
