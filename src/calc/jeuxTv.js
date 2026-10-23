/** Taxe sur les jeux radiotélévisés (CDI 10.13.03) : montant fixe par SMS et par appel de participation. */
export function calculJeuxTv({ sms = 0, appels = 0 }, b) {
  const j = b.jeuxTv, lignes = { sms: sms * j.parSms, appels: appels * j.parAppel };
  return { lignes, impot: lignes.sms + lignes.appels };
}
