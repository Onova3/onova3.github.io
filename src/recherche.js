// Recherche d'impôts par sigle, par nom ou par mot courant (data/mots-courants.json). Fonctions pures.

/** Minuscules sans accents : « Salarié » et « salarie » se retrouvent. */
export const normaliser = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').trim();

/**
 * @param {object[]} impots  inventaire (data/impots.json)
 * @param {{mots: {fr: string[], en: string[], mg: string[]}, impots: string[]}[]} motsCourants
 * @param {string} q  recherche saisie
 * @returns {object[]} impôts trouvés, dans l'ordre de l'inventaire
 */
export function rechercher(impots, motsCourants, q) {
  const r = normaliser(q);
  if (!r) return impots;
  const parMot = new Set(motsCourants
    .filter(m => Object.values(m.mots).flat().some(mot => normaliser(mot).includes(r) || (r.length >= 4 && r.includes(normaliser(mot)))))
    .flatMap(m => m.impots));
  return impots.filter(i => parMot.has(i.id) || [i.sigle, i.nom.fr, i.nom.en, i.nom.mg].some(s => normaliser(s).includes(r)));
}
