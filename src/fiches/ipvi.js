// Fiche IPVI (CDI Partie I, Titre V ; CPF Titre I, ST II, Chap. VII). Textes malgaches à relire.
import { calculIPVI } from '../calc/ipvi.js';
import { t, tr, fmt, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { prixCession: 80000000, valeurAdministrative: 0 };
const variables = b => ({ taux: pct(b.ipvi.taux, 0), revient: pct(b.ipvi.prixRevientForfaitaire, 0), part: pct(1 - b.ipvi.prixRevientForfaitaire, 0) });

const comprendre = {
  definition: {
    article: 'CDI 01.05.01, 01.05.02',
    texte: {
      fr: "L'impôt sur les plus-values immobilières (IPVI) est payé par un particulier qui vend un terrain, une maison ou un appartement. Il remplace l'IR ou l'impôt synthétique sur ce gain.",
      en: 'The real estate capital gains tax (IPVI) is paid by an individual who sells land, a house or a flat. It replaces IR or the synthetic tax on that gain.',
      mg: "Ny IPVI dia aloan'ny olon-tsotra mivarotra tany, trano na efitrano. Misolo ny IR na ny hetra tsotra amin'io tombony io izy.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.05.02', texte: {
      fr: 'Les personnes physiques qui vendent un bien immobilier, y compris aux enchères, quelle que soit la façon dont elles l’avaient acquis (achat, héritage, donation…).',
      en: 'Individuals who sell real estate, including at auction, however they acquired it (purchase, inheritance, gift…).',
      mg: "Ny olon-tsotra mivarotra trano na tany, na amin'ny lavanty aza, na ahoana na ahoana ny nahazoany azy (fividianana, lova, fanomezana…)." } },
    { article: 'CDI 01.05.02', texte: {
      fr: 'Une personne physique qui cède un contrat de crédit-bail immobilier.',
      en: 'An individual who transfers a real estate leasing contract.',
      mg: "Olon-tsotra mamindra fifanarahana fanofana mialoha fividianana trano na tany." } },
  ],
  exonerations: [
    { article: 'CDI 01.05.03', texte: {
      fr: 'Les ventes de biens de l’État ou des collectivités, et les sommes reçues lors d’une expropriation pour cause d’utilité publique.',
      en: 'Sales of State or local authority property, and sums received on expropriation in the public interest.',
      mg: "Ny fivarotana fananan'ny Fanjakana na ny vondrom-bahoaka, ary ny vola azo amin'ny fakana an-tery ho tombontsoam-bahoaka." } },
  ],
  aSavoir: [
    { article: 'CDI 01.05.04', texte: {
      fr: 'On ne calcule pas la plus-value réelle : le prix de revient est fixé d’office à {revient} du prix de vente. La plus-value imposable est donc {part} du prix.',
      en: 'The actual gain is not calculated: the cost price is set by law at {revient} of the sale price. The taxable gain is therefore {part} of the price.',
      mg: "Tsy kajiana ny tombony tena izy: voafetra ho {revient} amin'ny vidiny ny vidin'ny fahazoana. {part} amin'ny vidiny àry ny tombony iainan'ny hetra." } },
    { article: 'CDI 01.05.04', texte: {
      fr: 'Le prix retenu ne peut pas être inférieur à la valeur administrative du bien, fixée par texte réglementaire.',
      en: 'The price used cannot be lower than the administrative value of the property, set by regulation.',
      mg: "Tsy azo latsaky ny sanda ara-panjakana voafaritry ny didy ny vidiny raisina." } },
    { article: 'CDI 01.05.07, 01.05.08', texte: {
      fr: 'Taux : {taux} de la plus-value. L’impôt est calculé par le bureau d’enregistrement au moment où l’acte de vente est enregistré.',
      en: 'Rate: {taux} of the gain. The tax is calculated by the registration office when the deed of sale is registered.',
      mg: "Taha: {taux} amin'ny tombony. Ny biraon'ny fanoratana no manao ny kajy rehefa soratana ny taratasy fivarotana." } },
  ],
  exemple: {
    texte: {
      fr: 'Lova vend le terrain hérité de ses grands-parents pour {prix}. La plus-value imposable est {pv} et l’IPVI de {impot} est payé par le notaire avec les droits d’enregistrement.',
      en: 'Lova sells land inherited from grandparents for {prix}. The taxable gain is {pv} and the IPVI of {impot} is paid by the notary with the registration duties.',
      mg: "Mivarotra ny tany nolovaina tamin'ny raibe sy renibeny i Lova amin'ny {prix}. {pv} ny tombony iainan'ny hetra ary ny notera no mandoa ny IPVI {impot} miaraka amin'ny haba fanoratana.",
    },
    valeurs: b => { const r = calculIPVI(EXEMPLE, b); return { prix: ar(EXEMPLE.prixCession), pv: ar(r.plusValue), impot: ar(r.impot) }; },
  },
};

const L = {
  prix: { fr: 'Prix de vente', en: 'Sale price', mg: 'Vidin’ny varotra' },
  valeur: { fr: 'Valeur administrative du bien (0 si inconnue)', en: 'Administrative value of the property (0 if unknown)', mg: "Sanda ara-panjakana (0 raha tsy fantatra)" },
  valeurNote: { fr: 'Elle est fixée par texte réglementaire ; renseignez-vous au bureau des impôts.', en: 'It is set by regulation; ask at the tax office.', mg: "Voafaritry ny didy izy; manontania any amin'ny biraon'ny hetra." },
  prixL: { fr: 'Prix de vente', en: 'Sale price', mg: 'Vidin’ny varotra' },
  releve: { fr: 'Relevé à la valeur administrative', en: 'Raised to the administrative value', mg: "Nampitoviana tamin'ny sanda ara-panjakana" },
  revient: { fr: 'Prix de revient forfaitaire ({taux})', en: 'Flat-rate cost price ({taux})', mg: "Vidin'ny fahazoana voafetra ({taux})" },
  pv: { fr: 'Plus-value imposable', en: 'Taxable gain', mg: "Tombony iainan'ny hetra" },
  impot: { fr: 'IPVI à {taux}', en: 'IPVI at {taux}', mg: 'IPVI {taux}' },
  total: { fr: 'IPVI à payer', en: 'IPVI to pay', mg: 'IPVI aloa' },
  net: { fr: 'Reste au vendeur', en: 'Left to the seller', mg: "Sisa ho an'ny mpivarotra" },
  parVente: { fr: 'Par vente', en: 'Per sale', mg: 'Isaky ny varotra' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.ipvi.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champMontant('ipvi-prix', l('prix'), EXEMPLE.prixCession)}
        ${champMontant('ipvi-valeur', l('valeur'), EXEMPLE.valeurAdministrative)}
        <p class="aide">${l('valeurNote')}</p>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IPVI</span><span>${l('parVente')}</span></div>
        <div class="rows" id="ipvi-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ipvi-total"></span></div>
        <div class="sub" id="ipvi-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const prix = lireMontant($('ipvi-prix'));
    const r = calculIPVI({ prixCession: prix, valeurAdministrative: lireMontant($('ipvi-valeur')) }, b);
    let h = ligne(l('prixL'), ar(prix), A.plusValue);
    if (r.valeurAdministrativeAppliquee) h += ligne(l('releve'), ar(r.prixRetenu), A.plusValue, 'note');
    h += ligne(l('revient', { taux: pct(b.ipvi.prixRevientForfaitaire, 0) }), '− ' + ar(r.prixRevient), A.plusValue, 'neg')
      + ligne(l('pv'), ar(r.plusValue), A.plusValue) + ligne(l('impot', { taux: pct(r.taux, 0) }), ar(r.impot), A.taux);
    $('ipvi-rows').innerHTML = h;
    $('ipvi-total').textContent = ar(r.impot);
    $('ipvi-sub').innerHTML = puce(l('net'), ar(prix - r.impot));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ipvi', variables, comprendre, monterCalculateur, impotExemple: b => calculIPVI(EXEMPLE, b).impot };
