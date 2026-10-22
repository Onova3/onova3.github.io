import { arrondiInf } from './outils.js';

/**
 * Valeur locative (CDI 10.02.06, 10.02.09).
 * - immeuble loué : loyers de l'année, sans descendre sous la valeur de la commission communale ;
 * - résidence principale du propriétaire, ou immeuble industriel d'une entreprise agréée (Loi sur le développement de l'industrie) :
 *   une part de la valeur de la commission ;
 * - majoration si la commune n'a pas révisé ses évaluations.
 * @param {object} d { usage: 'loue'|'residencePrincipale'|'industrielLDI', loyersAnnuels = 0, valeurCommission = 0, sansRevision = false }
 */
export function valeurLocative({ usage, loyersAnnuels = 0, valeurCommission = 0, sansRevision = false }, b) {
  const r = b.ifpb;
  const commission = valeurCommission * (sansRevision ? 1 + r.majorationSansRevision : 1);
  const vl = usage === 'loue' ? Math.max(loyersAnnuels, commission) : commission * r.partValeurLocativeReduite;
  return { commission, valeurLocative: vl, commissionAppliquee: usage === 'loue' && commission > loyersAnnuels };
}

/** Impôt foncier sur la propriété bâtie (CDI 10.02.10) : taux du Code sur la valeur locative, avec un minimum par immeuble. */
export function calculIFPB(d, b) {
  const r = b.ifpb, v = valeurLocative(d, b);
  const calcule = v.valeurLocative * r.taux;
  const minimumApplique = calcule < r.minimum;
  return { ...v, taux: r.taux, calcule, minimumApplique, impot: arrondiInf(Math.max(calcule, r.minimum), b.penalites.arrondiImpot) };
}
