import { NextResponse } from "next/server";
import { lireFichier } from "@/lib/library-store";

export async function GET(_req, { params }) {
  try {
    const { univers, fichier } = await params;
    const { buffer, type } = await lireFichier(univers, fichier);
    return new NextResponse(buffer, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return NextResponse.json({ erreur: "Image introuvable" }, { status: 404 });
  }
}
