import { arrondiInf } from './outils.js';

/**
 * Droit d'accises d'un produit du tableau (CDI 03.01.04 et annexe 2 ; CPF II-95).
 * - exonéré : 0 ;
 * - ad valorem : taux × valeur taxable, la valeur ne pouvant être inférieure à quantité × valeur minimale quand le tableau en prévoit une ;
 * - spécifique : montant × quantité.
 * @param {object} produit  ligne de data/accises-2026.json
 * @param {object} d { origine: 'local'|'importe', valeur = 0, quantite = 0 }
 */
export function calculAccises(produit, { origine = 'local', valeur = 0, quantite = 0 }, b) {
  const t = produit[origine];
  let base = 0, droit = 0, valeurMinimaleAppliquee = false;
  if (t.type === 'advalorem') {
    base = valeur;
    if (t.valeurMinimale && quantite * t.valeurMinimale.montant > valeur) { base = quantite * t.valeurMinimale.montant; valeurMinimaleAppliquee = true; }
    droit = base * t.taux;
  } else if (t.type === 'specifique') {
    droit = quantite * t.montant;
  }
  return { tarif: t, base, droit, valeurMinimaleAppliquee, impot: arrondiInf(droit, b.penalites.arrondiImpot) };
}

/** Recherche dans le tableau par code tarifaire ou par mots de la désignation (sans accents ni majuscules). */
export function chercherProduits(produits, requete, max = 20) {
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const mots = norm(requete).split(/\s+/).filter(Boolean);
  if (!mots.length) return [];
  return produits.filter(p => {
    const texte = norm(`${p.code} ${p.code.replace(/\D/g, '')} ${p.contexte} ${p.designation}`);
    return mots.every(m => texte.includes(m));
  }).slice(0, max);
}
