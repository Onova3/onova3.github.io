import { arrondiInf } from './outils.js';

/**
 * Impôt foncier sur les terrains (CDI 10.01.07).
 * Catégories 1 à 5 : tarif en Ar par hectare voté par la commune ; catégorie 6 : taux du Code sur la valeur vénale.
 * Minimum par taxation.
 * @param {object} d { categorie (1 à 6), hectares = 0, tarifParHa = 0, valeurVenale = 0 }
 */
export function calculIFT({ categorie, hectares = 0, tarifParHa = 0, valeurVenale = 0 }, b) {
  const r = b.ift;
  const calcule = categorie === 6 ? valeurVenale * r.tauxCategorie6 : hectares * tarifParHa;
  const minimumApplique = calcule < r.minimum;
  return { calcule, minimumApplique, impot: arrondiInf(Math.max(calcule, r.minimum), b.penalites.arrondiImpot) };
}
