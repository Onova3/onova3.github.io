// Fiche Taxe sur l'eau et/ou l'électricité (CDI Livre II, Titre X ; pas de chapitre CPF). Textes malgaches à relire.
import { calculEauElec } from '../calc/eauElec.js';
import { t, tr, fmt, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

// Montant de facture d'exemple ; les tarifs d'eau et d'électricité ne figurent pas dans le Code.
const EXEMPLE = { montantHT: 80000 };
const variables = b => ({ taux: pct(b.eauElec.taux, 0) });

const comprendre = {
  definition: {
    article: 'CDI 10.10.01, 10.10.04',
    texte: {
      fr: "La taxe communale sur l'eau et l'électricité est ajoutée à chaque facture de la société d'eau et d'électricité. Elle vaut {taux} du tarif hors taxe et finance la commune.",
      en: 'The municipal water and electricity tax is added to each bill from the water and electricity company. It is {taux} of the price excluding tax and funds the commune.',
      mg: "Ny haba ao amin'ny kaominina amin'ny rano sy herinaratra dia ampiana amin'ny faktioran'ny orinasa mpamatsy rano sy herinaratra tsirairay. {taux} amin'ny vidiny tsy misy haba izy ary mamatsy ny kaominina.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.10.02', texte: {
      fr: 'Tous les abonnés, particuliers et entreprises, sur tout le territoire national.',
      en: 'All subscribers, households and businesses, throughout the country.',
      mg: "Ny mpanjifa rehetra, olon-tsotra sy orinasa, manerana ny firenena." } },
  ],
  exonerations: [
    { article: 'CDI 10.10.02', texte: {
      fr: 'Seule la commune qui reçoit la taxe en est exemptée pour ses propres abonnements.',
      en: 'Only the commune receiving the tax is exempt for its own subscriptions.',
      mg: "Ny kaominina mandray ny haba ihany no tsy mandoa amin'ny famandrihany manokana." } },
    { article: 'CDI 06.01.06 6°', texte: {
      fr: 'À ne pas confondre avec la TVA : les ménages sont exonérés de TVA jusqu’à 10 m³ d’eau et 100 kWh d’électricité.',
      en: 'Not to be confused with VAT: households are exempt from VAT up to 10 m³ of water and 100 kWh of electricity.',
      mg: "Aza afangaro amin'ny TVA: tsy iharan'ny TVA ny tokantrano hatramin'ny rano 10 m³ sy herinaratra 100 kWh." } },
  ],
  aSavoir: [
    { article: 'CDI 10.10.05', texte: {
      fr: 'Le nom, le taux et le montant de la taxe doivent apparaître clairement sur la facture.',
      en: 'The name, rate and amount of the tax must appear clearly on the bill.',
      mg: "Tsy maintsy hita mazava amin'ny faktiora ny anarana, ny taha ary ny habetsahan'ny haba." } },
  ],
  exemple: {
    texte: {
      fr: 'Sur une facture d’électricité de {ht} hors taxe, la taxe communale est de {impot}.',
      en: 'On an electricity bill of {ht} excluding tax, the municipal tax is {impot}.',
      mg: "Amin'ny faktioran'ny herinaratra {ht} tsy misy haba, {impot} ny haba ao amin'ny kaominina.",
    },
    valeurs: b => ({ ht: ar(EXEMPLE.montantHT), impot: ar(calculEauElec(EXEMPLE.montantHT, b).impot) }),
  },
};

const L = {
  montant: { fr: 'Montant hors taxe de la consommation facturée', en: 'Amount of consumption billed, excl. tax', mg: "Vidin'ny fanjifana tsy misy haba" },
  calcul: { fr: '{taux} × {ht}', en: '{taux} × {ht}', mg: '{taux} × {ht}' },
  total: { fr: 'Taxe communale sur la facture', en: 'Municipal tax on the bill', mg: "Haba ao amin'ny faktiora" },
  facture: { fr: 'Consommation + taxe communale', en: 'Consumption + municipal tax', mg: 'Fanjifana + haba' },
  parFacture: { fr: 'Par facture', en: 'Per bill', mg: 'Isaky ny faktiora' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.eauElec.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card"><span class="eg">${t('exemple')}</span>${champMontant('ee-ht', l('montant'), EXEMPLE.montantHT)}</div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Eau, électricité', en: 'Water, electricity', mg: 'Rano, herinaratra' })}</span><span>${l('parFacture')}</span></div>
        <div class="rows" id="ee-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ee-total"></span></div>
        <div class="sub" id="ee-sub"></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const ht = lireMontant($('ee-ht')), r = calculEauElec(ht, b);
    $('ee-rows').innerHTML = ligne(l('calcul', { taux: pct(r.taux, 0), ht: ar(ht) }), ar(r.impot), A.taux);
    $('ee-total').textContent = ar(r.impot);
    $('ee-sub').innerHTML = puce(l('facture'), ar(ht + r.impot));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'eau-elec', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculEauElec(EXEMPLE.montantHT, b).impot };
