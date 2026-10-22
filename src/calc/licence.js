/**
 * Impôt de licence de vente de boissons alcooliques (CDI 10.06.08) : tarif annuel voté par la commune dans une fourchette,
 * majoré pour les établissements de nuit, payé par trimestre et d'avance (tout trimestre commencé est dû).
 * @param {object} d { tarifAnnuel, etablissementNuit = false, trimestres = 4 }
 */
export function calculLicence({ tarifAnnuel, etablissementNuit = false, trimestres = 4 }, b) {
  const L = b.licence;
  const annuel = tarifAnnuel * (etablissementNuit ? 1 + L.majorationEtablissementNuit : 1);
  const parTrimestre = annuel / L.trimestres;
  return { annuel, parTrimestre, impot: parTrimestre * trimestres };
}

/** Licence foraine (CDI 10.06.09) : tarif par période de 24 heures, voté par la commune, avec un minimum. */
export const calculLicenceForaine = ({ jours, tarifParJour }) => ({ impot: jours * tarifParJour });

/** Autres licences calculables (CDI 10.06.81) : établissement de nuit (par mois), tombola (part des billets mis en vente). */
export const calculLicenceNuit = ({ mois, tarifParMois }) => ({ impot: mois * tarifParMois });
export const calculLicenceTombola = ({ billets, taux }) => ({ impot: billets * taux });
