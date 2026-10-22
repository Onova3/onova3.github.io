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

## IRM, IRCM, IPVI, IDH (étape 3)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 21 | Base de l'IRM : montant hors taxe ou toutes taxes | CDI 01.01.50 : « le montant du marché », sans précision | Le montant saisi est utilisé tel quel |
| 22 | Plus-values de cession mobilière (IRCM) : taux et calcul | CDI 01.04.02 6° (champ élargi par la LFR 2026) ; 01.04.04 ne prévoit d'abattement que pour les dividendes | Mentionnées dans la fiche ; pas de choix « plus-values » dans le calculateur (seuls intérêts, dividendes, ristournes sont demandés) |
| 23 | Taux de 10 % : seulement pour les distributions annuelles décidées par l'assemblée générale | CDI 01.04.04 | Appliqué à tout montant choisi comme « ristournes de coopérative » |
| 24 | Conventions fiscales (taux IRCM réduits pour les non-résidents) | CDI 01.04.04 : « sous réserve des Conventions » | Non prises en compte (prévues en phase 6) |
| 25 | IPVI : valeur administrative minimale | CDI 01.05.04 : fixée par texte réglementaire, absent des codes | Saisie libre par l'utilisateur |
| 26 | IPVI : arrondi de la plus-value | Aucun arrondi de base prévu au Titre V | Seul l'impôt est arrondi à la centaine (CPF VII-32) |
| 27 | IPVI : ancien calcul de la phase 0 | La phase 0 taxait une plus-value saisie librement ; l'art. 01.05.04 impose un prix de revient forfaitaire de 75 % | Corrigé : plus-value = 25 % du prix retenu |
| 28 | Redevance IDH : barème progressif par tranches ou taux unique selon la production | CDI 01.01.27 : « pour la tranche de production supérieure à… », mais la 1re ligne dit « pour une production inférieure ou égale à » | Barème seulement affiché, pas de calcul |
| 29 | IRM : abonnements, location d'immeubles et marchés à tranches restent à l'IRM même sous le seuil des bons de commande | CDI 01.01.46 | Signalé dans la fiche ; pas de seuil chiffré (le montant des « marchés de faible montant » est dans le Code des marchés publics) |

## TVA (phase 2, étape 1)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 30 | Riz : exonéré ou taux réduit de 5 % ? | CDI 06.01.06 21° exonère le riz ; `data/baremes-2026.json` reprend un taux de 5 % « riz » de la LFR 2026, dont le texte n'est pas dans le projet | Les deux sont affichés ; le taux de 5 % est proposé pour le riz. Vérifier la portée exacte dans la LFR (tout le riz ou « riz de luxe » ?) |
| 31 | Taux de 10 % sur le gaz butane | CDI 06.01.12 ; absent du barème avant cette étape | Ajouté au barème. Vérifier que la LFR 2026 ne l'a pas modifié |
| 32 | Seuil d'option de 200 M Ar pour la TVA | CDI 06.01.04 parle seulement d'option pour le régime du réel ; le seuil de 200 M Ar vient de l'option IR (01.01.13 I) | Présenté comme « possible notamment dès 200 M Ar » |
| 33 | Prorata de déduction (ventes taxables et exonérées mélangées) | CDI 06.01.17 2° a) et b) | Non calculé : le calculateur suppose que toute la TVA saisie est déductible |
| 34 | Taux réduits dans la déclaration mensuelle | CDI 06.01.12 | La déclaration ne propose que le taux normal et les exportations ; les ventes à 10 % ou 5 % passent par le convertisseur HT ↔ TTC |
| 35 | Arrondi de la TVA à payer | CPF VII-32 (LFR 2026) | Appliqué au solde à payer, pas au crédit |

## Droits d'enregistrement (phase 2, étape 2)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 36 | Suspension de la perception des droits de succession : depuis quand, jusqu'à quand ? | CDI 02.03.25 I : « La perception des droits sur la déclaration de succession […] est suspendue » | Tarif affiché pour information, 0 Ar à payer |
| 37 | Minimum de 20 000 Ar pour les cessions de parts et les donations | CDI 02.02.02 (dispositions communes) et 02.02.47 (mutations de meubles et immeubles) | Appliqué à tous les droits proportionnels |
| 38 | Arrondi du droit à la centaine | CPF VII-32 vise « impôts, droits et taxes » | Appliqué ; base arrondie au millier (02.01.05) |
| 39 | Valeur administrative et « table financière » des parts | Fixées par voie réglementaire (02.01.05, 02.02.43) | Saisie libre par l'utilisateur |
| 40 | Bail à usage mixte | CDI 02.02.12 : 2 % sauf ventilation des loyers d'habitation dans le contrat | Le calculateur propose 1 % ou 2 % ; pas de ventilation |
| 41 | Cas non calculés | Crédit-bail (droit fixe), bail emphytéotique, ventes de meubles et de véhicules (5 % ou 2 %), fonds de commerce, échanges, partages, apports en société, droits fixes de 2 000 à 16 000 Ar | Mentionnés ou absents ; à ajouter si besoin |
| 42 | Délai de dépôt pour une donation | CPF I-34 III vise les actes de notaire (2 mois) ; aucune règle propre aux donations n'a été relevée | Pas de délai spécifique affiché |

## Timbre, assurance, véhicules (phase 2, étape 3)

| # | Point | Texte | Choix actuel de l'application |
|---|---|---|---|
| 43 | Tableau TVM recopié depuis le texte extrait | CDI 02.09.06 ; le PDF n'a pas pu être affiché pour comparaison | 5 cases testées ; à comparer ligne par ligne avec le PDF (page 84 du Code) |
| 44 | Âge du véhicule : « n'excède pas cinq ans », « plus de cinq ans à dix ans inclus » | CDI 02.09.06, âge au premier jour de la période d'imposition | Calculé en mois depuis le mois de première mise en circulation ; 60 mois exactement = tranche « 5 ans ou moins » |
| 45 | Motos : correspondance entre cylindrée et classe de puissance | Le tableau met CV et cm³ sur la même ligne ; aucune ligne cm³ pour « plus de 15 CV » | Les deux sont affichés ensemble dans le choix de classe |
| 46 | Véhicules ferroviaires et utilitaires lourds | CDI 02.09.02 les cite, sans tarif propre | Traités avec le tableau général selon leur puissance |
| 47 | Demi-tarif des visas pour les visas « transformables » (182 000 et 325 000 Ar) | CDI 02.05.06 : le demi-tarif vise « les tarifs ci-dessus », les deux visas transformables sont cités après | Pas de demi-tarif pour ces deux visas |
| 48 | Taxe d'assurance : arrondi à la centaine | CPF VII-32 | Appliqué séparément à la taxe et à la TACAVA |
| 49 | TACAVA : « voitures particulières » appartenant à un particulier | CDI 02.06.17, 02.06.18 (exonération si transport public ou personne morale) | Case à cocher laissée au choix de l'utilisateur |
| 50 | Amende de l'article 20.01.54 pour la TVM | CDI 02.09.07 renvoie à 20.01.54, non encore lu en détail | Mentionnée sans montant ; le simulateur de sanctions commun reste celui de 20.01.52 et 20.01.53 |
