// Fiche Impôt sur les revenus (CDI Partie I, Titre I, ST I ; CPF Titre I, ST II, Chap. I). Textes malgaches à relire.
import { calculIR } from '../calc/ir.js';
import { t, tr, fmt, esc, ar, pct, ligne, puce, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { benefice: 30000000, caHT: 600000000, categorie: 'autres', personnesACharge: 0 };

const variables = b => ({
  seuil: ar(b.impotSynthetique.seuilCA), option: ar(b.impotSynthetique.seuilOptionIR),
  taux: pct(b.ir.taux, 0), reduction: ar(b.ir.reductionParPersonneACharge),
});

const comprendre = {
  definition: {
    article: 'CDI 01.01.01, 01.01.02',
    texte: {
      fr: "L'impôt sur les revenus (IR) est l'impôt annuel sur le bénéfice des entreprises au régime du réel : celles qui réalisent au moins {seuil} de chiffre d'affaires, ou qui ont choisi ce régime. Le régime du réel implique aussi la TVA.",
      en: 'Income tax (IR) is the annual tax on the profit of businesses under the real regime: those with at least {seuil} of turnover, or that chose this regime. The real regime also means VAT.',
      mg: "Ny hetra amin'ny vola miditra (IR) dia hetra isan-taona amin'ny tombony azon'ny orinasa ao amin'ny rafitra tena izy: ireo manana tondrom-barotra {seuil} farafahakeliny, na nisafidy io rafitra io. Midika koa TVA ny rafitra tena izy.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.01.02, 01.01.13 I', texte: {
      fr: 'Les entreprises (personnes physiques ou sociétés) dont le chiffre d’affaires atteint {seuil}, et celles qui optent pour le régime du réel.',
      en: 'Businesses (individuals or companies) with turnover of {seuil} or more, and those that opt for the real regime.',
      mg: "Ny orinasa (olona na fikambanana) manana tondrom-barotra {seuil} na mihoatra, sy ireo misafidy ny rafitra tena izy." } },
    { article: 'CDI 01.01.13 I', texte: {
      fr: 'Dès {option} de chiffre d’affaires, les entreprises dont les états financiers sont certifiés par un expert-comptable peuvent demander à passer à l’IR. L’option vaut à partir de l’exercice suivant.',
      en: 'From {option} of turnover, businesses whose financial statements are certified by a chartered accountant may ask to switch to IR. The option applies from the next year.',
      mg: "Manomboka amin'ny tondrom-barotra {option}, ny orinasa voamarin'ny kaontista manam-pahaizana ny tatitra ara-bolany dia afaka mangataka hiditra amin'ny IR. Manan-kery manomboka amin'ny taom-piasana manaraka izany." } },
    { article: 'CDI 01.01.05 I, V, VI', texte: {
      fr: 'Quel que soit leur chiffre d’affaires : les associés-gérants majoritaires de SARL, les activités d’éducation, et les exportateurs de produits agricoles et forestiers.',
      en: 'Whatever their turnover: majority partner-managers of SARL, education activities, and exporters of agricultural and forest products.',
      mg: "Na ohatrinona na ohatrinona ny tondrom-barotra: ny mpitantana tompon'ny ankamaroan'ny anjara ao amin'ny SARL, ny asa fanabeazana, ary ny mpanondrana vokatra avy amin'ny fambolena sy ny ala." } },
    { article: 'CDI 01.01.04, 01.01.05 II', texte: {
      fr: 'Les résidents de Madagascar pour tous leurs revenus ; les non-résidents pour leurs seuls revenus de source malgache.',
      en: 'Residents of Madagascar on all their income; non-residents only on their Malagasy-source income.',
      mg: "Ny mponina eto Madagasikara amin'ny vola miditra rehetra; ny tsy mponina amin'ny vola avy eto Madagasikara ihany." } },
  ],
  exonerations: [
    { article: 'CDI 01.01.03 1° à 3°', texte: {
      fr: 'Les intérêts de la Caisse d’Épargne de Madagascar, de l’emprunt national et des bons de caisse.',
      en: 'Interest from the Caisse d’Épargne de Madagascar, the national loan and cash bonds.',
      mg: "Ny zana-bola avy amin'ny Caisse d'Épargne de Madagascar, ny findramam-bola nasionaly ary ny bons de caisse." } },
    { article: 'CDI 01.01.03 5°, 6°', texte: {
      fr: 'Les missions religieuses, associations reconnues d’utilité publique et organismes de promotion des PME, si leur gestion est désintéressée et leur activité non concurrentielle.',
      en: 'Religious missions, public-interest associations and SME promotion bodies, if they are run on a non-profit basis and do not compete commercially.',
      mg: "Ny misiona ara-pivavahana, fikambanana ilaina ho an'ny besinimaro ary sampana manohana ny PME, raha tsy mizara tombony sy tsy mifaninana amin'ny tsena." } },
    { article: 'CDI 01.01.03 15°', texte: {
      fr: 'Les coopératives, si leur chiffre d’affaires avec les non-membres ne dépasse pas le quart du total.',
      en: 'Cooperatives, if their turnover with non-members does not exceed a quarter of the total.',
      mg: "Ny koperativa, raha tsy mihoatra ny ampahefatry ny totaliny ny tondrom-barotra amin'ny tsy mpikambana." } },
    { article: 'CDI 01.01.03 14°', texte: {
      fr: 'Les revenus des marchés publics soumis à l’impôt sur les revenus des marchés (IRM).',
      en: 'Income from public contracts subject to the public procurement income tax (IRM).',
      mg: "Ny vola azo avy amin'ny tsenam-panjakana iharan'ny IRM." } },
  ],
  aSavoir: [
    { article: 'CDI 01.01.14 I-A', texte: {
      fr: 'Taux : {taux} du bénéfice imposable, arrondi au millier d’ariary inférieur.',
      en: 'Rate: {taux} of taxable profit, rounded down to the thousand ariary.',
      mg: "Taha: {taux} amin'ny tombony iainan'ny hetra, boribory ho amin'ny arivo ariary ambany." } },
    { article: 'CDI 01.01.14 I-A', texte: {
      fr: 'Même en cas de perte, toute entreprise qui existe au 1er janvier paie un minimum de perception : un montant fixe plus un pourcentage du chiffre d’affaires hors taxe, selon l’activité.',
      en: 'Even when making a loss, every business existing on 1 January pays a minimum charge: a fixed amount plus a percentage of turnover excluding tax, depending on the activity.',
      mg: "Na very aza, ny orinasa rehetra misy amin'ny 1 janoary dia mandoa hetra kely indrindra: vola raikitra miampy isan-jaton'ny tondrom-barotra tsy misy haba, araka ny karazan'asa." } },
    { article: 'CDI 01.01.16', texte: {
      fr: 'Les entrepreneurs individuels ont droit à une réduction de {reduction} par an et par personne à charge.',
      en: 'Sole traders are entitled to a reduction of {reduction} per year per dependant.',
      mg: "Ny mpandraharaha tsy miankina dia mahazo fihenana {reduction} isan-taona isaky ny olona iantohana." } },
    { article: 'CDI 01.01.14 I-C, II, III, V', texte: {
      fr: 'Non calculés ici : la réduction pour investissement, et les règles particulières des non-résidents, des associés-gérants de SARL, des activités d’éducation et de santé, et des transporteurs (minimum fixé par texte réglementaire).',
      en: 'Not calculated here: the investment reduction, and the special rules for non-residents, SARL partner-managers, education and health activities, and transporters (minimum set by regulation).',
      mg: "Tsy kajiana eto: ny fihenana noho ny fampiasam-bola, sy ny fitsipika manokana ho an'ny tsy mponina, ny mpitantana SARL, ny asa fanabeazana sy fahasalamana, ary ny mpitatitra (hetra kely indrindra voafaritry ny didy)." } },
  ],
  exemple: {
    texte: {
      fr: 'Une société de services d’Antsirabe réalise {ca} de chiffre d’affaires hors taxe et {benefice} de bénéfice. L’IR à {taux} donnerait {calcule}, mais le minimum de perception est de {minimum} : c’est donc {impot} qui est dû, à payer au plus tard le 15 mai.',
      en: 'A services company in Antsirabe has {ca} of turnover excluding tax and {benefice} of profit. IR at {taux} would give {calcule}, but the minimum charge is {minimum}: so {impot} is due, payable by 15 May.',
      mg: "Orinasa mpanome tolotra any Antsirabe manana tondrom-barotra tsy misy haba {ca} sy tombony {benefice}. Ny IR {taux} dia ho {calcule}, nefa {minimum} ny hetra kely indrindra: {impot} àry no aloa, farany ny 15 mey.",
    },
    valeurs: b => {
      const r = calculIR(EXEMPLE, b);
      return { ca: ar(EXEMPLE.caHT), benefice: ar(EXEMPLE.benefice), taux: pct(b.ir.taux, 0),
        calcule: ar(r.calcule), minimum: ar(r.minimum), impot: ar(r.impot) };
    },
  },
};

const CATEGORIES = {
  activitesProductives: { fr: 'Agricole, artisanale, industrielle, minière, hôtelière ou touristique', en: 'Agriculture, crafts, industry, mining, hotels or tourism', mg: "Fambolena, asa tanana, indostria, fitrandrahana, trano fandraisam-bahiny na fizahan-tany" },
  autres: { fr: 'Autres activités (commerce, services…)', en: 'Other activities (trade, services…)', mg: 'Asa hafa (varotra, tolotra…)' },
  petrolieres: { fr: 'Compagnie pétrolière', en: 'Oil company', mg: 'Orinasa solika' },
  carburantDetail: { fr: 'Vente de carburant au détail', en: 'Retail fuel sales', mg: 'Fivarotana solika antsinjarany' },
};

const L = {
  categorie: { fr: 'Catégorie d’activité (pour le minimum de perception)', en: 'Type of activity (for the minimum charge)', mg: "Karazan'asa (ho an'ny hetra kely indrindra)" },
  benefice: { fr: 'Bénéfice imposable de l’exercice (0 en cas de perte)', en: 'Taxable profit for the year (0 if a loss)', mg: "Tombony iainan'ny hetra (0 raha very)" },
  ca: { fr: 'Chiffre d’affaires annuel hors taxe', en: 'Annual turnover excluding tax', mg: 'Tondrom-barotra isan-taona tsy misy haba' },
  physique: { fr: 'Entreprise individuelle (personne physique)', en: 'Sole trader (individual)', mg: 'Orinasa tsy miankina (olona tokana)' },
  charges: { fr: 'Personnes à charge', en: 'Dependants', mg: 'Olona iantohana' },
  base: { fr: 'Bénéfice, arrondi au millier inférieur', en: 'Profit, rounded down to the thousand', mg: "Tombony, boribory ho amin'ny arivo ambany" },
  calcule: { fr: 'IR à {taux}', en: 'IR at {taux}', mg: 'IR {taux}' },
  reduction: { fr: 'Réduction : {n} personne(s) à charge', en: 'Reduction: {n} dependant(s)', mg: 'Fihenana: olona iantohana {n}' },
  minimum: { fr: 'Minimum : {fixe} + {taux} du CA hors taxe', en: 'Minimum: {fixe} + {taux} of turnover excl. tax', mg: "Kely indrindra: {fixe} + {taux} amin'ny tondrom-barotra" },
  minApplique: { fr: 'Minimum de perception appliqué', en: 'Minimum charge applied', mg: 'Hetra kely indrindra nampiharina' },
  total: { fr: 'IR à payer', en: 'IR to pay', mg: 'IR aloa' },
  taux: { fr: 'Part du bénéfice', en: 'Share of profit', mg: 'Ampahan’ny tombony' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
  sousSeuil: { fr: 'Sous {option} de chiffre d’affaires, c’est en principe l’impôt synthétique qui s’applique, sauf option pour le régime du réel.',
    en: 'Under {option} of turnover, the synthetic tax normally applies, unless the business opts for the real regime.',
    mg: "Raha latsaky ny {option} ny tondrom-barotra, ny hetra tsotra no mihatra, raha tsy misafidy ny rafitra tena izy." },
  option: { fr: 'Entre {option} et {seuil}, l’IR s’applique seulement sur option (états financiers certifiés) ; sinon c’est l’impôt synthétique.',
    en: 'Between {option} and {seuil}, IR applies only by option (certified financial statements); otherwise it is the synthetic tax.',
    mg: "Eo anelanelan'ny {option} sy {seuil}, mihatra ny IR raha misafidy (tatitra ara-bola voamarina); raha tsy izany ny hetra tsotra." },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.ir.articles, v = variables(b), S = b.impotSynthetique;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('categorie')}</span>
          <select id="ir-cat">${Object.keys(b.ir.minimum).map(k =>
            `<option value="${k}"${k === EXEMPLE.categorie ? ' selected' : ''}>${esc(tr(CATEGORIES[k]))}</option>`).join('')}</select></label>
        ${champMontant('ir-benef', l('benefice'), EXEMPLE.benefice)}
        ${champMontant('ir-ca', l('ca'), EXEMPLE.caHT)}
        <label class="check"><input type="checkbox" id="ir-physique"><span>${l('physique')}</span></label>
        <div id="ir-charges-bloc" hidden>${champCompteur('ir-charges', l('charges'), 0, 0, 20)}</div>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IR</span><span>${l('parAn')}</span></div>
        <p class="warn" id="ir-regime" hidden></p>
        <div class="rows" id="ir-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ir-total"></span></div>
        <div class="sub" id="ir-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);

  const recalculer = () => {
    const categorie = $('ir-cat').value, physique = $('ir-physique').checked, caHT = lireMontant($('ir-ca'));
    $('ir-charges-bloc').hidden = !physique;
    const n = physique ? lireEntier($('ir-charges'), 0, 20) : 0;
    const r = calculIR({ benefice: lireMontant($('ir-benef')), caHT, categorie, personnesACharge: n }, b);
    const m = b.ir.minimum[categorie];
    const avis = $('ir-regime');
    const cle = caHT < S.seuilOptionIR ? 'sousSeuil' : caHT < S.seuilCA ? 'option' : null;
    avis.hidden = !cle;
    avis.innerHTML = cle ? esc(l(cle, v)) + `<small class="art">${A.regime}</small>` : '';
    let h = ligne(l('base'), ar(r.base), A.taux) + ligne(l('calcule', { taux: v.taux }), ar(r.calcule), A.taux);
    if (r.reduction > 0) h += ligne(l('reduction', { n }), '− ' + ar(r.reduction), A.personnesACharge, 'neg');
    h += ligne(l('minimum', { fixe: ar(m.fixe), taux: pct(m.tauxCA) }), ar(r.minimum), A.minimum);
    if (r.minimumApplique) h += ligne(l('minApplique'), ar(r.minimum), A.minimum, 'note');
    $('ir-rows').innerHTML = h;
    $('ir-total').textContent = ar(r.impot);
    $('ir-sub').innerHTML = r.base ? puce(l('taux'), pct(r.impot / r.base)) : '';
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default {
  id: 'ir',
  variables,
  comprendre,
  monterCalculateur,
  impotExemple: b => calculIR(EXEMPLE, b).impot,
};
