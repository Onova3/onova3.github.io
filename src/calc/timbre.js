/** Droit de visa (CDI 02.05.06) : demi-tarif pour les missionnaires et les étudiants étrangers des grandes écoles. */
export function droitVisa({ id, demiTarif = false }, b) {
  const t = b.timbre, v = t.visas.find(x => x.id === id);
  const reduit = demiTarif && v.demiTarif !== false;
  return { visa: v, reduit, montant: reduit ? v.montant * t.reductionMissionnairesEtudiants : v.montant };
}

/** Armes à feu (CDI 02.05.07, 02.05.08) : impôt annuel par arme, plus le droit de permis s'il est délivré ou renouvelé. */
export function droitsArmes({ armes = 1, permis = false }, b) {
  const t = b.timbre;
  const impotAnnuel = armes * t.impotAnnuelParArme;
  return { impotAnnuel, permis: permis ? t.permisArme : 0, total: impotAnnuel + (permis ? t.permisArme : 0) };
}
