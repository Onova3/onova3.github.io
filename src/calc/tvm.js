/**
 * Âge d'un véhicule en mois au 1er janvier de l'année d'imposition (CDI 02.09.06),
 * à partir du mois de première mise en circulation (1 à 12).
 */
export const ageEnMois = (anneeMiseEnCirculation, moisMiseEnCirculation, anneeImposition) =>
  Math.max(0, (anneeImposition - anneeMiseEnCirculation) * 12 - (moisMiseEnCirculation - 1));

/** Tranche d'âge (0 à 3) : ≤ 5 ans, de plus de 5 à 10 ans, de plus de 10 à 20 ans, plus de 20 ans. */
export const trancheAge = (mois, b) => {
  const i = b.tvm.agesMaxMois.findIndex(max => mois <= max);
  return i === -1 ? b.tvm.agesMaxMois.length : i;
};

/**
 * Taxe annuelle sur un véhicule terrestre (CDI 02.09.06).
 * @param {object} d { classe: '1-4'|'5-9'|'10-12'|'13-15'|'16+', energie: 'essence'|'diesel'|'electrique'|'hybride',
 *                     anneeMiseEnCirculation, moisMiseEnCirculation = 1, anneeImposition }
 */
export function calculTVM({ classe, energie, anneeMiseEnCirculation, moisMiseEnCirculation = 1, anneeImposition }, b) {
  const mois = ageEnMois(anneeMiseEnCirculation, moisMiseEnCirculation, anneeImposition);
  const tranche = trancheAge(mois, b);
  return { ageMois: mois, tranche, taxe: b.tvm.tarifs[classe][energie][tranche] };
}

/** Bateaux et aéronefs : forfait annuel par appareil (CDI 02.09.06). */
export const calculTVMForfait = (type, b) => ({ plaisance: b.tvm.plaisance, maritime: b.tvm.autresEnginsMaritimes, aeronef: b.tvm.aeronef })[type];
