// Touches Bauhaus, réservées aux moments forts (démarrage, présentation, états vides, quiz), jamais aux écrans de calcul.
// Toutes les formes viennent du logo : rectangle vert, rectangle noir, disque doré, quart ou demi-cercle vert, double trait noir.
// Les couleurs passent par des classes liées aux jetons de src/design.css (b-vert, b-noir, b-or), jamais par des valeurs en dur.

const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="b-${c}"/>`;
const disque = (cx, cy, r, c = 'or') => `<circle cx="${cx}" cy="${cy}" r="${r}" class="b-${c}"/>`;
/** Quart de cercle : centre (cx, cy), rayon r, ouvert vers le quadrant donné ('hd' haut-droite, 'hg', 'bd', 'bg'). */
const quart = (cx, cy, r, q, c = 'vert') => {
  const dx = q.includes('d') ? r : -r, dy = q.includes('h') ? -r : r;
  return `<path d="M${cx} ${cy}H${cx + dx}A${r} ${r} 0 0 ${q === 'hd' || q === 'bg' ? 0 : 1} ${cx} ${cy + dy}Z" class="b-${c}"/>`;
};
const demi = (cx, cy, r, c = 'vert') => `<path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" class="b-${c}"/>`;
const doubleTrait = (x, y, w, c = 'noir') => rect(x, y, w, 5, c) + rect(x, y + 10, w, 5, c);

/** Compositions sur une grille de 120 × 120 : le H du logo recomposé en grandes formes. */
export const COMPOSITIONS = {
  // Le H : colonne verte, colonne noire, disque doré au centre, double trait dessous.
  h: rect(22, 14, 18, 76, 'vert') + rect(80, 14, 18, 76, 'noir') + disque(60, 52, 15) + doubleTrait(22, 98, 76),
  // Calculer : la colonne verte s'élargit en bloc, le disque doré monte, le double trait souligne le total.
  calculer: rect(14, 30, 46, 60, 'vert') + rect(84, 14, 14, 76, 'noir') + disque(72, 28, 18) + doubleTrait(14, 98, 84),
  // Comprendre : demi-cercle vert comme une page ouverte, colonne noire, disque doré.
  comprendre: demi(44, 90, 32) + rect(90, 14, 14, 76, 'noir') + disque(26, 26, 12) + rect(48, 14, 30, 12, 'vert') + doubleTrait(12, 98, 92),
  // Hors connexion : quart de cercle vert, barre noire couchée, disque doré isolé.
  horsLigne: quart(14, 90, 64, 'hd') + rect(56, 18, 50, 14, 'noir') + disque(86, 62, 16) + doubleTrait(14, 98, 92),
  // États vides : petite composition calme.
  vide: quart(30, 92, 46, 'hd') + rect(84, 20, 12, 72, 'noir') + disque(62, 34, 12) + doubleTrait(20, 100, 76),
  // Quiz : deux colonnes et un disque, comme une question posée.
  quiz: rect(18, 22, 16, 68, 'vert') + disque(70, 44, 22) + rect(86, 70, 16, 20, 'noir') + doubleTrait(18, 98, 84),
};

/** SVG décoratif (caché aux lecteurs d'écran). */
export function composition(nom, { classe = '' } = {}) {
  return `<svg class="bauhaus${classe ? ' ' + classe : ''}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${COMPOSITIONS[nom]}</svg>`;
}
