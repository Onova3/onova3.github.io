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

/**
 * Pénalité de retard des impôts du Livre II (impôts locaux, CDI 20.01.53.4) : un taux par mois de retard,
 * tout mois commencé étant dû.
 */
export function calculPenalitesLocales({ impot, moisRetard }, b) {
  const p = b.penalites, mois = Math.max(1, Math.ceil(moisRetard));
  const interets = impot > 0 ? arrondiInf(impot * p.retardLivreII * mois, p.arrondiImpot) : 0;
  return { mois, interets, total: arrondiInf(impot + interets, p.arrondiImpot) };
}
