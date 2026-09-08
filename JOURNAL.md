# JOURNAL.md — Charabilla

Journal de bord des sessions de travail. La session la plus récente est en haut.

## Session du 8 septembre 2026 — commandes, suivi, chiffre d'affaires, noms multilingues

### Cadrage donné par la fondatrice

Deux interfaces. **Client** : formulaire du prototype, génération de l'affiche,
génération d'illustrations manquantes (qui alimentent la bibliothèque),
commande et suivi par e-mail. **Admin** (mot de passe) : trois bibliothèques
(Terracotta, Botanique, Nuit céleste) alimentées au fil de l'eau ; une
illustration a un visuel, un nom français et des langues supplémentaires ;
vue des commandes en cours et livrées, par type d'affiche, avec les
informations client pour le SAV ; vue du chiffre d'affaires.

### Ce qui a été fait

- **Commande client** : après le format et le cadre, saisie des coordonnées,
  puis « Valider et payer ». Avec une clé Stripe : redirection vers le
  paiement, la commande passe « payée » au retour du webhook. Sans clé : mode
  démonstration, commande payée directement. Numéro `CH-AAAA-0001`.
- **Page de suivi** `/commande/[id]` : étapes (payée → en production →
  expédiée → livrée), colis, récapitulatif, adresse, historique.
- **E-mails** : confirmation puis un e-mail par changement de statut. Avec
  une clé Resend : envoi réel ; sinon simulation consignée dans la commande.
- **Back-office → Commandes** : liste filtrable (statut, format), fiche
  client SAV, boutons d'avancement, annulation, numéro de colis, notes
  internes, historique, e-mails envoyés.
- **Back-office → Chiffre d'affaires** : total, mois en cours, commandes
  encaissées, panier moyen ; répartitions par format, univers, mois ; compte
  par statut. Seules les commandes payées et suivantes comptent.
- **Noms multilingues** : bouton « Noms » sur chaque illustration (français
  obligatoire, autres langues au choix). La recherche client et la
  correspondance automatique utilisent tous les noms (taper « cat » trouve
  « chat »).
- **Bibliothèque** : les fichiers déposés dans `public/images/{univers}/` sont
  la bibliothèque de l'univers (12 images Terre de sienne reçues). Côté
  client : lien « Parcourir la bibliothèque » et propositions en direct.
- Vérifié de bout en bout dans le navigateur, y compris sur la page de
  recette statique.

### En attente de décision

- **Fond des images Terre de sienne** : aucune des 12 n'a le fond `#F7EDE2`
  de la bible, et les fonds varient entre elles. Option A : régénérer sur
  fond transparent (brief ChatGPT fourni). Option B : fixer une teinte pêche
  unique et mettre la bible à jour. Chat et oiseau ont les yeux ouverts,
  le gâteau a des confettis.

### Prochaines étapes

1. Choisir l'option pour les fonds, puis compléter la bibliothèque.
2. Comptes Stripe et Resend (mode d'emploi à fournir), clé OpenAI.
3. Hébergement + Supabase (le stockage en fichiers ne convient pas à Vercel).
4. PDF 300 dpi avec agrandissement des images (Phase 3), Gelato (Phase 4).

## Session du 1er septembre 2026 (suite) — décisions produit et back-office

Bibliothèque en back-office (l'utilisateur ne dépose plus d'images) ;
génération d'illustration dans l'outil, 3 régénérations puis signalement ;
illustrations posées sans cercle ni fond ; filigrane sur l'aperçu ; bouton
d'impression locale retiré. Back-office `/admin` protégé par mot de passe.
Lexique généré depuis les deux CSV.

## Session du 1er septembre 2026 — portage du prototype

Portage fidèle de `prototype/charabilla.jsx` en Next.js avec les 6
adaptations de `DEMARRAGE.md`. Une première tentative faite sans le
prototype a été remplacée. **Toujours partir de `prototype/charabilla.jsx`.**
