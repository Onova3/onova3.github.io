import { arrondiInf } from './outils.js';

/** TVA : conversion HT <-> TTC (CDI 06.01.12). */
export function calculTVA({ montant, taux, depuis = 'HT' }) {
  const ht = depuis === 'HT' ? montant : montant / (1 + taux);
  const tva = ht * taux;
  return { ht, tva, ttc: ht + tva };
}

/**
 * Déclaration mensuelle de TVA (CDI 06.01.16, 06.01.17, 06.01.23).
 * TVA collectée sur les ventes, moins la TVA déductible et le crédit reporté du mois précédent.
 * Si les déductions dépassent la TVA collectée, la différence est un crédit reportable.
 * @param {object} d { ventes: [{ ht, taux }], tvaDeductible = 0, creditAnterieur = 0 }
 */
export function calculDeclarationTVA({ ventes = [], tvaDeductible = 0, creditAnterieur = 0 }, b) {
  const lignes = ventes.map(v => ({ ...v, tva: v.ht * v.taux }));
  const collectee = lignes.reduce((s, l) => s + l.tva, 0);
  const deductions = tvaDeductible + creditAnterieur;
  const solde = collectee - deductions;
  return { lignes, collectee, deductions,
    aPayer: solde > 0 ? arrondiInf(solde, b.penalites.arrondiImpot) : 0,
    credit: solde < 0 ? -solde : 0 };
}
