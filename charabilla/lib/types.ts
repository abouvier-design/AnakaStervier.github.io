export type Palier = 1 | 4 | 8 | 12 | 16;

export const PALIERS: Palier[] = [1, 4, 8, 12, 16];

export interface PaireMot {
  id: string;
  motReel: string;
  motEnfant: string;
  illustration: string;
}

export type ChoixTitre = "dico" | "imagier";

export function libelleTitre(choix: ChoixTitre, prenom: string): string {
  const nom = prenom.trim() || "…";
  return choix === "dico" ? `Le dico de ${nom}` : `L'imagier de ${nom}`;
}

// "4 = 2×2" se lit colonnes × lignes (voir PROJET.md, grille de l'affiche).
export function colonnesPourPalier(palier: Palier): number {
  switch (palier) {
    case 1:
      return 1;
    case 4:
      return 2;
    case 8:
      return 2;
    case 12:
      return 3;
    case 16:
      return 4;
  }
}
