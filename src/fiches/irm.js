// Fiche IRM (CDI Partie I, Titre I, ST III ; CPF Titre I, ST II, Chap. III). Textes malgaches à relire.
import { calculIRM } from '../calc/irm.js';
import { t, tr, fmt, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { montant: 50000000 };
const variables = b => ({ taux: pct(b.irm.taux, 0) });

const comprendre = {
  definition: {
    article: 'CDI 01.01.44, 01.01.51',
    texte: {
      fr: "L'impôt sur les revenus des marchés (IRM) frappe ce que gagnent les entreprises qui travaillent pour l'État et les personnes publiques : {taux} du montant du marché, quel que soit le bénéfice. Il remplace l'IR ou l'impôt synthétique sur ces revenus.",
      en: 'The public procurement income tax (IRM) applies to what businesses earn working for the State and public bodies: {taux} of the contract amount, whatever the profit. It replaces IR or the synthetic tax on that income.',
      mg: "Ny IRM dia hetra amin'ny vola azon'ny orinasa miasa ho an'ny Fanjakana sy ny sampam-panjakana: {taux} amin'ny vidin'ny tsena, na ohatrinona na ohatrinona ny tombony. Misolo ny IR na ny hetra tsotra amin'ireo vola ireo izy.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.01.45', texte: {
      fr: 'Les titulaires de marchés publics, et de tout marché financé par des fonds publics (budget, emprunt, subvention, don) au profit de l’État, des collectivités, établissements publics ou sociétés à participation publique majoritaire.',
      en: 'Holders of public contracts, and of any contract funded by public money (budget, loan, grant, gift) for the State, local authorities, public bodies or majority state-owned companies.',
      mg: "Ny tompon'ny tsenam-panjakana, sy ny tsena rehetra vatsian'ny volam-panjakana (tetibola, findramam-bola, fanampiana, fanomezana) ho an'ny Fanjakana, vondrom-bahoaka, sampam-panjakana na orinasa an'ny fanjakana ny ankamaroany." } },
    { article: 'CDI 01.01.48', texte: {
      fr: 'Quel que soit le chiffre d’affaires, résident ou non. Aussi : les sous-traitants de premier niveau, et chaque membre d’un consortium pour sa part.',
      en: 'Whatever the turnover, resident or not. Also: first-tier subcontractors, and each consortium member for its share.',
      mg: "Na ohatrinona na ohatrinona ny tondrom-barotra, mponina na tsia. Ary koa: ny mpanao asa an-tsokosoko voalohany, sy ny mpikambana tsirairay ao amin'ny fiaraha-miasa araka ny anjarany." } },
  ],
  exonerations: [
    { article: 'CDI 01.01.46', texte: {
      fr: 'Restent à l’IR ou à l’IS (pas d’IRM) : la fourniture d’eau et d’électricité, de produits pétroliers, les petits marchés passés par simple bon de commande, les services bancaires, et les marchés avec la Banky Foiben’i Madagasikara.',
      en: 'Stay under IR or synthetic tax (no IRM): water and electricity supply, petroleum products, small contracts by simple purchase order, banking services, and contracts with the Banky Foiben’i Madagasikara.',
      mg: "Mijanona amin'ny IR na hetra tsotra (tsy IRM): famatsiana rano sy herinaratra, solika, tsena kely amin'ny taratasy fanafarana fotsiny, tolotra ara-banky, ary tsena miaraka amin'ny Banky Foiben'i Madagasikara." } },
    { article: 'CDI 01.01.46', texte: {
      fr: 'Attention : les abonnements et la location d’immeubles à une personne publique restent soumis à l’IRM, quel que soit le montant.',
      en: 'Note: subscriptions and renting buildings to a public body remain subject to IRM, whatever the amount.',
      mg: "Tandremo: ny famandrihana sy ny fanofana trano amin'ny sampam-panjakana dia mbola iharan'ny IRM, na ohatrinona na ohatrinona." } },
  ],
  aSavoir: [
    { article: 'CDI 01.01.49, 01.01.50', texte: {
      fr: 'La base est le montant du marché. L’impôt est dû à chaque paiement : prix, avances ou acomptes.',
      en: 'The base is the contract amount. Tax is due at each payment: price, advances or instalments.',
      mg: "Ny vidin'ny tsena no fototra. Aloa isaky ny fandoavana ny hetra: vidiny, vola mialoha." } },
    { article: 'CDI 01.01.44', texte: {
      fr: 'Pas de minimum de perception, pas d’acompte, pas de déduction de charges ni de réduction d’impôt : {taux} du montant, point.',
      en: 'No minimum charge, no instalment, no deduction of costs or tax reduction: just {taux} of the amount.',
      mg: "Tsy misy hetra kely indrindra, tsy misy fandoavana mialoha, tsy misy fanesorana fandaniana na fihenana: {taux} amin'ny vola fotsiny." } },
  ],
  exemple: {
    texte: {
      fr: 'Fara dirige une petite entreprise de BTP qui rénove une école pour une commune, pour {montant}. À chaque paiement, le comptable public retient l’IRM : au total {impot}.',
      en: 'Fara runs a small building firm renovating a school for a commune, for {montant}. At each payment the public accountant withholds IRM: {impot} in total.',
      mg: "Mitantana orinasa kely mpanao trano i Fara, manamboatra sekoly ho an'ny kaominina iray amin'ny {montant}. Isaky ny fandoavana, manala ny IRM ny mpitam-bolam-panjakana: {impot} raha atambatra.",
    },
    valeurs: b => ({ montant: ar(EXEMPLE.montant), impot: ar(calculIRM(EXEMPLE.montant, b).impot) }),
  },
};

const L = {
  montant: { fr: 'Montant du marché payé (prix, avance ou acompte)', en: 'Contract amount paid (price, advance or instalment)', mg: "Vidin'ny tsena naloa (vidiny na vola mialoha)" },
  montantL: { fr: 'Montant du marché', en: 'Contract amount', mg: "Vidin'ny tsena" },
  impot: { fr: 'IRM à {taux}', en: 'IRM at {taux}', mg: 'IRM {taux}' },
  total: { fr: 'IRM à payer', en: 'IRM to pay', mg: 'IRM aloa' },
  net: { fr: 'Reste encaissé', en: 'Amount received', mg: 'Vola voaray' },
  parPaiement: { fr: 'Par paiement', en: 'Per payment', mg: 'Isaky ny fandoavana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.irm.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card"><span class="eg">${t('exemple')}</span>${champMontant('irm-montant', l('montant'), EXEMPLE.montant)}</div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IRM</span><span>${l('parPaiement')}</span></div>
        <div class="rows" id="irm-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="irm-total"></span></div>
        <div class="sub" id="irm-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const m = lireMontant($('irm-montant')), r = calculIRM(m, b);
    $('irm-rows').innerHTML = ligne(l('montantL'), ar(m), A.base) + ligne(l('impot', { taux: pct(r.taux, 0) }), ar(r.impot), A.taux);
    $('irm-total').textContent = ar(r.impot);
    $('irm-sub').innerHTML = puce(l('net'), ar(m - r.impot));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'irm', variables, comprendre, monterCalculateur, impotExemple: b => calculIRM(EXEMPLE.montant, b).impot };
