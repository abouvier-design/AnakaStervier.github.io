export type UniversKey = "terre-de-sienne" | "jardin-botanique" | "nuit-celeste";

export interface Univers {
  key: UniversKey;
  nom: string;
  background: string;
  accent: string;
  accentClair: string;
  texteMot: string;
  texteTitre: string;
  pointilles: string;
}

// Palettes verrouillées dans les bibles de style (voir PROJET.md).
export const UNIVERS: Record<UniversKey, Univers> = {
  "terre-de-sienne": {
    key: "terre-de-sienne",
    nom: "Terre de sienne",
    background: "#F7EDE2",
    accent: "#B96A45",
    accentClair: "#D89B78",
    texteMot: "#5A3524",
    texteTitre: "#B96A45",
    pointilles: "#D89B78",
  },
  "jardin-botanique": {
    key: "jardin-botanique",
    nom: "Jardin botanique",
    background: "#F5F2E9",
    accent: "#57704F",
    accentClair: "#8FA982",
    texteMot: "#3C4F37",
    texteTitre: "#57704F",
    pointilles: "#8FA982",
  },
  "nuit-celeste": {
    key: "nuit-celeste",
    nom: "Nuit céleste",
    background: "#1F2A4D",
    accent: "#E8C87A",
    accentClair: "#F4EFE2",
    // Décision produit : sur fond sombre, le mot de l'enfant s'affiche en
    // crème pour rester lisible (contrairement aux deux autres univers).
    texteMot: "#F4EFE2",
    texteTitre: "#E8C87A",
    pointilles: "#3D4A73",
  },
};

export const LISTE_UNIVERS: Univers[] = [
  UNIVERS["terre-de-sienne"],
  UNIVERS["jardin-botanique"],
  UNIVERS["nuit-celeste"],
];
