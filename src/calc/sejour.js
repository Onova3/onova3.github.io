/**
 * Taxe de séjour (CDI 10.05.03) : tarif voté par la commune, plafonné selon la catégorie de l'établissement,
 * par nuitée et par chambre (hôtels classés) ou par nuitée et par adulte (autres établissements).
 * @param {object} d { categorie, nuitees, tarif }  nuitées = chambres × nuits, ou adultes × nuits
 */
export function calculSejour({ categorie, nuitees, tarif }, b) {
  const c = b.sejour.categories.find(x => x.id === categorie);
  return { categorie: c, impot: nuitees * tarif };
}
