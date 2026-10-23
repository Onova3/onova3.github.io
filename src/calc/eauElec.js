/** Taxe communale sur l'eau et/ou l'électricité (CDI 10.10.03, 10.10.04) : taux sur le montant hors taxe des consommations facturées. */
export const calculEauElec = (montantHT, b) => ({ taux: b.eauElec.taux, impot: montantHT * b.eauElec.taux });
