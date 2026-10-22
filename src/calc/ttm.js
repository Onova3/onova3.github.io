import { arrondiInf } from './outils.js';

/** Taxe sur les transactions mobiles (CDI 03.02.17, 03.02.18) : taux sur les frais hors taxes perçus par l'établissement de monnaie électronique. */
export const calculTTM = (fraisHT, b) => ({ taux: b.ttm.taux, taxe: fraisHT * b.ttm.taux, impot: arrondiInf(fraisHT * b.ttm.taux, b.penalites.arrondiImpot) });
