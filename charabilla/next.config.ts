import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // La bibliothèque d'illustrations (Phase 1 : fichiers) doit accompagner les routes d'API.
  outputFileTracingIncludes: {
    "/api/**": ["./bibliotheque/**"],
  },
};

export default nextConfig;
