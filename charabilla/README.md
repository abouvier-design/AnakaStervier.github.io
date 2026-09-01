# Charabilla — Phase 1

Portage en Next.js du prototype `prototype/charabilla.jsx` (la spécification
vivante). Le design, les textes et la logique sont repris **à l'identique** :
seules les 6 adaptations listées dans `DEMARRAGE.md` ont été appliquées.

## Comment le lancer pour tester

Dans un terminal, depuis ce dossier `charabilla/` :

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Les adaptations appliquées

| # | Point de DEMARRAGE.md | Ce qui a été fait |
|---|---|---|
| 1 | `window.storage` n'existe pas hors des artifacts | `lib/storage.js`, même interface (`get`/`set`/`delete`), branché sur `localStorage`. À rebrancher sur Supabase en Phase 2 sans toucher au reste. |
| 2 | Images de la bibliothèque | Dossiers `public/images/{univers}/` créés pour les fichiers haute définition. Le dépôt d'images depuis l'interface (« Ma bibliothèque ») fonctionne déjà et garde les images d'une visite à l'autre. |
| 3 | `containerType` + unités `cqw` | Conservés tels quels — c'est ce qui garantit qu'aucun palier ne déborde du A4. |
| 4 | Polices | `next/font/google` : Fredoka, Nunito, Baloo 2, Cormorant Garamond, Comfortaa. |
| 5 | Flux « Générer avec l'IA » | Reste manuel (copier le prompt → déposer l'image → valider ou régénérer), inchangé. |
| 6 | Impression | Reste `window.print`. Le PDF 300 dpi serveur arrive en Phase 3. |

## Organisation des fichiers

- `components/Charabilla.jsx` — l'application (formulaire, affiche, modales).
- `lib/themes.js` — les 3 univers, leurs palettes et leurs prompts verrouillés.
- `lib/art.jsx` — les ~35 croquis SVG intégrés, recolorés par univers.
- `lib/storage.js` — le stockage (Phase 1 : localStorage).
- `public/images/{univers}/` — les illustrations haute définition.

## Ce qui n'est pas encore branché

Comptes utilisateurs (Phase 2), PDF haute définition (Phase 3), paiement
Stripe et impression Gelato (Phase 4), génération automatique par API
(Phase 5). Le bouton « Commander » ouvre la modale de commande simulée du
prototype.
