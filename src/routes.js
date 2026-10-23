// Liens partageables : #/ (accueil), #/irsa (fiche, onglet Comprendre), #/irsa/calculer, etc.
// Écrans : #/impots, #/calendrier, #/apprendre, #/plus, et leurs sous-écrans (#/guides/payer, #/quiz/tva, #/sources…).
export const ONGLETS = ['comprendre', 'calculer', 'declarer', 'sanctions'];
export const MODULES = ['impots', 'calendrier', 'apprendre', 'plus', 'sanctions', 'guides', 'quiz', 'sources'];

/** Les 5 onglets de la barre de navigation, dans l'ordre. */
export const BARRE = ['accueil', 'impots', 'calendrier', 'apprendre', 'plus'];
const PARENT = { sanctions: 'apprendre', guides: 'apprendre', quiz: 'apprendre', sources: 'plus' };

export function lireRoute(hash = '') {
  const [id = '', suite = ''] = hash.replace(/^#\/?/, '').split('/');
  if (!id) return { page: 'accueil' };
  const nom = id.toLowerCase();
  if (MODULES.includes(nom)) return { page: 'module', id: nom, sous: suite || null };
  return { page: 'fiche', id: nom, onglet: ONGLETS.includes(suite) ? suite : 'comprendre' };
}

/** Onglet de la barre à mettre en évidence pour une route. Les fiches dépendent de l'onglet Impôts. */
export function ongletBarre(r) {
  if (r.page === 'accueil') return 'accueil';
  if (r.page === 'fiche') return 'impots';
  return PARENT[r.id] ?? r.id;
}

/** Lien de la flèche de retour, ou null pour un écran racine d'onglet. */
export function lienRetour(r) {
  if (r.page === 'fiche') return '#/impots';
  if (r.page !== 'module') return null;
  if (r.sous && r.id !== 'calendrier') return `#/${r.id}`;
  return PARENT[r.id] ? `#/${PARENT[r.id]}` : null;
}

export const lien = (id, onglet = 'comprendre') => `#/${id}${onglet === 'comprendre' ? '' : '/' + onglet}`;
export const lienModule = (id, sous = null) => `#/${id}${sous ? '/' + sous : ''}`;
