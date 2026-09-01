// Remplace window.storage (API propre aux artifacts Claude) — adaptation n°1 de DEMARRAGE.md.
// Même interface exactement : get(key) -> { value }, set(key, value), delete(key).
// Phase 1 : localStorage. Phase 2 : à rebrancher sur Supabase sans toucher au reste du code.

const disponible = () => typeof window !== "undefined" && !!window.localStorage;

export const storage = {
  async get(key) {
    if (!disponible()) return { value: null };
    return { value: window.localStorage.getItem(key) };
  },

  async set(key, value) {
    if (!disponible()) throw new Error("Stockage indisponible");
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota dépassé : le navigateur limite localStorage à ~5 Mo.
      throw new Error("Espace de stockage plein");
    }
    return { ok: true };
  },

  async delete(key) {
    if (!disponible()) return { ok: true };
    window.localStorage.removeItem(key);
    return { ok: true };
  },
};

export default storage;
