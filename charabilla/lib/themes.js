// Univers graphiques + constantes — repris tels quels du prototype charabilla.jsx.
// Seule différence : les polices passent par les variables CSS de next/font (adaptation n°4).
import { LEXIQUE_100, FR2EN as LEXIQUE_FR2EN } from "./lexique.generated";

export const THEMES = {
  terracotta: {
    label: "Terre de sienne", desc: "Bohème argile & sable",
    bg: "#F7EDE2", wash: "#F0DCC9", washEdge: "#E4C3A6",
    title: "#B96A45", word: "#6E4632", accent: "#D89B78",
    titleFont: "var(--font-baloo2), sans-serif", titleItalic: false,
    pal: { d: "#C67B52", m: "#DFA57F", l: "#F3DFC9", ink: "#6E4632", nat: "#E8B04B" },
    deco: "arches",
    prompt: (obj) => `Flat boho illustration of ${obj}, warm terracotta and sand palette (#B96A45, #D89B78, #F7EDE2), matte grainy texture, soft rounded organic shapes, thick simple forms, no outline, single centered subject, plain warm beige background (#F7EDE2), no text, no border, no white outline, no sticker effect. Natural object colors softened to harmonize with the palette. Animals and characters have closed happy eyes; objects have no face. Style: modern bohemian nursery art, warm and cozy. Square format.`,
  },
  botanique: {
    label: "Jardin botanique", desc: "Aquarelle sauge & crème",
    bg: "#F5F2E9", wash: "#E2EAD8", washEdge: "#C6D5B9",
    title: "#57704F", word: "#41503C", accent: "#8FA982",
    titleFont: "var(--font-cormorant), serif", titleItalic: true,
    pal: { d: "#7C976F", m: "#A8BF97", l: "#EAEFDD", ink: "#41503C", nat: "#D3B36A" },
    deco: "leaves",
    prompt: (obj) => `Soft watercolor children's book illustration of ${obj}, sage green and cream palette (#57704F, #8FA982, #F5F2E9), delicate hand-painted texture with subtle watercolor edges, gentle rounded shapes, minimal details, no outline, single centered subject, plain cream background (#F5F2E9) identical on every image, no text, no border, no white outline, no sticker effect. Natural object colors softened into muted earthy watercolor tones that harmonize with the palette. Animals and characters have closed happy eyes; objects have no face. Style: vintage French imagier, tender and calm. Square format.`,
  },
  celeste: {
    label: "Nuit céleste", desc: "Bleu profond & or",
    bg: "#1F2A4D", wash: "#2C3A66", washEdge: "#44548F",
    title: "#E8C87A", word: "#F4EFE2", accent: "#E8C87A",
    titleFont: "var(--font-comfortaa), sans-serif", titleItalic: false,
    pal: { d: "#E8C87A", m: "#C9A75E", l: "#F4EFE2", ink: "#1F2A4D", nat: "#E8C87A" },
    deco: "stars",
    prompt: (obj) => `Dreamy night-sky illustration of ${obj}, deep navy blue background (#1F2A4D) identical on every image, gold and cream palette (#E8C87A, #F4EFE2), soft glowing highlights as if lit by moonlight, matte grainy texture, rounded gentle shapes, no outline, single centered subject, exactly three tiny gold stars scattered around the subject (always three, same size), no text, no border, no white outline, no sticker effect. Natural object colors softened into muted moonlit tones that harmonize with the navy and gold palette. Animals and characters have closed sleepy happy eyes; objects have no face. Style: celestial nursery art, magical and soothing. Square format.`,
  },
};

export const MAX_WORDS = 16;
export const INK = "#33324E";
export const CTA = "#E4589B";

export const normalize = (s) => s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export const keyify = (s) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ============ FR -> EN pour les prompts ============
export const FR2EN = {
  chat: "a cat", chien: "a dog", lapin: "a rabbit", oiseau: "a little bird", poisson: "a fish",
  canard: "a duck", vache: "a cow", cheval: "a horse", cochon: "a pig", mouton: "a sheep",
  poule: "a hen", poussin: "a chick", ours: "a bear", souris: "a mouse", elephant: "an elephant",
  lion: "a lion", singe: "a monkey", grenouille: "a frog", tortue: "a turtle", papillon: "a butterfly",
  escargot: "a snail", abeille: "a bee", crocodile: "a crocodile", girafe: "a giraffe", loup: "a wolf",
  eau: "a glass of water", lait: "a glass of milk", biberon: "a baby bottle", pain: "a bread loaf",
  pomme: "an apple", banane: "a banana", fraise: "a strawberry", orange: "an orange fruit",
  compote: "an apple sauce pot", yaourt: "a yogurt pot with a spoon", fromage: "a cheese wedge",
  gateau: "a small birthday cake", biscuit: "a round cookie", chocolat: "a chocolate bar",
  bonbon: "a wrapped candy", glace: "an ice cream cone", pates: "a bowl of pasta", oeuf: "an egg",
  carotte: "a carrot", tomate: "a tomato", tetine: "a baby pacifier", cuillere: "a spoon",
  assiette: "a plate", verre: "a small cup", bol: "a bowl", couche: "a baby diaper",
  chaussure: "a small child shoe", chaussette: "a sock", manteau: "a child coat",
  bonnet: "a beanie hat with a pompom", pyjama: "child pajamas", doudou: "a soft baby comforter toy",
  nounours: "a teddy bear", ballon: "a balloon on a string", balle: "a ball", poupee: "a rag doll",
  livre: "an open picture book", cube: "three stacked building blocks", velo: "a child tricycle",
  bulles: "soap bubbles with a bubble wand", voiture: "a car", camion: "a truck", bus: "a bus",
  train: "a small train with one wagon", avion: "an airplane", bateau: "a sailboat",
  tracteur: "a tractor", lit: "a child bed", chaise: "a chair", table: "a table", porte: "a door",
  bain: "a bathtub with bubbles", pot: "a baby potty", cle: "a key", telephone: "a phone",
  television: "a television", lampe: "a bedside lamp", soleil: "the sun", lune: "a crescent moon",
  etoile: "a star", nuage: "a cloud", pluie: "a cloud with rain drops", fleur: "a flower",
  arbre: "a tree", feuille: "a leaf", neige: "a snowman", mer: "sea waves", maison: "a house",
  parc: "a playground slide", ecole: "a small school building", papa: "a dad character",
  maman: "a mom character", bebe: "a baby", papi: "a grandpa character", mamie: "a grandma character",
  musique: "a music note", "pate a modeler": "a playdough pot",
};
// Le lexique généré (data/*.csv) a priorité ; la table du prototype sert de secours.
export const toEnglish = (fr) =>
  LEXIQUE_FR2EN[keyify(fr)] || FR2EN[normalize(fr)] || `a ${normalize(fr)}`;

export const LEXIQUE = LEXIQUE_100;

// ============ Grille ============
export function gridFor(n) {
  if (n <= 1) return { tier: 1, cols: 1 };
  if (n <= 4) return { tier: 4, cols: 2 };
  if (n <= 8) return { tier: 8, cols: 2 };
  if (n <= 12) return { tier: 12, cols: 3 };
  return { tier: 16, cols: 4 };
}

export const FORMATS = [
  { id: "carte", label: "Carte postale · 10 × 15 cm", price: 5, frame: false },
  { id: "a4", label: "A4 · 21 × 29,7 cm", price: 14, frame: true },
  { id: "a3", label: "A3 · 29,7 × 42 cm", price: 19, frame: true },
  { id: "3040", label: "30 × 40 cm", price: 24, frame: true },
  { id: "5070", label: "50 × 70 cm", price: 29, frame: true },
];

export const FRAMES = [
  { id: "none", label: "Sans cadre", price: 0 },
  { id: "oak", label: "Cadre bois chêne", price: 25 },
  { id: "black", label: "Cadre bois noir", price: 25 },
];
