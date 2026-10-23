// Logo Hetrako : symbole « H » dessiné sur une grille de 120 × 120, et nom « Hetrako ». Fonctions pures qui renvoient du SVG.
// Les deux colonnes sont la base et le taux ; les deux barres dorées, le double trait qui souligne un total.

export const COULEURS = { vert: '#0B6E4F', colonne: '#E6F2EC', or: '#F2B13C', vertClair: '#A9DCC4', noir: '#141414', blanc: '#FFFFFF', vertSombre: '#43C394', texteSombre: '#E6EEEA', texte: '#111412' };

export const GEOMETRIE = {
  carre: { x: 0, y: 0, width: 120, height: 120, rx: 26 },
  colonnes: [{ x: 28, y: 26, width: 12, height: 68, rx: 6 }, { x: 80, y: 26, width: 12, height: 68, rx: 6 }],
  barres: [{ x: 44, y: 50, width: 32, height: 7, rx: 3.5 }, { x: 44, y: 63, width: 32, height: 7, rx: 3.5 }],
};

/** Couleurs de chaque variante : fond du carré, colonnes, barres, texte du nom, « ko ». */
export const VARIANTES = {
  normale: { carre: COULEURS.vert, colonne: COULEURS.colonne, barre: COULEURS.or, nom: COULEURS.texte, ko: COULEURS.vert },
  surVert: { carre: COULEURS.vert, colonne: COULEURS.blanc, barre: COULEURS.or, nom: COULEURS.blanc, ko: COULEURS.vertClair },
  sombre: { carre: COULEURS.vert, colonne: COULEURS.colonne, barre: COULEURS.or, nom: COULEURS.texteSombre, ko: COULEURS.vertSombre },
  mono: { carre: COULEURS.noir, colonne: COULEURS.blanc, barre: COULEURS.blanc, nom: COULEURS.noir, ko: COULEURS.noir },
};

const rect = (r, fill) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="${r.rx}" fill="${fill}"/>`;

/** Dessin du symbole (sans balise <svg>), à placer dans une grille de 120 × 120. */
export function formesSymbole(variante = 'normale', { fond = true } = {}) {
  const v = VARIANTES[variante];
  return (fond ? rect(GEOMETRIE.carre, v.carre) : '')
    + GEOMETRIE.colonnes.map(c => rect(c, v.colonne)).join('')
    + GEOMETRIE.barres.map(b => rect(b, v.barre)).join('');
}

/** Symbole seul, carré. */
export function symbole({ variante = 'normale', taille = 40, titre = 'Hetrako' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${taille}" height="${taille}" role="img" aria-label="${titre}">${formesSymbole(variante)}</svg>`;
}

const POLICE = `font-family="Archivo, 'Segoe UI', system-ui, sans-serif" font-weight="800" letter-spacing="-2"`;

/**
 * Logo complet : symbole + nom, côte à côte ou empilés.
 * @param {{variante?: string, empile?: boolean, hauteur?: number}} options
 */
export function logo({ variante = 'normale', empile = false, hauteur = 40 } = {}) {
  const v = VARIANTES[variante];
  const nom = `<tspan fill="${v.nom}">Hetra</tspan><tspan fill="${v.ko}">ko</tspan>`;
  if (empile) {
    const largeur = 360, haut = 210;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${haut}" height="${hauteur}" role="img" aria-label="Hetrako">
      <g transform="translate(${(largeur - 120) / 2} 0)">${formesSymbole(variante)}</g>
      <text x="${largeur / 2}" y="196" text-anchor="middle" font-size="64" ${POLICE}>${nom}</text></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 120" height="${hauteur}" role="img" aria-label="Hetrako">
    ${formesSymbole(variante)}
    <text x="146" y="86" font-size="72" ${POLICE}>${nom}</text></svg>`;
}

/**
 * Logo pour les pages de l'application : symbole SVG + nom en texte HTML, coloré par la feuille de style
 * (thème clair ou sombre automatiquement). Classes : .logo, .logo--empile, .logo--sur-vert.
 */
export function logoHTML({ empile = false, surVert = false, taille = 40 } = {}) {
  const cls = ['logo', empile && 'logo--empile', surVert && 'logo--sur-vert'].filter(Boolean).join(' ');
  return `<span class="${cls}"><svg viewBox="0 0 120 120" width="${taille}" height="${taille}" aria-hidden="true">${formesSymbole(surVert ? 'surVert' : 'normale')}</svg><span class="logo-nom">Hetra<span class="ko">ko</span></span></span>`;
}
