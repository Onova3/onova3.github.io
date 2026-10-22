import { arrondiInf } from './outils.js';

/**
 * Taxe sur les contrats d'assurance (CDI 02.06.01, 02.06.02) et TACAVA (02.06.17).
 * Base : sommes stipulées au profit de l'assureur et accessoires (la prime).
 * @param {object} d { prime, categorie: 'navigation'|'incendiePro'|'incendieAutre'|'vie'|'renteViagere'|'autres', tacava = false }
 */
export function calculTaxeAssurance({ prime, categorie = 'autres', tacava = false }, b) {
  const a = b.assurance, arr = b.penalites.arrondiImpot;
  const taux = a.taux[categorie];
  const taxe = arrondiInf(prime * taux, arr);
  const annexe = tacava ? arrondiInf(prime * a.tacava, arr) : 0;
  return { taux, taxe, tacava: annexe, total: taxe + annexe, primeTTC: prime + taxe + annexe };
}
