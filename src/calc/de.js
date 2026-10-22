import { arrondiInf } from './outils.js';

/**
 * Droit proportionnel d'enregistrement (CDI 02.01.05, 02.02.02).
 * Base arrondie au millier inférieur ; minimum de perception si le droit calculé est plus faible.
 */
export function droitProportionnel(base, taux, b) {
  const e = b.enregistrement;
  const baseArrondie = arrondiInf(Math.max(0, base), e.arrondiBase);
  const calcule = baseArrondie * taux;
  const minimumApplique = calcule < e.minimumProportionnel;
  return { base: baseArrondie, taux, calcule, minimumApplique,
    impot: arrondiInf(Math.max(calcule, e.minimumProportionnel), b.penalites.arrondiImpot) };
}

/** Vente d'immeuble (CDI 02.02.39) : prix + charges, sans descendre sous la valeur administrative (02.01.05). */
export function droitVenteImmeuble({ prix, charges = 0, valeurAdministrative = 0 }, b) {
  const declare = prix + charges;
  return { declare, valeurAdministrativeAppliquee: valeurAdministrative > declare,
    ...droitProportionnel(Math.max(declare, valeurAdministrative), b.enregistrement.venteImmeuble, b) };
}

/**
 * Bail à durée limitée (CDI 02.02.12) : loyers cumulés sur toute la durée + charges du preneur.
 * Durée indéterminée (dureeMois = null) : un an de loyer.
 * @param {object} d { loyerMensuel, dureeMois = null, charges = 0, usage: 'habitation'|'autre'|'emphyteotique' }
 */
export function droitBail({ loyerMensuel, dureeMois = null, charges = 0, usage = 'habitation' }, b) {
  const mois = dureeMois ?? 12;
  return { mois, loyers: loyerMensuel * mois, ...droitProportionnel(loyerMensuel * mois + charges, b.enregistrement.bail[usage], b) };
}

/** Cession d'actions ou de parts sociales (CDI 02.02.43) : sur le prix ou la valeur réelle si elle est plus élevée (02.01.05). */
export function droitCessionParts({ prix, valeurReelle = 0 }, b) {
  return { valeurReelleAppliquee: valeurReelle > prix, ...droitProportionnel(Math.max(prix, valeurReelle), b.enregistrement.cessionParts, b) };
}

/**
 * Succession (CDI 02.03.25 I) : droit fixe par héritier selon le lien de parenté.
 * La perception est suspendue : l'impôt à payer est nul, le tarif est donné pour information.
 * @param {object} d { lien: 'directe'|'collaterale'|'autre', heritiers }
 */
export function droitSuccession({ lien = 'directe', heritiers = 1 }, b) {
  const s = b.enregistrement.succession;
  const tarif = s.parHeritier[lien] * heritiers;
  return { parHeritier: s.parHeritier[lien], tarif, suspendue: s.suspendue, impot: s.suspendue ? 0 : tarif };
}

/** Donation entre vifs (CDI 02.03.25 II) : 5 %, ou droit fixe par donataire en ligne directe descendante. */
export function droitDonation({ valeur, ligneDirecteDescendante = false, donataires = 1 }, b) {
  const d = b.enregistrement.donation;
  if (ligneDirecteDescendante) {
    const impot = d.ligneDirecteDescendanteParDonataire * donataires;
    return { fixe: true, parDonataire: d.ligneDirecteDescendanteParDonataire, impot };
  }
  return { fixe: false, ...droitProportionnel(valeur, d.taux, b) };
}
