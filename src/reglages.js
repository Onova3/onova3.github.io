// Thème et taille du texte : fonctions pures, appliquées par app.js (et au démarrage par le petit script de index.html).

/** Thème réellement affiché : 'clair' ou 'sombre'. */
export const themeEffectif = (choix, systemeSombre) => (choix === 'auto' ? (systemeSombre ? 'sombre' : 'clair') : choix);

/** Attribut data-theme posé sur <html> : absent en automatique pour laisser la feuille de style suivre le téléphone. */
export const attributTheme = choix => ({ clair: 'light', sombre: 'dark' })[choix] ?? null;

/** Couleur de la barre du téléphone (meta theme-color), reprise des variables --accent et --bg. */
export const couleurBarre = effectif => (effectif === 'sombre' ? '#0C1613' : '#0B6E4F');

/** Taille de base du texte, en pourcentage de la taille choisie dans le téléphone. */
export const TAILLES = { normale: 100, grande: 112.5, tresGrande: 125 };
