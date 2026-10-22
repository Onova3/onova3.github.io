// Fiche Droits d'enregistrement (CDI Partie II, SP I, Chap. I à III ; CPF Titre I, ST II, Chap. VIII). Textes malgaches à relire.
import { droitVenteImmeuble, droitBail, droitCessionParts, droitSuccession, droitDonation } from '../calc/de.js';
import { lien } from '../routes.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { prix: 40000000, loyer: 500000, duree: 36, parts: 10000000, heritiers: 3, donation: 20000000 };

const variables = b => {
  const e = b.enregistrement;
  return { min: ar(e.minimumProportionnel), vente: pct(e.venteImmeuble, 0), habitation: pct(e.bail.habitation, 0),
    autre: pct(e.bail.autre, 0), parts: pct(e.cessionParts), donation: pct(e.donation.taux, 0),
    directe: ar(e.succession.parHeritier.directe), collaterale: ar(e.succession.parHeritier.collaterale),
    lointain: ar(e.succession.parHeritier.autre), donLDD: ar(e.donation.ligneDirecteDescendanteParDonataire) };
};

const comprendre = {
  definition: {
    article: 'CDI 02.01.01 à 02.01.05',
    texte: {
      fr: "Quand on achète une maison, loue un local, cède des parts de société ou reçoit une donation, l'acte doit être « enregistré » auprès des impôts. On paie alors des droits d'enregistrement : un montant fixe, ou un pourcentage de la valeur en jeu.",
      en: 'When you buy a house, rent premises, transfer company shares or receive a gift, the deed must be “registered” with the tax office. Registration duties are then paid: a fixed amount, or a percentage of the value involved.',
      mg: "Rehefa mividy trano, manofa toerana, mamindra anjara amin'ny orinasa na mandray fanomezana, tsy maintsy « soratana » any amin'ny hetra ny taratasy. Mandoa haba fanoratana àry: vola raikitra, na isan-jaton'ny sandan'ny zavatra.",
    },
  },
  quiPaie: [
    { article: 'CDI 02.02.39', texte: {
      fr: 'Achat d’un terrain, d’une maison ou d’un appartement : {vente} du prix.',
      en: 'Buying land, a house or a flat: {vente} of the price.',
      mg: "Fividianana tany, trano na efitrano: {vente} amin'ny vidiny." } },
    { article: 'CDI 02.02.12', texte: {
      fr: 'Location : {habitation} des loyers pour un logement (ou un artisan avec 3 aides au plus), {autre} pour un local commercial, professionnel ou mixte.',
      en: 'Renting: {habitation} of the rent for housing (or a craftsperson with at most 3 helpers), {autre} for commercial, business or mixed premises.',
      mg: "Fanofana: {habitation} amin'ny hofan-trano ho an'ny fonenana (na mpanao asa tanana manana mpanampy 3 farafahabetsany), {autre} ho an'ny toeram-barotra, toeram-piasana na mifangaro." } },
    { article: 'CDI 02.02.43', texte: {
      fr: 'Cession d’actions ou de parts sociales : {parts} du prix.',
      en: 'Transfer of shares: {parts} of the price.',
      mg: "Famindrana anjara amin'ny orinasa: {parts} amin'ny vidiny." } },
    { article: 'CDI 02.03.25', texte: {
      fr: 'Donation : {donation} de la valeur, ou {donLDD} par enfant ou petit-enfant. Succession : un montant fixe par héritier selon le lien de parenté.',
      en: 'Gift: {donation} of the value, or {donLDD} per child or grandchild. Estate: a fixed amount per heir depending on the family link.',
      mg: "Fanomezana: {donation} amin'ny sandany, na {donLDD} isaky ny zanaka na zafikely. Lova: vola raikitra isaky ny mpandova araka ny fifandraisana ara-pianakaviana." } },
  ],
  exonerations: [
    { article: 'CDI 02.03.25 I', texte: {
      fr: 'La perception des droits sur les successions et les partages qui en découlent est actuellement suspendue : rien à payer, mais la déclaration reste obligatoire.',
      en: 'Collection of duties on estates and the resulting partitions is currently suspended: nothing to pay, but the return is still required.',
      mg: "Mihantona amin'izao fotoana izao ny fandraisana haba amin'ny lova sy ny fizarana avy aminy: tsy misy aloa, saingy mbola tsy maintsy atao ny fanambarana." } },
    { article: 'CDI 02.03.26, 02.03.31', texte: {
      fr: 'Les legs aux organismes reconnus d’utilité publique, et les successions des militaires morts au service de la nation ou des victimes du devoir lors de catastrophes.',
      en: 'Bequests to public-interest bodies, and estates of soldiers who died serving the nation or victims of duty in disasters.',
      mg: "Ny lova omena ny fikambanana ilaina ho an'ny besinimaro, sy ny lovan'ny miaramila maty nanompo ny firenena na ireo maty teo am-panatanterahana adidy nandritra ny loza." } },
  ],
  aSavoir: [
    { article: 'CDI 02.01.05', texte: {
      fr: 'Les droits se calculent sur le prix déclaré plus les charges, ou sur la valeur réelle si elle est plus élevée. Pour un immeuble, jamais sous la valeur administrative. Les centaines d’ariary sont négligées (base arrondie au millier).',
      en: 'Duties are calculated on the declared price plus charges, or on the real value if higher. For a building, never below the administrative value. Hundreds of ariary are ignored (base rounded to the thousand).',
      mg: "Kajiana amin'ny vidiny voalaza miampy ny fandaniana ny haba, na amin'ny sanda tena izy raha ambony kokoa. Ho an'ny trano na tany, tsy latsaky ny sanda ara-panjakana mihitsy. Tsy raisina ny zato ariary (boribory ho amin'ny arivo ny fototra)." } },
    { article: 'CDI 02.02.02', texte: {
      fr: 'Un droit proportionnel n’est jamais inférieur à {min}.',
      en: 'A proportional duty is never less than {min}.',
      mg: "Tsy latsaky ny {min} mihitsy ny haba isan-jato." } },
    { article: 'CDI 02.02.12 II, III', texte: {
      fr: 'Pour un bail, les droits portent sur tous les loyers de la durée du contrat. Durée indéterminée : un an de loyer, puis un nouveau droit chaque période.',
      en: 'For a lease, duties are on all the rent over the contract term. Open-ended lease: one year of rent, then a new duty each period.',
      mg: "Ho an'ny fanofana, ny hofan-trano rehetra mandritra ny faharetan'ny fifanarahana no iainan'ny haba. Faharetana tsy voafetra: hofan-trano herintaona, avy eo haba vaovao isaky ny vanim-potoana." } },
    { article: 'CDI 01.05.02', texte: {
      fr: 'Lors de la vente d’un immeuble par un particulier, le vendeur paie aussi l’impôt sur les plus-values immobilières (IPVI), en même temps que les droits d’enregistrement.',
      en: 'When an individual sells a building, the seller also pays real estate capital gains tax (IPVI), at the same time as the registration duties.',
      mg: "Rehefa mivarotra trano na tany ny olon-tsotra, mandoa koa ny IPVI ny mpivarotra, miaraka amin'ny haba fanoratana." } },
  ],
  exemple: {
    texte: {
      fr: 'Rado et Voahangy achètent un terrain à Antsirabe pour {prix}. Le notaire encaisse {impot} de droits d’enregistrement ({taux}) et les verse avant d’enregistrer l’acte, dans les 2 mois. De son côté, le vendeur paie l’IPVI.',
      en: 'Rado and Voahangy buy land in Antsirabe for {prix}. The notary collects {impot} in registration duties ({taux}) and pays them before registering the deed, within 2 months. The seller, for their part, pays IPVI.',
      mg: "Mividy tany any Antsirabe amin'ny {prix} i Rado sy Voahangy. Ny notera no mandray haba fanoratana {impot} ({taux}) ary mandoa azy alohan'ny hanoratana ny taratasy, ao anatin'ny 2 volana. Ny mpivarotra kosa mandoa ny IPVI.",
    },
    valeurs: b => ({ prix: ar(EXEMPLE.prix), taux: pct(b.enregistrement.venteImmeuble, 0), impot: ar(droitVenteImmeuble({ prix: EXEMPLE.prix }, b).impot) }),
  },
};

const L = {
  operation: { fr: 'Opération', en: 'Transaction', mg: 'Asa atao' },
  vente: { fr: 'Achat d’immeuble', en: 'Property purchase', mg: 'Fividianana trano/tany' },
  bail: { fr: 'Bail', en: 'Lease', mg: 'Fanofana' },
  parts: { fr: 'Cession de parts', en: 'Share transfer', mg: 'Famindrana anjara' },
  succession: { fr: 'Succession, donation', en: 'Estate, gift', mg: 'Lova, fanomezana' },
  prix: { fr: 'Prix de vente', en: 'Sale price', mg: 'Vidiny' },
  charges: { fr: 'Charges ajoutées au prix (indemnités au vendeur…)', en: 'Charges added to the price (payments to the seller…)', mg: "Fandaniana ampiana amin'ny vidiny" },
  valeurAdmin: { fr: 'Valeur administrative du bien (0 si inconnue)', en: 'Administrative value (0 if unknown)', mg: 'Sanda ara-panjakana (0 raha tsy fantatra)' },
  usage: { fr: 'Usage du local', en: 'Use of the premises', mg: "Fampiasana ny toerana" },
  habitation: { fr: 'Logement ({taux})', en: 'Housing ({taux})', mg: 'Fonenana ({taux})' },
  autre: { fr: 'Commerce, bureau, mixte ({taux})', en: 'Business, office, mixed ({taux})', mg: 'Varotra, birao, mifangaro ({taux})' },
  loyer: { fr: 'Loyer mensuel', en: 'Monthly rent', mg: 'Hofan-trano isam-bolana' },
  duree: { fr: 'Durée du bail en mois (0 = durée indéterminée)', en: 'Lease term in months (0 = open-ended)', mg: "Faharetan'ny fanofana amin'ny volana (0 = tsy voafetra)" },
  chargesBail: { fr: 'Charges imposées au locataire sur toute la durée', en: 'Charges borne by the tenant over the whole term', mg: "Fandaniana aloan'ny mpanofa mandritra ny faharetany" },
  prixParts: { fr: 'Prix de cession des parts', en: 'Share sale price', mg: "Vidin'ny anjara" },
  valeurReelle: { fr: 'Valeur réelle des parts, si connue (table financière de l’Administration)', en: 'Real value of the shares, if known (Administration’s valuation table)', mg: "Sanda tena izy, raha fantatra" },
  type: { fr: 'Type', en: 'Type', mg: 'Karazany' },
  typeSucc: { fr: 'Succession', en: 'Estate', mg: 'Lova' },
  typeDon: { fr: 'Donation', en: 'Gift', mg: 'Fanomezana' },
  lien: { fr: 'Lien avec le défunt', en: 'Relationship to the deceased', mg: "Fifandraisana amin'ny maty" },
  directe: { fr: 'Enfants, parents, conjoint ({m})', en: 'Children, parents, spouse ({m})', mg: 'Zanaka, ray aman-dreny, vady ({m})' },
  collaterale: { fr: 'Frères, sœurs, neveux, nièces ({m})', en: 'Siblings, nephews, nieces ({m})', mg: 'Mpirahalahy, mpiray tampo, zana-drahalahy ({m})' },
  lointain: { fr: 'Parents éloignés ou non-parents ({m})', en: 'Distant or unrelated ({m})', mg: 'Havana lavitra na tsy havana ({m})' },
  heritiers: { fr: 'Nombre d’héritiers', en: 'Number of heirs', mg: 'Isan’ny mpandova' },
  valeurDon: { fr: 'Valeur donnée', en: 'Value given', mg: 'Sandan’ny fanomezana' },
  ldd: { fr: 'Donation à ses enfants ou petits-enfants', en: 'Gift to one’s children or grandchildren', mg: "Fanomezana ho an'ny zanaka na zafikely" },
  donataires: { fr: 'Nombre de bénéficiaires', en: 'Number of recipients', mg: 'Isan’ny mahazo' },
  baseL: { fr: 'Base, arrondie au millier', en: 'Base, rounded to the thousand', mg: "Fototra, boribory ho amin'ny arivo" },
  releve: { fr: 'Relevé à la valeur administrative', en: 'Raised to the administrative value', mg: "Nampitoviana tamin'ny sanda ara-panjakana" },
  releveReel: { fr: 'Relevé à la valeur réelle', en: 'Raised to the real value', mg: "Nampitoviana tamin'ny sanda tena izy" },
  loyers: { fr: 'Loyers : {n} mois', en: 'Rent: {n} months', mg: 'Hofan-trano: {n} volana' },
  droit: { fr: 'Droit à {taux}', en: 'Duty at {taux}', mg: 'Haba {taux}' },
  minimum: { fr: 'Minimum de perception appliqué', en: 'Minimum charge applied', mg: 'Haba kely indrindra nampiharina' },
  tarif: { fr: '{n} × {m}', en: '{n} × {m}', mg: '{n} × {m}' },
  suspendu: { fr: 'Perception suspendue : rien à payer pour l’instant, mais la déclaration de succession reste obligatoire (6 mois après le décès).', en: 'Collection suspended: nothing to pay for now, but the estate return is still required (6 months after death).', mg: "Mihantona ny fandraisana: tsy misy aloa aloha, saingy mbola tsy maintsy atao ny fanambarana lova (6 volana aorian'ny fahafatesana)." },
  total: { fr: 'Droits à payer', en: 'Duties to pay', mg: 'Haba aloa' },
  parActe: { fr: 'Par acte', en: 'Per deed', mg: 'Isaky ny taratasy' },
  ipvi: { fr: 'Le vendeur paie aussi l’IPVI →', en: 'The seller also pays IPVI →', mg: 'Mandoa IPVI koa ny mpivarotra →' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let operation = 'vente', typeSucc = 'succession';

function monterCalculateur(p, b) {
  const e = b.enregistrement, A = e.articles;
  const seg = (attr, choix, actuel, cls = '') => `<div class="seg ${cls}" role="group">${choix.map(([val, lib]) =>
    `<button type="button" data-${attr}="${val}" aria-pressed="${val === actuel}">${lib}</button>`).join('')}</div>`;
  const formulaires = {
    vente: `${champMontant('de-prix', l('prix'), EXEMPLE.prix)}${champMontant('de-charges', l('charges'), 0)}${champMontant('de-admin', l('valeurAdmin'), 0)}
      <a class="aide" href="${lien('ipvi', 'calculer')}">${l('ipvi')}</a>`,
    bail: `<label class="f"><span>${l('usage')}</span><select id="de-usage">
        <option value="habitation">${esc(l('habitation', { taux: pct(e.bail.habitation, 0) }))}</option>
        <option value="autre">${esc(l('autre', { taux: pct(e.bail.autre, 0) }))}</option></select></label>
      ${champMontant('de-loyer', l('loyer'), EXEMPLE.loyer)}${champCompteur('de-duree', l('duree'), EXEMPLE.duree, 0, 1200)}${champMontant('de-charges', l('chargesBail'), 0)}`,
    parts: `${champMontant('de-prix', l('prixParts'), EXEMPLE.parts)}${champMontant('de-reelle', l('valeurReelle'), 0)}`,
    succession: `${seg('typesucc', [['succession', l('typeSucc')], ['donation', l('typeDon')]], typeSucc)}` + (typeSucc === 'succession'
      ? `<label class="f"><span>${l('lien')}</span><select id="de-lien">${[['directe', 'directe'], ['collaterale', 'collaterale'], ['autre', 'lointain']].map(([v, k]) =>
          `<option value="${v}">${esc(l(k, { m: ar(e.succession.parHeritier[v]) }))}</option>`).join('')}</select></label>
         ${champCompteur('de-nb', l('heritiers'), EXEMPLE.heritiers, 1, 50)}`
      : `${champMontant('de-valeur', l('valeurDon'), EXEMPLE.donation)}
         <label class="check"><input type="checkbox" id="de-ldd"><span>${l('ldd')}</span></label>
         ${champCompteur('de-nb', l('donataires'), 1, 1, 50)}`),
  };
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <div class="f"><span>${l('operation')}</span>
          ${seg('operation', ['vente', 'bail', 'parts', 'succession'].map(o => [o, l(o)]), operation, 'seg2x2')}</div>
        ${formulaires[operation]}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${l(operation)}</span><span>${l('parActe')}</span></div>
        <div class="rows" id="de-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="de-total"></span></div>
        <p class="warn" id="de-msg" hidden></p>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  p.querySelectorAll('[data-operation]').forEach(bt => bt.addEventListener('click', () => { operation = bt.dataset.operation; monterCalculateur(p, b); }));
  p.querySelectorAll('[data-typesucc]').forEach(bt => bt.addEventListener('click', () => { typeSucc = bt.dataset.typesucc; monterCalculateur(p, b); }));
  const $ = id => p.querySelector('#' + id);
  const proportionnel = (r, art) => ligne(l('baseL'), ar(r.base), A.base) + ligne(l('droit', { taux: pct(r.taux) }), ar(r.calcule), art)
    + (r.minimumApplique ? ligne(l('minimum'), ar(e.minimumProportionnel), A.minimum, 'note') : '');

  const recalculer = () => {
    let h = '', impot = 0, msg = '';
    if (operation === 'vente') {
      const prix = lireMontant($('de-prix')), charges = lireMontant($('de-charges'));
      const r = droitVenteImmeuble({ prix, charges, valeurAdministrative: lireMontant($('de-admin')) }, b);
      h = ligne(l('prix'), ar(prix), A.venteImmeuble) + (charges ? ligne(l('charges'), ar(charges), A.venteImmeuble) : '')
        + (r.valeurAdministrativeAppliquee ? ligne(l('releve'), '', A.base, 'note') : '') + proportionnel(r, A.venteImmeuble);
      impot = r.impot;
    } else if (operation === 'bail') {
      const duree = lireEntier($('de-duree'), 0, 1200), charges = lireMontant($('de-charges'));
      const r = droitBail({ loyerMensuel: lireMontant($('de-loyer')), dureeMois: duree || null, charges, usage: $('de-usage').value }, b);
      h = ligne(l('loyers', { n: r.mois }), ar(r.loyers), A.bail) + (charges ? ligne(l('chargesBail'), ar(charges), A.bail) : '') + proportionnel(r, A.bail);
      impot = r.impot;
    } else if (operation === 'parts') {
      const prix = lireMontant($('de-prix'));
      const r = droitCessionParts({ prix, valeurReelle: lireMontant($('de-reelle')) }, b);
      h = ligne(l('prixParts'), ar(prix), A.cessionParts) + (r.valeurReelleAppliquee ? ligne(l('releveReel'), '', A.base, 'note') : '') + proportionnel(r, A.cessionParts);
      impot = r.impot;
    } else if (typeSucc === 'succession') {
      const n = lireEntier($('de-nb'), 1, 50), r = droitSuccession({ lien: $('de-lien').value, heritiers: n }, b);
      h = ligne(l('tarif', { n, m: ar(r.parHeritier) }), ar(r.tarif), A.succession);
      impot = r.impot;
      if (r.suspendue) msg = esc(l('suspendu')) + `<small class="art">${A.succession}</small>`;
    } else {
      const n = lireEntier($('de-nb'), 1, 50), valeur = lireMontant($('de-valeur'));
      const r = droitDonation({ valeur, ligneDirecteDescendante: $('de-ldd').checked, donataires: n }, b);
      h = ligne(l('valeurDon'), ar(valeur), A.donation)
        + (r.fixe ? ligne(l('tarif', { n, m: ar(r.parDonataire) }), ar(r.impot), A.donation) : proportionnel(r, A.donation));
      impot = r.impot;
    }
    $('de-rows').innerHTML = h;
    $('de-total').textContent = ar(impot);
    $('de-msg').hidden = !msg;
    $('de-msg').innerHTML = msg;
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'de', variables, comprendre, monterCalculateur, impotExemple: b => droitVenteImmeuble({ prix: EXEMPLE.prix }, b).impot };
