# PROJET.md — Charabilla

> Fichier de contexte à lire en début de chaque session. Il résume tout ce qui a été décidé et validé. Ne pas remettre en cause ces décisions sans en discuter d'abord avec la fondatrice.

## Note importante sur la fondatrice

La fondatrice n'est **pas technique**. Conséquences pour toute session de travail : expliquer chaque étape en français simple, sans jargon ; ne jamais demander d'écrire ou modifier du code à la main ; pour toute action externe (créer un compte, récupérer une clé API, déployer), donner un mode d'emploi pas à pas ; avancer par petits lots testables et lui faire vérifier le résultat dans le navigateur entre chaque lot ; committer souvent avec des messages clairs pour pouvoir revenir en arrière sans douleur.

## Le produit

Charabilla (nom provisoire, il changera) génère des **affiches décoratives personnalisées à partir des premiers mots des enfants**. Le principe : les tout-petits déforment les mots ("compote" devient "amaka"). Les parents saisissent des paires mot réel → mot de l'enfant, et la plateforme compose une affiche où chaque mot de l'enfant apparaît sous une illustration de l'objet. Le mot réel ne figure **jamais** sur l'affiche (décision ferme) : l'illustration parle d'elle-même, le mot réel sert uniquement au classement interne et au choix de l'illustration. Titre de l'affiche : « Le dico de {prénom} » ou « L'imagier de {prénom} », au choix.

C'est un objet souvenir et déco (marché : cadeaux de naissance/anniversaire, déco de chambre d'enfant), avec une dimension valorisation du langage de l'enfant. Vente à l'international visée.

## Spécifications produit validées

**Grille de l'affiche** : paliers fixes de 1, 4, 8, 12 ou 16 mots (16 = maximum absolu). La mise en page s'ajuste au palier : 1 mot = pleine page, 4 = 2×2, 8 = 2×4, 12 = 3×4, 16 = 4×4. Les emplacements vides du palier en cours s'affichent en pointillés dans l'aperçu (pas à l'impression). Toutes les tailles internes de l'affiche sont proportionnelles à sa largeur (le prototype utilise des unités cqw avec container-type) pour que rien ne déborde jamais du format A4 (ratio 1/1.414).

**Univers graphiques** : trois univers distincts pensés pour s'intégrer à une déco de chambre — Terre de sienne (validé par test, en production), Jardin botanique et Nuit céleste (prompts verrouillés définis, validation par test en cours). Pas d'emojis ni d'icônes dans le produit final : de vraies illustrations générées par IA selon les bibles de style ci-dessous.

**Fonctionnalités cibles** : formulaire de saisie (prénom, choix du titre, paires de mots, illustration auto-suggérée modifiable), aperçu en direct, comptes utilisateurs avec plusieurs dicos sauvegardés (un par enfant), génération PDF haute définition 300 dpi, commande d'impression avec livraison via API Gelato (avec ou sans cadre), paiement Stripe.

**Formats de vente** : carte postale, A4, A3, et grand format mural. Attention : Gelato déconseille les formats A pour l'encadré à l'international (conversions cm/pouces, cadres assortis) et recommande 30×40 / 50×70 / 70×100 cm. Décision à finaliser en consultant le catalogue Gelato exact ; partir sur carte postale + A4 + A3 pour la France et 30×40 + 50×70 pour l'international sauf contre-ordre.

## Bibles de style des trois univers

### Règles communes aux trois univers (NE PAS MODIFIER)

Un fond strictement identique sur toutes les images d'un même univers. Formes rondes et douces, aucun contour. Couleurs naturelles de l'objet quand il en a une, adoucies et harmonisées avec la palette de l'univers. Animaux et personnages : yeux fermés souriants ; objets : jamais de visage. Interdits absolus : texte dans l'image, bordure blanche, effet autocollant/sticker, contour noir. Un seul sujet centré. Format carré, haute résolution (2048×2048 minimum pour tenir le 50×70 cm à 300 dpi). Une conversation ChatGPT distincte par univers lors de la génération manuelle (ne jamais mélanger deux styles dans une même conversation). Un prompt template verrouillé par univers où seule la variable {OBJECT} change.

### Univers 1 — « Terre de sienne » (VALIDÉ PAR TEST)

Validé sur 10 générations réelles. Fond beige uni #F7EDE2, palette terracotta/sable #B96A45, #D89B78, #F7EDE2, texture granuleuse mate, formes épaisses. Prompt verrouillé :
```
Flat boho illustration of {OBJECT}, warm terracotta and sand palette
(#B96A45, #D89B78, #F7EDE2), matte grainy texture, soft rounded organic
shapes, thick simple forms, no outline, single centered subject, plain warm
beige background (#F7EDE2), no text, no border, no white outline, no sticker
effect. Natural object colors softened to harmonize with the palette.
Animals and characters have closed happy eyes; objects have no face.
Style: modern bohemian nursery art, warm and cozy. Square format.
```

### Univers 2 — « Jardin botanique » (défini, à valider par test)

Fond crème uni #F5F2E9, palette sauge/crème #57704F, #8FA982, #F5F2E9, aquarelle douce aux bords délicats, esprit imagier français vintage. Prompt verrouillé :
```
Soft watercolor children's book illustration of {OBJECT}, sage green and
cream palette (#57704F, #8FA982, #F5F2E9), delicate hand-painted texture
with subtle watercolor edges, gentle rounded shapes, minimal details, no
outline, single centered subject, plain cream background (#F5F2E9) identical
on every image, no text, no border, no white outline, no sticker effect.
Natural object colors softened into muted earthy watercolor tones that
harmonize with the palette. Animals and characters have closed happy eyes;
objects have no face. Style: vintage French imagier, tender and calm.
Square format.
```
Dérive connue à surveiller : éclaboussures d'aquarelle ou feuillage décoratif ajouté autour du sujet. Correction : « sujet seul, sans éclaboussures ni feuillage autour ».

### Univers 3 — « Nuit céleste » (défini, à valider par test)

Fond bleu nuit uni #1F2A4D, palette or/crème #E8C87A, #F4EFE2, lumière douce façon clair de lune, texture granuleuse mate. Signature de l'univers : exactement trois petites étoiles dorées de même taille autour du sujet, sur chaque image (verrouillé pour empêcher un nombre d'étoiles variable, qui trahirait l'incohérence sur une affiche). Prompt verrouillé :
```
Dreamy night-sky illustration of {OBJECT}, deep navy blue background
(#1F2A4D) identical on every image, gold and cream palette (#E8C87A,
#F4EFE2), soft glowing highlights as if lit by moonlight, matte grainy
texture, rounded gentle shapes, no outline, single centered subject, exactly
three tiny gold stars scattered around the subject (always three, same
size), no text, no border, no white outline, no sticker effect. Natural
object colors softened into muted moonlit tones that harmonize with the navy
and gold palette. Animals and characters have closed sleepy happy eyes;
objects have no face. Style: celestial nursery art, magical and soothing.
Square format.
```
Dérives connues à surveiller : ajout d'une lune, de halos ou de constellations. Correction : « pas de lune, seulement le sujet et les trois petites étoiles ». Univers le plus risqué des trois : prévoir éventuellement deux itérations de prompt. Attention produit : le mot de l'enfant devra s'afficher en crème #F4EFE2 sur ce fond sombre (contraste), contrairement aux deux autres univers.

**Protocole de validation d'un univers** : générer les 10 mots tests (a cat, a rabbit, a banana, a teddy bear, a car, a baby bottle, a flower, a balloon, the sun, a shoe — mêmes 10 mots pour les trois univers afin de pouvoir les comparer côte à côte), juger sur 4 critères (même fond, même palette, mêmes formes, aucun texte/contour) ; 8-10 images cohérentes = univers validé, 5-7 = resserrer le prompt, <5 = changer de modèle de génération.

## Bibliothèque d'illustrations

Stratégie à deux étages : (1) bibliothèque pré-générée des 100 mots les plus fréquents du vocabulaire 18-24 mois (fichier `charabilla-100-mots-prompts.csv` : mot français, catégorie, terme anglais, prompt complet), générée manuellement dans ChatGPT par la fondatrice, curée à la main, stockée définitivement — elle couvre ~95 % des besoins ; à terme 100 mots × 3 univers = 300 images ; (2) génération à la volée via API (gpt-image recommandé pour démarrer) pour les mots hors bibliothèque, avec le prompt verrouillé de l'univers choisi + images de référence, validation avant impression, et enrichissement automatique de la bibliothèque. Un lexique étendu de 286 mots existe aussi (`lexique-300-premiers-mots.csv`).

Correspondance mot saisi → illustration : normaliser (minuscules, sans accents), correspondance exacte puis par préfixe (≥ 3 lettres), tolérance aux fautes de frappe souhaitable. Si aucun résultat : proposer le choix manuel dans la bibliothèque, puis la génération à la volée. Une même illustration existe dans les trois univers sous le même identifiant de mot : changer d'univers sur une affiche = échanger toutes les illustrations sans autre modification.

## Stack technique recommandée

Next.js (App Router) + Supabase (auth, base de données, stockage des images de la bibliothèque) + Vercel (hébergement) + Stripe (paiement, démarrer en mode test) + API Gelato (impression/livraison, mode test d'abord) + API OpenAI gpt-image (génération à la volée, phase 2). Le point technique le plus délicat est la génération du PDF 300 dpi avec fond perdu 3 mm conforme aux gabarits Gelato : prévoir un rendu serveur (par exemple Puppeteer ou @react-pdf/renderer) et le valider tôt avec une vraie commande test.

## Actifs existants

`charabilla.jsx` : prototype React fonctionnel qui sert de spécification vivante (formulaire 3 étapes, grille par paliers avec pointillés, 3 univers, compte simulé via window.storage à remplacer par Supabase, modale de commande simulée à remplacer par Stripe+Gelato, impression via window.print à remplacer par le PDF serveur). `charabilla-100-mots-prompts.csv` : les 100 mots avec prompts Terre de sienne. `lexique-300-premiers-mots.csv` : lexique étendu. `charabilla-pipeline-technique.md` : détails pipeline illustrations + impression. Dossiers d'images (fichiers nommés `mot.png` en français, ex. `chat.png`, `compote.png`) : « Terre de sienne » en cours de génération par la fondatrice ; « Jardin botanique » et « Nuit céleste » à démarrer après validation de leur test de cohérence.

## Feuille de route

Phase 1 — Site vitrine fonctionnel : reprendre le prototype en Next.js, brancher les vraies images de la bibliothèque à la place des emojis, aperçu en direct identique au prototype. Phase 2 — Comptes : auth Supabase, sauvegarde de plusieurs dicos par utilisateur. Phase 3 — PDF : rendu haute définition 300 dpi + fond perdu, validé visuellement. Phase 4 — Commande : Stripe mode test, puis API Gelato mode test, une commande réelle de bout en bout livrée chez la fondatrice avant toute mise en production. Phase 5 — Génération à la volée + bibliothèques Botanique et Nuit céleste + traductions pour l'international.

## Décisions en attente (ne pas trancher seul)

Le nom définitif (Charabilla est provisoire ; « Lalla » est le favori actuel, vérification INPI/EUIPO à faire). Les formats exacts au catalogue Gelato. Le prix de vente. La validation par test des univers Jardin botanique et Nuit céleste (protocole des 10 mots ci-dessus) avant toute génération de leur bibliothèque complète.
