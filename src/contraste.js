// Rapport de contraste entre deux couleurs (règles WCAG 2.1), fonction pure. Sert aux tests du système de design.

const canal = c => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = hex => {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
};

/** @returns {number} rapport de 1 à 21 (4,5 minimum pour un texte courant, 3 pour un grand texte ou un élément graphique) */
export function contraste(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
