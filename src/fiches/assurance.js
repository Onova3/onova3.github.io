// Fiche Taxe sur les contrats d'assurance (CDI Partie II, SP I, Chap. VI ; CPF Titre I, ST II, Chap. IX). Textes malgaches à relire.
import { calculTaxeAssurance } from '../calc/assurance.js';
import { t, tr, fmt, esc, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { prime: 600000, categorie: 'autres', tacava: true };
const CATEGORIES = {
  autres: { fr: 'Autres assurances (auto, santé, responsabilité…)', en: 'Other insurance (car, health, liability…)', mg: 'Fiantohana hafa (fiara, fahasalamana, andraikitra…)' },
  incendieAutre: { fr: 'Incendie, autres biens (logement…)', en: 'Fire, other property (home…)', mg: 'Afo, fananana hafa (trano…)' },
  incendiePro: { fr: 'Incendie, biens professionnels', en: 'Fire, business property', mg: "Afo, fananana ho an'ny asa" },
  vie: { fr: 'Assurance vie', en: 'Life insurance', mg: 'Fiantohana aina' },
  renteViagere: { fr: 'Rente viagère', en: 'Life annuity', mg: 'Vola omena mandra-pahafaty' },
  navigation: { fr: 'Navigation maritime, fluviale ou aérienne', en: 'Sea, river or air navigation', mg: 'Fitaterana an-dranomasina, an-drenirano na an-habakabaka' },
};

const variables = b => {
  const a = b.assurance.taux;
  return { autres: pct(a.autres), incendieAutre: pct(a.incendieAutre, 0), incendiePro: pct(a.incendiePro, 0), vie: pct(a.vie, 0),
    rente: pct(a.renteViagere, 0), navigation: pct(a.navigation, 0), tacava: pct(b.assurance.tacava, 0) };
};

const comprendre = {
  definition: {
    article: 'CDI 02.06.01',
    texte: {
      fr: "Chaque contrat d'assurance supporte une taxe annuelle calculée sur la prime payée à l'assureur. L'assureur l'ajoute à la prime et la reverse aux impôts.",
      en: 'Every insurance contract bears an annual tax calculated on the premium paid to the insurer. The insurer adds it to the premium and pays it over to the tax office.',
      mg: "Ny fifanarahana fiantohana tsirairay dia misy haba isan-taona kajiana amin'ny sarany aloa amin'ny mpiantoka. Ny mpiantoka no manampy azy amin'ny sarany ary mandoa azy any amin'ny hetra.",
    },
  },
  quiPaie: [
    { article: 'CDI 02.06.02', texte: {
      fr: 'Taux selon le contrat : {autres} pour la plupart des assurances (auto, santé…), {incendieAutre} pour l’incendie d’un logement, {incendiePro} pour l’incendie de biens professionnels, {vie} pour l’assurance vie, {rente} pour une rente viagère, {navigation} pour la navigation.',
      en: 'Rate by contract: {autres} for most insurance (car, health…), {incendieAutre} for fire on a home, {incendiePro} for fire on business property, {vie} for life insurance, {rente} for a life annuity, {navigation} for navigation.',
      mg: "Taha araka ny fifanarahana: {autres} ho an'ny ankamaroan'ny fiantohana (fiara, fahasalamana…), {incendieAutre} ho an'ny afo amin'ny trano fonenana, {incendiePro} ho an'ny afo amin'ny fananana ho an'ny asa, {vie} ho an'ny fiantohana aina, {rente} ho an'ny vola omena mandra-pahafaty, {navigation} ho an'ny fitaterana an-dranomasina sy an-habakabaka." } },
    { article: 'CDI 02.06.17, 02.06.18', texte: {
      fr: 'Pour une voiture particulière de tourisme, s’ajoute la TACAVA de {tacava} de la prime, sauf si la voiture sert au transport public ou appartient à une société.',
      en: 'For a private passenger car, the TACAVA of {tacava} of the premium is added, unless the car is used for public transport or belongs to a company.',
      mg: "Ho an'ny fiara tsotra fitsangatsanganana, ampiana ny TACAVA {tacava} amin'ny sarany, afa-tsy raha fitaterana iombonana na an'ny orinasa ilay fiara." } },
  ],
  exonerations: [
    { article: 'CDI 02.06.03', texte: {
      fr: 'Réassurances ; accidents du travail ; mutuelles agricoles et sociétés de secours mutuels ; transport international maritime ou aérien ; marchandises transportées ; risques situés hors de Madagascar ; assurance vie des non-résidents.',
      en: 'Reinsurance; workplace accidents; agricultural mutuals and mutual aid societies; international sea or air transport; goods in transit; risks located outside Madagascar; life insurance of non-residents.',
      mg: "Fiantohana indroa; loza any am-piasana; fiantohana ifanomezan'ny mpamboly sy fikambanana fifanampiana; fitaterana iraisam-pirenena an-dranomasina na an-habakabaka; entana entina; loza any ivelan'i Madagasikara; fiantohana ain'ny tsy mponina." } },
    { article: 'CDI 06.01.06 19°', texte: {
      fr: 'Bon à savoir : les contrats d’assurance des petits exploitants agricoles à l’impôt synthétique sont exonérés de TVA.',
      en: 'Good to know: insurance contracts of small farmers under the synthetic tax are exempt from VAT.',
      mg: "Tsara ho fantatra: tsy iharan'ny TVA ny fifanarahana fiantohana an'ny mpamboly madinika iharan'ny hetra tsotra." } },
  ],
  aSavoir: [
    { article: 'CDI 02.06.01', texte: {
      fr: 'Grâce à cette taxe, les actes du contrat (signature, avenant, résiliation amiable) sont enregistrés gratuitement.',
      en: 'Thanks to this tax, contract documents (signature, amendment, amicable termination) are registered free of charge.',
      mg: "Noho ity haba ity, soratana maimaimpoana ny taratasin'ny fifanarahana (sonia, fanovana, fanafoanana am-pitoniana)." } },
    { article: 'CDI 02.06.17', texte: {
      fr: 'La TACAVA n’est pas déductible du bénéfice imposable à l’IR.',
      en: 'TACAVA is not deductible from profit taxable under IR.',
      mg: "Tsy azo esorina amin'ny tombony iainan'ny IR ny TACAVA." } },
  ],
  exemple: {
    texte: {
      fr: 'Haja assure sa voiture personnelle pour {prime} par an. La taxe ({taux}) et la TACAVA ({tacava}) ajoutent {total} : Haja paie {ttc} à l’assureur.',
      en: 'Haja insures a personal car for {prime} a year. The tax ({taux}) and TACAVA ({tacava}) add {total}: Haja pays {ttc} to the insurer.',
      mg: "Mampiantoka ny fiarany manokana amin'ny {prime} isan-taona i Haja. Ny haba ({taux}) sy ny TACAVA ({tacava}) dia manampy {total}: {ttc} no aloan'i Haja amin'ny mpiantoka.",
    },
    valeurs: b => {
      const r = calculTaxeAssurance(EXEMPLE, b);
      return { prime: ar(EXEMPLE.prime), taux: pct(r.taux), tacava: pct(b.assurance.tacava, 0), total: ar(r.total), ttc: ar(r.primeTTC) };
    },
  },
};

const L = {
  prime: { fr: 'Prime annuelle (hors taxe)', en: 'Annual premium (excl. tax)', mg: 'Sarany isan-taona (tsy misy haba)' },
  categorie: { fr: 'Type de contrat', en: 'Type of contract', mg: 'Karazana fifanarahana' },
  tacava: { fr: 'Voiture particulière d’un particulier (TACAVA)', en: 'Private car owned by an individual (TACAVA)', mg: "Fiara tsotra an'olon-tsotra (TACAVA)" },
  primeL: { fr: 'Prime', en: 'Premium', mg: 'Sarany' },
  taxe: { fr: 'Taxe à {taux}', en: 'Tax at {taux}', mg: 'Haba {taux}' },
  tacavaL: { fr: 'TACAVA à {taux}', en: 'TACAVA at {taux}', mg: 'TACAVA {taux}' },
  total: { fr: 'Taxes sur le contrat', en: 'Taxes on the contract', mg: "Haba amin'ny fifanarahana" },
  ttc: { fr: 'Prime toutes taxes', en: 'Premium incl. taxes', mg: 'Sarany miaraka amin’ny haba' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.assurance.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('categorie')}</span><select id="as-cat">${Object.keys(CATEGORIES).map(k =>
          `<option value="${k}"${k === EXEMPLE.categorie ? ' selected' : ''}>${esc(tr(CATEGORIES[k]))} · ${pct(b.assurance.taux[k])}</option>`).join('')}</select></label>
        ${champMontant('as-prime', l('prime'), EXEMPLE.prime)}
        <label class="check"><input type="checkbox" id="as-tacava"${EXEMPLE.tacava ? ' checked' : ''}><span>${l('tacava')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Assurance', en: 'Insurance', mg: 'Fiantohana' })}</span><span>${l('parAn')}</span></div>
        <div class="rows" id="as-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="as-total"></span></div>
        <div class="sub" id="as-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const prime = lireMontant($('as-prime')), r = calculTaxeAssurance({ prime, categorie: $('as-cat').value, tacava: $('as-tacava').checked }, b);
    $('as-rows').innerHTML = ligne(l('primeL'), ar(prime), A.base) + ligne(l('taxe', { taux: pct(r.taux) }), ar(r.taxe), A.taux)
      + (r.tacava ? ligne(l('tacavaL', { taux: pct(b.assurance.tacava, 0) }), ar(r.tacava), A.tacava) : '');
    $('as-total').textContent = ar(r.total);
    $('as-sub').innerHTML = puce(l('ttc'), ar(r.primeTTC));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'assurance', variables, comprendre, monterCalculateur, impotExemple: b => calculTaxeAssurance(EXEMPLE, b).total };
