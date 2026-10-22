import { arrondiInf } from './outils.js';

/**
 * Impôt synthétique annuel (CDI 01.02.02 à 01.02.05 bis).
 * @param {object} d  { ca, achats = 0, chargesSalariales = 0, tauxReduit = false }
 */
export function calculIS({ ca, achats = 0, chargesSalariales = 0, tauxReduit = false }, b) {
  const s = b.impotSynthetique;
  const regime = ca >= s.seuilCA ? 'reel-obligatoire' : ca >= s.seuilOptionIR ? 'option-possible' : 'synthetique';
  const base = arrondiInf(ca, s.arrondiBase);
  const taux = tauxReduit ? s.tauxReduitCGA : s.taux;
  const brut = base * taux;
  const reduction = (achats + chargesSalariales) * s.reductionCharges;
  const plancher = ca * s.plancherCA;
  let impot = brut - reduction, plancherApplique = false;
  if (impot < plancher) { impot = plancher; plancherApplique = true; }
  return { regime, base, taux, brut, reduction, plancher, plancherApplique, impot: arrondiInf(impot, b.penalites.arrondiImpot) };
}
