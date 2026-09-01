"use client";

import { Univers } from "@/lib/univers";
import { ChoixTitre, PaireMot, Palier, colonnesPourPalier, libelleTitre } from "@/lib/types";

interface PosterPreviewProps {
  prenom: string;
  choixTitre: ChoixTitre;
  univers: Univers;
  palier: Palier;
  paires: PaireMot[];
}

export default function PosterPreview({
  prenom,
  choixTitre,
  univers,
  palier,
  paires,
}: PosterPreviewProps) {
  const colonnes = colonnesPourPalier(palier);
  const cases = Array.from({ length: palier }, (_, i) => paires[i]);

  return (
    <div
      className="poster-container mx-auto w-full max-w-[420px]"
      style={{ containerType: "inline-size" }}
    >
      {/* Format A4 : ratio largeur/hauteur = 1/1.414 */}
      <div
        className="flex flex-col shadow-lg"
        style={{
          aspectRatio: "1 / 1.414",
          background: univers.background,
          padding: "6cqw",
        }}
      >
        <h2
          className="text-center font-semibold"
          style={{
            color: univers.texteTitre,
            fontSize: "5.5cqw",
            marginBottom: "5cqw",
          }}
        >
          {libelleTitre(choixTitre, prenom)}
        </h2>

        <div
          className="flex-1 grid"
          style={{
            gridTemplateColumns: `repeat(${colonnes}, 1fr)`,
            gap: "3cqw",
          }}
        >
          {cases.map((paire, i) =>
            paire && paire.motEnfant.trim() ? (
              <div
                key={paire.id}
                className="flex flex-col items-center justify-center rounded-lg"
              >
                <span style={{ fontSize: palier === 1 ? "28cqw" : "13cqw", lineHeight: 1 }}>
                  {paire.illustration}
                </span>
                <span
                  className="text-center font-medium"
                  style={{
                    color: univers.texteMot,
                    fontSize: palier === 1 ? "6cqw" : "4cqw",
                    marginTop: "2cqw",
                  }}
                >
                  {paire.motEnfant}
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="flex items-center justify-center rounded-lg border-2 border-dashed print:hidden"
                style={{ borderColor: univers.pointilles, minHeight: "10cqw" }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
