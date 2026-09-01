# DEMARRAGE.md — Lancer Charabilla dans Claude Code

## Ce que contient ce dossier

`PROJET.md` est le cerveau du projet : tout le contexte, les décisions fermes, les bibles de style des 3 univers, la feuille de route. À lire en début de chaque session. `prototype/charabilla.jsx` est la spécification vivante : la v4 du prototype, fonctionnelle, dont le comportement doit être reproduit exactement avant toute évolution. `data/` contient les deux lexiques (100 mots avec prompts, 286 mots étendus). `docs/` contient le détail du pipeline illustrations + impression. Ajouter à côté un dossier `images/terracotta/` avec les PNG générés (nommés `chat.png`, `compote.png`, etc.).

## Première session — le prompt à coller dans Claude Code

> Lis PROJET.md puis prototype/charabilla.jsx. Reformule-moi ce que tu as compris du projet et du prototype. Ensuite, démarre la Phase 1 : crée une application Next.js (App Router) qui reproduit EXACTEMENT le comportement du prototype, avec les adaptations listées dans DEMARRAGE.md section « Adaptations obligatoires ». Ne change ni le design, ni les textes, ni la logique. Avance par petites étapes et montre-moi le résultat dans le navigateur à chaque étape. Je ne suis pas développeuse : explique-moi tout simplement et guide-moi pas à pas pour chaque action à faire de mon côté.

## Adaptations obligatoires lors du portage (le prototype tourne dans un environnement spécial)

1. **`window.storage` n'existe pas en dehors des artifacts Claude.** C'est une API de stockage clé-valeur propre au prototype. La remplacer par un petit module `lib/storage.js` avec la même interface (`get(key)` → `{value}`, `set(key, value)`, `delete(key)`) branché sur `localStorage` en Phase 1, puis sur Supabase en Phase 2 — comme ça le reste du code ne change pas.
2. **Les images de la bibliothèque** sont stockées en base64 compressé 512px dans le prototype (contrainte de l'environnement). En vrai : stocker les fichiers **originaux haute définition** dans Supabase Storage (ou `/public/images/{univers}/` en Phase 1), organisés par univers, avec le nom de fichier = mot normalisé (minuscules, sans accents, tirets). La résolution d'un mot vers son image (exact puis préfixe ≥ 3 lettres) est dans la fonction `suggestArt` du prototype : la conserver.
3. **La grille de l'affiche** utilise `containerType: "inline-size"` et des unités `cqw` : à conserver tel quel, c'est ce qui garantit que les paliers 1/4/8/12/16 ne débordent jamais du ratio A4.
4. **Les polices** sont chargées par injection d'une balise link Google Fonts dans un useEffect : remplacer par `next/font/google` (Fredoka, Nunito, Baloo 2, Cormorant Garamond, Comfortaa).
5. **Le flux « Générer avec l'IA »** reste en mode manuel (copier le prompt / déposer l'image / valider ou régénérer) en Phase 1 — il fonctionne déjà. En Phase 5 seulement, remplacer l'étape manuelle par l'appel API gpt-image, en gardant identiques : l'assemblage du prompt verrouillé, l'écran de validation « convient / régénérer », et l'ajout automatique à la bibliothèque après validation.
6. **L'impression** reste `window.print` en Phase 1 ; le rendu PDF 300 dpi serveur arrive en Phase 3 (voir docs/charabilla-pipeline-technique.md).

## Rappels de méthode (pour Claude Code)

Une phase à la fois, dans l'ordre de PROJET.md ; commits fréquents avec messages en français simple ; jamais de refonte du design sans demande explicite ; toute décision listée dans « Décisions en attente » de PROJET.md se discute avec la fondatrice avant d'agir ; à la fin de chaque session, mettre à jour un fichier `JOURNAL.md` avec ce qui a été fait et la prochaine étape.
