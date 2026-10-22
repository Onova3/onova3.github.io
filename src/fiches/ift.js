// Fiche Impôt foncier sur les terrains (CDI Livre II, Titre I ; CPF Chap. XII). Textes malgaches à relire.
import { calculIFT } from '../calc/ift.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, champCommunal, lireMontant, lireCommunal, brancher } from '../ui.js';

// Le tarif par hectare est voté par chaque commune : la valeur ci-dessous est un exemple, pas un tarif officiel.
const EXEMPLE = { categorie: 3, hectares: 2, tarifParHa: 5000, valeurVenale: 20000000 };
const variables = b => ({ min: ar(b.ift.minimum), taux6: pct(b.ift.tauxCategorie6, 0), duree: b.ift.dureeTarifAnnees });

const comprendre = {
  definition: {
    article: 'CDI 10.01.01, 10.01.07',
    texte: {
      fr: "L'impôt foncier sur les terrains (IFT) est un impôt annuel de la commune sur les terrains non bâtis. Pour les terrains agricoles, c'est un montant par hectare voté par la commune pour {duree} ans ; pour les terrains en ville, {taux6} de leur valeur.",
      en: 'The land tax (IFT) is an annual commune tax on undeveloped land. For farmland, it is an amount per hectare voted by the commune for {duree} years; for urban plots, {taux6} of their value.',
      mg: "Ny IFT dia hetra isan-taona an'ny kaominina amin'ny tany tsy misy trano. Ho an'ny tany fambolena, vola isaky ny hektara nolanian'ny kaominina mandritra ny {duree} taona; ho an'ny tany an-tanàn-dehibe, {taux6} amin'ny sandany.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.01.02', texte: {
      fr: 'Le propriétaire ou l’occupant effectif de tout terrain au 1er janvier, quelle que soit sa situation juridique.',
      en: 'The owner or actual occupant of any land on 1 January, whatever its legal status.',
      mg: "Ny tompon'ny tany na izay tena mampiasa azy amin'ny 1 janoary, na inona na inona toe-javatra ara-dalàna misy azy." } },
    { article: 'CDI 10.01.07', texte: {
      fr: 'Six catégories : 1. cultures de rente (café, vanille, girofle…) ; 2. bois, forêts, lacs ; 3. cultures vivrières et riz ; 4. pâturages et jachères ; 5. terrains exploitables non exploités ; 6. terrains non agricoles en ville.',
      en: 'Six categories: 1. cash crops (coffee, vanilla, cloves…); 2. woods, forests, lakes; 3. food crops and rice; 4. pasture and fallow; 5. usable land left unused; 6. non-farm urban land.',
      mg: "Sokajy enina: 1. vokatra fanondrana (kafe, lavanila, jirofo…); 2. ala, farihy; 3. vokatra fihinana sy vary; 4. kijana sy tany avela; 5. tany azo ampiasaina tsy ampiasaina; 6. tany tsy fambolena an-tanàn-dehibe." } },
  ],
  exonerations: [
    { article: 'CDI 10.01.03', texte: {
      fr: 'Terrains publics affectés à un service public ; terrains gratuitement affectés aux œuvres sociales, à l’enseignement ou au culte ; cour et jardin d’une maison jusqu’à 20 ares ; terrains déjà soumis à l’IFPB.',
      en: 'Public land used for a public service; land given free to social works, education or worship; yard and garden of a house up to 20 ares; land already subject to IFPB.',
      mg: "Tanim-panjakana ho an'ny asam-panjakana; tany omena maimaimpoana ho an'ny asa sosialy, fampianarana na fivavahana; tokotany sy zaridainan'ny trano hatramin'ny 20 ara; tany efa iharan'ny IFPB." } },
    { article: 'CDI 10.01.04', texte: {
      fr: 'Terrain nouvellement mis en culture : imposé seulement à partir de la 6e année. Terrain reboisé (1 500 arbres par hectare au moins) : exonéré jusqu’à la première coupe.',
      en: 'Newly cultivated land: taxed only from the 6th year. Reforested land (at least 1,500 trees per hectare): exempt until the first felling.',
      mg: "Tany vao nambolena: iharan'ny hetra manomboka amin'ny taona faha-6 ihany. Tany novolena hazo (1 500 hazo farafahakeliny isaky ny hektara): tsy iharany mandra-pikapana voalohany." } },
  ],
  aSavoir: [
    { article: 'CDI 10.01.07', texte: {
      fr: 'Sans nouveau vote du conseil municipal, les tarifs de la période précédente sont reconduits. L’impôt n’est jamais inférieur à {min}.',
      en: 'Without a new council vote, the previous period’s rates continue. The tax is never less than {min}.',
      mg: "Raha tsy misy latsa-bato vaovao ataon'ny filankevitra, mitohy ny taha teo aloha. Tsy latsaky ny {min} mihitsy ny hetra." } },
    { article: 'CDI 10.01.10', texte: {
      fr: 'En cas de récolte perdue (cyclone, inondation, criquets…), on peut demander une réduction dans les 3 mois.',
      en: 'If the crop is lost (cyclone, flood, locusts…), a reduction can be requested within 3 months.',
      mg: "Raha simba ny vokatra (rivodoza, tondra-drano, valala…), azo angatahana fihenana ao anatin'ny 3 volana." } },
  ],
  exemple: {
    texte: {
      fr: 'Fanja cultive 2 hectares de riz près d’Ambatondrazaka (catégorie 3). Si la commune a voté {tarif} par hectare (valeur d’exemple), l’IFT est de {impot}.',
      en: 'Fanja grows 2 hectares of rice near Ambatondrazaka (category 3). If the commune voted {tarif} per hectare (example value), the IFT is {impot}.',
      mg: "Mamboly vary 2 hektara akaikin'i Ambatondrazaka i Fanja (sokajy 3). Raha {tarif} isaky ny hektara no nolanian'ny kaominina (ohatra fotsiny), {impot} ny IFT.",
    },
    valeurs: b => ({ tarif: ar(EXEMPLE.tarifParHa), impot: ar(calculIFT(EXEMPLE, b).impot) }),
  },
};

const L = {
  categorie: { fr: 'Catégorie du terrain', en: 'Land category', mg: 'Sokajin’ny tany' },
  hectares: { fr: 'Superficie (hectares)', en: 'Area (hectares)', mg: 'Velarana (hektara)' },
  tarif: { fr: 'Tarif voté par ma commune, par hectare', en: 'Rate voted by my commune, per hectare', mg: 'Taha nolanian’ny kaominako, isaky ny hektara' },
  regleTarif: { fr: 'Aucune fourchette dans le Code : tarif voté pour {duree} ans par le conseil municipal, reconduit à défaut de vote.', en: 'No range in the Code: rate voted for {duree} years by the council, continued if there is no vote.', mg: "Tsy misy fetra ao amin'ny Fehezan-dalàna: taha lanian'ny filankevitra mandritra ny {duree} taona, mitohy raha tsy misy latsa-bato." },
  valeur: { fr: 'Valeur vénale du terrain', en: 'Market value of the land', mg: "Sandan'ny tany eny an-tsena" },
  calcul: { fr: '{ha} ha × {tarif}', en: '{ha} ha × {tarif}', mg: '{ha} ha × {tarif}' },
  calcul6: { fr: '{taux} de la valeur vénale', en: '{taux} of market value', mg: "{taux} amin'ny sandany" },
  minimum: { fr: 'Minimum par taxation appliqué', en: 'Minimum per assessment applied', mg: 'Hetra kely indrindra nampiharina' },
  total: { fr: 'IFT à payer', en: 'IFT to pay', mg: 'IFT aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let categorie = EXEMPLE.categorie;

function monterCalculateur(p, b) {
  const A = b.ift.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('categorie')}</span><select id="ift-cat">${b.ift.categories.map(c =>
          `<option value="${c.numero}"${c.numero === categorie ? ' selected' : ''}>${c.numero}. ${esc(tr(c.libelle))}</option>`).join('')}</select></label>
        ${categorie === 6 ? champMontant('ift-valeur', l('valeur'), EXEMPLE.valeurVenale) : `
          ${champMontant('ift-ha', l('hectares'), EXEMPLE.hectares).replace('<span class="u">Ar</span>', '<span class="u">ha</span>')}
          ${champCommunal({ id: 'ift-tarif', libelle: l('tarif'), valeur: EXEMPLE.tarifParHa, unite: 'Ar/ha', article: A.calcul,
            regle: l('regleTarif', { duree: b.ift.dureeTarifAnnees }) + ' ' + t('valeur_exemple') })}`}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IFT</span><span>${l('parAn')}</span></div>
        <div class="rows" id="ift-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ift-total"></span></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('ift-cat').addEventListener('change', () => { categorie = Number($('ift-cat').value); monterCalculateur(p, b); });
  const recalculer = () => {
    const d = categorie === 6 ? { categorie, valeurVenale: lireMontant($('ift-valeur')) }
      : { categorie, hectares: lireMontant($('ift-ha')), tarifParHa: lireCommunal(p, 'ift-tarif') };
    const r = calculIFT(d, b);
    let h = categorie === 6 ? ligne(l('calcul6', { taux: pct(b.ift.tauxCategorie6, 0) }), ar(r.calcule), A.calcul)
      : ligne(l('calcul', { ha: d.hectares, tarif: ar(d.tarifParHa) }), ar(r.calcule), A.calcul);
    if (r.minimumApplique) h += ligne(l('minimum'), ar(b.ift.minimum), A.calcul, 'note');
    $('ift-rows').innerHTML = h;
    $('ift-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ift', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculIFT(EXEMPLE, b).impot };
