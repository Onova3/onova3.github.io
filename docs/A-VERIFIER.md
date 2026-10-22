# À vérifier

Points que le texte des codes ne tranche pas clairement. L'application suit l'interprétation indiquée, à confirmer (DGI, enseignant, praticien).

## IRSA (étape 1)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 1 | Minimum de 3 000 Ar quand la base ne dépasse pas 350 000 Ar | CDI 01.03.16 : « sans toutefois être inférieur à Ar 3000 », sans condition écrite | Pas d'IRSA (0 Ar) si la base est ≤ 350 000 Ar ; minimum appliqué seulement au-delà |
| 2 | Régime spécial : minimum de 3 000 Ar et réduction pour personnes à charge | CDI 01.03.16 B ne dit rien | Ni minimum ni réduction en régime spécial |
| 3 | Liste des rémunérations du régime spécial | CDI 01.03.16 B renvoie à un arrêté, absent des codes | Liste non affichée ; simple renvoi à l'arrêté |
| 4 | Taux CNaPS et OSTIE (1 % + 1 %) et plafond de 2 400 000 Ar | Hors Code des impôts. CDI 01.03.09 ne fixe que des plafonds de déduction (10 % retraite, 2 % santé) | Valeurs de `data/baremes-2026.json`, signalées comme « à confirmer » à l'écran |
| 5 | Versement par bimestre des employeurs à l'impôt synthétique | CPF I-21 autorise le cumul par bimestre sans préciser la date limite | Affiché sans date précise |
| 6 | Nom du formulaire de déclaration IRSA | CPF I-23 : « formulaire prescrit par l'Administration » | Pas de nom de formulaire affiché |
| 7 | Chiffre d'affaires à retenir pour les pénalités d'un employeur sans CA (ONG, projet, administration) | CDI 20.01.53 : « chiffre d'affaires ou revenu » ; CDI 20.01.52 : 50 000 Ar pour les organismes sans but lucratif | Le simulateur demande un CA ; cas des organismes sans but lucratif non traité à part |
| 8 | LFR 2026 et IRSA | Aucun changement IRSA reporté dans `data/baremes-2026.json` | Barème LFI 2026 appliqué |
| 9 | Traductions malgaches | — | Toutes à relire par un locuteur natif (bandeau affiché en MG) |

## IS (étape 2)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 10 | Minima de l'impôt synthétique | CDI 01.02.05 : « minima fixés par textes réglementaires », proposés par les directions régionales ; aucun montant dans le Code | Aucun minimum appliqué. Les montants 16 000 à 150 000 Ar sont présentés comme acomptes de début d'activité (01.02.06), pas comme minima |
| 11 | Plancher de 3 % avec le taux réduit de 3 % | CDI 01.02.05 bis : impôt ≥ 3 % du CA ; la base est arrondie à la dizaine de milliers, donc 3 % de la base peut être un peu inférieur à 3 % du CA | Le plancher limite seulement les réductions ; il ne relève jamais l'impôt au-dessus du montant avant réduction |
| 12 | Plafonds des « autres charges » (formation 1 %, santé 5 % de la masse salariale) | CDI 01.02.05 bis | L'utilisateur saisit des montants déjà plafonnés ; l'application ne vérifie pas les plafonds |
| 13 | Abattement de 50 % (plafonné à 10 000 000 Ar) pour les adhérents des centres de gestion agréés | CDI 01.02.04 : conditions fixées par voie réglementaire | Mentionné, non calculé |
| 14 | Réduction sur les ventes facturées des producteurs de base, intermédiaires et artisans | CDI 01.02.05 bis | Mentionnée dans les obligations, non calculée à part |
| 15 | Option pour l'IR entre 200 et 400 M Ar | CDI 01.01.02 et 01.01.13 I : l'article 01.01.13 ajoute la condition d'états financiers certifiés par un expert-comptable | Condition affichée |

## IR (étape 2)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 16 | Ordre entre réduction pour personnes à charge et minimum de perception | CDI 01.01.16 ne dit pas si la réduction peut ramener l'impôt sous le minimum de 01.01.14 | Réduction d'abord, puis minimum : l'impôt ne descend jamais sous le minimum |
| 17 | Réduction pour personnes à charge réservée aux personnes physiques | CDI 01.01.16 : « personnes physiques soumises à l'IR » | Proposée seulement si « entreprise individuelle » est cochée |
| 18 | Minimum des transporteurs | CDI 01.01.14 I-A : fixé par texte réglementaire | Non proposé dans le calculateur |
| 19 | Régimes particuliers (non-résidents 10 %, associés-gérants de SARL, éducation et santé 10 %, exportateurs 3 %, réduction pour investissement) | CDI 01.01.14 I-C, II, III, V, VI | Mentionnés, non calculés |
| 20 | Pourcentages et montants cités dans les textes explicatifs (répartition de l'IS, plafonds 1 % et 5 %, abattement 10 000 000 Ar, seuils comptables 100 et 200 M Ar) | Articles cités à côté de chaque texte | Écrits dans les textes des fiches et non dans le barème, car ils ne servent à aucun calcul |
