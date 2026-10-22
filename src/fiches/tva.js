// Fiche TVA (CDI Partie VI, Titre I ; CPF Titre I, ST II, Chap. XI). Textes malgaches à relire.
import { calculTVA, calculDeclarationTVA } from '../calc/tva.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { ventesHT: 30000000, exportations: 0, tvaDeductible: 3000000, creditAnterieur: 0, prix: 100000 };

const declarationExemple = (b, e = EXEMPLE) => calculDeclarationTVA({
  ventes: [{ ht: e.ventesHT, taux: b.tva.tauxNormal }, { ht: e.exportations, taux: b.tva.tauxExport }],
  tvaDeductible: e.tvaDeductible, creditAnterieur: e.creditAnterieur }, b);

const variables = b => {
  const v = b.tva;
  return { seuil: ar(v.seuilObligatoire), option: ar(v.seuilOption), normal: pct(v.tauxNormal, 0), gaz: pct(v.tauxReduitGaz, 0),
    riz: pct(v.tauxReduit, 0), export: pct(v.tauxExport, 0), report: v.reportCreditAnnees };
};

const comprendre = {
  definition: {
    article: 'CDI 06.01.01, 06.01.02, 06.01.16',
    texte: {
      fr: "La TVA est un impôt sur la consommation : c'est le client final qui la paie dans le prix. L'entreprise collecte la TVA sur ses ventes, déduit celle qu'elle a payée sur ses achats, et reverse la différence chaque mois.",
      en: 'VAT is a consumption tax: the final customer pays it in the price. The business collects VAT on its sales, deducts what it paid on its purchases, and pays over the difference every month.',
      mg: "Hetra amin'ny fanjifana ny TVA: ny mpanjifa farany no mandoa azy ao anatin'ny vidiny. Ny orinasa manangona TVA amin'ny varotra, manala ny naloany tamin'ny fividianana, ary mandoa ny sisa isam-bolana.",
    },
  },
  quiPaie: [
    { article: 'CDI 06.01.04', texte: {
      fr: 'Obligatoirement : toute entreprise dont le chiffre d’affaires annuel hors taxe atteint {seuil}.',
      en: 'Mandatorily: any business with annual turnover excluding tax of {seuil} or more.',
      mg: "Tsy maintsy: ny orinasa rehetra manana tondrom-barotra isan-taona tsy misy haba {seuil} na mihoatra." } },
    { article: 'CDI 06.01.04, 01.01.13 I', texte: {
      fr: 'Sur option : les entreprises qui choisissent le régime du réel (possible notamment dès {option} de chiffre d’affaires, avec des états financiers certifiés).',
      en: 'By option: businesses that choose the real regime (possible in particular from {option} of turnover, with certified financial statements).',
      mg: "Raha misafidy: ny orinasa misafidy ny rafitra tena izy (azo atao indrindra manomboka amin'ny tondrom-barotra {option}, miaraka amin'ny tatitra ara-bola voamarina)." } },
    { article: 'CDI 06.01.03', texte: {
      fr: 'Toutes les importations, quel que soit l’importateur ; les travaux immobiliers ; les biens qu’une entreprise assujettie prélève pour elle-même.',
      en: 'All imports, whoever the importer; building works; goods a registered business takes for its own use.',
      mg: "Ny fanafarana rehetra, na iza na iza no manafatra; ny asa fanorenana; ny entana alain'ny orinasa iharan'ny TVA ho azy manokana." } },
    { article: 'CDI 06.01.04, 06.01.09 bis', texte: {
      fr: 'Les prestataires étrangers qui rendent des services à Madagascar, quel que soit leur chiffre d’affaires.',
      en: 'Foreign providers supplying services in Madagascar, whatever their turnover.',
      mg: "Ny mpanome tolotra vahiny manome tolotra eto Madagasikara, na ohatrinona na ohatrinona ny tondrom-barotra." } },
  ],
  exonerations: [
    { article: 'CDI 06.01.06 1°, 7°, 8°, 11°', texte: {
      fr: 'Écolages, soins de santé, médicaments, livres et imprimés scolaires.',
      en: 'School fees, health care, medicines, school books and printed matter.',
      mg: "Saram-pianarana, fitsaboana, fanafody, boky sy taratasy fianarana." } },
    { article: 'CDI 06.01.06 6°', texte: {
      fr: 'L’eau et l’électricité des ménages, jusqu’à 10 m³ d’eau et 100 kWh d’électricité.',
      en: 'Household water and electricity, up to 10 m³ of water and 100 kWh of electricity.',
      mg: "Ny rano sy herinaratra ampiasain'ny tokantrano, hatramin'ny rano 10 m³ sy herinaratra 100 kWh." } },
    { article: 'CDI 06.01.06 13°, 21°', texte: {
      fr: 'Intrants agricoles ; maïs, blé, paddy, farine et huile alimentaire fabriquées localement, lait pour nourrissons. Le riz figure aussi dans cette liste, mais la LFR 2026 lui applique un taux réduit (voir « Bon à savoir »).',
      en: 'Farm inputs; maize, wheat, paddy, locally made flour and cooking oil, infant milk. Rice is also on this list, but the 2026 amending law applies a reduced rate to it (see “Good to know”).',
      mg: "Fitaovana fambolena; katsaka, varimbazaha, akotry, lafarinina sy menaka vita eto an-toerana, ronono ho an'ny zazakely. Ao anatin'io lisitra io koa ny vary, saingy taha ambany no ampiharin'ny LFR 2026 aminy (jereo « Tsara ho fantatra »)." } },
    { article: 'CDI 06.01.06 18°, 29°', texte: {
      fr: 'Le transport aérien et maritime international, et les véhicules hybrides.',
      en: 'International air and sea transport, and hybrid vehicles.',
      mg: "Ny fitaterana an-habakabaka sy an-dranomasina iraisam-pirenena, ary ny fiara hybride." } },
    { article: 'CDI 06.01.06 28°, 06.01.08', texte: {
      fr: 'Les marchés soumis à l’IRM. Hors du champ de la TVA : les salaires.',
      en: 'Contracts subject to IRM. Outside the scope of VAT: salaries.',
      mg: "Ny tsena iharan'ny IRM. Tsy tafiditra amin'ny TVA: ny karama." } },
  ],
  aSavoir: [
    { article: 'CDI 06.01.12', texte: {
      fr: 'Taux : {normal} en général ; {gaz} pour le gaz butane et ses bouteilles ; {riz} pour le riz depuis la LFR 2026 ; {export} pour les exportations.',
      en: 'Rates: {normal} in general; {gaz} for butane gas and its cylinders; {riz} for rice since the 2026 amending law; {export} for exports.',
      mg: "Taha: {normal} amin'ny ankapobeny; {gaz} ho an'ny entona butane sy ny tavoahangy; {riz} ho an'ny vary nanomboka ny LFR 2026; {export} ho an'ny fanondranana." } },
    { article: 'CDI 06.01.17', texte: {
      fr: 'Pour déduire la TVA d’un achat, il faut une facture conforme d’un fournisseur assujetti, payée par banque ou mobile banking.',
      en: 'To deduct VAT on a purchase, you need a proper invoice from a registered supplier, paid by bank or mobile banking.',
      mg: "Mba hanesorana ny TVA amin'ny fividianana, ilaina ny faktiora ara-dalàna avy amin'ny mpamatsy iharan'ny TVA, naloa tamin'ny banky na mobile banking." } },
    { article: 'CDI 06.01.18', texte: {
      fr: 'Non déductible : voitures particulières (sauf location ou transport payant), logements non professionnels, meubles (sauf hôtels et restaurants), carburants, nourriture consommée dans l’entreprise.',
      en: 'Not deductible: private cars (except for rental or paid transport), non-business housing, furniture (except hotels and restaurants), fuel, food consumed in the business.',
      mg: "Tsy azo esorina: fiara tsotra (afa-tsy ho an'ny fanofana na fitaterana mandoa), trano tsy ho an'ny asa, fanaka (afa-tsy hotely sy trano fisakafoanana), solika, sakafo hanina ao amin'ny orinasa." } },
    { article: 'CDI 06.01.23, 06.01.24', texte: {
      fr: 'Si la TVA déductible dépasse la TVA collectée, l’écart est un crédit reporté sur les mois suivants, pendant {report} ans au plus. Il n’est remboursé qu’aux exportateurs, zones franches, crédits-bailleurs et entreprises qui investissent.',
      en: 'If deductible VAT exceeds VAT collected, the difference is a credit carried forward to later months, for up to {report} years. It is refunded only to exporters, free zones, leasing companies and investing businesses.',
      mg: "Raha mihoatra ny TVA voaray ny TVA azo esorina, trosa afindra amin'ny volana manaraka ny tsy fitoviana, mandritra ny {report} taona farafahabetsany. Tsy averina afa-tsy amin'ny mpanondrana, faritra afaka, mpampanofa ary orinasa mampiasa vola." } },
    { article: 'CDI 06.01.26', texte: {
      fr: 'Entre entreprises assujetties, les paiements se font par chèque, virement, carte bancaire ou mobile banking, pas en espèces.',
      en: 'Between registered businesses, payments are made by cheque, transfer, bank card or mobile banking, not in cash.',
      mg: "Eo amin'ny orinasa iharan'ny TVA, aloa amin'ny seky, famindram-bola, karatra na mobile banking ny vola, fa tsy vola an-tanana." } },
  ],
  exemple: {
    texte: {
      fr: 'Tiana tient une quincaillerie à Fianarantsoa. En mars : {ventes} de ventes hors taxe, soit {collectee} de TVA collectée, et {deductible} de TVA payée sur ses achats avec factures. La TVA de mars à verser avant le 15 avril est de {aPayer}.',
      en: 'Tiana runs a hardware shop in Fianarantsoa. In March: {ventes} of sales excluding tax, i.e. {collectee} of VAT collected, and {deductible} of VAT paid on invoiced purchases. March VAT payable by 15 April is {aPayer}.',
      mg: "Mitantana fivarotana fitaovana any Fianarantsoa i Tiana. Tamin'ny martsa: varotra tsy misy haba {ventes}, izany hoe TVA voaray {collectee}, ary TVA naloa tamin'ny fividianana misy faktiora {deductible}. Ny TVA amin'ny martsa haloa alohan'ny 15 aprily dia {aPayer}.",
    },
    valeurs: b => {
      const r = declarationExemple(b);
      return { ventes: ar(EXEMPLE.ventesHT), collectee: ar(r.collectee), deductible: ar(EXEMPLE.tvaDeductible), aPayer: ar(r.aPayer) };
    },
  },
};

const L = {
  declaration: { fr: 'Déclaration du mois', en: 'Monthly return', mg: 'Fanambarana isam-bolana' },
  prix: { fr: 'Prix HT ↔ TTC', en: 'Price excl. ↔ incl. tax', mg: 'Vidiny HT ↔ TTC' },
  ventes: { fr: 'Ventes du mois au taux normal, hors taxe', en: 'Month’s sales at the standard rate, excl. tax', mg: "Varotra tamin'ny volana amin'ny taha ankapobeny, tsy misy haba" },
  exports: { fr: 'Exportations du mois, hors taxe', en: 'Month’s exports, excl. tax', mg: "Fanondranana tamin'ny volana, tsy misy haba" },
  deductible: { fr: 'TVA payée sur les achats (factures conformes)', en: 'VAT paid on purchases (proper invoices)', mg: "TVA naloa tamin'ny fividianana (faktiora ara-dalàna)" },
  deductibleNote: { fr: 'Ne comptez pas la TVA non déductible (voitures particulières, carburant, nourriture…).', en: 'Do not include non-deductible VAT (private cars, fuel, food…).', mg: "Aza ampidirina ny TVA tsy azo esorina (fiara tsotra, solika, sakafo…)." },
  credit: { fr: 'Crédit de TVA reporté du mois précédent', en: 'VAT credit carried from the previous month', mg: "Trosa TVA avy tamin'ny volana teo aloha" },
  collecteL: { fr: 'TVA collectée à {taux} sur {ht}', en: 'VAT collected at {taux} on {ht}', mg: 'TVA voaray {taux} amin’ny {ht}' },
  deductibleL: { fr: 'TVA déductible', en: 'Deductible VAT', mg: 'TVA azo esorina' },
  creditL: { fr: 'Crédit reporté', en: 'Credit carried forward', mg: 'Trosa nafindra' },
  aPayer: { fr: 'TVA à payer', en: 'VAT to pay', mg: 'TVA aloa' },
  aReporter: { fr: 'Crédit à reporter sur le mois suivant : {credit}', en: 'Credit to carry to next month: {credit}', mg: "Trosa hafindra amin'ny volana manaraka: {credit}" },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
  montant: { fr: 'Montant', en: 'Amount', mg: 'Vola' },
  depuisHT: { fr: 'Je connais le prix HT', en: 'I know the price excl. tax', mg: 'Fantatro ny vidiny HT' },
  depuisTTC: { fr: 'Je connais le prix TTC', en: 'I know the price incl. tax', mg: 'Fantatro ny vidiny TTC' },
  taux: { fr: 'Taux', en: 'Rate', mg: 'Taha' },
  tNormal: { fr: '{taux} · taux normal', en: '{taux} · standard rate', mg: '{taux} · taha ankapobeny' },
  tGaz: { fr: '{taux} · gaz butane', en: '{taux} · butane gas', mg: '{taux} · entona butane' },
  tRiz: { fr: '{taux} · riz (LFR 2026)', en: '{taux} · rice (2026 amending law)', mg: '{taux} · vary (LFR 2026)' },
  tExport: { fr: '{taux} · exportations', en: '{taux} · exports', mg: '{taux} · fanondranana' },
  ht: { fr: 'Prix HT', en: 'Price excl. tax', mg: 'Vidiny HT' },
  tva: { fr: 'TVA à {taux}', en: 'VAT at {taux}', mg: 'TVA {taux}' },
  ttc: { fr: 'Prix TTC', en: 'Price incl. tax', mg: 'Vidiny TTC' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let mode = 'declaration', depuis = 'HT';

function monterCalculateur(p, b) {
  const v = b.tva, A = v.articles;
  const seg = (attr, choix, actuel) => `<div class="seg" role="group">${choix.map(([val, lib]) =>
    `<button type="button" data-${attr}="${val}" aria-pressed="${val === actuel}">${lib}</button>`).join('')}</div>`;
  const TAUX = [['tauxNormal', 'tNormal'], ['tauxReduitGaz', 'tGaz'], ['tauxReduit', 'tRiz'], ['tauxExport', 'tExport']];
  const formulaire = mode === 'declaration' ? `
      ${champMontant('tva-ventes', l('ventes'), EXEMPLE.ventesHT)}
      ${champMontant('tva-exports', l('exports'), EXEMPLE.exportations)}
      ${champMontant('tva-deductible', l('deductible'), EXEMPLE.tvaDeductible)}
      <p class="aide">${l('deductibleNote')}</p>
      ${champMontant('tva-credit', l('credit'), EXEMPLE.creditAnterieur)}` : `
      ${seg('depuis', [['HT', l('depuisHT')], ['TTC', l('depuisTTC')]], depuis)}
      ${champMontant('tva-prix', l('montant'), EXEMPLE.prix)}
      <label class="f"><span>${l('taux')}</span><select id="tva-taux">${TAUX.map(([cle, lib]) =>
        `<option value="${cle}">${esc(l(lib, { taux: pct(v[cle], 0) }))}</option>`).join('')}</select></label>`;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${seg('mode', [['declaration', l('declaration')], ['prix', l('prix')]], mode)}
        ${formulaire}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · TVA</span><span>${mode === 'declaration' ? l('parMois') : 'HT · TTC'}</span></div>
        <div class="rows" id="tva-rows"></div>
        <div class="total"><span class="k" id="tva-k"></span><span class="v" id="tva-total"></span></div>
        <p class="warn" id="tva-credit-msg" hidden></p>
        ${mode === 'declaration' ? `<p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>` : ''}
      </div>
    </div>`;
  p.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => { mode = bt.dataset.mode; monterCalculateur(p, b); }));
  p.querySelectorAll('[data-depuis]').forEach(bt => bt.addEventListener('click', () => { depuis = bt.dataset.depuis; monterCalculateur(p, b); }));
  const $ = id => p.querySelector('#' + id);

  const recalculer = mode === 'declaration' ? () => {
    const r = declarationExemple(b, { ventesHT: lireMontant($('tva-ventes')), exportations: lireMontant($('tva-exports')),
      tvaDeductible: lireMontant($('tva-deductible')), creditAnterieur: lireMontant($('tva-credit')) });
    let h = r.lignes.filter(x => x.ht > 0).map(x => ligne(l('collecteL', { taux: pct(x.taux, 0), ht: ar(x.ht) }), ar(x.tva), A.taux)).join('');
    h += ligne(l('deductibleL'), '− ' + ar(lireMontant($('tva-deductible'))), A.deduction, 'neg');
    const c = lireMontant($('tva-credit'));
    if (c > 0) h += ligne(l('creditL'), '− ' + ar(c), A.credit, 'neg');
    $('tva-rows').innerHTML = h;
    $('tva-k').textContent = l('aPayer');
    $('tva-total').textContent = ar(r.aPayer);
    const msg = $('tva-credit-msg');
    msg.hidden = !r.credit;
    msg.innerHTML = r.credit ? esc(l('aReporter', { credit: ar(r.credit) })) + `<small class="art">${A.credit}</small>` : '';
  } : () => {
    const taux = v[$('tva-taux').value], r = calculTVA({ montant: lireMontant($('tva-prix')), taux, depuis });
    $('tva-rows').innerHTML = ligne(l('ht'), ar(r.ht), A.base) + ligne(l('tva', { taux: pct(taux, 0) }), ar(r.tva), A.taux);
    $('tva-k').textContent = l('ttc');
    $('tva-total').textContent = ar(r.ttc);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'tva', variables, comprendre, monterCalculateur, impotExemple: b => declarationExemple(b).aPayer };
