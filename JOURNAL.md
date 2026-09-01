# JOURNAL.md — Charabilla

Journal de bord des sessions de travail. La session la plus récente est en haut.

## Session du 1er septembre 2026 (suite) — décisions produit et back-office

### Décisions prises par la fondatrice

1. La bibliothèque d'illustrations est un **back-office** : l'utilisateur ne
   dépose jamais ses propres images. L'administrateur constitue une
   bibliothèque cohérente par univers.
2. L'utilisateur renseigne prénom, titre, sous-titre, mots, univers. S'il ne
   trouve pas l'illustration d'un mot, il la **génère dans l'outil** (IA
   branchée côté serveur). Plus aucun aller-retour avec ChatGPT.
3. Le bouton s'appelle **« Générer une illustration »**. Régénération limitée
   à **3 essais**. Ensuite, l'utilisateur **signale le mot** ; le back-office
   ajoute l'illustration à la bibliothèque et raye le signalement. Pas de
   suivi ni de notification retour (jugé trop lourd pour un MVP).
4. Sur l'affiche, **plus de cercle ni de fond** derrière les illustrations :
   elles se posent directement sur le fond de l'affiche.
5. **Filigrane** sur l'aperçu pour décourager l'impression d'une capture
   d'écran. Le bouton « imprimer chez soi » est retiré en conséquence.

Ces décisions remplacent, pour les points concernés, ce que disaient
`PROJET.md` et `DEMARRAGE.md` (flux de génération manuel, bibliothèque dans
l'interface utilisateur).

### Ce qui a été fait

- **Back-office `/admin`** protégé par mot de passe (`ADMIN_PASSWORD`) :
  onglets par univers, chiffres, les 100 mots du lexique avec leur état
  (illustré / manquant), génération ou dépôt de fichier mot par mot, dépôt en
  masse (nom du fichier = mot), suppression, validation des illustrations
  générées par des utilisateurs, liste des mots signalés.
- **Génération dans l'outil** : route serveur qui appelle `gpt-image-1` avec
  le prompt verrouillé de l'univers ; traduction du mot via le lexique, sinon
  par un petit modèle de texte. Sans clé d'API, mode démonstration (croquis).
  Garde-fou : 12 générations par visiteur et par heure.
- **Côté utilisateur** : carte « Ma bibliothèque » et liste d'émojis
  retirées ; sélecteur = recherche par mot dans la bibliothèque + « Générer
  une illustration » ; 3 régénérations puis signalement ; le mot signalé
  garde sa place avec un croquis estompé et recevra son image automatiquement.
- **Affiche** : illustrations sans cercle ni fond, filigrane diagonal
  « charabilla · aperçu », plus de bouton d'impression.
- **Lexique** : `scripts/generer-lexique.mjs` produit `lib/lexique.generated.js`
  à partir des deux CSV (100 mots prioritaires, 251 traductions).
- Vérifié dans le navigateur, de bout en bout : connexion admin (bon et
  mauvais mot de passe), génération et enregistrement d'un mot par l'admin,
  résolution de ce mot côté utilisateur, génération utilisateur avec limite de
  3 essais puis signalement, illustration utilisateur « à valider » puis
  validée par l'admin, signalement rayé.

### Prochaines étapes

1. **Activer l'IA réelle** : créer une clé OpenAI et la renseigner dans
   `OPENAI_API_KEY` (mode d'emploi donné à la fondatrice), puis générer les
   10 mots tests de chaque univers pour valider la cohérence (protocole de
   `PROJET.md`).
2. **Héberger** : Vercel pour le site ; comme son disque est en lecture seule,
   la bibliothèque doit passer sur Supabase Storage (Phase 2) — remplacer
   `lib/library-store.js` uniquement.
3. Comptes utilisateurs (Phase 2), PDF 300 dpi (Phase 3), Stripe + Gelato
   (Phase 4).

## Session du 1er septembre 2026 — portage du prototype

**Mise en place du dépôt.** `PROJET.md`, `DEMARRAGE.md`,
`prototype/charabilla.jsx`, les deux lexiques.

**Phase 1 — portage du prototype en Next.js** (dossier `charabilla/`), à
l'identique, avec les 6 adaptations de `DEMARRAGE.md` : `window.storage` →
`lib/storage.js` sur `localStorage`, polices via `next/font`, styles
d'impression dans `globals.css` ; `containerType` + `cqw`, croquis SVG et
flux manuel conservés à ce stade.

Une première tentative faite sans le prototype ne correspondait pas et a été
remplacée. **Toujours partir de `prototype/charabilla.jsx`.**
