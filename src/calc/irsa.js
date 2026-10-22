import { arrondiInf } from './outils.js';

/**
 * IRSA mensuel, droit commun (CDI 01.03.16 et 01.03.19).
 * @param {number} brut  salaire brut mensuel en ariary
 * @param {object} b     bareme complet (data/baremes-2026.json)
 * @param {object} opts  { personnesACharge = 0, deduireCotisations = true }
 */
export function calculIRSA(brut, b, { personnesACharge = 0, deduireCotisations = true } = {}) {
  const c = b.cotisationsSociales, r = b.irsa;
  const assiette = Math.min(brut, c.plafond);
  const cnaps = deduireCotisations ? Math.round(assiette * c.cnapsSalarie) : 0;
  const ostie = deduireCotisations ? Math.round(assiette * c.ostieSalarie) : 0;
  const base = Math.max(0, arrondiInf(brut - cnaps - ostie, r.arrondiBase));

  const tranches = r.tranches.map(({ de, a, taux }) => {
    const montant = Math.max(0, Math.min(base, a ?? Infinity) - de);
    return { de, a, taux, montant, impot: montant * taux };
  });
  const bareme = tranches.reduce((s, t) => s + t.impot, 0);

  let impot = 0, reduction = 0, minimumApplique = false;
  if (base > r.tranches[0].a) {
    reduction = Math.min(bareme, personnesACharge * r.reductionParPersonneACharge);
    impot = bareme - reduction;
    if (impot < r.minimum) { impot = r.minimum; minimumApplique = true; }
  }
  impot = arrondiInf(impot, b.penalites.arrondiImpot);
  return { cnaps, ostie, base, tranches, bareme, reduction, minimumApplique, impot, net: brut - cnaps - ostie - impot };
}

/** IRSA régime spécial : rémunérations à taux unitaire (CDI 01.03.16 B). */
export function calculIRSASpecial(remuneration, tauxUnitaire, b) {
  const palier = b.irsa.regimeSpecial.find(p => p.tauxUnitaireMax === null || tauxUnitaire <= p.tauxUnitaireMax);
  return { taux: palier.taux, impot: arrondiInf(remuneration * palier.taux, b.penalites.arrondiImpot) };
}
