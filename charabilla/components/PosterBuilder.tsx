"use client";

import { useMemo, useState } from "react";
import { LISTE_UNIVERS, UniversKey, UNIVERS } from "@/lib/univers";
import { ChoixTitre, PaireMot, Palier, PALIERS, libelleTitre } from "@/lib/types";
import { suggererIllustration } from "@/lib/illustrations";
import PosterPreview from "./PosterPreview";

let compteurId = 0;
function nouvelId() {
  compteurId += 1;
  return `paire-${compteurId}`;
}

function paireVide(): PaireMot {
  return { id: nouvelId(), motReel: "", motEnfant: "", illustration: "❔" };
}

type Etape = 1 | 2 | 3;

export default function PosterBuilder() {
  const [etape, setEtape] = useState<Etape>(1);
  const [prenom, setPrenom] = useState("");
  const [choixTitre, setChoixTitre] = useState<ChoixTitre>("dico");
  const [universKey, setUniversKey] = useState<UniversKey>("terre-de-sienne");
  const [palier, setPalier] = useState<Palier>(4);
  const [paires, setPaires] = useState<PaireMot[]>(() =>
    Array.from({ length: 4 }, () => paireVide())
  );

  const univers = UNIVERS[universKey];

  function changerPalier(nouveauPalier: Palier) {
    setPalier(nouveauPalier);
    setPaires((actuelles) => {
      if (nouveauPalier > actuelles.length) {
        const ajout = Array.from(
          { length: nouveauPalier - actuelles.length },
          () => paireVide()
        );
        return [...actuelles, ...ajout];
      }
      return actuelles.slice(0, nouveauPalier);
    });
  }

  function majPaire(id: string, champs: Partial<PaireMot>) {
    setPaires((actuelles) =>
      actuelles.map((p) => (p.id === id ? { ...p, ...champs } : p))
    );
  }

  function surChangementMotReel(id: string, motReel: string) {
    majPaire(id, { motReel, illustration: suggererIllustration(motReel) });
  }

  const nombreMotsRemplis = useMemo(
    () => paires.filter((p) => p.motEnfant.trim()).length,
    [paires]
  );

  const peutContinuerEtape1 = prenom.trim().length > 0;
  const peutContinuerEtape2 = nombreMotsRemplis > 0;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <div className="order-2 lg:order-1">
        <ol className="mb-8 flex gap-4 text-sm">
          {(["1. Infos", "2. Mots", "3. Aperçu"] as const).map((libelle, i) => {
            const n = (i + 1) as Etape;
            return (
              <li
                key={libelle}
                className={`font-medium ${
                  etape === n ? "text-stone-900" : "text-stone-400"
                }`}
              >
                {libelle}
              </li>
            );
          })}
        </ol>

        {etape === 1 && (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Prénom de l&apos;enfant
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex. Anaka"
                className="w-full rounded-md border border-stone-300 px-3 py-2"
              />
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">
                Titre de l&apos;affiche
              </span>
              <div className="flex gap-3">
                {(["dico", "imagier"] as ChoixTitre[]).map((choix) => (
                  <button
                    key={choix}
                    type="button"
                    onClick={() => setChoixTitre(choix)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      choixTitre === choix
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 text-stone-700"
                    }`}
                  >
                    {libelleTitre(choix, prenom || "…")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">
                Univers graphique
              </span>
              <div className="flex gap-3">
                {LISTE_UNIVERS.map((u) => (
                  <button
                    key={u.key}
                    type="button"
                    onClick={() => setUniversKey(u.key)}
                    className={`flex flex-col items-center gap-2 rounded-md border p-2 text-xs ${
                      universKey === u.key
                        ? "border-stone-900"
                        : "border-stone-200"
                    }`}
                  >
                    <span
                      className="block h-10 w-10 rounded-full border"
                      style={{ background: u.background, borderColor: u.accent }}
                    />
                    {u.nom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-sm font-medium text-stone-700">
                Nombre de mots
              </span>
              <div className="flex gap-2">
                {PALIERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => changerPalier(p)}
                    className={`h-10 w-10 rounded-md border text-sm ${
                      palier === p
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 text-stone-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!peutContinuerEtape1}
              onClick={() => setEtape(2)}
              className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        )}

        {etape === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              Pour chaque mot, indiquez le mot réel et la façon dont{" "}
              {prenom || "l'enfant"} le prononce. Le mot réel ne sera jamais
              affiché sur l&apos;affiche : il sert seulement à choisir
              l&apos;illustration.
            </p>

            <div className="space-y-3">
              {paires.map((paire, i) => (
                <div key={paire.id} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-stone-400">{i + 1}</span>
                  <input
                    type="text"
                    value={paire.motReel}
                    onChange={(e) => surChangementMotReel(paire.id, e.target.value)}
                    placeholder="Mot réel (ex. compote)"
                    className="w-1/2 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={paire.motEnfant}
                    onChange={(e) => majPaire(paire.id, { motEnfant: e.target.value })}
                    placeholder="Mot de l'enfant (ex. amaka)"
                    className="w-1/2 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={paire.illustration}
                    onChange={(e) => majPaire(paire.id, { illustration: e.target.value })}
                    title="Illustration suggérée — modifiable"
                    className="w-14 rounded-md border border-stone-300 px-2 py-1.5 text-center text-lg"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEtape(1)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
              >
                Retour
              </button>
              <button
                type="button"
                disabled={!peutContinuerEtape2}
                onClick={() => setEtape(3)}
                className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-40"
              >
                Voir l&apos;aperçu
              </button>
            </div>
          </div>
        )}

        {etape === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              {nombreMotsRemplis} mot{nombreMotsRemplis > 1 ? "s" : ""} sur{" "}
              {palier} rempli{nombreMotsRemplis > 1 ? "s" : ""}. Les cases
              vides s&apos;affichent en pointillés dans l&apos;aperçu — elles
              n&apos;apparaîtront pas à l&apos;impression.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEtape(2)}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
              >
                Imprimer (aperçu navigateur)
              </button>
              <button
                type="button"
                disabled
                title="Paiement et impression professionnelle arrivent en phase 4 (Stripe + Gelato)"
                className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white opacity-40"
              >
                Commander
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="order-1 lg:order-2 lg:sticky lg:top-8">
        <PosterPreview
          prenom={prenom}
          choixTitre={choixTitre}
          univers={univers}
          palier={palier}
          paires={paires}
        />
      </div>
    </div>
  );
}
