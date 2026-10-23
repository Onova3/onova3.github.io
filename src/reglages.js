// Thème et taille du texte : fonctions pures, appliquées par app.js (et au démarrage par le petit script de index.html).

/** Thème réellement affiché : 'clair' ou 'sombre'. */
export const themeEffectif = (choix, systemeSombre) => (choix === 'auto' ? (systemeSombre ? 'sombre' : 'clair') : choix);

/** Attribut data-theme posé sur <html>, toujours présent : les couleurs de src/design.css ne sont définies qu'une fois par thème. */
export const attributTheme = (choix, systemeSombre) => (themeEffectif(choix, systemeSombre) === 'sombre' ? 'dark' : 'light');

/** Couleur de la barre du téléphone (meta theme-color), reprise des jetons --vert (clair) et --fond (sombre) de src/design.css. */
export const couleurBarre = effectif => (effectif === 'sombre' ? '#0C1412' : '#0B6E4F');

/** Taille de base du texte, en pourcentage de la taille choisie dans le téléphone. */
export const TAILLES = { normale: 100, grande: 112.5, tresGrande: 125 };
