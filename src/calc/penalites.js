import { arrondiInf } from './outils.js';

/**
 * Pénalités de retard (CDI 20.01.53) et amende de défaut de dépôt (CDI 20.01.52, LFR 2026).
 * @param {object} d { impot, moisRetard, ca, defautDepot = false }
 */
export function calculPenalites({ impot, moisRetard, ca, defautDepot = false }, b) {
  const p = b.penalites;
  const mois = Math.max(1, Math.ceil(moisRetard)); // tout mois commencé est dû
  const regle = p.retard.find(r => ca >= r.caMin);
  let interets = impot > 0 ? impot * (regle.premierMois + (mois - 1) * regle.moisSuivants) : 0;
  const minimumApplique = impot > 0 && interets < p.minimumRetard;
  if (minimumApplique) interets = p.minimumRetard;
  const amende = defautDepot ? p.amendeDefautDepot.find(a => ca >= a.caMin).montant : 0;
  return { regle, interets: arrondiInf(interets, p.arrondiImpot), minimumApplique, amende,
    total: arrondiInf(impot + interets + amende, p.arrondiImpot) };
}
