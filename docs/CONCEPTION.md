# Kajy Hetra — Dossier de conception

Version 0.2 · 22 octobre 2026 (fin de la phase 1)

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
| 8 | Droits d'enregistrement des actes et mutations | Partie II, SP I, Chap. I à III | Titre I, ST II, Chap. VIII | Simulateurs : vente, bail, cession de parts, succession | 2 |
| 9 | Droits de timbre | Partie II, SP I, Chap. V | Titre I, ST II, Chap. VIII | Barème consultable | 2 |
| 10 | Taxe sur les contrats d'assurance | Partie II, SP I, Chap. VI | Titre I, ST II, Chap. IX | Calculateur | 2 |
| 11 | Taxe sur les véhicules à moteur | Partie II, SP II | — | Calculateur | 2 |
| 12 | Taxe sur la valeur ajoutée (TVA) | Partie VI, Titre I | Titre I, ST II, Chap. XI | Calculateur HT/TTC + déclaration mensuelle | 2 |
| 13 | Droit d'accises (DA) | Partie III, Titre I + annexe | Titre II | Recherche par produit | 3 |
| 14 | Taxe spéciale alcools, tabacs, jeux | Partie III, Titre II, Chap. I | Titre I, ST II, Chap. X | Fiche + calcul | 3 |
| 15 | Prélèvement sur produits alcooliques | Partie III, Titre II, Chap. II | Titre I, ST II, Chap. X | Fiche + calcul | 3 |
| 16 | Taxe sur les transactions mobiles | Partie III, Titre II, Chap. IV | Titre II | Calculateur | 3 |

### 4.2 Livre II · Impôts locaux

| # | Impôt | Code des impôts | Code des procédures fiscales | Outil prévu |
|---|---|---|---|---|
| 17 | Impôt foncier sur les terrains (IFT) | Titre I | Chap. XII | Calculateur |
| 18 | Impôt foncier sur la propriété bâtie (IFPB) | Titre II | Chap. XIII | Calculateur |
| 19 | Taxe de protection civile | Titre III | Chap. XIV | Fiche |
| 20 | Taxe de résidence pour le développement | Titre IV | Chap. XV | Fiche |
| 21 | Taxe de séjour | Titre V | Chap. XVI | Calculateur |
| 22 | Impôt de licence (alcools et autres) | Titre VI | Titre III | Fiche |
| 23 | Taxe annuelle sur les appareils automatiques | Titre VII | Chap. XVII | Fiche |
| 24 | Taxe sur les eaux minérales | Titre VIII | Chap. XVIII | Fiche |
| 25 | Taxe sur la publicité | Titre IX | Chap. XIX | Fiche |
| 26 | Taxe sur l'eau et/ou l'électricité | Titre X | — | Fiche |
| 27 | Taxe sur les fêtes, spectacles et manifestations | Titre XI | Chap. XX | Fiche |
| 28 | Taxe sur les pylônes, relais, antennes ou mâts | Titre XII | Chap. XXI | Fiche |
| 29 | Taxe sur les jeux radiotélévisés | Titre XIII | — | Fiche |

Phase 4. Beaucoup de taux sont votés par chaque commune dans une fourchette légale : l'outil affiche la fourchette et laisse saisir le taux local.

### 4.3 Livre III et Code des procédures fiscales · Modules transversaux (phase 5)

| Module | Contenu | Références |
|---|---|---|
| Calendrier fiscal | Toutes les échéances, filtrables par impôt et par profil (salarié, IS, réel) | CPF Titre I |
| Sanctions | Pénalités de retard, amendes de défaut de dépôt, amendes pour inexactitude, taxation d'office | CDI Livre III Titre I (art. 20.01.52 et suivants), CPF Titre V Chap. IV |
| Immatriculation | NIF, carte fiscale, cessation, mise en veilleuse | CPF Titre I, ST I |
| Droit de communication | Qui déclare quoi, délais (30 jours depuis la LFR 2026) | CPF Titre IV |
| Contrôle fiscal | Contrôle sur pièces, vérification sur place, droits du contribuable | CPF Titre V |
| Réclamer | Procédure gracieuse, contentieux d'assiette, Commission fiscale, délais | CPF Titre VI |
| Payer | Avis d'imposition, déclaration spontanée, sursis de paiement, arrondi à la centaine | CPF Titres VII et VIII |
| Prescription | Délais de reprise par impôt | CPF Titre IX Chap. I |
| Quiz | Questions par chapitre, pour réviser | Tous |

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

## 9. Phases

| Phase | Contenu | Livrable |
|---|---|---|
| 0 | Socle : structure, barèmes, calculs de base corrigés, tests | Terminée |
| 1 | Impôts sur les revenus (n° 1 à 7) + accueil + gabarit de fiche | Terminée le 22 octobre 2026 : 7 fiches, 45 tests ; reste la relecture du malgache et des points « À vérifier » avant la première mise en ligne |
| 2 | Enregistrement, timbre, assurance, véhicules, TVA (n° 8 à 12) | |
| 3 | Impôts indirects (n° 13 à 16) | |
| 4 | Impôts locaux (n° 17 à 29) | |
| 5 | Modules CPF transversaux | |
| 6 | Régimes spécifiques et conventions | |
