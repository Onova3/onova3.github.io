// Fiche Impôt synthétique (CDI Partie I, Titre II ; CPF Titre I, ST II, Chap. IV). Textes malgaches à relire.
import { calculIS, acompteDebutActivite } from '../calc/is.js';
import { t, tr, fmt, esc, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { ca: 36000000, achats: 12000000, chargesSalariales: 0, autresCharges: 0, categorie: 2 };

const variables = b => {
  const s = b.impotSynthetique;
  return { seuil: ar(s.seuilCA), option: ar(s.seuilOptionIR), taux: pct(s.taux, 0), tauxReduit: pct(s.tauxReduitCGA, 0),
    reduction: pct(s.reductionCharges, 0), plancher: pct(s.plancherCA, 0) };
};

const comprendre = {
  definition: {
    article: 'CDI 01.02.01, 01.02.02',
    texte: {
      fr: "L'impôt synthétique est l'impôt unique des petites et moyennes activités indépendantes dont le chiffre d'affaires annuel est inférieur à {seuil}. Il remplace l'impôt sur les revenus et les taxes sur le chiffre d'affaires, et finance surtout la Région et la Commune.",
      en: 'The synthetic tax is the single tax for small and medium independent businesses with annual turnover under {seuil}. It replaces income tax and turnover taxes, and mainly funds the Region and the Commune.',
      mg: "Ny hetra tsotra dia hetra tokana ho an'ny asa tsy miankina madinika sy salantsalany manana tondrom-barotra isan-taona latsaky ny {seuil}. Misolo ny hetra amin'ny vola miditra sy ny haba amin'ny tondrom-barotra izy, ary indrindra ny Faritra sy ny Kaominina no mahazo azy.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.02.02 I', texte: {
      fr: 'Les personnes et entreprises exerçant une activité indépendante sous {seuil} de chiffre d’affaires : agriculteurs, éleveurs, pêcheurs, producteurs, artisans, commerçants, prestataires de services, professions libérales, auteurs et artistes, gargotiers, transporteurs.',
      en: 'People and businesses with an independent activity under {seuil} of turnover: farmers, breeders, fishers, producers, craftspeople, traders, service providers, liberal professions, authors and artists, food-stall keepers, transporters.',
      mg: "Ny olona sy orinasa manao asa tsy miankina ka latsaky ny {seuil} ny tondrom-barotra: mpamboly, mpiompy, mpanjono, mpamokatra, mpanao asa tanana, mpivarotra, mpanome tolotra, asa tsy miankina, mpanoratra sy mpanakanto, mpivarotra sakafo, mpitatitra." } },
    { article: 'CDI 01.02.02 I', texte: {
      fr: 'Les membres d’une société coopérative dont le chiffre d’affaires ou les revenus restent sous ce seuil.',
      en: 'Members of a cooperative whose turnover or income stays below this threshold.',
      mg: "Ny mpikambana ao amin'ny koperativa izay tsy mihoatra io fetra io ny tondrom-barotra na ny vola miditra." } },
    { article: 'CDI 01.02.02 III', texte: {
      fr: 'Les producteurs de base (agriculteurs, forestiers) et leurs intermédiaires restent à l’impôt synthétique pour ces activités, même au-delà du seuil.',
      en: 'Primary producers (farmers, foresters) and their intermediaries stay under the synthetic tax for these activities, even above the threshold.',
      mg: "Ny mpamokatra fototra (mpamboly, mpikarakara ala) sy ny mpanelanelana aminy dia mijanona amin'ny hetra tsotra ho an'ireo asa ireo, na dia mihoatra ny fetra aza." } },
  ],
  exonerations: [
    { article: 'CDI 01.02.04', texte: {
      fr: 'Les revenus des marchés publics soumis à l’impôt sur les revenus des marchés (IRM) sont exclus de la base.',
      en: 'Income from public contracts subject to the public procurement income tax (IRM) is excluded from the base.',
      mg: "Tsy tafiditra ao amin'ny fototra ny vola azo avy amin'ny tsenam-panjakana iharan'ny IRM." } },
    { article: 'CDI 01.01.02, 01.01.13 I', texte: {
      fr: 'À partir de {seuil} de chiffre d’affaires, on quitte l’impôt synthétique : c’est le régime du réel (IR et TVA). Dès {option}, une entreprise dont les états financiers sont certifiés par un expert-comptable peut choisir l’IR.',
      en: 'From {seuil} of turnover, the synthetic tax no longer applies: the real regime (IR and VAT) does. From {option}, a business whose financial statements are certified by a chartered accountant may opt for IR.',
      mg: "Manomboka amin'ny tondrom-barotra {seuil}, tsy amin'ny hetra tsotra intsony fa amin'ny rafitra tena izy (IR sy TVA). Manomboka amin'ny {option}, ny orinasa voamarin'ny kaontista manam-pahaizana ny tatitra ara-bolany dia afaka misafidy ny IR." } },
  ],
  aSavoir: [
    { article: 'CDI 01.02.05', texte: {
      fr: 'Taux : {taux} du chiffre d’affaires de l’année précédente, arrondi à la dizaine de milliers inférieure. {tauxReduit} pour les nouveaux adhérents d’un centre de gestion agréé et les contribuables nouvellement immatriculés en ligne par leurs clients, pour leurs premiers exercices.',
      en: 'Rate: {taux} of the previous year’s turnover, rounded down to the ten thousand. {tauxReduit} for new members of an approved management centre and taxpayers newly registered online by their customers, for their first years.',
      mg: "Taha: {taux} amin'ny tondrom-barotra tamin'ny taona lasa, boribory ho amin'ny iray alina ambany. {tauxReduit} ho an'ny mpikambana vaovao ao amin'ny foibe fitantanana nankatoavina sy ireo vao voasoratra an-tserasera avy amin'ny mpanjifany, mandritra ny taom-piasana voalohany." } },
    { article: 'CDI 01.02.05 bis', texte: {
      fr: 'Réduction de {reduction} des achats avec factures régulières, des salaires et charges patronales déclarés à la CNaPS, des cotisations de formation professionnelle (dans la limite de 1 % de la masse salariale), de la couverture santé des salariés (dans la limite de 5 %) et des dons aux fondations d’utilité publique. L’impôt ne descend jamais sous {plancher} du chiffre d’affaires.',
      en: 'Reduction of {reduction} of purchases with proper invoices, salaries and employer charges declared to CNaPS, vocational training contributions (up to 1% of payroll), staff health cover (up to 5%) and donations to public-interest foundations. The tax never falls below {plancher} of turnover.',
      mg: "Fihenana {reduction} amin'ny fividianana misy faktiora ara-dalàna, karama sy saram-pikarakarana nambara tamin'ny CNaPS, latsakemboka fanofanana (hatramin'ny 1 % amin'ny totalin'ny karama), fiahiana ara-pahasalamana ho an'ny mpiasa (hatramin'ny 5 %) ary fanomezana ho an'ny fondation ilaina ho an'ny besinimaro. Tsy latsaky ny {plancher} amin'ny tondrom-barotra mihitsy ny hetra." } },
    { article: 'CDI 01.02.06', texte: {
      fr: 'L’impôt de l’année en cours est payé par acomptes calculés sur l’impôt de l’année précédente. Pour un début d’activité, l’acompte est un montant fixe selon l’activité (voir l’onglet Calculer).',
      en: 'The current year’s tax is paid in instalments based on the previous year’s tax. When starting a business, the instalment is a fixed amount depending on the activity (see the Calculate tab).',
      mg: "Ny hetra amin'ity taona ity dia aloa amin'ny fandoavana mialoha kajiana araka ny hetra tamin'ny taona lasa. Raha vao manomboka ny asa, vola raikitra araka ny karazan'asa no aloa mialoha (jereo ny tabilao Hikajy)." } },
    { article: 'CDI 01.02.04', texte: {
      fr: 'Les adhérents d’un centre de gestion agréé peuvent bénéficier d’un abattement de 50 % sur la base, plafonné à 10 000 000 Ar, sous conditions fixées par texte réglementaire (non calculé ici).',
      en: 'Members of an approved management centre may get a 50% allowance on the base, capped at 10,000,000 Ar, under conditions set by regulation (not calculated here).',
      mg: "Ny mpikambana ao amin'ny foibe fitantanana nankatoavina dia mety hahazo fihenana 50 % amin'ny fototra, hatramin'ny 10 000 000 Ar, araka ny fepetra voafaritry ny didy (tsy kajiana eto)." } },
    { article: 'CDI 01.02.01', texte: {
      fr: 'Où va l’argent : 60 % à la Commune, 25 % à la Région, 10 % au Fonds national de péréquation, 3 % à la Chambre de commerce et 2 % au Fonds pour l’insertion du secteur informel.',
      en: 'Where the money goes: 60% to the Commune, 25% to the Region, 10% to the National Equalisation Fund, 3% to the Chamber of Commerce and 2% to the Fund for integrating the informal sector.',
      mg: "Mankaiza ny vola: 60 % ho an'ny Kaominina, 25 % ho an'ny Faritra, 10 % ho an'ny Tahirim-pirenena fampitoviana, 3 % ho an'ny Efitra ara-barotra ary 2 % ho an'ny Tahirim-pampidirana ny sehatra tsy ara-dalàna." } },
  ],
  exemple: {
    texte: {
      fr: 'Hery tient une épicerie à Toamasina. L’an dernier : {ca} de chiffre d’affaires et {achats} d’achats avec factures. L’impôt synthétique à déclarer et payer avant le 31 mars est de {impot}.',
      en: 'Hery runs a grocery in Toamasina. Last year: {ca} of turnover and {achats} of purchases with invoices. The synthetic tax to file and pay by 31 March is {impot}.',
      mg: "Mitantana fivarotana kely any Toamasina i Hery. Tamin'ny taona lasa: tondrom-barotra {ca} ary fividianana misy faktiora {achats}. Ny hetra tsotra hambara sy haloa alohan'ny 31 martsa dia {impot}.",
    },
    valeurs: b => ({ ca: ar(EXEMPLE.ca), achats: ar(EXEMPLE.achats), impot: ar(calculIS(EXEMPLE, b).impot) }),
  },
};

const L = {
  ca: { fr: 'Chiffre d’affaires de l’année', en: 'Turnover for the year', mg: "Tondrom-barotra tamin'ny taona" },
  achats: { fr: 'Achats avec factures régulières', en: 'Purchases with proper invoices', mg: 'Fividianana misy faktiora ara-dalàna' },
  salaires: { fr: 'Salaires et charges patronales déclarés (CNaPS)', en: 'Salaries and employer charges declared (CNaPS)', mg: 'Karama sy saram-pikarakarana nambara (CNaPS)' },
  autres: { fr: 'Autres charges admises (formation, santé, dons)', en: 'Other eligible costs (training, health, donations)', mg: 'Fandaniana hafa ekena (fanofanana, fahasalamana, fanomezana)' },
  autresNote: { fr: 'Formation : 1 % de la masse salariale au plus ; santé : 5 % au plus. Saisissez les montants déjà plafonnés.',
    en: 'Training: at most 1% of payroll; health: at most 5%. Enter amounts already capped.',
    mg: "Fanofanana: 1 % amin'ny totalin'ny karama farafahabetsany; fahasalamana: 5 % farafahabetsany. Ampidiro ny vola efa voafetra." },
  reduit: { fr: 'Taux réduit de {taux} : nouvel adhérent d’un centre de gestion agréé, ou immatriculé en ligne par ses clients', en: 'Reduced {taux} rate: new member of an approved management centre, or registered online by customers', mg: "Taha {taux}: mpikambana vaovao ao amin'ny foibe fitantanana nankatoavina, na voasoratra an-tserasera avy amin'ny mpanjifa" },
  caL: { fr: 'Chiffre d’affaires', en: 'Turnover', mg: 'Tondrom-barotra' },
  base: { fr: 'Base, arrondie à la dizaine de milliers inférieure', en: 'Base, rounded down to the ten thousand', mg: "Fototra, boribory ho amin'ny iray alina ambany" },
  brut: { fr: 'Impôt à {taux}', en: 'Tax at {taux}', mg: 'Hetra {taux}' },
  reduction: { fr: 'Réduction de {taux} des charges', en: '{taux} reduction on costs', mg: "Fihenana {taux} amin'ny fandaniana" },
  plancher: { fr: 'Plancher appliqué : {taux} du chiffre d’affaires', en: 'Floor applied: {taux} of turnover', mg: "Fetra ambany nampiharina: {taux} amin'ny tondrom-barotra" },
  total: { fr: 'Impôt synthétique', en: 'Synthetic tax', mg: 'Hetra tsotra' },
  part: { fr: 'Part du chiffre d’affaires', en: 'Share of turnover', mg: "Ampahan'ny tondrom-barotra" },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
  reel: { fr: 'Avec {seuil} ou plus de chiffre d’affaires, l’impôt synthétique ne s’applique plus : vous relevez du régime du réel (IR et TVA) et devez déclarer le changement de régime avant la clôture de l’exercice.',
    en: 'With {seuil} or more of turnover, the synthetic tax no longer applies: you fall under the real regime (IR and VAT) and must declare the change before the year closes.',
    mg: "Raha {seuil} na mihoatra ny tondrom-barotra, tsy mihatra intsony ny hetra tsotra: ao amin'ny rafitra tena izy (IR sy TVA) ianao ary tsy maintsy manambara ny fiovana alohan'ny fanakatonana ny taom-piasana." },
  option: { fr: 'Entre {option} et {seuil}, vous pouvez opter pour l’IR si vos états financiers sont certifiés par un expert-comptable. Sinon, l’impôt synthétique s’applique.',
    en: 'Between {option} and {seuil}, you may opt for IR if your financial statements are certified by a chartered accountant. Otherwise, the synthetic tax applies.',
    mg: "Eo anelanelan'ny {option} sy {seuil}, afaka misafidy ny IR ianao raha voamarin'ny kaontista manam-pahaizana ny tatitra ara-bolanao. Raha tsy izany, ny hetra tsotra no mihatra." },
  acompteTitre: { fr: 'Acompte de début d’activité', en: 'Start-up instalment', mg: 'Fandoavana mialoha rehefa manomboka asa' },
  acompteLead: { fr: 'L’année où l’activité démarre, il n’y a pas encore d’impôt de l’année précédente : l’acompte est un montant fixe selon l’activité. Il sera déduit de l’impôt calculé l’année suivante.',
    en: 'In the year the business starts there is no previous year’s tax yet: the instalment is a fixed amount depending on the activity. It is deducted from the tax calculated the following year.',
    mg: "Amin'ny taona anombohan'ny asa, mbola tsy misy hetra tamin'ny taona lasa: vola raikitra araka ny karazan'asa no aloa mialoha. Hesorina amin'ny hetra kajiana amin'ny taona manaraka izany." },
  activite: { fr: 'Activité', en: 'Activity', mg: 'Karazan’asa' },
  acompte: { fr: 'Acompte à payer', en: 'Instalment to pay', mg: 'Vola aloa mialoha' },
  echeances: { fr: 'Échéances des acomptes : au plus tard le {e1} et le {e2}.', en: 'Instalment deadlines: by {e1} and {e2}.', mg: "Fe-potoana: farany ny {e1} sy ny {e2}." },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const s = b.impotSynthetique, A = s.articles, v = variables(b);
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champMontant('is-ca', l('ca'), EXEMPLE.ca)}
        ${champMontant('is-achats', l('achats'), EXEMPLE.achats)}
        ${champMontant('is-sal', l('salaires'), EXEMPLE.chargesSalariales)}
        ${champMontant('is-autres', l('autres'), EXEMPLE.autresCharges)}
        <p class="aide">${l('autresNote')}</p>
        <label class="check"><input type="checkbox" id="is-reduit"><span>${l('reduit', { taux: v.tauxReduit })}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IS</span><span>${l('parAn')}</span></div>
        <p class="warn" id="is-regime" hidden></p>
        <div class="rows" id="is-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="is-total"></span></div>
        <div class="sub" id="is-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>
    <h3 class="titre-sim">${l('acompteTitre')}<small class="art">${A.acomptes}</small></h3>
    <p class="lead">${l('acompteLead')}</p>
    <div class="grid" id="is-acompte">
      <div class="card">
        <label class="f"><span>${l('activite')}</span>
          <select id="is-cat">${s.acomptesDebutActivite.map((a, i) =>
            `<option value="${i}"${i === EXEMPLE.categorie ? ' selected' : ''}>${esc(tr(a.activites))}</option>`).join('')}</select></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${l('acompteTitre')}</span><span>IS</span></div>
        <div class="total"><span class="k">${l('acompte')}</span><span class="v" id="is-acompte-v"></span></div>
        <p class="arr">${l('echeances', { e1: tr(s.echeancesAcomptes[0]), e2: tr(s.echeancesAcomptes[1]) })}<small class="art">${A.echeances}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);

  const recalculer = () => {
    const ca = lireMontant($('is-ca')), reduit = $('is-reduit').checked;
    const r = calculIS({ ca, achats: lireMontant($('is-achats')), chargesSalariales: lireMontant($('is-sal')),
      autresCharges: lireMontant($('is-autres')), tauxReduit: reduit }, b);
    const avis = $('is-regime');
    avis.hidden = r.regime === 'synthetique';
    avis.innerHTML = r.regime === 'synthetique' ? '' : esc(l(r.regime === 'reel-obligatoire' ? 'reel' : 'option', v)) + `<small class="art">${A.regime}</small>`;
    let h = ligne(l('caL'), ar(ca)) + ligne(l('base'), ar(r.base), A.taux)
      + ligne(l('brut', { taux: pct(r.taux, 0) }), ar(r.brut), A.taux);
    if (r.reduction > 0) h += ligne(l('reduction', { taux: v.reduction }), '− ' + ar(r.reduction), A.reductions, 'neg');
    if (r.plancherApplique) h += ligne(l('plancher', { taux: v.plancher }), ar(Math.min(r.brut, r.plancher)), A.plancher, 'note');
    $('is-rows').innerHTML = h;
    $('is-total').textContent = ar(r.impot);
    $('is-sub').innerHTML = puce(l('part'), ca ? pct(r.impot / ca, 2) : '—');
  };
  const acompte = () => { $('is-acompte-v').textContent = ar(acompteDebutActivite(Number($('is-cat').value), b)); };
  brancher(p.querySelector('.card'), recalculer);
  brancher($('is-acompte'), acompte);
  recalculer();
  acompte();
}

export default {
  id: 'is',
  variables,
  comprendre,
  monterCalculateur,
  impotExemple: b => calculIS(EXEMPLE, b).impot,
};
