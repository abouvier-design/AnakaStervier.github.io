# Charabilla — Phase 1

Application Next.js issue du prototype `prototype/charabilla.jsx`, avec les
décisions produit de la fondatrice (voir `JOURNAL.md`).

## Les deux interfaces

**Client** (`/`) : formulaire du prototype (prénom, titre, sous-titre, mots,
univers), affiche en direct avec filigrane, illustrations posées directement
sur le fond. Si un mot n'a pas d'illustration, le client la **génère dans
l'outil** (3 régénérations au plus, puis signalement au back-office). Il passe
**commande** (format, cadre, coordonnées, paiement), reçoit un numéro, une
**page de suivi** et des **e-mails** à chaque étape.

**Back-office** (`/admin`, mot de passe) :
- **Bibliothèque** par univers (Terre de sienne, Jardin botanique, Nuit
  céleste) : dépôt d'illustrations, génération, validation de celles générées
  par les clients, mots signalés, **noms dans plusieurs langues**.
- **Commandes** : liste filtrable par statut et par format, fiche client pour
  le SAV, changement de statut (payée → en production → expédiée → livrée,
  annulation), numéro de colis, notes internes. Chaque changement envoie un
  e-mail au client.
- **Chiffre d'affaires** : total, mois en cours, panier moyen, par format, par
  univers, par mois.

## Lancer en local

```bash
npm install
cp .env.example .env.local     # puis remplir au minimum ADMIN_PASSWORD
npm run dev
```

Site : http://localhost:3000 · Back-office : http://localhost:3000/admin

## Services externes (tous facultatifs en test)

| Variable | Rôle | Sans elle |
|---|---|---|
| `ADMIN_PASSWORD` | Mot de passe du back-office | `/admin` reste fermé |
| `OPENAI_API_KEY` | Génération d'illustrations (`gpt-image-1`) | Mode démonstration : croquis provisoire |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paiement par carte (Stripe Checkout) | Mode démonstration : commande marquée payée directement |
| `RESEND_API_KEY`, `EMAIL_EXPEDITEUR` | E-mails aux clients (Resend) | Simulation : l'e-mail est consigné dans la commande, pas envoyé |
| `SITE_URL` | Adresse publique (liens des e-mails, retour de paiement) | `http://localhost:3000` |

## Illustrations

Un fichier déposé dans `public/images/{univers}/` fait partie de la
bibliothèque de cet univers ; le nom du fichier est le mot (`chat.png`). Le
back-office peut aussi déposer, générer, remplacer, supprimer, et donner des
noms dans d'autres langues (la recherche du client les utilise toutes).
Résolution d'un mot : correspondance exacte sur l'identifiant ou un nom, puis
préfixe ≥ 3 lettres, puis croquis provisoire, sinon proposition de génération.

## Organisation

| Fichier | Rôle |
|---|---|
| `components/Charabilla.jsx` | Application client (formulaire, affiche, commande). |
| `components/SuiviCommande.jsx` | Page de suivi d'une commande (`/commande/[id]`). |
| `components/Admin.jsx` + `AdminCommandes.jsx` + `AdminChiffres.jsx` | Back-office. |
| `components/ModaleGeneration.jsx`, `ModaleNoms.jsx`, `Illustration.jsx` | Briques partagées. |
| `lib/themes.js`, `lib/art.jsx`, `lib/lexique.generated.js` | Univers, croquis, lexique (généré depuis `data/*.csv`). |
| `lib/commandes-communs.js` | Statuts, prix, chiffre d'affaires (utilisable partout). |
| `lib/library-store.js`, `lib/commandes-store.js` | Stockage serveur (Phase 1 : fichiers dans `bibliotheque/`). |
| `lib/generation.js`, `lib/stripe.js`, `lib/emails.js`, `lib/admin-auth.js` | Services externes et sécurité. |
| `lib/api-client.js` | Accès depuis le navigateur, en mode serveur ou en mode local (page de recette). |
| `app/api/*` | Routes : bibliothèque, images, génération, signalements, commandes, webhook Stripe, connexion admin. |

## Limites connues de la Phase 1

- **Stockage en fichiers** : parfait en local ; un hébergement type Vercel a un
  disque en lecture seule. La Phase 2 (Supabase) remplace les deux modules
  `*-store.js` sans toucher au reste.
- **Dicos sauvegardés** dans le navigateur uniquement (comptes en Phase 2).
- **Images** : 1 024 à 1 254 px aujourd'hui ; agrandissement prévu dans la
  fabrication du PDF (Phase 3).
- Le filigrane décourage l'usage d'une capture d'écran ; rien ne peut
  empêcher la capture elle-même.
