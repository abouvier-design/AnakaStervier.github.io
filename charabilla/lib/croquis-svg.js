// Transforme un croquis SVG (élément React de lib/art.jsx) en image autonome (data URL).
// Sert au mode démonstration de la génération : sans clé d'API, « générer » produit le
// croquis provisoire du mot, posé sur le fond exact de l'univers.
import { ART, SVG_MAP } from "./art";
import { THEMES } from "./themes";

const echapper = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// Sérialise un arbre d'éléments React (type chaîne + props) en balisage SVG.
function serialiser(noeud) {
  if (noeud == null || noeud === false) return "";
  if (Array.isArray(noeud)) return noeud.map(serialiser).join("");
  if (typeof noeud === "string" || typeof noeud === "number") return echapper(noeud);
  const { type, props } = noeud;
  if (typeof type !== "string") return serialiser(props?.children);
  const attributs = Object.entries(props || {})
    .filter(([k, v]) => k !== "children" && k !== "key" && v != null && v !== false)
    .map(([k, v]) => {
      const nom = k === "className" ? "class" : k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      return ` ${nom}="${echapper(v)}"`;
    })
    .join("");
  const enfants = serialiser(props?.children);
  return enfants ? `<${type}${attributs}>${enfants}</${type}>` : `<${type}${attributs}/>`;
}

export function idCroquisPour(key) {
  return SVG_MAP[key] || "etoile";
}

export function croquisSvg(id, universKey) {
  const theme = THEMES[universKey];
  const dessin = ART[id] || ART.etoile;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">` +
    `<rect width="100" height="100" fill="${theme.bg}"/>` +
    serialiser(dessin(theme.pal)) +
    `</svg>`
  );
}

export function croquisEnDataUrl(id, universKey) {
  return "data:image/svg+xml;utf8," + encodeURIComponent(croquisSvg(id, universKey));
}
