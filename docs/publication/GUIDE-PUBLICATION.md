# Hetrako — guide de publication

Ce guide prépare la publication ; **rien n'a été publié**. Il est écrit pour quelqu'un qui débute. Les règles de Google changent souvent : vérifiez chaque point dans l'aide officielle de la Play Console au moment de publier.

Ordre conseillé :

1. Terminer les relectures (malgache, points « À vérifier »), car tout ce qui est publié devient public.
2. Mettre le site en ligne sur GitHub Pages (gratuit) : l'application est alors installable depuis Chrome, sans le Play Store.
3. Plus tard, publier sur le Google Play Store (payant, plusieurs semaines de démarches).

---

## 1. Avant de publier : ce qui deviendra public

| Élément | Où | À faire |
|---|---|---|
| Textes malgaches non relus | toute l'application | Faire relire ; retirer ensuite le bandeau « à relire » |
| Points ouverts | `docs/A-VERIFIER.md` (111 points) | Trancher au moins ceux affichés dans l'application (ex. n° 106, délai du droit de communication) |
| Lexique et mots courants | `data/lexique.json`, `data/mots-courants.json` | Relecture par un spécialiste (points 110 et 111) |
| Adresse e-mail de contact | `src/signaler.js` | Votre adresse personnelle sera visible : envisager une adresse dédiée au projet |
| PDF des codes | `codes/` | Vérifier qu'ils peuvent être rediffusés ; sinon, ne pas les publier et remplacer les liens par la source officielle |
| Dossiers de travail | `docs/`, `prototype/`, `tests/`, `design/` | Ils seront visibles dans le dépôt public ; sans danger, mais à savoir |

---

## 2. Mettre le site en ligne gratuitement sur GitHub Pages

GitHub Pages sert gratuitement des fichiers statiques, en **https** (obligatoire pour l'installation et le mode hors connexion). Le dépôt doit être **public** avec un compte gratuit.

### Le choix de l'adresse (important pour le Play Store)

| Nom du dépôt | Adresse du site | Play Store possible ? |
|---|---|---|
| `hetrako` | `https://<votre-nom>.github.io/hetrako/` | **Non** sans domaine : le fichier de vérification Android doit être à la racine du domaine |
| `<votre-nom>.github.io` | `https://<votre-nom>.github.io/` | Oui |
| `hetrako` + nom de domaine acheté (ex. `hetrako.mg`) | `https://hetrako.mg/` | Oui (domaine payant, prix selon l’extension et le vendeur) |

L'application n'utilise que des liens relatifs : elle fonctionne dans les trois cas.

### Étapes

1. Créer un compte sur github.com (gratuit).
2. Créer un dépôt **public**, sans README (le projet en a déjà un).
3. Ajouter à la racine du projet un fichier vide nommé `.nojekyll` (sinon GitHub ignore le dossier `.well-known` nécessaire au Play Store).
4. Envoyer le projet (Claude Code peut préparer ces commandes ; vous validez l'envoi) :

   ```bash
   git remote add origin https://github.com/<votre-nom>/<depot>.git
   ```

   ```bash
   git push -u origin main
   ```

5. Sur GitHub : **Settings › Pages › Build and deployment › Source : Deploy from a branch**, branche `main`, dossier `/ (root)`, **Save**.
6. Attendre une à deux minutes, puis ouvrir l'adresse indiquée.
7. Sur le téléphone : ouvrir l'adresse dans Chrome, puis **Plus › Installer l'application**.

### À chaque mise à jour

1. Changer le numéro de version dans `src/version.js`, `package.json` et `sw.js` (`VERSION`) ; si les barèmes changent, recopier leur date dans `BAREMES` (`sw.js`). Les tests vérifient la cohérence.
2. `npm test`, puis commit et `git push`.
3. Les téléphones affichent « Nouvelle version disponible » à l'ouverture suivante.

---

## 3. Publier sur le Google Play Store

### Les outils possibles

| Outil | Principe | Pour Hetrako |
|---|---|---|
| **PWABuilder** (pwabuilder.com) | Site web : on donne l'adresse du site, il fabrique le paquet Android (Trusted Web Activity). Utilise Bubblewrap en coulisses. | **Recommandé** : aucune installation, aucun code à changer |
| **Bubblewrap** (outil en ligne de commande de Google) | Même résultat que PWABuilder, en ligne de commande | Possible ; demande d'installer Node, Java et le SDK Android (à valider avant toute installation) |
| **Capacitor** | Emballe les fichiers dans une vraie application Android | Plus lourd : demande Android Studio et une étape de construction ; utile seulement si l'app doit utiliser des fonctions natives |

Avec PWABuilder ou Bubblewrap, l'application Android affiche le site en plein écran : **chaque mise à jour du site met à jour l'application**, sans republier sur le Play Store (sauf changement d'icône ou de nom).

### Le lien de confiance entre le site et l'application

Android vérifie que le site appartient bien à l'éditeur de l'application grâce au fichier `/.well-known/assetlinks.json`, placé **à la racine du domaine**. PWABuilder le fournit. Sans lui, l'application s'ouvre avec une barre d'adresse de navigateur.

Piège fréquent : si Google signe l'application lui-même (« Play App Signing », proposé par défaut), il faut mettre dans `assetlinks.json` l'empreinte de la clé **de Google** (Play Console › Intégrité de l'application), pas seulement celle de la clé générée par PWABuilder.

### Coûts et exigences (à vérifier dans la Play Console au moment de publier)

| Point | Ce qu'il faut savoir |
|---|---|
| Compte développeur | Frais d'inscription uniques de 25 dollars US ; vérification d'identité (pièce d'identité, parfois justificatif d'adresse) |
| Compte personnel récent | Test fermé obligatoire avant la production : au moins **12 testeurs** inscrits pendant **14 jours d'affilée**, puis demande d'accès à la production |
| Politique de confidentialité | Une **adresse web publique** est exigée : publier une page `confidentialite.html` reprenant le texte de l'écran Confidentialité |
| Sécurité des données | Formulaire « Data safety » : déclarer qu'aucune donnée n'est collectée ni partagée |
| Classification du contenu | Questionnaire à remplir (application éducative, sans contenu sensible) |
| Public cible | Déclarer un public de 18 ans et plus (ou 16+) pour rester hors du programme « Familles », plus exigeant |
| Fiche | Nom, description courte (80 caractères), description complète (4 000 caractères), icône 512 × 512, bannière 1024 × 500, captures d'écran |
| Catégorie | Éducation |
| Coût total | 25 dollars US une fois ; GitHub Pages gratuit ; domaine facultatif |

### Étapes

1. Mettre le site en ligne (partie 2), à une adresse compatible.
2. Créer le compte développeur Google Play et faire vérifier son identité.
3. Sur pwabuilder.com : entrer l'adresse du site, corriger les remarques éventuelles, choisir **Android › Google Play**, nom de paquet par exemple `mg.hetrako.app`, télécharger le paquet (`.aab`) et la clé de signature. **Garder la clé et son mot de passe en lieu sûr** : sans elle, impossible de mettre l'application à jour.
4. Publier le fichier `assetlinks.json` dans `.well-known/` sur le site, puis `git push`.
5. Dans la Play Console : créer l'application, remplir la fiche (textes de `docs/publication/play-store.json`), la politique de confidentialité, la sécurité des données, la classification et le public cible.
6. Envoyer le `.aab` en **test fermé**, inviter au moins 12 testeurs (amis, camarades), attendre 14 jours.
7. Demander l'accès à la production, puis publier.

---

## 4. La fiche Play Store

Textes complets en français, anglais et malgache : `docs/publication/play-store.json` (longueurs vérifiées par un test). Le malgache est à faire relire avant publication.

| Langue | Nom | Description courte |
|---|---|---|
| Français | Hetrako — Mon impôt | Les impôts de Madagascar expliqués et calculés, article par article. |
| Anglais | Hetrako — My tax | Madagascar's taxes explained and calculated, article by article. |
| Malgache | Hetrako — Ny hetrako | Ny hetra eto Madagasikara, hazavaina sy kajiana isaky ny andininy. |

Éléments graphiques : icône `assets/icones/icone-512.png` ; bannière 1024 × 500 à créer (logo empilé à gauche, composition Bauhaus du démarrage à droite, fond gris clair).

---

## 5. Les captures d'écran à préparer

Format conseillé : téléphone en portrait, 1080 × 1920 px (ou 1080 × 2400), thème clair, langue de la fiche. Préparer la série en français, puis en malgache et en anglais si possible. Données d'exemple seulement : aucune donnée personnelle.

| N° | Écran | Lien | Ce qu'on doit voir |
|---|---|---|---|
| 1 | Accueil | `#/` | Logo, prochaine échéance en grand, raccourcis par profil |
| 2 | Calcul IRSA | `#/irsa/calculer` | Formulaire pré-rempli et aperçu du montant |
| 3 | Résultat IRSA | `#/irsa/calculer` (défiler) | Lignes avec articles, barres par tranche, double trait doré, montant en grand |
| 4 | Fiche « Comprendre » | `#/tva` | Définition, qui paie, articles |
| 5 | Calendrier fiscal | `#/calendrier/employeur` | Échéances du mois en cours |
| 6 | Guide pas à pas | `#/guides/reclamer` | Étapes numérotées, délais |
| 7 | Lexique | `#/lexique` | Termes et articles |
| 8 | Thème sombre | `#/irsa/calculer` | Le résultat en sombre |
| (option) | Présentation | Plus › Revoir la présentation | Composition Bauhaus |

Astuce : dans Chrome sur ordinateur, F12 puis Ctrl+Maj+M, appareil 1080 × 1920 réduit, puis menu ⋮ › « Capture d'écran ».

---

## Sources consultées (octobre 2026)

- Aide Play Console, éléments graphiques et fiche : https://support.google.com/googleplay/android-developer/answer/9866151 et https://support.google.com/googleplay/android-developer/answer/1078870
- Trusted Web Activity, démarrage rapide : https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2 et https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- Bubblewrap : https://www.thinktecture.com/en/pwa/twa-bubblewrap
- Test fermé (12 testeurs, 14 jours ; sources non officielles, à vérifier dans l'aide Google) : https://dev.to/playconsolestore1/the-14-day-closed-testing-requirement-for-new-google-play-developer-accounts-explained-4gpc et https://ontest.app/blog/google-play-12-testers-14-days-requirement-explained
- Vérification d'identité des développeurs (source non officielle) : https://testerbee.com/blog/google-play-developer-verification-2026
