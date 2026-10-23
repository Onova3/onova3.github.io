// Usage quotidien : favoris, fiches consultées récemment et historique des calculs.
// Fonctions pures sur des listes ; l'écriture sur le téléphone passe par src/stockage.js (voir creerMemoire).

export const MAX_RECENTS = 6;
export const MAX_HISTORIQUE = 20;

/** Ajoute ou retire une fiche des favoris. */
export const basculerFavori = (favoris, id) => (favoris.includes(id) ? favoris.filter(x => x !== id) : [...favoris, id]);

/** Met la fiche en tête des consultations récentes, sans doublon. */
export const ajouterRecent = (recents, id, max = MAX_RECENTS) => [id, ...recents.filter(x => x !== id)].slice(0, max);

const memesValeurs = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Ajoute un calcul en tête de l'historique. Un calcul identique (même fiche, mêmes valeurs) remonte au lieu d'être dupliqué.
 * @param {object[]} historique
 * @param {{fiche: string, mode?: string|null, valeurs: object, libelle: string, total: string, date: string}} calcul
 */
export function ajouterCalcul(historique, calcul, max = MAX_HISTORIQUE) {
  const autres = historique.filter(h => !(h.fiche === calcul.fiche && h.mode === calcul.mode && memesValeurs(h.valeurs, calcul.valeurs)));
  return [calcul, ...autres].slice(0, max);
}

/** Lit les champs d'un formulaire de calcul : { id: valeur } (cases à cocher en vrai/faux). */
export function lireValeurs(racine) {
  const v = {};
  racine.querySelectorAll('input[id], select[id]').forEach(e => { v[e.id] = e.type === 'checkbox' ? e.checked : e.value; });
  return v;
}

/** Remet des valeurs enregistrées dans un formulaire et relance le calcul. */
export function remettreValeurs(racine, valeurs) {
  for (const [id, val] of Object.entries(valeurs)) {
    const e = racine.querySelector('#' + CSS.escape(id));
    if (!e) continue;
    if (e.type === 'checkbox') e.checked = Boolean(val); else e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    if (e.classList.contains('money')) e.dispatchEvent(new Event('blur')); // remet les espaces des milliers
  }
}

/** Accès aux listes mémorisées, au travers du module unique de stockage. */
export function creerMemoire(stockage) {
  const lire = cle => { const v = stockage.lireJSON(cle, []); return Array.isArray(v) ? v : []; };
  let aRestaurer = null;
  return {
    favoris: () => lire('favoris'),
    estFavori: id => lire('favoris').includes(id),
    basculerFavori(id) { const f = basculerFavori(lire('favoris'), id); stockage.ecrireJSON('favoris', f); return f.includes(id); },
    recents: () => lire('recents'),
    noterConsultation: id => stockage.ecrireJSON('recents', ajouterRecent(lire('recents'), id)),
    historique: () => lire('historique'),
    noterCalcul: calcul => stockage.ecrireJSON('historique', ajouterCalcul(lire('historique'), calcul)),
    effacerHistorique: () => stockage.ecrireJSON('historique', []),
    /** Calcul à rouvrir au prochain affichage de sa fiche. */
    preparerRestauration: calcul => { aRestaurer = calcul; },
    prendreRestauration: fiche => { const c = aRestaurer?.fiche === fiche ? aRestaurer : null; aRestaurer = null; return c; },
  };
}
