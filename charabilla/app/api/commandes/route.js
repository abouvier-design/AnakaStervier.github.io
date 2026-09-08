import { NextResponse } from "next/server";
import { creerCommande, listerCommandes, lireCommande, mettreAJourCommande, vueClient, calculerChiffres, STATUTS } from "@/lib/commandes-store";
import { envoyerEmail, emailConfirmation, emailStatut, modeEmail } from "@/lib/emails";
import { creerSessionPaiement, modePaiement } from "@/lib/stripe";
import { estAdmin } from "@/lib/admin-auth";

const erreur = (message, status = 400) => NextResponse.json({ erreur: message }, { status });

async function envoyerEtConsigner(commande, email) {
  try {
    const trace = await envoyerEmail(email);
    await mettreAJourCommande(commande.id, { email: trace });
  } catch (e) {
    await mettreAJourCommande(commande.id, { email: { mode: "echec", date: Date.now(), a: email.a, sujet: email.sujet, erreur: e.message } });
  }
}

// Le client passe commande.
export async function POST(req) {
  try {
    const { affiche, formatId, cadreId, client } = await req.json();
    const mode = modePaiement();
    const commande = await creerCommande({ affiche, formatId, cadreId, client, paiement: { mode } });
    if (mode === "stripe") {
      const { url, sessionId } = await creerSessionPaiement(commande);
      await mettreAJourCommande(commande.id, { paiement: { sessionId } });
      return NextResponse.json({ id: commande.id, numero: commande.numero, url });
    }
    await envoyerEtConsigner(commande, emailConfirmation(commande));
    return NextResponse.json({ id: commande.id, numero: commande.numero });
  } catch (e) {
    return erreur(e.message.includes("EROFS") ? "Stockage en lecture seule sur cet hébergement (Phase 2 : Supabase)" : e.message);
  }
}

// Suivi d'une commande (client, par identifiant) ou liste complète (admin).
export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const id = p.get("id");
  if (id) {
    const c = await lireCommande(id);
    if (!c) return erreur("Commande introuvable", 404);
    return NextResponse.json({ commande: (await estAdmin()) ? c : vueClient(c) });
  }
  if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
  const commandes = await listerCommandes();
  return NextResponse.json({
    commandes, chiffres: calculerChiffres(commandes), statuts: STATUTS,
    modes: { paiement: modePaiement(), email: modeEmail() },
  });
}

// L'administrateur change le statut, le suivi ou les notes.
export async function PATCH(req) {
  try {
    if (!(await estAdmin())) return erreur("Réservé à l'administrateur", 403);
    const { id, statut, suivi, notes } = await req.json();
    const { commande, statutChange } = await mettreAJourCommande(id, { statut, suivi, notes });
    if (statutChange) await envoyerEtConsigner(commande, emailStatut(commande));
    return NextResponse.json({ commande: await lireCommande(id) });
  } catch (e) { return erreur(e.message); }
}
