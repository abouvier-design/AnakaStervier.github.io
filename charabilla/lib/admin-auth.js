// Protection du back-office — Phase 1 : un mot de passe unique (variable ADMIN_PASSWORD).
// Phase 2 : remplacer par les comptes Supabase avec un rôle administrateur.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const NOM_COOKIE = "charabilla_admin";
const DUREE_SECONDES = 7 * 24 * 3600;

const motDePasse = () => process.env.ADMIN_PASSWORD || "";
export const adminConfigure = () => motDePasse().length >= 8;

function jeton() {
  return createHmac("sha256", motDePasse()).update("charabilla-admin-v1").digest("hex");
}

export function motDePasseValide(candidat) {
  if (!adminConfigure() || typeof candidat !== "string") return false;
  const a = Buffer.from(candidat), b = Buffer.from(motDePasse());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function estAdmin() {
  if (!adminConfigure()) return false;
  const c = (await cookies()).get(NOM_COOKIE)?.value || "";
  const attendu = jeton();
  return c.length === attendu.length && timingSafeEqual(Buffer.from(c), Buffer.from(attendu));
}

export async function ouvrirSession() {
  (await cookies()).set(NOM_COOKIE, jeton(), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: DUREE_SECONDES,
  });
}

export async function fermerSession() {
  (await cookies()).delete(NOM_COOKIE);
}
