import { arrondiInf } from './outils.js';

/**
 * IR annuel (CDI 01.01.14 I-A) avec réduction pour personnes à charge (01.01.16) et minimum de perception.
 * @param {object} d { benefice, caHT, categorie: 'activitesProductives'|'autres'|'petrolieres'|'carburantDetail',
 *                     personnesACharge = 0 (personnes physiques seulement) }
 */
export function calculIR({ benefice, caHT, categorie = 'autres', personnesACharge = 0 }, b) {
  const ir = b.ir;
  const base = arrondiInf(Math.max(0, benefice), ir.arrondiBase);
  const calcule = base * ir.taux;
  const reduction = Math.min(calcule, personnesACharge * ir.reductionParPersonneACharge);
  const m = ir.minimum[categorie];
  const minimum = m.fixe + caHT * m.tauxCA;
  const minimumApplique = calcule - reduction < minimum;
  return { base, calcule, reduction, minimum, minimumApplique,
    impot: arrondiInf(Math.max(calcule - reduction, minimum), b.penalites.arrondiImpot) };
}