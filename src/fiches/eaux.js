// Fiche Taxe sur les eaux minérales (CDI Livre II, Titre VIII ; CPF Chap. XVIII). Textes malgaches à relire.
import { calculEaux } from '../calc/eaux.js';
import { t, tr, fmt, ar, ligne, champMontant, champCommunal, lireMontant, lireCommunal, brancher } from '../ui.js';

const EXEMPLE = { litres: 300000 };
const variables = b => ({ max: ar(b.eauxMinerales.maxParLitre) });

const comprendre = {
  definition: {
    article: 'CDI 10.08.01, 10.08.04',
    texte: {
      fr: "La commune où se trouve une source d'eau minérale perçoit une taxe sur chaque litre mis en bouteille et vendu. La commune vote son tarif chaque année, sans dépasser {max} par litre.",
      en: 'The commune where a mineral spring is located levies a tax on each litre bottled and sold. The commune votes its rate each year, up to {max} per litre.',
      mg: "Ny kaominina misy loharano rano mineraly no mandray haba amin'ny litatra tsirairay ampidirina anaty tavoahangy sy amidy. Ny kaominina no mandany ny tahany isan-taona, tsy mihoatra ny {max} isaky ny litatra.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.08.02', texte: {
      fr: 'Les entreprises qui exploitent une source d’eau minérale ou gazéifiée vendue en bouteilles. Elles ajoutent la taxe sur leurs factures.',
      en: 'Businesses operating a mineral or sparkling water source sold in bottles. They add the tax to their invoices.',
      mg: "Ny orinasa mitrandraka loharano rano mineraly na misy entona amidy anaty tavoahangy. Ampiany amin'ny faktiorany ny haba." } },
  ],
  exonerations: [
    { article: 'CDI 10.08.02', texte: {
      fr: 'Seules les eaux livrées en bouteilles sont visées.',
      en: 'Only water delivered in bottles is covered.',
      mg: "Ny rano amidy anaty tavoahangy ihany no voakasika." } },
  ],
  aSavoir: [
    { article: 'CDI 10.08.03', texte: {
      fr: 'La taxe porte sur chaque litre ou fraction de litre mis à la consommation.',
      en: 'The tax applies to each litre or part of a litre released for consumption.',
      mg: "Mikasika ny litatra tsirairay na ampahany navoaka ho amin'ny fanjifana ny haba." } },
  ],
  exemple: {
    texte: {
      fr: 'Une société d’eau minérale d’Antsirabe a vendu 300 000 litres au trimestre. Si la commune applique le plafond, elle verse {impot} avant la fin du mois qui suit le trimestre.',
      en: 'A mineral water company in Antsirabe sold 300,000 litres in the quarter. If the commune applies the ceiling, it pays {impot} before the end of the month after the quarter.',
      mg: "Orinasa rano mineraly any Antsirabe no nivarotra 300 000 litatra tao anatin'ny telo volana. Raha ny fetra ambony no ampiharin'ny kaominina, {impot} no aloany alohan'ny fiafaran'ny volana manaraka.",
    },
    valeurs: b => ({ impot: ar(calculEaux({ litres: EXEMPLE.litres, tarifParLitre: b.eauxMinerales.maxParLitre }).impot) }),
  },
};

const L = {
  litres: { fr: 'Litres mis à la consommation dans le trimestre', en: 'Litres released for consumption in the quarter', mg: 'Litatra navoaka tao anatin’ny telo volana' },
  tarif: { fr: 'Tarif voté par ma commune, par litre', en: 'Rate voted by my commune, per litre', mg: 'Taha nolanian’ny kaominako, isaky ny litatra' },
  regle: { fr: 'Plafond fixé par le Code : {max} par litre.', en: 'Ceiling set by the Code: {max} per litre.', mg: 'Fetra ambony napetraky ny Fehezan-dalàna: {max} isaky ny litatra.' },
  calcul: { fr: '{n} litres × {m}', en: '{n} litres × {m}', mg: '{n} litatra × {m}' },
  total: { fr: 'Taxe à verser', en: 'Tax to pay', mg: 'Haba aloa' },
  parTrim: { fr: 'Par trimestre', en: 'Per quarter', mg: 'Isaky ny telo volana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const E = b.eauxMinerales, A = E.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champMontant('eau-l', l('litres'), EXEMPLE.litres).replace('<span class="u">Ar</span>', '<span class="u">l</span>')}
        ${champCommunal({ id: 'eau-tarif', libelle: l('tarif'), valeur: E.maxParLitre, max: E.maxParLitre, unite: 'Ar/l', article: A.tarif, regle: l('regle', { max: ar(E.maxParLitre) }) + ' ' + t('valeur_exemple') })}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Eaux minérales', en: 'Mineral water', mg: 'Rano mineraly' })}</span><span>${l('parTrim')}</span></div>
        <div class="rows" id="eau-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="eau-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const tarif = lireCommunal(p, 'eau-tarif'), r = calculEaux({ litres: lireMontant($('eau-l')), tarifParLitre: tarif });
    $('eau-rows').innerHTML = ligne(l('calcul', { n: r.litresTaxes.toLocaleString('fr-FR'), m: ar(tarif) }), ar(r.impot), A.base);
    $('eau-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'eaux', impotLocal: true, variables, comprendre, monterCalculateur,
  impotExemple: b => calculEaux({ litres: EXEMPLE.litres, tarifParLitre: b.eauxMinerales.maxParLitre }).impot };
