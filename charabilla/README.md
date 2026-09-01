# Charabilla — Phase 1 : site vitrine

Prototype fonctionnel du créateur d'affiche (voir `PROJET.md` à la racine du
dépôt pour le contexte complet du produit).

## Ce que fait ce prototype aujourd'hui

- Formulaire en 3 étapes : infos (prénom, titre, univers, nombre de mots),
  paires de mots, aperçu.
- Grille par paliers (1 / 4 / 8 / 12 / 16 mots) avec cases vides en
  pointillés dans l'aperçu.
- Trois univers graphiques (Terre de sienne, Jardin botanique, Nuit
  céleste) avec les couleurs verrouillées dans les bibles de style.
- Le mot réel ne s'affiche jamais sur l'affiche — il sert uniquement à
  suggérer une illustration.

## Ce qui manque encore (prochaines phases)

- **Illustrations** : ce prototype utilise des pictogrammes (émojis) à la
  place des vraies images génées par IA. À remplacer dès que la
  bibliothèque d'images par univers sera prête.
- Comptes utilisateurs (Supabase), génération PDF 300 dpi, paiement
  (Stripe) et impression (Gelato) : pas encore branchés — le bouton
  « Commander » est désactivé exprès.

## Comment le lancer pour tester

Dans un terminal, à la racine de ce dossier `charabilla/` :

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000) dans le
navigateur. La page d'accueil mène vers `/creer`, le créateur d'affiche.
