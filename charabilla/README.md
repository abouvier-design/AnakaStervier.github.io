# Charabilla — Phase 1

Application Next.js issue du prototype `prototype/charabilla.jsx`, avec les
décisions produit prises par la fondatrice le 1er septembre 2026 :

- La **bibliothèque d'illustrations est un back-office** (`/admin`), protégé
  par mot de passe. L'utilisateur ne dépose jamais ses propres images.
- L'utilisateur renseigne prénom, titre (dico / imagier), sous-titre, mots et
  univers. L'illustration se trouve par le mot dans la bibliothèque ; sinon
  il peut **« Générer une illustration »** dans l'outil (IA branchée côté
  serveur, prompt verrouillé de l'univers), régénérer 3 fois au plus, puis
  **signaler le mot** au back-office.
- Sur l'affiche, les illustrations sont posées **directement sur le fond**
  (ni cercle ni fond) et l'aperçu porte un **filigrane**.

## Lancer en local

```bash
npm install
cp .env.example .env.local     # puis remplir ADMIN_PASSWORD (et OPENAI_API_KEY)
npm run dev
```

- Site : [http://localhost:3000](http://localhost:3000)
- Back-office : [http://localhost:3000/admin](http://localhost:3000/admin)

Sans `OPENAI_API_KEY`, la génération est en **mode démonstration** : elle
renvoie le croquis provisoire du mot, ce qui permet de tester tout le
parcours sans dépenser. Avec la clé, elle appelle `gpt-image-1`
(1024 × 1024, qualité réglable par `GENERATION_QUALITE`).

## Organisation

| Dossier / fichier | Rôle |
|---|---|
| `components/Charabilla.jsx` | Application utilisateur (formulaire, affiche, modales). |
| `components/Admin.jsx` | Back-office : lexique des 100 mots, dépôt, génération, validation, mots signalés. |
| `components/ModaleGeneration.jsx` | Modale « Générer une illustration », commune aux deux. |
| `components/Illustration.jsx` | Affiche l'illustration d'un mot (bibliothèque, sinon croquis). |
| `lib/themes.js` | Les 3 univers, palettes, prompts verrouillés, grille. |
| `lib/art.jsx` | Les ~35 croquis SVG provisoires. |
| `lib/lexique.generated.js` | Généré depuis `data/*.csv` par `scripts/generer-lexique.mjs`. |
| `lib/api-client.js` | Accès à la bibliothèque et à la génération (mode serveur ou mode local de démo). |
| `lib/library-store.js` | Stockage serveur des images et des signalements (Phase 1 : fichiers dans `bibliotheque/`). |
| `lib/generation.js` | Appel à l'IA d'images (ou croquis en mode démo). |
| `lib/admin-auth.js` | Mot de passe du back-office (cookie signé). |
| `lib/storage.js` | Sauvegarde des dicos côté navigateur (`localStorage`). |
| `app/api/*` | Routes : bibliothèque, images, génération, signalements, connexion admin. |

## Résolution d'un mot vers son illustration

Mot normalisé (minuscules, sans accent, tirets) → image de la bibliothèque de
l'univers courant (exacte, puis préfixe ≥ 3 lettres) → croquis provisoire →
sinon proposition de génération. Un même identifiant de mot existe dans les
trois univers : changer d'univers échange toutes les illustrations.

## Limites connues de la Phase 1

- **Stockage en fichiers** : parfait en local, mais un hébergement type Vercel
  a un disque en lecture seule. La Phase 2 (Supabase Storage) remplace
  `lib/library-store.js` sans toucher au reste.
- **Sauvegarde des dicos** dans le navigateur uniquement (comptes en Phase 2).
- **Résolution des images** : 1024 px ; la Phase 3 (PDF 300 dpi) tranchera
  entre agrandissement et génération haute définition.
- Le filigrane décourage l'usage d'une capture d'écran ; rien ne peut
  empêcher la capture elle-même.
