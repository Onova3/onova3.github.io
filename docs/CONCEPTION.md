# Kajy Hetra — Dossier de conception

Version 0.5 · 23 octobre 2026 (fin de la phase 4 : les 29 impôts ont leur fiche)

## 1. Le produit en une phrase

Une application web trilingue (français, anglais, malgache) qui explique et calcule **tous les impôts du Code des impôts de Madagascar**, et qui montre pour chacun **comment le déclarer, le payer et ce qu'on risque**, selon le **Code des procédures fiscales**.

- **Public principal** : étudiants (droit, gestion, comptabilité) et jeunes qui entrent dans la vie active ou créent une activité.
- **Public secondaire** : petits entrepreneurs, enseignants de fiscalité.
- **Ce que ce n'est pas** : un logiciel de déclaration ni un avis fiscal. Chaque résultat renvoie à l'article du Code.

## 2. Sources de vérité

| Ordre | Source | Fichier du projet |
|---|---|---|
| 1 | Code des impôts suivant la LFI 2026 | `codes/CDI-LFI-2026.pdf` (texte : `codes/CDI-2026.txt`) |
| 2 | Code des procédures fiscales suivant la LFI 2026 | `codes/CPF-LFI-2026.pdf` (texte : `codes/CPF-2026.txt`) |
| 3 | Loi n° 2026-004, LFR 2026 (promulguée le 16 juillet 2026) | modifications reportées dans `data/baremes-2026.json`, champ `source: "LFR 2026"` |

Règle : un taux, un seuil ou un délai n'entre dans l'application **que s'il est rattaché à un article**. Les sites tiers ne servent jamais de source.

## 3. Choix techniques

| Sujet | Choix | Pourquoi |
|---|---|---|
| Type d'application | Site web statique installable sur téléphone (PWA), fonctionne hors connexion | Pas de serveur à payer, utilisable avec une connexion faible |
| Langages | HTML, CSS, JavaScript (modules ES), sans framework ni étape de compilation | Simple à comprendre, à modifier et à héberger |
| Calculs | Fonctions pures dans `src/calc/`, une par impôt | Testables, réutilisables, indépendantes de l'affichage |
| Barèmes | Un fichier `data/baremes-2026.json`, chaque valeur avec son article | Mise à jour annuelle sans toucher au code |
| Tests | `node --test` (intégré à Node.js, aucune dépendance) | Chaque calcul vérifié contre des exemples du Code |
| Hébergement | GitHub Pages (gratuit) | Lien public stable, mises à jour par simple publication |
| Langues | Fichiers `src/i18n/fr.json`, `en.json`, `mg.json` pour l'interface ; textes `{ fr, en, mg }` dans les fiches et les données | Les traductions se relisent sans toucher au code |
| Navigation | Liens à dièse : `#/` (accueil), `#/irsa` (fiche), `#/irsa/calculer`, `#/irsa/declarer`, `#/irsa/sanctions` (`src/routes.js`) | Chaque fiche et chaque onglet a un lien partageable, sans serveur |
| Serveur local | `npm start` lance `scripts/serveur.js` (Node, sans dépendance) | Fonctionne sans connexion ni téléchargement |

## 4. Inventaire complet

### 4.1 Livre I · Impôts d'État

| # | Impôt | Code des impôts | Code des procédures fiscales | Outil prévu | Phase |
|---|---|---|---|---|---|
| 1 | Impôt sur les revenus (IR) | Partie I, Titre I, Sous-titre I | Titre I, ST II, Chap. I | Calculateur + minimum de perception | 1 |
| 2 | Redevance et impôt direct sur les hydrocarbures (IDH) | Partie I, Titre I, ST II | Titre I, ST II, Chap. II | Fiche | 1 |
| 3 | Impôt sur les revenus des marchés (IRM), 8 % | Partie I, Titre I, ST III | Titre I, ST II, Chap. III | Calculateur | 1 |
| 4 | Impôt synthétique (IS) | Partie I, Titre II | Titre I, ST II, Chap. IV | Calculateur | 1 |
| 5 | Impôt sur les revenus salariaux (IRSA) | Partie I, Titre III | Titre I, ST II, Chap. V | Calculateur (droit commun + régime spécial) | 1 |
| 6 | Impôt sur les revenus des capitaux mobiliers (IRCM) | Partie I, Titre IV | Titre I, ST II, Chap. VI | Calculateur | 1 |
| 7 | Impôt sur les plus-values immobilières (IPVI) | Partie I, Titre V | Titre I, ST II, Chap. VII | Calculateur | 1 |
| 8 | Droits d'enregistrement des actes et mutations | Partie II, SP I, Chap. I à III | Titre I, ST II, Chap. VIII | Simulateurs : vente d’immeuble, bail, cession de parts, succession et donation (fait) | 2 |
| 9 | Droits de timbre | Partie II, SP I, Chap. V | Titre I, ST II, Chap. VIII | Barème des visas consultable + droits sur les armes (fait) | 2 |
| 10 | Taxe sur les contrats d'assurance | Partie II, SP I, Chap. VI | Titre I, ST II, Chap. IX | Calculateur avec TACAVA (fait) | 2 |
| 11 | Taxe sur les véhicules à moteur | Partie II, SP II | Titre I, ST II, Chap. IX bis | Calculateur : puissance, énergie, âge ; forfaits bateaux et aéronefs (fait) | 2 |
| 12 | Taxe sur la valeur ajoutée (TVA) | Partie VI, Titre I | Titre I, ST II, Chap. XI | Calculateur HT/TTC + déclaration mensuelle (fait) | 2 |
| 13 | Droit d'accises (DA) | Partie III, Titre I + annexe | Titre II | Recherche par produit (nom ou code) + calcul : 181 lignes extraites par `scripts/extraire-accises.js` vers `data/accises-2026.json` (fait) | 3 |
| 14 | Taxe spéciale alcools et tabacs | Partie III, Titre II, Chap. I | CDI 03.02.04 | Calcul par produit, rhum au litre d’alcool pur (fait) | 3 |
| 15 | Prélèvement sur produits alcooliques | Partie III, Titre II, Chap. II | Titre I, ST II, Chap. X (I-103) | Calcul au litre, export déduit (fait) | 3 |
| 16 | Taxe sur les transactions mobiles | Partie III, Titre II, Chap. IV | Titre I, ST II, Chap. X (I-103 bis) | Calcul sur les frais de l’opérateur (fait) | 3 |

### 4.2 Livre II · Impôts locaux

| # | Impôt | Code des impôts | Code des procédures fiscales | Outil prévu |
|---|---|---|---|---|
| 17 | Impôt foncier sur les terrains (IFT) | Titre I | Chap. XII | 6 catégories ; tarif par hectare voté, 1 % en catégorie 6, minimum 2 000 Ar (fait) |
| 18 | Impôt foncier sur la propriété bâtie (IFPB) | Titre II | Chap. XIII | Valeur locative selon l’usage, 5 %, minimum 5 000 Ar (fait) |
| 19 | Taxe de protection civile | Titre III | Chap. XIV | Calcul : chiens, animaux, armes blanches ; tarifs plafonnés, forfait professionnel (fait) |
| 20 | Taxe de résidence pour le développement | Titre IV | Chap. XV | Calcul : tarif plafonné à 5 000 Ar, demi-tarif (fait) |
| 21 | Taxe de séjour | Titre V | Chap. XVI | Calcul par nuitée, plafonds par catégorie (fait) |
| 22 | Impôt de licence (alcools et autres) | Titre VI | Titre III | Calcul : alcool (fourchette par catégorie de commune), foraine, nuit, tombola (fait) |
| 23 | Taxe annuelle sur les appareils automatiques | Titre VII | Chap. XVII | Calcul, demi-tarif au second semestre (fait) |
| 24 | Taxe sur les eaux minérales | Titre VIII | Chap. XVIII | Calcul au litre, plafond 20 Ar (fait) |
| 25 | Taxe sur la publicité | Titre IX | Chap. XIX | Calcul : affiches, panneaux, audiovisuel et presse (fait) |
| 26 | Taxe sur l'eau et/ou l'électricité | Titre X | — (CDI 10.10.05) | Calcul : 10 % de la facture HT (fait) |
| 27 | Taxe sur les fêtes, spectacles et manifestations | Titre XI | Chap. XX | Calcul : 5 % des places ou 3 % des recettes, cautionnement (fait) |
| 28 | Taxe sur les pylônes, relais, antennes ou mâts | Titre XII | Chap. XXI | Calcul : tarifs plafonnés par pylône et antenne (fait) |
| 29 | Taxe sur les jeux radiotélévisés | Titre XIII | — (CDI 10.13.04, 10.13.05) | Calcul par SMS et par appel (fait) |

Phase 4. Beaucoup de taux sont votés par chaque commune dans une fourchette légale ou sous un plafond. Le champ commun `champCommunal` (`src/ui.js`) affiche la règle du Code et son article, pré-remplit une valeur marquée « exemple », et prévient si la saisie sort des limites (testé sous un minimum et au-dessus d'un maximum). Le site ne contient aucun taux propre à une commune. Les fiches locales (`impotLocal: true`) utilisent la pénalité de retard du Livre II : 1 % par mois (art. 20.01.53.4).

### 4.3 Livre III et Code des procédures fiscales · Modules transversaux (phase 5)

| Module | Contenu | Références |
|---|---|---|
| Calendrier fiscal | Toutes les échéances, filtrables par impôt et par profil (salarié, IS, réel) | CPF Titre I |
| Sanctions | Pénalités de retard, amendes de défaut de dépôt, amendes pour inexactitude, taxation d'office | CDI Livre III Titre I (art. 20.01.52 et suivants), CPF Titre V Chap. IV |
| Immatriculation | NIF, carte fiscale, cessation, mise en veilleuse | CPF Titre I, ST I |
| Droit de communication | Qui déclare quoi, délais (10 jours dans le CPF 2026 ; 30 jours selon la LFR 2026, à confirmer : point 106) | CPF Titre IV |
| Contrôle fiscal | Contrôle sur pièces, vérification sur place, droits du contribuable | CPF Titre V |
| Réclamer | Procédure gracieuse, contentieux d'assiette, Commission fiscale, délais | CPF Titre VI |
| Payer | Avis d'imposition, déclaration spontanée, sursis de paiement, arrondi à la centaine | CPF Titres VII et VIII |
| Prescription | Délais de reprise par impôt | CPF Titre IX Chap. I |
| Quiz | Questions par chapitre, pour réviser ; chaque chiffre est relié au barème par un test (`data/quiz.json`) | Tous |
| Sources | Textes utilisés, date de mise à jour des barèmes, limites (`#/sources`) | — |

### 4.4 Livre IV et annexes (phase 6)

Fiches de consultation : zones et entreprises franches, régime des grands investissements miniers, conventions fiscales (France, Maurice, Canada, Maroc) et convention d'assistance administrative mutuelle.

## 5. La fiche impôt (gabarit commun)

Chaque impôt suit le même gabarit, en quatre onglets :

1. **Comprendre** : définition simple, qui paie, exonérations principales, un exemple de la vie courante.
2. **Calculer** : formulaire pré-rempli d'un exemple, résultat détaillé ligne par ligne, chaque ligne avec son article.
3. **Déclarer et payer** : qui déclare, où, avec quel formulaire, à quelle date (tiré du CPF).
4. **Sanctions** : ce qui se passe en cas de retard ou d'oubli, avec un simulateur relié au module Sanctions.

### Où vit chaque morceau (construit en phase 1)

| Morceau | Fichier | Contenu |
|---|---|---|
| Gabarit | `src/fiche.js` | En-tête, quatre onglets, onglets Déclarer et Sanctions communs à tous les impôts |
| Contenu d'un impôt | `src/fiches/<id>.js`, déclaré dans `src/fiches/index.js` | Textes Comprendre (trilingues, chacun avec son article), exemple de la vie courante, calculateur |
| Inventaire et statut | `data/impots.json` | Sigle, nom, références CDI et CPF, catégorie, phase, statut |
| Taux, seuils | `data/baremes-2026.json` | Chaque valeur avec son article ; les textes des fiches les reprennent par `{variable}` |
| Obligations du CPF | `data/obligations.json` | Par impôt : `qui`, `ou`, `document`, `quand` (avec `delai`), `sanctions` ; chaque élément a son article et un texte fr, en, mg |
| Calculs | `src/calc/<impot>.js` | Fonctions pures, testées dans `tests/` |
| Affichage commun | `src/ui.js` | Langue, formats d'ariary, lignes du ticket « avis d'imposition », champs |

Forme d'une fiche (`src/fiches/<id>.js`) :

```js
export default {
  id: 'irsa',
  variables: b => ({ taux: ... }),          // facultatif : valeurs du barème citées dans les textes
  comprendre: { definition, quiPaie, exonerations, aSavoir, exemple },
  monterCalculateur: (panneau, b) => {...}, // absent pour une fiche sans calculateur (IDH)
  impotExemple: b => ...,                   // pré-remplit le simulateur de sanctions
};
```

Pour ajouter un impôt : écrire `src/fiches/<id>.js`, l'ajouter à `src/fiches/index.js`, compléter `data/obligations.json`, puis ajouter les tests. Les tests vérifient que chaque texte existe dans les trois langues et porte un article.

Statut dans `data/impots.json` : `a-faire` → `calcul-teste` → `verifie` (fiche complète et validée).

## 6. Écrans

| Écran | Rôle |
|---|---|
| Accueil | Recherche en langage courant (« je loue une maison »), entrée par profil (salarié, créateur d'activité, propriétaire, étudiant), entrée par livre du Code |
| Fiche impôt | Les quatre onglets ci-dessus (fait en phase 1) |
| Calendrier | Échéances du mois en cours et à venir |
| Sanctions | Simulateur général retard et défaut de dépôt |
| Guides | Les procédures du CPF, pas à pas |
| Quiz | Révision par chapitre |
| Sources | Textes, date de mise à jour, limites |

Identité visuelle : celle de la version 1 (vert ravinala, résultat présenté comme un avis d'imposition, chiffres en police à chasse fixe), à conserver.

## 7. Règles de qualité

- Chaque calcul a au moins un test reprenant un exemple chiffré.
- Chaque ligne de résultat affiche son article.
- Arrondis : base IRSA à la centaine inférieure (art. 01.03.16), bénéfice IR et IDH au millier inférieur (art. 01.01.14, 01.01.39), base IS à la dizaine de milliers inférieure (art. 01.02.05), revenus IRCM au millier inférieur (art. 01.04.04), impôt à payer à la centaine inférieure (CPF art. VII-32, LFR 2026).
- Les points que le texte ne tranche pas sont notés dans `docs/A-VERIFIER.md`, avec le choix fait par l'application.
- Les traductions malgaches sont relues par un locuteur natif avant chaque mise en ligne.
- Un écran « Sources » indique la date de mise à jour des barèmes.

## 8. Corrections à reporter depuis la version 1

| Point | Version 1 (fausse) | Code 2026 |
|---|---|---|
| Seuil de l'impôt synthétique | moins de 200 M Ar | moins de 400 M Ar, option pour l'IR possible dès 200 M Ar (art. 01.02.02, 01.01.13) |
| 16 000 à 150 000 Ar | « minimum de perception » | acompte de début d'activité (art. 01.02.06) |
| Plancher de l'IS | — | 3 % du CA ; taux de 3 % pour les nouveaux adhérents des centres de gestion agréés (art. 01.02.05) |
| Minimum des pénalités de retard | 2 000 Ar | 10 000 Ar par impôt et par période (art. 20.01.53) |
| IRCM sur dividendes | 20 % du montant | abattement de 50 % sur les dividendes, revenus arrondis au millier inférieur (art. 01.04.04) |
| Minimum de l'IR | non appliqué | 500 000 Ar + 1 % du CA (agricole, artisanal, industriel, minier, hôtelier, touristique) ou 1 000 000 Ar + 1 % du CA (autres) (art. 01.01.14) |

Ces corrections sont déjà intégrées dans `src/calc/` et `data/baremes-2026.json`.

Corrections faites pendant la phase 1, en relisant les articles :

| Point | Avant (phase 0) | Code 2026 |
|---|---|---|
| Bénéfice IR | non arrondi | arrondi au millier d'ariary inférieur (art. 01.01.14 I-A) |
| Personnes à charge à l'IR | absent | réduction de 24 000 Ar par an et par personne, personnes physiques (art. 01.01.16) |
| Plancher de 3 % de l'IS | pouvait relever l'impôt au-dessus du montant avant réduction | limite seulement la réduction de 2 % (art. 01.02.05 bis) |
| Réduction IS | achats et salaires | aussi charges patronales, formation, santé, dons (art. 01.02.05 bis) |
| IPVI | 20 % d'une plus-value saisie librement | prix retenu ≥ valeur administrative, prix de revient forfaitaire de 75 %, donc plus-value = 25 % du prix (art. 01.05.04) |

Corrections et compléments faits pendant la phase 2 :

| Point | Avant | Code 2026 |
|---|---|---|
| Taux réduit de TVA sur le gaz butane | absent du barème | 10 % (art. 06.01.12) ; le taux de 5 % sur le riz vient de la LFR 2026 et reste à vérifier, le Code exonérant le riz (06.01.06, 21°) |
| Taxe sur les véhicules | « pas de chapitre dans le CPF » | CPF Titre I, ST II, Chap. IX bis : déclaration en ligne avant le 31 janvier, QR code (art. I-102 bis) |
| Droits de succession | — | tarif par héritier, perception suspendue (art. 02.03.25 I) |
| Timbre | « barème consultable » général | le tarif général est abrogé (art. 02.05.05) ; restent les visas et les armes à feu |

Points relevés pendant la phase 3 :

| Point | Avant | Code 2026 |
|---|---|---|
| Taxe sur les transactions mobiles | souvent présentée comme un pourcentage du montant envoyé | 5 % des **frais** hors taxes perçus par l’opérateur (art. 03.02.17) |
| Taxe spéciale | « alcools, tabacs, jeux » | les jeux de hasard n’ont plus de tarif dans l’article 03.02.02 ; seuls alcools et tabacs restent |
| « Sans être inférieur à » du tableau des accises | — | lu comme une valeur taxable minimale (CPF II-95) ; à confirmer (point 56 de `docs/A-VERIFIER.md`) |

Les données extraites automatiquement d’un texte (tableau des accises) passent par un script relançable, qui signale les lignes illisibles au lieu de les deviner ; chaque correction manuelle y est écrite avec sa raison.

Points relevés pendant la phase 4 :

| Point | Constat |
|---|---|
| Plafonds et fourchettes | La plupart des montants du Livre II sont des **maxima** votés par la commune ; seules la licence d'alcool (fourchette) et la licence foraine (minimum) ont un plancher |
| Pénalité des impôts locaux | Taux unique de 1 % par mois (art. 20.01.53.4), au lieu du barème par chiffre d'affaires |
| Autres licences (foires, billards…) | Plafonds exprimés en % d'un « minimum de l'impôt synthétique » sans montant dans le Code : non calculables |
| Deux taxes sans chapitre CPF | Eau et électricité, jeux radiotélévisés : obligations tirées du CDI |

## 9. Phases

| Phase | Contenu | Livrable |
|---|---|---|
| 0 | Socle : structure, barèmes, calculs de base corrigés, tests | Terminée |
| 1 | Impôts sur les revenus (n° 1 à 7) + accueil + gabarit de fiche | Terminée le 22 octobre 2026 : 7 fiches, 45 tests ; reste la relecture du malgache et des points « À vérifier » avant la première mise en ligne |
| 2 | Enregistrement, timbre, assurance, véhicules, TVA (n° 8 à 12) | Terminée le 22 octobre 2026 : 5 fiches, 64 tests au total, points « À vérifier » 30 à 50 |
| 3 | Impôts indirects (n° 13 à 16) | Terminée le 22 octobre 2026 : 4 fiches, 72 tests au total, points « À vérifier » 51 à 63 |
| 4 | Impôts locaux (n° 17 à 29) | Terminée le 23 octobre 2026 : 13 fiches, 89 tests au total, points « À vérifier » 64 à 89 ; les 29 impôts ont leur fiche |
| 5 | Modules CPF transversaux | Terminée le 23 octobre 2026 : calendrier par profil, sanctions, 6 guides, quiz (14 questions reliées au barème), écran Sources ; 105 tests au total, points « À vérifier » 90 à 109 |
| 6 | Régimes spécifiques et conventions | |
