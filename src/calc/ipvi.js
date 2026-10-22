import { arrondiInf } from './outils.js';

/**
 * IPVI (CDI 01.05.04 et 01.05.07).
 * Prix retenu = prix de cession, sans pouvoir être inférieur à la valeur administrative ;
 * prix de revient fixé forfaitairement à un pourcentage du prix retenu ; plus-value = différence.
 * @param {object} d { prixCession, valeurAdministrative = 0 }
 */
export function calculIPVI({ prixCession, valeurAdministrative = 0 }, b) {
  const r = b.ipvi;
  const prixRetenu = Math.max(prixCession, valeurAdministrative);
  const prixRevient = prixRetenu * r.prixRevientForfaitaire;
  const plusValue = prixRetenu - prixRevient;
  return { prixRetenu, valeurAdministrativeAppliquee: valeurAdministrative > prixCession, prixRevient, plusValue,
    taux: r.taux, impot: arrondiInf(plusValue * r.taux, b.penalites.arrondiImpot) };
}
