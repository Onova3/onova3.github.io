/**
 * Taxe de résidence pour le développement (CDI 10.04.04) : tarif voté par la commune, plafonné par le Code,
 * réduit de moitié pour l'un des époux et pour les personnes déjà soumises à l'IR, l'IS ou l'IRSA.
 * @param {object} d { tarif, demiTarif = false }
 */
export function calculTRD({ tarif, demiTarif = false }, b) {
  return { demiTarif, impot: demiTarif ? tarif * b.trd.demiTarif : tarif };
}
