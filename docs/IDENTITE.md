# Hetrako — identité visuelle

« Ny hetrako · Mon impôt » (hetra, l'impôt ; -ko, le mien).

## Logo

- Composant unique : `src/logo.js` (symbole sur une grille de 120 × 120, nom en Archivo 800, « ko » en vert).
- Variantes : normale, sur fond vert, sombre, monochrome noir, empilée — fichiers dans `assets/logo/`, planche dans `assets/logo/planche.html`.
- Icônes : `assets/icones/` (16, 32, 64, 192, 512, Android plein et rond, iPhone, onglet).
- Hors de l'application, les SVG du logo complet utilisent la police Archivo si elle est installée ; sinon une police proche.

## Système de design (style suisse)

- Jetons uniques : `src/design.css` (couleurs claires et sombres, polices, tailles, grille de 8 px). Le thème est toujours porté par `data-theme` sur `<html>`.
- Composants : `src/composants.js` et classes `h-*` ; page interne de démonstration : `design/index.html` (non liée, non mise en cache).
- Mise en page des écrans : `src/style.css`, sans aucune couleur en dur (vérifié par un test).
- Élément signature : double trait doré au-dessus du montant final, en Archivo 800.
- Polices intégrées : `assets/polices/` (licence SIL OFL 1.1), jeu de caractères latin.

## Touches Bauhaus

- Formes du logo seulement : `src/bauhaus.js` (classes `b-vert`, `b-noir`, `b-or`).
- Utilisées pour : écran de démarrage, présentation, états vides, quiz. Jamais sur les écrans de calcul.

## Vérification finale (23 octobre 2026)

| Point | Résultat |
|---|---|
| Débordement à 360 px | Aucun, sur 130 écrans × 2 langues × 2 tailles de texte (520 vues) |
| Zones tactiles | 44 px minimum ; sigles du calendrier agrandis |
| Textes malgaches longs | Aucun texte coupé |
| Contrastes | Textes ≥ 4,5:1 et éléments graphiques ≥ 3:1 dans les deux thèmes (tests) ; l'or en thème clair (1,9:1) est purement décoratif |
| Hors connexion | 117 fichiers (885 Ko) en cache, polices et icônes comprises, aucun appel externe |

Limite : le navigateur intégré à l'outil de développement ne permet plus d'enregistrer le service worker ; le mode hors connexion est vérifié par les tests et par le téléchargement des 117 fichiers, à confirmer sur téléphone.
