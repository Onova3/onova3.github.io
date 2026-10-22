// Fiche IRCM (CDI Partie I, Titre IV ; CPF Titre I, ST II, Chap. VI). Textes malgaches à relire.
import { calculIRCM } from '../calc/ircm.js';
import { t, tr, fmt, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { montant: 2000000, nature: 'dividendes' };
const variables = b => ({ taux: pct(b.ircm.taux, 0), abattement: pct(b.ircm.abattementDividendes, 0), tauxCoop: pct(b.ircm.tauxCooperatives, 0) });

const comprendre = {
  definition: {
    article: 'CDI 01.04.01, 01.04.04',
    texte: {
      fr: "L'impôt sur les revenus des capitaux mobiliers (IRCM) frappe les revenus de l'argent placé : intérêts, dividendes, jetons de présence… Il est retenu directement par celui qui paie, au taux de {taux}.",
      en: 'The investment income tax (IRCM) applies to income from invested money: interest, dividends, directors’ fees… It is withheld directly by the payer, at {taux}.',
      mg: "Ny IRCM dia hetra amin'ny vola azo avy amin'ny vola napetraka: zana-bola, tombom-barotra zaraina, tambin'ny mpitantana… Esorin'ny mpandoa mivantana izy, amin'ny taha {taux}.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.04.02 1°, 5°, 01.04.03 1°', texte: {
      fr: 'Intérêts des prêts, obligations, créances et dépôts, placements bancaires et d’assurance, bons du Trésor (BTA, BTF).',
      en: 'Interest on loans, bonds, receivables and deposits, bank and insurance investments, Treasury bills (BTA, BTF).',
      mg: "Zana-bola amin'ny fampindramam-bola, obligasiona, trosa sy petra-bola, fametrahana any amin'ny banky sy fiantohana, bons du Trésor (BTA, BTF)." } },
    { article: 'CDI 01.04.02 6°', texte: {
      fr: 'Dividendes reçus par les associés, résidents ou non, et plus-values de cession de valeurs mobilières par des particuliers (champ élargi par la LFR 2026).',
      en: 'Dividends received by partners, resident or not, and capital gains on securities sold by individuals (scope widened by the 2026 amending law).',
      mg: "Tombom-barotra zaraina azon'ny mpikambana, mponina na tsia, ary tombony amin'ny fivarotana anjara ataon'ny olon-tsotra (nitarina tamin'ny LFR 2026)." } },
    { article: 'CDI 01.04.02 3°, 01.04.03 2°, 3°', texte: {
      fr: 'Jetons de présence et rémunérations des administrateurs, intérêts des comptes courants d’associés, intérêts sur parts sociales et ristournes des coopératives.',
      en: 'Directors’ fees and pay, interest on partners’ current accounts, interest on cooperative shares and cooperative rebates.',
      mg: "Tambin'ny mpitantana, zana-bola amin'ny kaonty ankehitriny an'ny mpikambana, zana-bola amin'ny anjara sy fiverenam-bola avy amin'ny koperativa." } },
  ],
  exonerations: [
    { article: 'CDI 01.04.10', texte: {
      fr: 'Intérêts perçus par les banques sur leurs crédits, intérêts des dépôts à vue, et intérêts des emprunts d’investissement accordés par des bailleurs extérieurs.',
      en: 'Interest received by banks on their loans, interest on demand deposits, and interest on investment loans from foreign lenders.',
      mg: "Zana-bola azon'ny banky amin'ny fampindramany, zana-bola amin'ny petra-bola azo alaina avy hatrany, ary zana-bola amin'ny findramam-bola fampiasam-bola avy any ivelany." } },
    { article: 'CDI 01.04.11 à 01.04.14', texte: {
      fr: 'Prêts entre une coopérative et ses membres, crédit mutuel et coopération agricole, associations de secours mutuel, avances par warrants.',
      en: 'Loans between a cooperative and its members, mutual credit and farming cooperation, mutual aid associations, warrant advances.',
      mg: "Fampindramam-bola eo amin'ny koperativa sy ny mpikambana, fampindramam-bola ifanaovana sy fiaraha-miasa ara-pambolena, fikambanana fifanampiana, vola mialoha amin'ny warrant." } },
    { article: 'CDI 01.01.03 1° à 3°', texte: {
      fr: 'À l’IR, les intérêts de la Caisse d’Épargne de Madagascar, de l’emprunt national et des bons de caisse sont exonérés.',
      en: 'Under IR, interest from the Caisse d’Épargne de Madagascar, the national loan and cash bonds is exempt.',
      mg: "Amin'ny IR, tsy iharan'ny hetra ny zana-bola avy amin'ny Caisse d'Épargne de Madagascar, ny findramam-bola nasionaly ary ny bons de caisse." } },
  ],
  aSavoir: [
    { article: 'CDI 01.04.04', texte: {
      fr: 'Dividendes : abattement de {abattement} avant d’appliquer le taux. Intérêts sur parts sociales et ristournes de coopératives : taux réduit de {tauxCoop}. Revenus arrondis au millier d’ariary inférieur.',
      en: 'Dividends: {abattement} allowance before applying the rate. Interest on cooperative shares and rebates: reduced rate of {tauxCoop}. Income rounded down to the thousand ariary.',
      mg: "Tombom-barotra zaraina: esorina {abattement} alohan'ny hampiharana ny taha. Zana-bola amin'ny anjaran'ny koperativa sy fiverenam-bola: taha {tauxCoop}. Boriborina ho amin'ny arivo ariary ambany ny vola." } },
    { article: 'CDI 01.04.04', texte: {
      fr: 'L’IRCM payé est libératoire : sur justification, ces revenus ne sont plus taxés à l’IR.',
      en: 'IRCM paid is final: with proof, this income is not taxed again under IR.',
      mg: "Famaranana ny IRCM naloa: raha misy porofo, tsy iharan'ny IR intsony ireo vola ireo." } },
  ],
  exemple: {
    texte: {
      fr: 'Mamy détient des parts d’une SARL familiale qui lui verse {montant} de dividendes. La société retient {impot} d’IRCM et verse le reste.',
      en: 'Mamy holds shares in a family SARL that pays {montant} in dividends. The company withholds {impot} of IRCM and pays the rest.',
      mg: "Manana anjara ao amin'ny SARL ara-pianakaviana i Mamy, izay mandoa tombom-barotra {montant}. Manala IRCM {impot} ny orinasa ary mandoa ny ambiny.",
    },
    valeurs: b => ({ montant: ar(EXEMPLE.montant), impot: ar(calculIRCM(EXEMPLE, b).impot) }),
  },
};

const L = {
  interets: { fr: 'Intérêts', en: 'Interest', mg: 'Zana-bola' },
  dividendes: { fr: 'Dividendes', en: 'Dividends', mg: 'Tombom-barotra zaraina' },
  cooperative: { fr: 'Ristournes de coopérative', en: 'Cooperative rebates', mg: 'Fiverenam-bola koperativa' },
  nature: { fr: 'Nature du revenu', en: 'Type of income', mg: "Karazan'ny vola miditra" },
  montant: { fr: 'Montant brut versé', en: 'Gross amount paid', mg: 'Vola naloa manontolo' },
  brut: { fr: 'Revenu brut', en: 'Gross income', mg: 'Vola manontolo' },
  abattement: { fr: 'Abattement sur dividendes ({taux})', en: 'Dividend allowance ({taux})', mg: 'Fihenana amin’ny tombom-barotra ({taux})' },
  base: { fr: 'Base, arrondie au millier inférieur', en: 'Base, rounded down to the thousand', mg: "Fototra, boribory ho amin'ny arivo ambany" },
  impot: { fr: 'IRCM à {taux}', en: 'IRCM at {taux}', mg: 'IRCM {taux}' },
  total: { fr: 'IRCM retenu', en: 'IRCM withheld', mg: 'IRCM nesorina' },
  net: { fr: 'Net reçu', en: 'Net received', mg: 'Vola voaray' },
  parVersement: { fr: 'Par versement', en: 'Per payment', mg: 'Isaky ny fandoavana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let nature = EXEMPLE.nature;

function monterCalculateur(p, b) {
  const A = b.ircm.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <div class="f"><span>${l('nature')}</span>
          <div class="seg seg3" role="group">${['interets', 'dividendes', 'cooperative'].map(n =>
            `<button type="button" data-nature="${n}" aria-pressed="${n === nature}">${l(n)}</button>`).join('')}</div></div>
        ${champMontant('ircm-montant', l('montant'), EXEMPLE.montant)}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IRCM</span><span>${l('parVersement')}</span></div>
        <div class="rows" id="ircm-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ircm-total"></span></div>
        <div class="sub" id="ircm-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const m = lireMontant($('ircm-montant')), r = calculIRCM({ montant: m, nature }, b);
    let h = ligne(l('brut'), ar(m), A.champ);
    if (nature === 'dividendes') h += ligne(l('abattement', { taux: pct(b.ircm.abattementDividendes, 0) }), '− ' + ar(m * b.ircm.abattementDividendes), A.calcul, 'neg');
    h += ligne(l('base'), ar(r.base), A.calcul) + ligne(l('impot', { taux: pct(r.taux, 0) }), ar(r.impot), A.calcul);
    $('ircm-rows').innerHTML = h;
    $('ircm-total').textContent = ar(r.impot);
    $('ircm-sub').innerHTML = puce(l('net'), ar(m - r.impot));
  };
  p.querySelectorAll('[data-nature]').forEach(bt => bt.addEventListener('click', () => {
    nature = bt.dataset.nature;
    p.querySelectorAll('[data-nature]').forEach(x => x.setAttribute('aria-pressed', x === bt));
    recalculer();
  }));
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ircm', variables, comprendre, monterCalculateur, impotExemple: b => calculIRCM(EXEMPLE, b).impot };
