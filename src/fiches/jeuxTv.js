// Fiche Taxe sur les jeux radiotélévisés (CDI Livre II, Titre XIII ; pas de chapitre CPF). Textes malgaches à relire.
import { calculJeuxTv } from '../calc/jeuxTv.js';
import { t, tr, fmt, ar, ligne, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { sms: 50000, appels: 10000 };
const variables = b => ({ sms: ar(b.jeuxTv.parSms), appel: ar(b.jeuxTv.parAppel) });

const comprendre = {
  definition: {
    article: 'CDI 10.13.01, 10.13.03',
    texte: {
      fr: "Quand on participe à un jeu à la radio, à la télévision ou à une téléréalité par SMS ou par appel, l'organisateur paie une taxe : {sms} par SMS et {appel} par appel. Elle finance le Fonds national de péréquation des collectivités.",
      en: 'When people take part in a radio, TV or reality game by text or call, the organiser pays a tax: {sms} per text and {appel} per call. It funds the local authorities’ national equalisation fund.',
      mg: "Rehefa mandray anjara amin'ny lalao amin'ny radio, fahitalavitra na tele-reality amin'ny SMS na antso, mandoa haba ny mpikarakara: {sms} isaky ny SMS ary {appel} isaky ny antso. Mamatsy ny Tahirim-pirenena fampitoviana ny vondrom-bahoaka izany.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.13.02, 10.13.03', texte: {
      fr: 'L’organisateur du jeu, sur tous les appels et SMS de participation reçus.',
      en: 'The game organiser, on all participation calls and texts received.',
      mg: "Ny mpikarakara ny lalao, amin'ny antso sy SMS fandraisana anjara rehetra voaray." } },
  ],
  exonerations: [
    { article: 'CDI 10.13.02', texte: {
      fr: 'Seuls les appels et SMS liés à la participation à un jeu sont visés.',
      en: 'Only calls and texts linked to taking part in a game are covered.',
      mg: "Ny antso sy SMS mifandray amin'ny fandraisana anjara amin'ny lalao ihany no voakasika." } },
  ],
  aSavoir: [
    { article: 'CDI 10.13.04', texte: {
      fr: 'L’organisateur déclare le jeu 30 jours au moins avant son lancement, et dépose un état de tous les SMS et appels dans les 30 jours après la fin.',
      en: 'The organiser declares the game at least 30 days before launch, and files a statement of all texts and calls within 30 days after it ends.',
      mg: "Ambaran'ny mpikarakara 30 andro farafahakeliny alohan'ny hanombohany ny lalao, ary apetrany ao anatin'ny 30 andro aorian'ny fiafarany ny famintinana ny SMS sy antso rehetra." } },
  ],
  exemple: {
    texte: {
      fr: 'Un jeu télévisé reçoit 50 000 SMS et 10 000 appels en juin : l’organisateur verse {impot} avant le 15 juillet.',
      en: 'A TV game receives 50,000 texts and 10,000 calls in June: the organiser pays {impot} before 15 July.',
      mg: "Lalao amin'ny fahitalavitra iray no nahazo SMS 50 000 sy antso 10 000 tamin'ny jona: {impot} no aloan'ny mpikarakara alohan'ny 15 jolay.",
    },
    valeurs: b => ({ impot: ar(calculJeuxTv(EXEMPLE, b).impot) }),
  },
};

const L = {
  sms: { fr: 'SMS reçus dans le mois', en: 'Texts received in the month', mg: 'SMS voaray tamin’ny volana' },
  appels: { fr: 'Appels reçus dans le mois', en: 'Calls received in the month', mg: 'Antso voaray tamin’ny volana' },
  calcul: { fr: '{lib} : {n} × {m}', en: '{lib}: {n} × {m}', mg: '{lib}: {n} × {m}' },
  total: { fr: 'Taxe à verser', en: 'Tax to pay', mg: 'Haba aloa' },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const J = b.jeuxTv, A = J.articles, sansAr = s => s.replace('<span class="u">Ar</span>', '');
  p.innerHTML = `
    <div class="grid">
      <div class="card"><span class="eg">${t('exemple')}</span>${sansAr(champMontant('jt-sms', l('sms'), EXEMPLE.sms))}${sansAr(champMontant('jt-app', l('appels'), EXEMPLE.appels))}</div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Jeux radiotélévisés', en: 'Broadcast games', mg: 'Lalao amin’ny radio sy TV' })}</span><span>${l('parMois')}</span></div>
        <div class="rows" id="jt-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="jt-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const d = { sms: lireMontant($('jt-sms')), appels: lireMontant($('jt-app')) }, r = calculJeuxTv(d, b);
    $('jt-rows').innerHTML = ligne(l('calcul', { lib: 'SMS', n: d.sms.toLocaleString('fr-FR'), m: ar(J.parSms) }), ar(r.lignes.sms), A.tarif)
      + ligne(l('calcul', { lib: tr({ fr: 'Appels', en: 'Calls', mg: 'Antso' }), n: d.appels.toLocaleString('fr-FR'), m: ar(J.parAppel) }), ar(r.lignes.appels), A.tarif);
    $('jt-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'jeux-tv', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculJeuxTv(EXEMPLE, b).impot };
