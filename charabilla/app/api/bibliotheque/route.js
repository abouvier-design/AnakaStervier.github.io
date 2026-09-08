import { NextResponse } from "next/server";
import { lister, enregistrer, supprimer, changerStatut, mettreAJourNoms } from "@/lib/library-store";
import { estAdmin } from "@/lib/admin-auth";

const erreur = (message, status = 400) => NextResponse.json({ erreur: message }, { status });

export async function GET(req) {
  try {
    const univers = new URL(req.url).searchParams.get("univers");
    return NextResponse.json({ items: await lister(univers) });
  } catch (e) { return erreur(e.message); }
}

// Ajout d'une illustration. L'administrateur enregistre en « valide » ;
// un utilisateur ne peut qu'ajouter une illustration générée, « à valider ».
export async function POST(req) {
  try {
    const corps = await req.json();
    const admin = await estAdmin();
    if (!admin && corps.source !== "utilisateur") return erreur("Réservé à l'administrateur", 403);
    const item = await enregistrer({
      ...corps,
      source: admin ? corps.source || "admin" : "utilisateur",
      statut: admin ? corps.statut || "valide" : "a_valider",
    });
    return NextResponse.json({ item });
  } catch (e) { return erreur(e.message.includes("EROFS") ? "Stockage en lecture seule sur cet hébergement (Phase 2 : Supabase)" : e.message); }
}

export async function PATCH(req) {
  try {
    if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
    const { univers, key, statut, noms } = await req.json();
    if (noms) return NextResponse.json({ item: await mettreAJourNoms(univers, key, noms) });
    return NextResponse.json({ item: await changerStatut(univers, key, statut) });
  } catch (e) { return erreur(e.message); }
}

export async function DELETE(req) {
  try {
    if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
    const p = new URL(req.url).searchParams;
    return NextResponse.json(await supprimer(p.get("univers"), p.get("key")));
  } catch (e) { return erreur(e.message); }
}
