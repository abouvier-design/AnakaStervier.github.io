import { NextResponse } from "next/server";
import { lireEvenementWebhook } from "@/lib/stripe";
import { lireCommande, mettreAJourCommande } from "@/lib/commandes-store";
import { envoyerEmail, emailConfirmation } from "@/lib/emails";

// Stripe prévient ici quand un paiement est terminé : la commande passe « payée ».
export async function POST(req) {
  try {
    const corps = await req.text();
    const evenement = lireEvenementWebhook(corps, req.headers.get("stripe-signature"));
    if (evenement.type === "checkout.session.completed") {
      const id = evenement.data?.object?.metadata?.commandeId;
      const c = id && (await lireCommande(id));
      if (c && c.statut === "en_attente_paiement") {
        const { commande } = await mettreAJourCommande(id, { statut: "payee", message: "Paiement confirmé par Stripe" });
        try { await mettreAJourCommande(id, { email: await envoyerEmail(emailConfirmation(commande)) }); } catch { /* consigné côté serveur */ }
      }
    }
    return NextResponse.json({ recu: true });
  } catch (e) {
    return NextResponse.json({ erreur: e.message }, { status: 400 });
  }
}
