// Fiche Taxe sur les transactions mobiles (CDI Partie III, Titre II, Chap. IV ; CPF I-103 bis). Textes malgaches à relire.
import { calculTTM } from '../calc/ttm.js';
import { t, tr, fmt, ar, pct, ligne, champMontant, lireMontant, brancher } from '../ui.js';

// Les frais ci-dessous sont des valeurs d'exemple, pas des tarifs du Code : chaque opérateur fixe ses frais.
const EXEMPLE = { fraisMensuels: 2000000000, fraisOperation: 1000, envoi: 100000 };
const variables = b => ({ taux: pct(b.ttm.taux, 0) });

const comprendre = {
  definition: {
    article: 'CDI 03.02.13, 03.02.17, 03.02.18',
    texte: {
      fr: "La taxe sur les transactions mobiles frappe les opérations de mobile money. Elle n'est pas calculée sur l'argent envoyé, mais sur les frais que l'opérateur prend pour l'opération : {taux} de ces frais hors taxes.",
      en: 'The mobile transaction tax applies to mobile money operations. It is not calculated on the money sent, but on the fees the operator charges for the operation: {taux} of those fees excluding tax.',
      mg: "Ny haba amin'ny fifanakalozana amin'ny finday dia mikasika ny asa mobile money. Tsy kajiana amin'ny vola alefa izy, fa amin'ny sarany alain'ny mpandraharaha: {taux} amin'ireo sarany tsy misy haba ireo.",
    },
  },
  quiPaie: [
    { article: 'CDI 03.02.14', texte: {
      fr: 'Les envois d’argent par mobile money et leur retrait, les paiements d’achats par téléphone ou par carte rattachée au compte mobile money, les virements vers un compte bancaire, et toute autre opération payante du service.',
      en: 'Mobile money transfers and their withdrawal, purchase payments by phone or by a card linked to the mobile money account, transfers to a bank account, and any other paid operation of the service.',
      mg: "Ny fandefasana vola amin'ny mobile money sy ny fanalana azy, ny fandoavana entana amin'ny finday na amin'ny karatra mifandray amin'ny kaonty mobile money, ny famindrana any amin'ny kaonty banky, ary ny asa rehetra mandoa sarany." } },
    { article: 'CDI 03.02.15', texte: {
      fr: 'C’est l’établissement de monnaie électronique qui paie la taxe, pas l’utilisateur directement.',
      en: 'The electronic money institution pays the tax, not the user directly.',
      mg: "Ny orinasa mpitantana vola elektronika no mandoa ny haba, fa tsy ny mpampiasa mivantana." } },
  ],
  exonerations: [
    { article: 'CDI 03.02.14 d', texte: {
      fr: 'Les frais et intérêts liés aux prêts et aux placements financiers faits par mobile money ne sont pas taxés.',
      en: 'Fees and interest on loans and financial investments made through mobile money are not taxed.',
      mg: "Tsy iharan'ny haba ny sarany sy ny zana-bola amin'ny fampindramam-bola sy ny fametrahana vola atao amin'ny mobile money." } },
  ],
  aSavoir: [
    { article: 'CDI 03.02.16', texte: {
      fr: 'La taxe est due dès que l’opérateur perçoit ses frais.',
      en: 'The tax is due as soon as the operator collects its fees.',
      mg: "Tsy maintsy aloa ny haba raha vao mandray ny sarany ny mpandraharaha." } },
  ],
  exemple: {
    texte: {
      fr: 'Lalao envoie {envoi} à sa famille par mobile money. Si l’opérateur prend {frais} de frais hors taxes, la taxe est de {taxe} : elle porte sur les frais, pas sur les {envoi} envoyés. (Les frais sont un exemple : chaque opérateur fixe les siens.)',
      en: 'Lalao sends {envoi} to family by mobile money. If the operator charges {frais} in fees excluding tax, the tax is {taxe}: it is on the fees, not on the {envoi} sent. (The fees are an example: each operator sets its own.)',
      mg: "Mandefa {envoi} ho an'ny fianakaviany amin'ny mobile money i Lalao. Raha {frais} tsy misy haba ny sarany alain'ny mpandraharaha, {taxe} ny haba: amin'ny sarany izy fa tsy amin'ny {envoi} nalefa. (Ohatra fotsiny ny sarany: samy manana ny azy ny mpandraharaha.)",
    },
    valeurs: b => ({ envoi: ar(EXEMPLE.envoi), frais: ar(EXEMPLE.fraisOperation), taxe: ar(calculTTM(EXEMPLE.fraisOperation, b).taxe) }),
  },
};

const L = {
  frais: { fr: 'Frais hors taxes perçus par l’opérateur dans le mois', en: 'Fees excl. tax collected by the operator in the month', mg: "Sarany tsy misy haba noraisin'ny mpandraharaha tamin'ny volana" },
  fraisL: { fr: 'Frais perçus (chiffre d’affaires)', en: 'Fees collected (turnover)', mg: 'Sarany voaray (tondrom-barotra)' },
  taxe: { fr: 'TTM à {taux}', en: 'TTM at {taux}', mg: 'TTM {taux}' },
  total: { fr: 'TTM à payer', en: 'TTM to pay', mg: 'TTM aloa' },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.ttm.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card"><span class="eg">${t('exemple')}</span>${champMontant('ttm-frais', l('frais'), EXEMPLE.fraisMensuels)}</div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · TTM</span><span>${l('parMois')}</span></div>
        <div class="rows" id="ttm-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ttm-total"></span></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const f = lireMontant($('ttm-frais')), r = calculTTM(f, b);
    $('ttm-rows').innerHTML = ligne(l('fraisL'), ar(f), A.base) + ligne(l('taxe', { taux: pct(r.taux, 0) }), ar(r.taxe), A.taux);
    $('ttm-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ttm', variables, comprendre, monterCalculateur, impotExemple: b => calculTTM(EXEMPLE.fraisMensuels, b).impot };
