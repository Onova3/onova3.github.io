// Liens partageables : #/ (accueil), #/irsa (fiche, onglet Comprendre), #/irsa/calculer, etc.
// Modules transversaux : #/calendrier, #/calendrier/employeur…
export const ONGLETS = ['comprendre', 'calculer', 'declarer', 'sanctions'];
export const MODULES = ['calendrier', 'sanctions', 'guides'];

export function lireRoute(hash = '') {
  const [id = '', suite = ''] = hash.replace(/^#\/?/, '').split('/');
  if (!id) return { page: 'accueil' };
  const nom = id.toLowerCase();
  if (MODULES.includes(nom)) return { page: 'module', id: nom, sous: suite || null };
  return { page: 'fiche', id: nom, onglet: ONGLETS.includes(suite) ? suite : 'comprendre' };
}

export const lien = (id, onglet = 'comprendre') => `#/${id}${onglet === 'comprendre' ? '' : '/' + onglet}`;
export const lienModule = (id, sous = null) => `#/${id}${sous ? '/' + sous : ''}`;
