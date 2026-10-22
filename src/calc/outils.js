// Arrondi à l'inférieur au multiple donné (100 = centaine, 1000 = millier...).
export const arrondiInf = (montant, pas = 100) => Math.floor(montant / pas) * pas;
