"use client";

import { ART, SVG_MAP } from "@/lib/art";
import { THEMES } from "@/lib/themes";

// Affiche l'illustration d'un mot, posée directement sur le fond de l'affiche.
//  - art.type === "lib" : image de la bibliothèque (clé = mot normalisé). Si l'image n'existe
//    pas encore dans cet univers, on montre le croquis provisoire, estompé.
//  - art.type === "svg" : croquis intégré, recoloré par l'univers.
export default function Illustration({ art, univers, items, size }) {
  const theme = THEMES[univers];
  if (art?.type === "lib") {
    const item = (items || []).find((it) => it.key === art.word);
    if (item) {
      return <img src={item.url} alt="" draggable={false} style={{ width: size, height: size, objectFit: "contain", display: "block" }} />;
    }
    const id = SVG_MAP[art.word] || "etoile";
    return <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: "block", opacity: 0.35 }}>{ART[id](theme.pal)}</svg>;
  }
  const id = art?.type === "svg" && ART[art.id] ? art.id : "etoile";
  return <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: "block" }}>{ART[id](theme.pal)}</svg>;
}

// L'illustration est-elle « en préparation » (mot connu, image pas encore dans la bibliothèque) ?
export function enPreparation(art, items) {
  return art?.type === "lib" && !(items || []).some((it) => it.key === art.word);
}
