/** TVA : conversion HT <-> TTC (CDI 06.01.12). */
export function calculTVA({ montant, taux, depuis = 'HT' }) {
  const ht = depuis === 'HT' ? montant : montant / (1 + taux);
  const tva = ht * taux;
  return { ht, tva, ttc: ht + tva };
}
