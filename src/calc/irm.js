import { arrondiInf } from './outils.js';

/** IRM : taux fixe sur le montant du marché encaissé (CDI 01.01.49 à 01.01.51). */
export const calculIRM = (montant, b) => ({ taux: b.irm.taux, impot: arrondiInf(montant * b.irm.taux, b.penalites.arrondiImpot) });
