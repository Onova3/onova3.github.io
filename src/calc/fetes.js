/**
 * Taxe sur les fêtes, spectacles et manifestations (CDI 10.11.05, 10.11.06) : taux selon le type,
 * sur le prix des places vendues ou sur les recettes brutes ; cautionnement provisoire sur les billets mis en vente (CPF I-120).
 * @param {object} d { type, montant, billetsMisEnVente = 0 }
 */
export function calculFetes({ type, montant, billetsMisEnVente = 0 }, b) {
  const t = b.fetes.types.find(x => x.id === type);
  return { type: t, impot: montant * t.taux, cautionnement: billetsMisEnVente * b.fetes.cautionnement };
}
