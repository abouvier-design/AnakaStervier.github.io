// Paiement par Stripe Checkout, sans SDK (appels HTTP directs).
// Sans STRIPE_SECRET_KEY : mode démonstration, la commande est marquée payée directement.
import { createHmac, timingSafeEqual } from "node:crypto";

const CLE = () => process.env.STRIPE_SECRET_KEY || "";
const SECRET_WEBHOOK = () => process.env.STRIPE_WEBHOOK_SECRET || "";
const SITE = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function modePaiement() {
  return CLE() ? "stripe" : "demo";
}

// Crée une session de paiement et renvoie l'adresse où envoyer le client.
export async function creerSessionPaiement(commande) {
  const nomProduit = `Affiche Charabilla — ${commande.format.label}${commande.cadre && commande.cadre.id !== "none" ? ` · ${commande.cadre.label}` : ""}`;
  const corps = new URLSearchParams({
    mode: "payment",
    success_url: `${SITE()}/commande/${commande.id}?paiement=ok`,
    cancel_url: `${SITE()}/?commande=annulee`,
    customer_email: commande.client.email,
    "metadata[commandeId]": commande.id,
    "metadata[numero]": commande.numero,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(Math.round(commande.total * 100)),
    "line_items[0][price_data][product_data][name]": nomProduit,
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${CLE()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: corps,
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw new Error(`Stripe a répondu ${r.status}${detail ? ` : ${detail.slice(0, 200)}` : ""}`);
  }
  const session = await r.json();
  return { url: session.url, sessionId: session.id };
}

// Vérifie la signature d'un webhook Stripe et renvoie l'événement.
export function lireEvenementWebhook(corpsBrut, enTeteSignature) {
  if (!SECRET_WEBHOOK()) throw new Error("STRIPE_WEBHOOK_SECRET manquant");
  const parties = Object.fromEntries((enTeteSignature || "").split(",").map((p) => p.split("=")));
  const t = parties.t, v1 = parties.v1;
  if (!t || !v1) throw new Error("Signature absente");
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) throw new Error("Signature expirée");
  const attendu = createHmac("sha256", SECRET_WEBHOOK()).update(`${t}.${corpsBrut}`).digest("hex");
  const a = Buffer.from(attendu), b = Buffer.from(v1);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Signature invalide");
  return JSON.parse(corpsBrut);
}
