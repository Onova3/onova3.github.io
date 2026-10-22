// Fiche Droit d'accises (CDI Partie III, Titre I et annexe 2 ; CPF Titre II). Textes malgaches à relire.
// Le tableau des produits vient de data/accises-2026.json (scripts/extraire-accises.js) ; désignations en français.
import { calculAccises, chercherProduits } from '../calc/accises.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { recherche: 'bière', code: '2203.00 90', origine: 'local', valeur: 3000000, quantite: 1000 };
// Le tableau est chargé à l'ouverture du module : par le réseau dans le navigateur, depuis le disque dans les tests.
const produits = (typeof window === 'undefined'
  ? JSON.parse((await import('node:fs')).readFileSync(new URL('../../data/accises-2026.json', import.meta.url), 'utf8'))
  : await (await fetch('data/accises-2026.json')).json()).produits;
const produitExemple = () => produits.find(x => x.code === EXEMPLE.code);
const calculExemple = b => calculAccises(produitExemple(), EXEMPLE, b);

const variables = () => ({});

const comprendre = {
  definition: {
    article: 'CDI 03.01.01, 03.01.04',
    texte: {
      fr: "Le droit d'accises frappe certains produits précis, fabriqués à Madagascar ou importés : boissons, alcools, tabacs, sucreries, sacs plastiques, pierres précieuses, voitures, ainsi que les communications téléphoniques. Chaque produit a son taux dans le tableau annexé au Code, souvent plus élevé pour les produits importés.",
      en: 'Excise duty applies to specific products, made in Madagascar or imported: drinks, spirits, tobacco, confectionery, plastic bags, precious stones, cars, and telephone communications. Each product has its rate in the table annexed to the Code, often higher for imported products.',
      mg: "Ny haba manokana dia mikasika vokatra voafaritra, vita eto Madagasikara na afarana: zava-pisotro, toaka, paraky, vatomamy, kitapo plastika, vato sarobidy, fiara, ary ny fifandraisana an-telefaonina. Samy manana ny tahany ao amin'ny tabilao ampiarahina amin'ny Fehezan-dalàna ny vokatra tsirairay, matetika ambony kokoa ho an'ny entana afarana.",
    },
  },
  quiPaie: [
    { article: 'CDI 03.01.03, CPF II-95', texte: {
      fr: 'Le fabricant pour les produits locaux, à la fabrication ou à la mise en vente ; l’importateur, à la Douane, pour les produits importés ; l’opérateur pour les communications téléphoniques, à l’encaissement du prix.',
      en: 'The manufacturer for local products, at manufacture or release for sale; the importer, at Customs, for imported products; the operator for telephone communications, when the price is collected.',
      mg: "Ny mpamokatra ho an'ny vokatra eto an-toerana, rehefa vokarina na avoaka hamidy; ny mpanafatra, any amin'ny Ladoany, ho an'ny entana afarana; ny mpandraharaha ho an'ny fifandraisana an-telefaonina, rehefa voaray ny vidiny." } },
  ],
  exonerations: [
    { article: 'CDI 03.01.02', texte: {
      fr: 'Les produits exportés sous acquit-à-caution (sauf exceptions listées), l’alcool destiné aux médicaments ou aux établissements de santé, les matières servant à fabriquer des médicaments, et l’éthanol combustible dénaturé de plus de 90°.',
      en: 'Products exported under bond (except listed exceptions), alcohol for medicines or health establishments, materials used to make medicines, and denatured fuel ethanol above 90°.',
      mg: "Ny vokatra aondrana miaraka amin'ny acquit-à-caution (afa-tsy ireo voatanisa), ny alikaola ho an'ny fanafody na toeram-pitsaboana, ny akora hanamboarana fanafody, ary ny etanola fandrehitra mihoatra ny 90°." } },
    { article: 'Tableau, annexe 2', texte: {
      fr: 'Beaucoup de produits locaux sont exonérés alors que les mêmes produits importés sont taxés (miel, thé, sucres, voitures neuves…).',
      en: 'Many local products are exempt while the same products imported are taxed (honey, tea, sugars, new cars…).',
      mg: "Maro ny vokatra eto an-toerana tsy iharan'ny haba nefa iharany kosa ireo mitovy aminy afarana (tantely, dite, siramamy, fiara vaovao…)." } },
  ],
  aSavoir: [
    { article: 'CDI 03.01.04', texte: {
      fr: 'Trois façons de taxer : un pourcentage de la valeur (ad valorem), un montant par litre, kilo ou paquet (spécifique), ou les deux à la fois.',
      en: 'Three ways of taxing: a percentage of value (ad valorem), an amount per litre, kilo or pack (specific), or both.',
      mg: "Fomba telo hanaovana haba: isan-jaton'ny sanda (ad valorem), vola isaky ny litatra, kilao na paoma (spécifique), na izy roa." } },
    { article: 'CDI 03.01.04', texte: {
      fr: 'Valeur taxable : pour un produit importé, la valeur CAF plus les droits de douane ; pour un produit local, le prix de sortie d’usine, jamais sous le coût de production plus la marge.',
      en: 'Taxable value: for an import, the CIF value plus customs duties; for a local product, the ex-factory price, never below production cost plus margin.',
      mg: "Sanda iainan'ny haba: ho an'ny entana afarana, ny sanda CAF miampy ny haban'ny Ladoany; ho an'ny vokatra eto an-toerana, ny vidiny miala amin'ny orinasa, tsy latsaky ny saran'ny famokarana miampy ny tombony." } },
    { article: 'CPF II-95', texte: {
      fr: 'Quand le tableau indique « sans être inférieur à Ar … par litre », la valeur taxable ne peut pas descendre sous ce montant multiplié par la quantité.',
      en: 'When the table says “not less than Ar … per litre”, the taxable value cannot fall below that amount times the quantity.',
      mg: "Rehefa milaza ny tabilao hoe « tsy latsaky ny Ar … isaky ny litatra », tsy azo latsaky ny io vola io ampitomboina amin'ny habetsahana ny sanda iainan'ny haba." } },
  ],
  exemple: {
    texte: {
      fr: 'Une brasserie locale vend à la sortie de l’usine 1 000 litres de bière pour {valeur}. Le tableau prévoit {taux} de la valeur, avec une valeur minimale de {min} par litre : le droit d’accises est de {impot}.',
      en: 'A local brewery sells 1,000 litres of beer ex-factory for {valeur}. The table sets {taux} of value, with a minimum value of {min} per litre: excise duty is {impot}.',
      mg: "Orinasa mpanao labiera eto an-toerana no mivarotra labiera 1 000 litatra amin'ny {valeur} miala amin'ny orinasa. {taux} amin'ny sanda no voalazan'ny tabilao, miaraka amin'ny sanda farafahakeliny {min} isaky ny litatra: {impot} ny haba manokana.",
    },
    valeurs: b => {
      const tx = produitExemple().local;
      return { valeur: ar(EXEMPLE.valeur), taux: pct(tx.taux), min: ar(tx.valeurMinimale.montant), impot: ar(calculExemple(b).impot) };
    },
  },
};

const L = {
  recherche: { fr: 'Chercher un produit (nom ou code tarifaire)', en: 'Search for a product (name or tariff code)', mg: 'Hitady vokatra (anarana na laharana)' },
  noteFr: { fr: '', en: 'Product names are given in French, as in the Code.', mg: "Amin'ny teny frantsay ny anaran'ny vokatra, toy ny ao amin'ny Fehezan-dalàna." },
  aucun: { fr: 'Aucun produit trouvé.', en: 'No product found.', mg: 'Tsy misy vokatra hita.' },
  origine: { fr: 'Origine', en: 'Origin', mg: 'Niaviany' },
  local: { fr: 'Fabriqué à Madagascar', en: 'Made in Madagascar', mg: 'Vita eto Madagasikara' },
  importe: { fr: 'Importé', en: 'Imported', mg: 'Afarana' },
  valeur: { fr: 'Valeur taxable (prix sortie d’usine, ou CAF + douane)', en: 'Taxable value (ex-factory price, or CIF + duties)', mg: "Sanda iainan'ny haba" },
  quantite: { fr: 'Quantité ({unite})', en: 'Quantity ({unite})', mg: 'Habetsahana ({unite})' },
  tarif: { fr: 'Tarif', en: 'Rate', mg: 'Taha' },
  exo: { fr: 'Exonéré', en: 'Exempt', mg: 'Tsy iharan’ny haba' },
  min: { fr: 'Valeur minimale : {q} × {m}', en: 'Minimum value: {q} × {m}', mg: 'Sanda farafahakeliny: {q} × {m}' },
  base: { fr: 'Valeur taxable', en: 'Taxable value', mg: "Sanda iainan'ny haba" },
  droit: { fr: 'Droit d’accises', en: 'Excise duty', mg: 'Haba manokana' },
  total: { fr: 'Droit d’accises à payer', en: 'Excise duty to pay', mg: 'Haba manokana aloa' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
const UNITE = { litre: { fr: 'litres', en: 'litres', mg: 'litatra' }, kg: { fr: 'kg', en: 'kg', mg: 'kg' }, 'pièce': { fr: 'pièces', en: 'pieces', mg: 'isa' }, 'paquet de 20': { fr: 'paquets de 20', en: 'packs of 20', mg: 'paoma misy 20' } };
const libelleTaux = x => x.type === 'exonere' ? l('exo') : x.type === 'advalorem' ? pct(x.taux) + (x.valeurMinimale ? ` (min. ${ar(x.valeurMinimale.montant)}/${x.valeurMinimale.unite})` : '') : `${ar(x.montant)}/${x.unite}`;

let choix = null, origine = EXEMPLE.origine;

function monterCalculateur(p, b) {
  choix ??= produitExemple();
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="search"><span class="sr">${l('recherche')}</span><input id="da-q" type="search" placeholder="${esc(l('recherche'))}" value="${esc(EXEMPLE.recherche)}"></label>
        ${l('noteFr') ? `<p class="aide">${l('noteFr')}</p>` : ''}
        <div class="rows" id="da-liste"></div>
      </div>
      <div class="card" id="da-form"></div>
    </div>
    <div class="ticket" aria-live="polite" style="margin-top:18px">
      <div class="t-head"><span>${t('avis')} · DA</span><span id="da-code"></span></div>
      <div class="rows" id="da-rows"></div>
      <div class="total"><span class="k">${l('total')}</span><span class="v" id="da-total"></span></div>
      <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
    </div>`;
  const $ = id => p.querySelector('#' + id);

  const liste = () => {
    const r = chercherProduits(produits, $('da-q').value);
    $('da-liste').innerHTML = r.length ? r.map(x => `<button type="button" class="produit" data-code="${esc(x.code)}" aria-pressed="${x === choix}">
      <span class="sigle">${esc(x.code)}</span> ${esc(x.contexte ? x.contexte.split(' › ')[0].slice(0, 50) + ' › ' : '')}${esc(x.designation)}</button>`).join('')
      : `<p class="aide">${l('aucun')}</p>`;
    $('da-liste').querySelectorAll('[data-code]').forEach(bt => bt.addEventListener('click', () => {
      choix = produits.find(x => x.code === bt.dataset.code); liste(); formulaire();
    }));
  };
  const formulaire = () => {
    const tx = choix[origine];
    const besoinValeur = tx.type === 'advalorem', besoinQuantite = tx.type === 'specifique' || tx.valeurMinimale;
    const unite = (tx.valeurMinimale ?? tx).unite;
    $('da-form').innerHTML = `
      <h3>${esc(choix.designation)}</h3>
      <p class="aide">${esc(choix.contexte)}</p>
      <div class="seg" role="group">${['local', 'importe'].map(o =>
        `<button type="button" data-origine="${o}" aria-pressed="${o === origine}">${l(o)} · ${esc(libelleTaux(choix[o]))}</button>`).join('')}</div>
      ${besoinValeur ? champMontant('da-valeur', l('valeur'), EXEMPLE.valeur) : ''}
      ${besoinQuantite ? champMontant('da-quantite', l('quantite', { unite: tr(UNITE[unite] ?? { fr: unite }) }), EXEMPLE.quantite).replace('<span class="u">Ar</span>', '') : ''}`;
    $('da-form').querySelectorAll('[data-origine]').forEach(bt => bt.addEventListener('click', () => { origine = bt.dataset.origine; formulaire(); }));
    brancher($('da-form'), recalculer);
    recalculer();
  };
  const recalculer = () => {
    const v = $('da-valeur'), q = $('da-quantite');
    const r = calculAccises(choix, { origine, valeur: v ? lireMontant(v) : 0, quantite: q ? lireMontant(q) : 0 }, b);
    const art = 'CDI 03.01.04, annexe 2';
    let h = ligne(l('tarif'), esc(libelleTaux(r.tarif)), art);
    if (r.tarif.type === 'advalorem') {
      if (r.valeurMinimaleAppliquee) h += ligne(l('min', { q: lireMontant(q).toLocaleString('fr-FR'), m: ar(r.tarif.valeurMinimale.montant) }), ar(r.base), 'CPF II-95', 'note');
      h += ligne(l('base'), ar(r.base), 'CDI 03.01.04');
    }
    h += ligne(l('droit'), ar(r.droit), art);
    $('da-code').textContent = choix.code;
    $('da-rows').innerHTML = h;
    $('da-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), liste);
  liste();
  formulaire();
}

export default { id: 'da', variables, comprendre, monterCalculateur, produits, impotExemple: b => calculExemple(b).impot };
