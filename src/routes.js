// Liens partageables : #/ (accueil), #/irsa (fiche, onglet Comprendre), #/irsa/calculer, etc.
export const ONGLETS = ['comprendre', 'calculer', 'declarer', 'sanctions'];

export function lireRoute(hash = '') {
  const [id = '', onglet = ''] = hash.replace(/^#\/?/, '').split('/');
  if (!id) return { page: 'accueil' };
  return { page: 'fiche', id: id.toLowerCase(), onglet: ONGLETS.includes(onglet) ? onglet : 'comprendre' };
}

export const lien = (id, onglet = 'comprendre') => `#/${id}${onglet === 'comprendre' ? '' : '/' + onglet}`;
