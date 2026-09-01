import { NextResponse } from "next/server";
import { listerSignalements, creerSignalement, supprimerSignalement } from "@/lib/library-store";
import { estAdmin } from "@/lib/admin-auth";

const erreur = (message, status = 400) => NextResponse.json({ erreur: message }, { status });

// Liste des mots signalés sans illustration convenable — réservé au back-office.
export async function GET() {
  if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
  return NextResponse.json({ items: await listerSignalements() });
}

// Un utilisateur signale qu'aucune illustration générée ne convient pour un mot.
export async function POST(req) {
  try {
    const { univers, key, mot, en } = await req.json();
    return NextResponse.json(await creerSignalement({ univers, key, mot, en }));
  } catch (e) { return erreur(e.message); }
}

export async function DELETE(req) {
  if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
  const id = new URL(req.url).searchParams.get("id");
  return NextResponse.json(await supprimerSignalement(id));
}
