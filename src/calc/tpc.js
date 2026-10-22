/**
 * Taxe de protection civile (CDI 10.03.03) : tarifs votés par la commune, dans la limite des maxima du Code.
 * Éleveurs et marchands de chiens ou d'animaux dangereux, vendeurs d'armes blanches : forfait quel que soit le nombre.
 * @param {object} d { chiens = 0, animaux = 0, armes = 0, tarifChien, tarifAnimal, tarifArme, professionnel = false }
 */
export function calculTPC({ chiens = 0, animaux = 0, armes = 0, tarifChien, tarifAnimal, tarifArme, professionnel = false }, b) {
  if (professionnel) return { forfait: true, impot: b.tpc.forfaitProfessionnel };
  const lignes = { chiens: chiens * tarifChien, animaux: animaux * tarifAnimal, armes: armes * tarifArme };
  return { forfait: false, lignes, impot: lignes.chiens + lignes.animaux + lignes.armes };
}
