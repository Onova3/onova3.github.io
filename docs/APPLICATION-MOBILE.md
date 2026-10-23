# Hetrako — organisation de l'application mobile

Application web installable (PWA), sans framework ni compilation. Ce document décrit les écrans, la navigation, le premier lancement, les états des écrans et les évolutions futures. Il complète `CONCEPTION.md`.

## 1. Carte des écrans

La barre d'onglets (en bas sur téléphone, à gauche à partir de 900 px de large) compte 5 onglets. Chaque écran a son propre lien.

| Onglet | Écran | Lien | État |
|---|---|---|---|
| **Accueil** | Recherche, profils « Je suis… », raccourcis | `#/` | Fait (étape 4 : mots courants, favoris, derniers consultés) |
| **Impôts** | Liste des 29 impôts par catégorie, avec filtre | `#/impots` | Fait |
| | Fiche impôt (par-dessus) : Comprendre, Calculer, Déclarer et payer, Sanctions | `#/irsa`, `#/irsa/calculer`… | Fait (étape 4 : étoile, partage, signaler une erreur) |
| **Calendrier** | Échéances par mois, filtre par profil | `#/calendrier`, `#/calendrier/employeur` | Fait |
| **Apprendre** | Accueil de l'onglet | `#/apprendre` | Fait |
| | Guides pas à pas (6) | `#/guides`, `#/guides/payer`… | Fait |
| | Sanctions (simulateur) | `#/sanctions` | Fait |
| | Quiz de révision (4 chapitres) | `#/quiz`, `#/quiz/tva`… | Fait |
| | Lexique | — | À venir (étape 4) |
| **Plus** | Réglages : langue, thème, taille du texte | `#/plus` | Fait |
| | Sources et limites, date des barèmes | `#/sources` | Fait |
| | À propos, numéro de version | `#/plus/a-propos` | Fait |
| | Revoir la présentation | bouton dans `#/plus` | Fait |
| | Signaler une erreur | — | Étape 4 |
| | Conditions d'utilisation, Confidentialité | — | Étape 5 |

## 2. Navigation

- **Onglet actif** : calculé par `ongletBarre(route)` (`src/routes.js`) et mis en évidence (`aria-current="page"`). Les fiches dépendent de l'onglet Impôts ; guides, sanctions et quiz de l'onglet Apprendre ; Sources de l'onglet Plus.
- **Écrans par-dessus** : fiches, guides, quiz, sources et à propos s'ouvrent avec une flèche « Retour » en haut, collée lors du défilement. Son lien est donné par `lienRetour(route)` : une fiche ramène à `#/impots`, un guide à la liste des guides, la liste des guides à `#/apprendre`.
- **Anciens liens** : `#/guides/payer`, `#/quiz/tva`, `#/sources`… restent valides.
- **Animation** : une fiche glisse légèrement à l'ouverture ; coupée si le téléphone demande moins d'animations.

## 3. Réglages et mémoire du téléphone

- Un seul module, `src/stockage.js`, lit et écrit sur le téléphone (clés préfixées `kh-`). Valeurs permises et défauts : `PREFERENCES`.
- Si le stockage est indisponible, les choix tiennent en mémoire jusqu'à la fermeture, et l'onglet Plus le signale.
- **Thème** : Automatique (défaut, suit le téléphone), Clair, Sombre. Un petit script dans `index.html` applique le thème et la taille avant l'affichage (pas de flash blanc). La couleur de la barre du téléphone suit le thème.
- **Taille du texte** : Normale (100 %), Grande (112,5 %), Très grande (125 %) ; toutes les polices sont en `rem` et suivent ce réglage.
- **Version** : `src/version.js`, identique dans `package.json` et `sw.js` (vérifié par un test).

## 4. Premier lancement (fait)

Affiché une seule fois, mémorisé par `src/stockage.js` :

1. Écran de démarrage avec le logo, le temps du chargement seulement (affiché à chaque ouverture tant que les données se chargent).
2. Choix de la langue.
3. Trois écrans de présentation à faire défiler, avec « Passer » : calculer ses impôts ; comprendre le Code avec ses articles ; utiliser l'application hors connexion.
4. Avertissement « Outil pédagogique, pas un avis fiscal », à accepter.

« Revoir la présentation » dans l'onglet Plus relance les écrans 2 à 4.

## 5. États des écrans (fait)

Éléments réutilisables : `src/etats.js` (chargement, erreur, confirmation) et `etatVide` dans `src/composants.js`.

| État | Rendu | Où |
|---|---|---|
| Chargement | Blocs gris animés (`squelette`), animation coupée si demandé | Démarrage, et à chaque « Réessayer » |
| Vide | Petite composition, message et action (`etatVide`) | Recherche sans résultat (« Effacer la recherche »), calendrier sans échéance (« Tous »), fiche sans calculateur (« Comprendre »), fiche introuvable (« Tous les impôts ») ; favoris et historique à l'étape 4 |
| Erreur | Message clair et « Réessayer » (`etatErreur`), textes en trois langues même si les fichiers de langue manquent | Données illisibles au démarrage |
| Hors connexion | Bandeau discret sous l'en-tête (`#hors-ligne`) ; « Connexion rétablie » au retour | Partout |
| Confirmation | Petit message en bas de l'écran, lu par les lecteurs d'écran (`confirmer`), 2,5 à 6 s | Réglage enregistré, résultat copié, partage impossible, connexion rétablie |

## 6. Accessibilité

- Cibles tactiles d'au moins 44 px (onglets : 56 px).
- Focus visible au clavier sur tous les liens et boutons.
- Contrastes des deux thèmes repris du prototype ; textes secondaires au moins 4,5:1.
- Animations coupées avec `prefers-reduced-motion`.
- Zones sûres (encoche, barre de geste) respectées.

## 7. Évolutions futures (hors de cette phase)

Pas de compte, pas de serveur, pas de notification pour l'instant. Pistes notées :

- **Compte utilisateur** : retrouver ses favoris et son historique sur un autre téléphone. Suppose un serveur et une politique de confidentialité revue.
- **Synchronisation** : sauvegarde des données de `src/stockage.js` vers ce compte ; le module unique de stockage la rend possible sans toucher aux écrans.
- **Notifications d'échéances** : rappel quelques jours avant une date du calendrier, selon le profil choisi. Demande l'accord de l'utilisateur et, pour les rappels hors de l'application, un service d'envoi.
- **Espace enseignant** : créer un quiz pour une classe, suivre les résultats des élèves. Suppose comptes et serveur.
- **Publication dans les magasins** : emballage de l'application (TWA ou Capacitor) pour le Play Store (étape 6).
