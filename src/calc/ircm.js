import { arrondiInf } from './outils.js';

/**
 * IRCM (CDI 01.04.04).
 * @param {object} d { montant, nature: 'interets'|'dividendes'|'cooperative' }
 */
export function calculIRCM({ montant, nature = 'interets' }, b) {
  const r = b.ircm;
  const apresAbattement = nature === 'dividendes' ? montant * (1 - r.abattementDividendes) : montant;
  const base = arrondiInf(apresAbattement, r.arrondiBase);
  const taux = nature === 'cooperative' ? r.tauxCooperatives : r.taux;
  return { base, taux, impot: arrondiInf(base * taux, b.penalites.arrondiImpot) };
}
