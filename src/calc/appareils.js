/**
 * Taxe annuelle sur les appareils automatiques (CDI 10.07.01 ; CPF I-114).
 * La première année, demi-tarif pour un appareil mis en service au second semestre.
 * @param {object} d { machinesASous = 0, autres = 0, secondSemestre = false }
 */
export function calculAppareils({ machinesASous = 0, autres = 0, secondSemestre = false }, b) {
  const a = b.appareils, k = secondSemestre ? a.demiTarifSecondSemestre : 1;
  const lignes = { machinesASous: machinesASous * a.machineASous * k, autres: autres * a.autre * k };
  return { lignes, impot: lignes.machinesASous + lignes.autres };
}
