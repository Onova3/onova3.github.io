// Fiche Impôt foncier sur la propriété bâtie (CDI Livre II, Titre II ; CPF Chap. XIII). Textes malgaches à relire.
import { calculIFPB } from '../calc/ifpb.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, champCommunal, lireMontant, lireCommunal, brancher } from '../ui.js';

// La valeur de la commission est votée par chaque commune : les montants ci-dessous sont des exemples.
const EXEMPLE = { usage: 'loue', loyerMensuel: 300000, valeurCommission: 2400000 };
const variables = b => ({ taux: pct(b.ifpb.taux, 0), min: ar(b.ifpb.minimum), part: pct(b.ifpb.partValeurLocativeReduite, 0),
  majo: pct(b.ifpb.majorationSansRevision, 0), ans: b.ifpb.exonerationConstructionNeuveAnnees });
const exemple = (b, usage = EXEMPLE.usage) => calculIFPB({ usage, loyersAnnuels: EXEMPLE.loyerMensuel * 12, valeurCommission: EXEMPLE.valeurCommission }, b);

const comprendre = {
  definition: {
    article: 'CDI 10.02.01, 10.02.10',
    texte: {
      fr: "L'impôt foncier sur la propriété bâtie (IFPB) est l'impôt annuel de la commune sur les maisons et immeubles. Il est égal à {taux} de la valeur locative, c'est-à-dire du loyer annuel que le bien rapporte ou pourrait rapporter, et n'est jamais inférieur à {min} par immeuble.",
      en: 'The built property tax (IFPB) is the commune’s annual tax on houses and buildings. It equals {taux} of the rental value, i.e. the annual rent the property brings or could bring, and is never less than {min} per building.',
      mg: "Ny IFPB dia hetra isan-taona an'ny kaominina amin'ny trano. Mitovy amin'ny {taux} amin'ny sanda fanofana izy, izany hoe ny hofan-trano isan-taona azo na mety ho azo amin'ilay trano, ary tsy latsaky ny {min} isaky ny trano mihitsy.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.02.02', texte: {
      fr: 'Le propriétaire au 1er janvier, pour toute construction achevée (habitable ou habitée), quels que soient les matériaux ; aussi les terrains à usage industriel ou commercial et l’outillage fixé à l’immeuble.',
      en: 'The owner on 1 January, for any completed building (habitable or lived in), whatever the materials; also land used for industry or trade and equipment fixed to the building.',
      mg: "Ny tompony amin'ny 1 janoary, ho an'ny trano vita rehetra (azo onenana na onenana), na inona na inona fitaovana; ary koa ny tany ho an'ny indostria na varotra sy ny milina miraikitra amin'ny trano." } },
  ],
  exonerations: [
    { article: 'CDI 10.02.03', texte: {
      fr: 'Bâtiments publics affectés à un service public ; bâtiments gratuitement affectés aux œuvres sociales et médicales, à l’enseignement ou au culte.',
      en: 'Public buildings used for a public service; buildings given free to social and medical works, education or worship.',
      mg: "Tranom-panjakana ho an'ny asam-panjakana; trano omena maimaimpoana ho an'ny asa sosialy sy fitsaboana, fampianarana na fivavahana." } },
    { article: 'CDI 10.02.04, 10.02.05', texte: {
      fr: 'Construction neuve : exonérée pendant {ans} ans à partir de l’achèvement, sur demande avec le permis d’habiter. L’exonération s’arrête si la maison est vendue, mais continue pour les héritiers.',
      en: 'New building: exempt for {ans} years from completion, on request with the occupancy permit. The exemption ends if the house is sold, but continues for heirs.',
      mg: "Trano vaovao: tsy iharan'ny hetra mandritra ny {ans} taona manomboka amin'ny nahavitana azy, raha angatahina miaraka amin'ny fahazoan-dalana hipetraka. Mijanona raha amidy ny trano, fa mitohy ho an'ny mpandova." } },
  ],
  aSavoir: [
    { article: 'CDI 10.02.06', texte: {
      fr: 'Maison louée : la valeur locative est le loyer de l’année, sans descendre sous l’évaluation de la commission communale. Maison où le propriétaire habite (résidence principale) : seulement {part} de cette évaluation.',
      en: 'Rented house: the rental value is the year’s rent, never below the municipal commission’s valuation. House where the owner lives (main residence): only {part} of that valuation.',
      mg: "Trano ofana: ny hofan-trano isan-taona no sanda fanofana, tsy latsaky ny tombanan'ny vaomiera ao amin'ny kaominina. Trano onenan'ny tompony (fonenana fototra): {part} amin'io tombana io ihany." } },
    { article: 'CDI 10.02.08, 10.02.09', texte: {
      fr: 'Une commission communale propose les valeurs locatives, votées par le conseil municipal. Sans révision, elles augmentent de {majo} pour 3 ans.',
      en: 'A municipal commission proposes rental values, voted by the council. Without revision, they rise by {majo} for 3 years.',
      mg: "Vaomiera ao amin'ny kaominina no manolotra ny sanda fanofana, lanian'ny filankevitra. Raha tsy havaozina, miakatra {majo} mandritra ny 3 taona izy ireo." } },
  ],
  exemple: {
    texte: {
      fr: 'Tahiry loue un appartement à Antsirabe {loyer} par mois. Valeur locative : {vl} par an ; IFPB : {impot}. Si Tahiry y habitait, avec une évaluation communale de {commission}, l’IFPB serait de {impotRP}. (Montants d’exemple.)',
      en: 'Tahiry rents out a flat in Antsirabe for {loyer} a month. Rental value: {vl} a year; IFPB: {impot}. If Tahiry lived there, with a municipal valuation of {commission}, IFPB would be {impotRP}. (Example amounts.)',
      mg: "Mampanofa efitrano any Antsirabe {loyer} isam-bolana i Tahiry. Sanda fanofana: {vl} isan-taona; IFPB: {impot}. Raha i Tahiry no nipetraka teo, miaraka amin'ny tombana {commission} avy amin'ny kaominina, {impotRP} ny IFPB. (Ohatra fotsiny ny vola.)",
    },
    valeurs: b => {
      const r = exemple(b), rp = exemple(b, 'residencePrincipale');
      return { loyer: ar(EXEMPLE.loyerMensuel), vl: ar(r.valeurLocative), impot: ar(r.impot), commission: ar(EXEMPLE.valeurCommission), impotRP: ar(rp.impot) };
    },
  },
};

const USAGES = {
  loue: { fr: 'Loué', en: 'Rented out', mg: 'Ofana' },
  residencePrincipale: { fr: 'Habité par le propriétaire (résidence principale)', en: 'Lived in by the owner (main residence)', mg: "Onenan'ny tompony (fonenana fototra)" },
  industrielLDI: { fr: 'Industriel, entreprise agréée (Loi sur le développement de l’industrie)', en: 'Industrial, approved company (Industry Development Law)', mg: 'Indostria, orinasa nankatoavina (Lalàna momba ny fampandrosoana ny indostria)' },
};
const L = {
  usage: { fr: 'Usage de l’immeuble', en: 'Use of the building', mg: "Fampiasana ny trano" },
  loyer: { fr: 'Loyer mensuel', en: 'Monthly rent', mg: 'Hofan-trano isam-bolana' },
  commission: { fr: 'Valeur locative annuelle fixée par ma commune (0 si inconnue)', en: 'Annual rental value set by my commune (0 if unknown)', mg: 'Sanda fanofana isan-taona napetraky ny kaominako (0 raha tsy fantatra)' },
  regleCommission: { fr: 'Proposée par la commission communale et votée par le conseil municipal ; aucune fourchette dans le Code.', en: 'Proposed by the municipal commission and voted by the council; no range in the Code.', mg: "Aroson'ny vaomiera ao amin'ny kaominina ary lanian'ny filankevitra; tsy misy fetra ao amin'ny Fehezan-dalàna." },
  revision: { fr: 'Ma commune n’a pas révisé ses évaluations (majoration de {majo})', en: 'My commune has not revised its valuations ({majo} increase)', mg: "Tsy nohavaozin'ny kaominako ny tombana (fiakarana {majo})" },
  loyers: { fr: 'Loyers de l’année ({m} × 12)', en: 'Year’s rent ({m} × 12)', mg: 'Hofan-trano isan-taona ({m} × 12)' },
  commissionL: { fr: 'Évaluation communale', en: 'Municipal valuation', mg: 'Tombana avy amin’ny kaominina' },
  commissionRetenue: { fr: 'Évaluation communale retenue (plus élevée que les loyers)', en: 'Municipal valuation used (higher than rent)', mg: 'Tombana avy amin’ny kaominina no noraisina' },
  vl: { fr: 'Valeur locative', en: 'Rental value', mg: 'Sanda fanofana' },
  impot: { fr: 'IFPB à {taux}', en: 'IFPB at {taux}', mg: 'IFPB {taux}' },
  minimum: { fr: 'Minimum par immeuble appliqué', en: 'Minimum per building applied', mg: 'Hetra kely indrindra nampiharina' },
  total: { fr: 'IFPB à payer', en: 'IFPB to pay', mg: 'IFPB aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let usage = EXEMPLE.usage;

function monterCalculateur(p, b) {
  const A = b.ifpb.articles, v = variables(b);
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('usage')}</span><select id="ifpb-usage">${Object.keys(USAGES).map(k =>
          `<option value="${k}"${k === usage ? ' selected' : ''}>${esc(tr(USAGES[k]))}</option>`).join('')}</select></label>
        ${usage === 'loue' ? champMontant('ifpb-loyer', l('loyer'), EXEMPLE.loyerMensuel) : ''}
        ${champCommunal({ id: 'ifpb-commission', libelle: l('commission'), valeur: usage === 'loue' ? 0 : EXEMPLE.valeurCommission, article: A.base,
          regle: l('regleCommission') + ' ' + t('valeur_exemple') })}
        <label class="check"><input type="checkbox" id="ifpb-revision"><span>${l('revision', { majo: v.majo })}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IFPB</span><span>${l('parAn')}</span></div>
        <div class="rows" id="ifpb-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ifpb-total"></span></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('ifpb-usage').addEventListener('change', () => { usage = $('ifpb-usage').value; monterCalculateur(p, b); });
  const recalculer = () => {
    const loyer = usage === 'loue' ? lireMontant($('ifpb-loyer')) : 0;
    const r = calculIFPB({ usage, loyersAnnuels: loyer * 12, valeurCommission: lireCommunal(p, 'ifpb-commission'), sansRevision: $('ifpb-revision').checked }, b);
    let h = '';
    if (usage === 'loue') h += ligne(l('loyers', { m: ar(loyer) }), ar(loyer * 12), A.base);
    if (r.commission) h += ligne(l('commissionL'), ar(r.commission), A.revision);
    if (r.commissionAppliquee) h += ligne(l('commissionRetenue'), '', A.base, 'note');
    h += ligne(l('vl'), ar(r.valeurLocative), A.base) + ligne(l('impot', { taux: pct(r.taux, 0) }), ar(r.calcule), A.calcul);
    if (r.minimumApplique) h += ligne(l('minimum'), ar(b.ifpb.minimum), A.calcul, 'note');
    $('ifpb-rows').innerHTML = h;
    $('ifpb-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ifpb', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => exemple(b).impot };
