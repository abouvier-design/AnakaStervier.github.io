# JOURNAL.md — Charabilla

Journal de bord des sessions de travail. La session la plus récente est en haut.

## Session du 1er septembre 2026

### Ce qui a été fait

**Mise en place du dépôt.** Les fichiers de référence du projet sont
maintenant versionnés : `PROJET.md`, `DEMARRAGE.md`, `prototype/charabilla.jsx`
(la spécification vivante), `data/charabilla-100-mots-prompts.csv` et
`data/lexique-300-premiers-mots.csv`.

**Phase 1 démarrée — portage du prototype en Next.js** dans le dossier
`charabilla/`. Le design, les textes et la logique du prototype sont repris à
l'identique. Les 6 adaptations obligatoires de `DEMARRAGE.md` ont été
appliquées (voir le tableau dans `charabilla/README.md`) :

- `window.storage` remplacé par `lib/storage.js` sur `localStorage`, même
  interface — les dicos sauvegardés survivent maintenant à un rechargement.
- Polices via `next/font` (Fredoka, Nunito, Baloo 2, Cormorant Garamond,
  Comfortaa).
- Styles d'impression déplacés dans `app/globals.css`, `window.print`
  conservé.
- `containerType` + unités `cqw`, flux de génération manuel, croquis SVG :
  inchangés.

**Vérifié dans le navigateur** : les 3 univers (fonds, palettes, polices de
titre, décor, étoiles de Nuit céleste), les paliers de grille avec cases en
pointillés, l'ajout et l'édition de mots, le sélecteur d'illustration avec les
35 croquis, le flux de génération IA, la modale de commande, et la sauvegarde
d'un dico qui revient bien après rechargement de la page.

### Point d'attention

Une première tentative de Phase 1 avait été faite d'après la seule description
écrite de `PROJET.md`, sans le prototype : l'interface obtenue ne correspondait
pas. Elle a été entièrement remplacée par le portage fidèle décrit ci-dessus.
**Toujours partir de `prototype/charabilla.jsx`.**

### Prochaine étape

Brancher les vraies illustrations « Terre de sienne » : les déposer via le
bouton « Ajouter des illustrations » de l'interface (nom du fichier = le mot),
ou les placer dans `charabilla/public/images/terracotta/` pour qu'elles soient
livrées avec le site. Une fois la bibliothèque en place, Phase 1 est terminée
et on passe aux comptes utilisateurs (Phase 2, Supabase).
