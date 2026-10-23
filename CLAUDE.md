# Hetrako

Application web trilingue (français, anglais, malgache) qui explique et calcule tous les impôts du Code des impôts de Madagascar, avec les obligations et sanctions du Code des procédures fiscales. Public : étudiants et jeunes.

Le propriétaire du projet débute avec Claude Code : réponds en français, explique simplement ce que tu fais, et propose l'étape suivante à la fin de chaque tâche.

## À lire avant toute tâche

- `docs/CONCEPTION.md` : inventaire des 29 impôts, gabarit de fiche, écrans, phases.
- `data/impots.json` : inventaire et statut de chaque impôt.
- `data/baremes-2026.json` : tous les taux, seuils et délais, chacun avec son article.

## Sources de vérité (dans cet ordre)

1. `codes/CDI-2026.txt` : Code des impôts suivant la LFI 2026 (texte extrait de `codes/CDI-LFI-2026.pdf`).
2. `codes/CPF-2026.txt` : Code des procédures fiscales suivant la LFI 2026 (texte extrait de `codes/CPF-LFI-2026.pdf`).
3. Loi n° 2026-004 (LFR 2026, 16 juillet 2026) : ses changements sont déjà reportés dans `data/baremes-2026.json` avec `"source": "LFR 2026"`. Les deux codes ci-dessus ne les contiennent pas encore.

Pour trouver un article : `grep -n "Article 01.03.16" codes/CDI-2026.txt`, puis lire les lignes autour.

## Règles

- Aucun taux, seuil ou délai sans article du Code. Jamais de chiffre venant d'un site tiers ou de mémoire.
- Les taux vivent dans `data/baremes-2026.json`, jamais en dur dans le code.
- Les calculs sont des fonctions pures dans `src/calc/`, une par impôt, qui reçoivent le barème en paramètre.
- Chaque nouveau calcul a des tests dans `tests/` avec des exemples chiffrés. Lancer `npm test` après chaque modification ; tous les tests doivent passer.
- Arrondis : base IRSA à la centaine inférieure, revenus IRCM au millier inférieur, base IS à la dizaine de milliers inférieure, impôt à payer à la centaine inférieure (CPF VII-32). Utiliser `arrondiInf` de `src/calc/outils.js`.
- Tout texte visible existe en `fr`, `en` et `mg`. Les noms malgaches sont marqués « à relire » tant qu'un locuteur natif ne les a pas validés.
- Pas de framework ni d'étape de compilation : HTML, CSS et JavaScript (modules ES). Le site doit fonctionner en fichiers statiques.
- Interface : reprendre l'identité de `prototype/v1-kajy-hetra.html` (vert, résultat présenté comme un avis d'imposition, montants en police à chasse fixe, utilisable au téléphone, thème clair et sombre).
- Après chaque impôt terminé, passer son `statut` à `verifie` dans `data/impots.json`.

## Commandes

- `npm test` : lance les tests des calculs (Node.js 18 ou plus récent).
- `npm start` : sert le site sur http://localhost:3000.

## Structure

```
codes/       textes officiels (PDF + texte extrait)
data/        barèmes et inventaire
docs/        dossier de conception
prototype/   version 1 (référence visuelle)
src/calc/    fonctions de calcul
src/i18n/    textes de l'interface (fr, en, mg)
tests/       tests des calculs
index.html   point d'entrée du site
```
