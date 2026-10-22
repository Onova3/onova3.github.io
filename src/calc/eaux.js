/**
 * Taxe sur les eaux minérales (CDI 10.08.03, 10.08.04) : par litre ou fraction de litre mis à la consommation en bouteille,
 * au tarif voté par la commune dans la limite du maximum. La fraction est appliquée au volume total déclaré.
 * @param {object} d { litres, tarifParLitre }
 */
export function calculEaux({ litres, tarifParLitre }) {
  const litresTaxes = Math.ceil(litres);
  return { litresTaxes, impot: litresTaxes * tarifParLitre };
}
