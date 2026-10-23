// Fin du droit de reprise de l'administration (CPF IX-02 à IX-14), fonction pure.

/** Règles : années ajoutées et point de départ (année de l'impôt, de l'exigibilité, de l'enregistrement, ou date de l'événement). */
export const REGLES = {
  revenus: { annees: 3, depart: 'annee', article: 'CPF IX-02, IX-03' },
  foncier: { annees: 3, depart: 'annee', article: 'CPF IX-04' },
  tva: { annees: 3, depart: 'annee', article: 'CPF IX-05' },
  indirects: { annees: 3, depart: 'annee', article: 'CPF IX-12' },
  enregistrement: { annees: 3, depart: 'annee', article: 'CPF IX-07' },
  successionNonDeclaree: { annees: 10, depart: 'date', article: 'CPF IX-08 a' },
  sansActe: { annees: 10, depart: 'date', article: 'CPF IX-09' },
  fluxIllicites: { annees: 10, depart: 'annee', article: 'CPF IX-14' },
};

/**
 * @param {string} regle  clé de REGLES
 * @param {string|number} depart  année (ex. 2025) ou date AAAA-MM-JJ selon la règle
 * @returns {string} date AAAA-MM-JJ jusqu'à laquelle l'administration peut agir
 */
export function finPrescription(regle, depart) {
  const r = REGLES[regle];
  if (r.depart === 'date') {
    const [a, m, j] = String(depart).split('-').map(Number);
    return `${a + r.annees}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
  }
  return `${Number(depart) + r.annees}-12-31`;
}
