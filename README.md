# Kajy Hetra

Calculateurs et fiches de tous les impôts de Madagascar, selon le Code des impôts et le Code des procédures fiscales 2026. En français, anglais et malgache.

## Ouvrir le projet dans Claude Code

### Avec l'application de bureau (le plus simple)

1. Décompressez ce dossier `kajy-hetra` à un endroit facile à retrouver, par exemple dans `Documents`.
2. Installez l'application Claude pour [Windows ou macOS](https://code.claude.com/docs/en/desktop-quickstart) et connectez-vous. Claude Code demande un abonnement Pro, Max, Team ou Enterprise.
3. Cliquez sur l'onglet **Code** en haut de la barre latérale.
4. Sous la zone de saisie, choisissez l'environnement **Local**, puis **Open folder…** et sélectionnez le dossier `kajy-hetra`.
5. Écrivez votre première demande, par exemple :
   > Lis CLAUDE.md et docs/CONCEPTION.md, puis commence la phase 1 : construis l'accueil et la fiche IRSA.

### Avec le terminal

Installez Claude Code ([guide officiel](https://code.claude.com/docs/en/quickstart)) :

- macOS, Linux : `curl -fsSL https://claude.ai/install.sh | bash`
- Windows (PowerShell) : `irm https://claude.ai/install.ps1 | iex`

Puis :

```
cd chemin/vers/kajy-hetra
claude
```

## Pour tester les calculs

Installez [Node.js](https://nodejs.org) (version 18 ou plus récente), puis dans le dossier :

```
npm test
```

## Contenu

- `docs/CONCEPTION.md` : le dossier de conception (inventaire, écrans, phases).
- `CLAUDE.md` : les règles du projet, lues automatiquement par Claude Code.
- `data/baremes-2026.json` : tous les taux, avec leurs articles.
- `src/calc/` : les calculs (IRSA, IS, IR, IRM, IPVI, IRCM, TVA, pénalités).
- `codes/` : le Code des impôts et le Code des procédures fiscales 2026.

Outil pédagogique, pas un avis fiscal.
