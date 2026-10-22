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
