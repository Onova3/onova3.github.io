import { arrondiInf } from './outils.js';

/**
 * Impôt synthétique annuel (CDI 01.02.02 à 01.02.05 bis).
 * La réduction de 2 % (01.02.05 bis) ne peut pas faire descendre l'impôt sous 3 % du CA ;
 * le plancher limite la réduction, il ne relève pas l'impôt au-dessus du montant avant réduction.
 * @param {object} d  { ca, achats = 0, chargesSalariales = 0, autresCharges = 0, tauxReduit = false }
 */
export function calculIS({ ca, achats = 0, chargesSalariales = 0, autresCharges = 0, tauxReduit = false }, b) {
  const s = b.impotSynthetique;
  const regime = ca >= s.seuilCA ? 'reel-obligatoire' : ca >= s.seuilOptionIR ? 'option-possible' : 'synthetique';
  const base = arrondiInf(ca, s.arrondiBase);
  const taux = tauxReduit ? s.tauxReduitCGA : s.taux;
  const brut = base * taux;
  const reduction = (achats + chargesSalariales + autresCharges) * s.reductionCharges;
  const plancher = ca * s.plancherCA;
  let impot = brut - reduction, plancherApplique = false;
  if (reduction > 0 && impot < Math.min(brut, plancher)) { impot = Math.min(brut, plancher); plancherApplique = true; }
  return { regime, base, taux, brut, reduction, plancher, plancherApplique, impot: arrondiInf(impot, b.penalites.arrondiImpot) };
}

/** Acompte de début d'activité (CDI 01.02.06) : montant fixe selon la catégorie (0 à 3). */
export const acompteDebutActivite = (categorie, b) => b.impotSynthetique.acomptesDebutActivite[categorie].montant;
