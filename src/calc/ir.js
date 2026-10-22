import { arrondiInf } from './outils.js';

/**
 * IR annuel (CDI 01.01.14) avec minimum de perception.
 * @param {object} d { benefice, caHT, categorie: 'activitesProductives'|'autres'|'petrolieres'|'carburantDetail' }
 */
export function calculIR({ benefice, caHT, categorie = 'autres' }, b) {
  const ir = b.ir;
  const calcule = Math.max(0, benefice) * ir.taux;
  const m = ir.minimum[categorie];
  const minimum = m.fixe + caHT * m.tauxCA;
  const minimumApplique = calcule < minimum;
  return { calcule, minimum, minimumApplique, impot: arrondiInf(Math.max(calcule, minimum), b.penalites.arrondiImpot) };
}

/** IRM : 8 % du montant du marché (CDI 01.01.51). */
export const calculIRM = (montant, b) => ({ taux: b.irm.taux, impot: arrondiInf(montant * b.irm.taux, b.penalites.arrondiImpot) });

/** IPVI : 20 % de la plus-value imposable (CDI 01.05.07). */
export const calculIPVI = (plusValue, b) => ({ taux: b.ipvi.taux, impot: arrondiInf(Math.max(0, plusValue) * b.ipvi.taux, b.penalites.arrondiImpot) });
