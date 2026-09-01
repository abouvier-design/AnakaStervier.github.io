import { NextResponse } from "next/server";
import { adminConfigure, estAdmin, motDePasseValide, ouvrirSession, fermerSession } from "@/lib/admin-auth";
import { modeGeneration } from "@/lib/generation";

export async function GET() {
  return NextResponse.json({ connecte: await estAdmin(), configure: adminConfigure(), generation: modeGeneration() });
}

export async function POST(req) {
  if (!adminConfigure()) {
    return NextResponse.json({ erreur: "Le back-office n'est pas configuré : définir ADMIN_PASSWORD (8 caractères minimum)." }, { status: 503 });
  }
  const { motDePasse } = await req.json().catch(() => ({}));
  if (!motDePasseValide(motDePasse)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ erreur: "Mot de passe incorrect" }, { status: 401 });
  }
  await ouvrirSession();
  return NextResponse.json({ connecte: true, generation: modeGeneration() });
}

export async function DELETE() {
  await fermerSession();
  return NextResponse.json({ connecte: false });
}
