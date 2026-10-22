import { arrondiInf } from './outils.js';

/**
 * Taxe spéciale sur les boissons alcooliques et les tabacs (CDI 03.02.02) : montant fixe par unité.
 * Rhum : l'unité est le litre d'alcool pur (LAP) = litres × degré ÷ 100.
 * @param {object} d { produit, quantite, degre = 0 }  quantite dans l'unité du produit (litres pour le rhum)
 */
export function calculTaxeSpeciale({ produit, quantite, degre = 0 }, b) {
  const p = b.taxeSpeciale.produits.find(x => x.id === produit);
  const unites = p.unite === 'lap' ? quantite * degre / 100 : quantite;
  const taxe = unites * p.montant;
  return { produit: p, unites, taxe, impot: arrondiInf(taxe, b.penalites.arrondiImpot) };
}
