// Génération d'une illustration côté serveur.
//
// Avec OPENAI_API_KEY : appel à l'API Images d'OpenAI (gpt-image-1) avec le prompt
// verrouillé de l'univers. Sans clé : mode démonstration, on renvoie le croquis
// provisoire du mot sur le fond de l'univers, pour pouvoir tester tout le parcours.
import { THEMES, toEnglish, keyify } from "./themes";
import { FR2EN as LEXIQUE_FR2EN } from "./lexique.generated";
import { croquisEnDataUrl, idCroquisPour } from "./croquis-svg";

const CLE = () => process.env.OPENAI_API_KEY || "";
const MODELE_IMAGE = process.env.GENERATION_MODELE || "gpt-image-1";
const QUALITE = process.env.GENERATION_QUALITE || "medium";
const MODELE_TEXTE = process.env.TRADUCTION_MODELE || "gpt-4o-mini";

export function modeGeneration() {
  return CLE() ? "ia" : "demo";
}

// Traduit un mot français en groupe nominal anglais pour le prompt.
async function traduire(mot) {
  const key = keyify(mot);
  if (LEXIQUE_FR2EN[key]) return LEXIQUE_FR2EN[key];
  const secours = toEnglish(mot);
  if (!CLE()) return secours;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${CLE()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODELE_TEXTE, temperature: 0, max_tokens: 20,
        messages: [
          { role: "system", content: "Translate the French word (a toddler's vocabulary word: an object, animal, food, person or place) into a short English noun phrase with an article, suitable for an illustration prompt. Answer with the phrase only." },
          { role: "user", content: mot },
        ],
      }),
    });
    if (!r.ok) return secours;
    const corps = await r.json();
    const texte = corps.choices?.[0]?.message?.content?.trim().replace(/^["']|["'.]$/g, "");
    return texte && texte.length < 80 ? texte : secours;
  } catch {
    return secours;
  }
}

export async function genererIllustration({ mot, univers, en }) {
  const theme = THEMES[univers];
  if (!theme) throw new Error("Univers inconnu");
  const motPropre = (mot || "").trim().slice(0, 60);
  if (!motPropre) throw new Error("Mot manquant");
  const enFinal = (en || "").trim().slice(0, 200) || (await traduire(motPropre));
  const prompt = theme.prompt(enFinal);

  if (!CLE()) {
    return { image: croquisEnDataUrl(idCroquisPour(keyify(motPropre)), univers), en: enFinal, prompt, mode: "demo" };
  }

  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${CLE()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODELE_IMAGE, prompt, n: 1, size: "1024x1024", quality: QUALITE }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Le service d'images a répondu ${r.status}${detail ? ` : ${detail.slice(0, 200)}` : ""}`);
  }
  const corps = await r.json();
  const b64 = corps.data?.[0]?.b64_json;
  if (!b64) throw new Error("Le service d'images n'a pas renvoyé d'image");
  return { image: `data:image/png;base64,${b64}`, en: enFinal, prompt, mode: "ia" };
}
