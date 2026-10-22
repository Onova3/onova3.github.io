import { arrondiInf } from './outils.js';

/** Prélèvement sur les boissons alcooliques (CDI 03.02.07) : montant par litre mis à la consommation, export exonéré. */
export function calculPrelevement({ litres, litresExport = 0 }, b) {
  const taxables = Math.max(0, litres - litresExport);
  const montant = taxables * b.prelevementAlcools.parLitre;
  return { taxables, montant, impot: arrondiInf(montant, b.penalites.arrondiImpot) };
}
