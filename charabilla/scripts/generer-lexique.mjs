// Génère lib/lexique.generated.js à partir des deux CSV de data/.
// Lancer : node scripts/generer-lexique.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ici = dirname(fileURLToPath(import.meta.url));
const racine = join(ici, "..", "..");

const normalize = (s) => s.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
const keyify = (s) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function lireCsv(chemin) {
  const texte = readFileSync(chemin, "utf8").replace(/^﻿/, "");
  const lignes = [];
  let ligne = [], champ = "", entreGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entreGuillemets) {
      if (c === '"' && texte[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') entreGuillemets = false;
      else champ += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === ",") { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ); lignes.push(ligne); ligne = []; champ = "";
    } else champ += c;
  }
  if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  const [entete, ...corps] = lignes.filter((l) => l.some((v) => v.trim()));
  return corps.map((l) => Object.fromEntries(entete.map((h, i) => [h.trim(), (l[i] || "").trim()])));
}

const cent = lireCsv(join(racine, "data", "charabilla-100-mots-prompts.csv"));
const large = lireCsv(join(racine, "data", "lexique-300-premiers-mots.csv"));

const article = (en) => (/^(a|an|the|three|child|soap|sea|sugar|french|petits)\b/i.test(en) ? en : (/^[aeiou]/i.test(en) ? `an ${en}` : `a ${en}`));

// Les 100 mots prioritaires : mot, catégorie, terme anglais complet.
const LEXIQUE_100 = cent.map((r) => ({
  key: keyify(r.mot), mot: r.mot, categorie: r.categorie, en: r.objet_anglais,
}));

// Traductions : les 100 mots ont priorité, puis le lexique étendu (mots illustrables).
const FR2EN = {};
for (const r of large) if (r.terme_anglais_prompt && r.illustrable !== "non") FR2EN[keyify(r.mot)] = article(r.terme_anglais_prompt);
for (const r of cent) FR2EN[keyify(r.mot)] = r.objet_anglais;

const sortie = `// Fichier généré par scripts/generer-lexique.mjs — ne pas modifier à la main.
// Sources : data/charabilla-100-mots-prompts.csv et data/lexique-300-premiers-mots.csv

export const LEXIQUE_100 = ${JSON.stringify(LEXIQUE_100, null, 2)};

export const FR2EN = ${JSON.stringify(FR2EN, null, 2)};
`;
writeFileSync(join(ici, "..", "lib", "lexique.generated.js"), sortie);
console.log(`lexique : ${LEXIQUE_100.length} mots prioritaires, ${Object.keys(FR2EN).length} traductions`);
