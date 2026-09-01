import { NextResponse } from "next/server";
import { genererIllustration, modeGeneration } from "@/lib/generation";
import { estAdmin } from "@/lib/admin-auth";

// Garde-fou de coût : un visiteur ne peut lancer qu'un nombre limité de générations par heure.
const LIMITE_PAR_HEURE = Number(process.env.GENERATION_LIMITE_HEURE || 12);
const compteurs = new Map();

function depasseLaLimite(ip) {
  const maintenant = Date.now();
  const liste = (compteurs.get(ip) || []).filter((t) => maintenant - t < 3600_000);
  if (liste.length >= LIMITE_PAR_HEURE) { compteurs.set(ip, liste); return true; }
  liste.push(maintenant); compteurs.set(ip, liste);
  return false;
}

export async function POST(req) {
  try {
    const { mot, univers, en } = await req.json();
    if (!(await estAdmin())) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "inconnue";
      if (depasseLaLimite(ip)) {
        return NextResponse.json({ erreur: "Trop de générations pour l'instant — réessaie dans une heure." }, { status: 429 });
      }
    }
    const resultat = await genererIllustration({ mot, univers, en });
    return NextResponse.json(resultat);
  } catch (e) {
    return NextResponse.json({ erreur: e.message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ mode: modeGeneration() });
}
