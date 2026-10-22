/**
 * Tarif maximal d'une affiche sur papier selon sa surface (CDI 10.09.04 1° et 2°) :
 * paliers en décimètres carrés jusqu'à 2 m², puis un supplément par mètre carré ou fraction ; double si l'affiche est préparée.
 */
export function tarifAffiche(surfaceDm2, preparee, b) {
  const p = b.publicite;
  const palier = p.affiches.find(a => surfaceDm2 <= a.jusquaDm2);
  const base = palier ? palier.max : p.affiches.at(-1).max + Math.ceil((surfaceDm2 - p.affiches.at(-1).jusquaDm2) / 100) * p.afficheParM2AuDela;
  return base * (preparee ? p.multiplicateurAffichePreparee : 1);
}

/** Affiches sur papier : tarif unitaire × nombre (montants maximaux ; la commune peut voter moins). */
export function calculAffiches({ nombre, surfaceDm2, preparee = false }, b) {
  const unitaire = tarifAffiche(surfaceDm2, preparee, b);
  return { unitaire, impot: unitaire * nombre };
}

/** Panneaux peints ou lumineux (CDI 10.09.04 3° et 4°) : par mètre carré et par an (maximum), mètre carré entamé compté. */
export function calculPanneaux({ surfaceM2, lumineux = false }, b) {
  const tarif = lumineux ? b.publicite.lumineuseParM2An : b.publicite.panneauParM2An;
  return { tarif, impot: Math.ceil(surfaceM2) * tarif };
}

/** Publicité audiovisuelle ou presse écrite (CDI 10.09.08, 10.09.09) : taux sur les sommes HT hors commission d'agence. */
export function calculPubliciteMedia({ sommes, presse = false }, b) {
  const taux = presse ? b.publicite.presseTaux : b.publicite.audiovisuelTaux;
  return { taux, impot: sommes * taux };
}
