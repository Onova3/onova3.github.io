// Fiche Taxe de résidence pour le développement (CDI Livre II, Titre IV ; CPF Chap. XV). Textes malgaches à relire.
import { calculTRD } from '../calc/trd.js';
import { t, tr, fmt, ar, ligne, champCommunal, lireCommunal, brancher } from '../ui.js';

const variables = b => ({ max: ar(b.trd.max), demi: ar(b.trd.max * b.trd.demiTarif), age: b.trd.ageMinimum });

const comprendre = {
  definition: {
    article: 'CDI 10.04.01, 10.04.04',
    texte: {
      fr: "La taxe de résidence pour le développement est une taxe annuelle de la commune, due par chaque habitant adulte. La commune vote son tarif, sans dépasser {max}.",
      en: 'The residence tax for development is an annual commune tax due from each adult resident. The commune votes its rate, up to {max}.',
      mg: "Ny haba fonenana ho an'ny fampandrosoana dia haba isan-taona an'ny kaominina, aloan'ny mponina lehibe tsirairay. Ny kaominina no mandany ny tahany, tsy mihoatra ny {max}.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.04.02', texte: {
      fr: 'Toute personne de {age} ans ou plus qui réside dans la commune au 1er janvier.',
      en: 'Anyone aged {age} or over living in the commune on 1 January.',
      mg: "Izay olona {age} taona na mihoatra monina ao amin'ny kaominina amin'ny 1 janoary." } },
    { article: 'CDI 10.04.04', texte: {
      fr: 'Demi-tarif pour l’un des deux époux (mariage légal ou coutumier), et pour les personnes déjà soumises à l’IR, à l’impôt synthétique ou à l’IRSA (carte fiscale, certificat de travail…).',
      en: 'Half rate for one of the two spouses (legal or customary marriage), and for people already subject to IR, synthetic tax or IRSA (tax card, employment certificate…).',
      mg: "Antsasa-bidy ho an'ny iray amin'ny mpivady (fanambadiana ara-dalàna na nentim-paharazana), sy ho an'ireo efa iharan'ny IR, hetra tsotra na IRSA (karatra ara-ketra, taratasy fanamarinana asa…)." } },
  ],
  exonerations: [
    { article: 'CDI 10.04.03', texte: {
      fr: 'Plus de 60 ans ; personnes reconnues indigentes ; personnes handicapées sans autre revenu que leur pension ; élèves et étudiants de 25 ans au plus sans revenu professionnel ; appelés du Service national ; personnes détenues ; diplomates étrangers (sous réserve de réciprocité).',
      en: 'Over 60; people recognised as destitute; disabled people with no income other than their pension; pupils and students aged 25 or under with no professional income; national service conscripts; detainees; foreign diplomats (subject to reciprocity).',
      mg: "Mihoatra ny 60 taona; olona sahirana voamarina; olona manana fahasembanana tsy manana fidiram-bola afa-tsy ny fisotroan-drononony; mpianatra sy mpianatra ambony 25 taona farafahabetsany tsy misy fidiram-bola; miaramila tanora; voafonja; diplaomaty vahiny (raha misy fifamaliana)." } },
  ],
  aSavoir: [
    { article: 'CPF I-110', texte: {
      fr: 'On déclare et on paie en même temps, et le paiement est inscrit dans le karinem-pokontany.',
      en: 'You file and pay at the same time, and the payment is recorded in the karinem-pokontany.',
      mg: "Ambara sy aloa miaraka, ary soratana ao amin'ny karinem-pokontany ny fandoavana." } },
  ],
  exemple: {
    texte: {
      fr: 'Mialy, 24 ans, vient de finir ses études et travaille comme salariée à Mahajanga : elle paie l’IRSA, donc la taxe de résidence est à demi-tarif. Si la commune a voté {max}, elle paie {demi}, avant le 15 juin. Pendant ses études, elle était exonérée.',
      en: 'Mialy, 24, has just finished studying and works as an employee in Mahajanga: she pays IRSA, so the residence tax is at half rate. If the commune voted {max}, she pays {demi}, by 15 June. While studying, she was exempt.',
      mg: "Mialy, 24 taona, vao vita fianarana ary miasa any Mahajanga: mandoa IRSA izy, ka antsasa-bidy ny haba fonenana. Raha {max} no nolanian'ny kaominina, {demi} no aloany, alohan'ny 15 jona. Tsy nandoa izy nandritra ny fianarany.",
    },
    valeurs: b => ({ max: ar(b.trd.max), demi: ar(calculTRD({ tarif: b.trd.max, demiTarif: true }, b).impot) }),
  },
};

const L = {
  tarif: { fr: 'Tarif voté par ma commune', en: 'Rate voted by my commune', mg: 'Taha nolanian’ny kaominako' },
  regle: { fr: 'Plafond fixé par le Code : {max}.', en: 'Ceiling set by the Code: {max}.', mg: "Fetra ambony napetraky ny Fehezan-dalàna: {max}." },
  demi: { fr: 'Demi-tarif : l’un des époux, ou déjà soumis à l’IR, l’IS ou l’IRSA', en: 'Half rate: one of the spouses, or already subject to IR, synthetic tax or IRSA', mg: "Antsasa-bidy: iray amin'ny mpivady, na efa iharan'ny IR, IS na IRSA" },
  tarifL: { fr: 'Tarif communal', en: 'Commune rate', mg: 'Taha ao amin’ny kaominina' },
  demiL: { fr: 'Réduction de moitié', en: 'Half-rate reduction', mg: 'Fihenana antsasany' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.trd.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champCommunal({ id: 'trd-tarif', libelle: l('tarif'), valeur: b.trd.max, max: b.trd.max, article: A.tarif, regle: l('regle', { max: ar(b.trd.max) }) + ' ' + t('valeur_exemple') })}
        <label class="check"><input type="checkbox" id="trd-demi" checked><span>${l('demi')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · TRD</span><span>${l('parAn')}</span></div>
        <div class="rows" id="trd-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="trd-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const tarif = lireCommunal(p, 'trd-tarif'), r = calculTRD({ tarif, demiTarif: $('trd-demi').checked }, b);
    $('trd-rows').innerHTML = ligne(l('tarifL'), ar(tarif), A.tarif) + (r.demiTarif ? ligne(l('demiL'), '− ' + ar(tarif - r.impot), A.tarif, 'neg') : '');
    $('trd-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'trd', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculTRD({ tarif: b.trd.max, demiTarif: true }, b).impot };
