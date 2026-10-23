// Module Sanctions (#/sanctions) : règles générales du Livre III, amendes pour erreur ou fraude, taxation d'office,
// et simulateur combinant complément d'impôt, amende et pénalité de retard. Textes malgaches à relire.
import { calculAmende, calculPenalites } from '../calc/penalites.js';
import { t, tr, fmt, esc, ar, pct, art, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const GROUPES = {
  declaration: { fr: 'Déclaration inexacte', en: 'Inaccurate return', mg: 'Fanambarana diso' },
  retenues: { fr: 'Retenues à la source', en: 'Withholding at source', mg: 'Hetra esorina avy hatrany' },
  tva: { fr: 'TVA et factures', en: 'VAT and invoices', mg: 'TVA sy faktiora' },
  enregistrement: { fr: 'Actes et enregistrement', en: 'Deeds and registration', mg: 'Taratasy sy fanoratana' },
  controle: { fr: 'Contrôle et fraude', en: 'Audit and fraud', mg: 'Fanaraha-maso sy hosoka' },
  autres: { fr: 'Autres manquements', en: 'Other breaches', mg: 'Tsy fanarahana hafa' },
};
const LIBELLES = {
  insuffisance: { fr: 'Insuffisance, omission ou inexactitude dans une déclaration', en: 'Understatement, omission or inaccuracy in a return', mg: 'Tsy ampy, adino na diso ao amin’ny fanambarana' },
  oppositionControle: { fr: 'Opposition au contrôle fiscal', en: 'Obstructing a tax audit', mg: 'Fanoherana ny fanaraha-maso' },
  irsaNonRetenu: { fr: 'Employeur : IRSA non retenu sur les salaires', en: 'Employer: IRSA not withheld from salaries', mg: 'Mpampiasa: IRSA tsy nesorina tamin’ny karama' },
  irsaNonVerse: { fr: 'Employeur : IRSA retenu mais non versé', en: 'Employer: IRSA withheld but not paid over', mg: 'Mpampiasa: IRSA nesorina nefa tsy naloa' },
  intermittentNonRetenu: { fr: 'IR, TVA intermittente ou IRM non retenus', en: 'Intermittent IR, VAT or IRM not withheld', mg: 'IR, TVA na IRM tsy nesorina' },
  retenueNonVersee: { fr: 'IR, TVA intermittente ou IRM retenus mais non versés', en: 'Intermittent IR, VAT or IRM withheld but not paid', mg: 'IR, TVA na IRM nesorina nefa tsy naloa' },
  tvaFacture: { fr: 'Facture irrégulière ou absente (opération bien comptabilisée)', en: 'Irregular or missing invoice (transaction properly recorded)', mg: 'Faktiora tsy ara-dalàna na tsy misy' },
  tvaNonApparente: { fr: 'TVA non indiquée séparément sur la facture', en: 'VAT not shown separately on the invoice', mg: 'TVA tsy aseho misaraka amin’ny faktiora' },
  tvaDeductionAbusive: { fr: 'Déduction ou remboursement de TVA abusif, crédit injustifié', en: 'Improper VAT deduction or refund, unjustified credit', mg: 'Fanesorana na famerenana TVA tsy ara-dalàna' },
  tvaDissimulation: { fr: 'Fausse facture, vente non déclarée, facture sous-évaluée', en: 'False invoice, undeclared sale, undervalued invoice', mg: 'Faktiora sandoka, varotra tsy nambara' },
  foncier: { fr: 'Impôt foncier éludé', en: 'Property tax evaded', mg: 'Hetra amin’ny tany sy trano nolavina' },
  dissimulationActe: { fr: 'Contre-lettre ou contrat déguisé pour payer moins de droits', en: 'Counter-letter or disguised contract to pay less duty', mg: 'Fifanarahana nafenina mba handoavana haba kely kokoa' },
  fausseDeclarationActe: { fr: 'Autre fausse déclaration dans un acte', en: 'Other false statement in a deed', mg: 'Fanambarana diso hafa ao amin’ny taratasy' },
  taxationOffice: { fr: 'Taxation ou redressement d’office', en: 'Assessment or adjustment by default', mg: 'Hetra napetraky ny fitondrana' },
  fraude: { fr: 'Manœuvres frauduleuses', en: 'Fraudulent practices', mg: 'Hosoka' },
  deficitRedresse: { fr: 'IR : déficit déclaré, redressé par l’administration', en: 'IR: declared loss adjusted by the tax office', mg: 'IR: fatiantoka nambara nefa nahitsy' },
  sansComptabilite: { fr: 'Absence de comptabilité régulière', en: 'No proper accounts', mg: 'Tsy misy kaonty ara-dalàna' },
  especes: { fr: 'Paiement en espèces là où chèque, virement ou mobile banking est obligatoire', en: 'Cash payment where cheque, transfer or mobile banking is required', mg: 'Fandoavana vola an-tanana' },
  chequeSansProvision: { fr: 'Paiement de l’impôt par chèque sans provision', en: 'Tax paid by bounced cheque', mg: 'Seky tsy misy vola' },
  refusDocuments: { fr: 'Refus de présenter livres ou documents', en: 'Refusal to present books or documents', mg: 'Fandavana tsy hampiseho boky na taratasy' },
  refusAccesIfpb: { fr: 'IFPB : refus d’accès à l’immeuble', en: 'IFPB: refusal of access to the building', mg: 'IFPB: fandavana tsy hampidirana' },
  autreInfraction: { fr: 'Autre infraction non prévue ailleurs', en: 'Other offence not provided for elsewhere', mg: 'Fandikana hafa' },
};
const BASES = {
  droits: { fr: 'Droits éludés (complément d’impôt)', en: 'Duties evaded (additional tax)', mg: 'Hetra nolavina' },
  elements: { fr: 'Base des éléments en possession de l’administration', en: 'Base of the facts held by the tax office', mg: 'Fototra hitan’ny fitondrana' },
  sommes: { fr: 'Sommes non retenues ou non versées', en: 'Amounts not withheld or not paid over', mg: 'Vola tsy nesorina na tsy naloa' },
  taxe: { fr: 'Montant de la TVA en cause', en: 'Amount of VAT concerned', mg: 'TVA voakasika' },
  sommeContrat: { fr: 'Somme stipulée dans le contrat', en: 'Sum stated in the contract', mg: 'Vola voalaza ao amin’ny fifanarahana' },
  impotFictif: { fr: 'Impôt calculé sur les redressements', en: 'Tax calculated on the adjustments', mg: 'Hetra kajiana amin’ny fanitsiana' },
  ca: { fr: 'Chiffre d’affaires de l’exercice', en: 'Turnover for the year', mg: 'Tondrom-barotra' },
  transactions: { fr: 'Montant des transactions concernées', en: 'Amount of the transactions concerned', mg: 'Vola voakasika' },
  montantExigible: { fr: 'Montant exigible payé par le chèque', en: 'Amount due paid by the cheque', mg: 'Vola naloa tamin’ny seky' },
};

const L = {
  intro: { fr: 'Ce que le Code des impôts prévoit quand un impôt est déclaré en retard, mal déclaré ou fraudé. Chaque fiche impôt rappelle les sanctions qui lui sont propres.', en: 'What the Tax Code provides when a tax is filed late, misreported or evaded. Each tax guide recalls its own penalties.', mg: "Izay voalazan'ny Fehezan-dalàna momba ny hetra raha tara, diso na hosoka ny fanambarana. Ny pejy tsirairay dia mampahatsiahy ny sazy manokana." },
  base3: { fr: 'Les trois sanctions de base', en: 'The three basic penalties', mg: 'Ireo sazy fototra telo' },
  retard: { fr: 'Retard de paiement : {regles}. Minimum {min} par impôt et par période.', en: 'Late payment: {regles}. Minimum {min} per tax and period.', mg: 'Fandoavana tara: {regles}. Farafahakeliny {min}.' },
  regle: { fr: '{p1} puis {p2} par mois dès {ca} de CA', en: '{p1} then {p2} per month from {ca} turnover', mg: '{p1} dia {p2} isam-bolana manomboka amin’ny {ca}' },
  defaut: { fr: 'Déclaration non déposée : de {min} à {max} selon le chiffre d’affaires.', en: 'Return not filed: {min} to {max} depending on turnover.', mg: 'Fanambarana tsy napetraka: {min} ka hatramin’ny {max} araka ny tondrom-barotra.' },
  local: { fr: 'Impôts locaux : {taux} par mois de retard.', en: 'Local taxes: {taux} per month late.', mg: 'Hetra ifotony: {taux} isaky ny volana tara.' },
  cumul: { fr: 'Toute infraction entraîne aussi la pénalité de retard.', en: 'Any offence also triggers the late-payment penalty.', mg: 'Ny fandikana rehetra dia miteraka koa sazy noho ny fahatarana.' },
  amendes: { fr: 'Amendes pour erreur ou fraude', en: 'Fines for errors or fraud', mg: 'Onitra noho ny hadisoana na hosoka' },
  fixe: { fr: 'montant fixe', en: 'fixed amount', mg: 'vola raikitra' },
  de: { fr: 'de : {base}', en: 'of: {base}', mg: 'amin’ny: {base}' },
  min: { fr: 'minimum {min}', en: 'minimum {min}', mg: 'farafahakeliny {min}' },
  office: { fr: 'Taxation d’office', en: 'Assessment by default', mg: 'Hetra napetraky ny fitondrana' },
  officeTexte: { fr: 'Si une déclaration n’est pas déposée à temps, si la comptabilité est absente ou peu fiable, en cas d’achats ou de ventes sans facture, ou si le contrôle est empêché, l’administration fixe elle-même la base de l’impôt, d’après ses informations ou par comparaison avec des entreprises semblables. S’y ajoute une amende de 40 % des droits.', en: 'If a return is not filed on time, if accounts are missing or unreliable, for purchases or sales without invoices, or if the audit is obstructed, the tax office sets the tax base itself, from its information or by comparison with similar businesses. A fine of 40% of the duties is added.', mg: "Raha tsy napetraka ara-potoana ny fanambarana, raha tsy misy na tsy azo itokisana ny kaonty, raha misy fividianana na fivarotana tsy misy faktiora, na raha voasakana ny fanaraha-maso, ny fitondrana mihitsy no mamaritra ny fototry ny hetra, araka ny fampahalalana ananany na amin'ny fampitahana amin'ny orinasa mitovy aminy. Ampiana onitra 40 % amin'ny hetra izany." },
  attenuer: { fr: 'Réduire ou éviter une sanction', en: 'Reducing or avoiding a penalty', mg: 'Hampihena na hialana amin’ny sazy' },
  remise: { fr: 'Une remise partielle ou totale de pénalité ou d’amende peut être demandée au bureau qui gère le dossier ; le Directeur général des impôts décide.', en: 'A partial or full remission of a penalty or fine can be requested from the office managing the file; the Director General of Taxes decides.', mg: "Azo angatahana amin'ny biraon'ny hetra mitantana ny antontan-taratasy ny fanafoanana ampahany na manontolo ny sazy na onitra; ny Talen'ny hetra no manapa-kevitra." },
  cga: { fr: 'Un nouvel adhérent à un centre de gestion agréé qui corrige spontanément ses déclarations ne paie aucune pénalité.', en: 'A new member of an approved management centre who spontaneously corrects their returns pays no penalty.', mg: "Ny mpikambana vaovao ao amin'ny foibe fitantanana nankatoavina izay manitsy ho azy ny fanambarany dia tsy mandoa sazy." },
  sim: { fr: 'Simuler une sanction', en: 'Simulate a penalty', mg: 'Hanao tombana sazy' },
  manquement: { fr: 'Manquement', en: 'Breach', mg: 'Tsy fanarahana' },
  complement: { fr: 'Complément d’impôt à payer', en: 'Additional tax to pay', mg: 'Hetra fanampiny aloa' },
  mois: { fr: 'Mois de retard', en: 'Months late', mg: 'Volana tara' },
  ca: { fr: 'Chiffre d’affaires annuel (pour la pénalité de retard)', en: 'Annual turnover (for the late-payment penalty)', mg: 'Tondrom-barotra isan-taona' },
  defautCoche: { fr: 'La déclaration n’a pas non plus été déposée', en: 'The return was not filed either', mg: 'Tsy napetraka koa ny fanambarana' },
  rComplement: { fr: 'Complément d’impôt', en: 'Additional tax', mg: 'Hetra fanampiny' },
  rAmende: { fr: 'Amende : {lib}', en: 'Fine: {lib}', mg: 'Onitra: {lib}' },
  rMin: { fr: 'Minimum de l’amende appliqué', en: 'Fine minimum applied', mg: 'Onitra farafahakeliny nampiharina' },
  rRetard: { fr: 'Pénalité de retard ({n} mois)', en: 'Late-payment penalty ({n} months)', mg: 'Sazy noho ny fahatarana ({n} volana)' },
  rDefaut: { fr: 'Amende pour défaut de dépôt', en: 'Fine for not filing', mg: 'Onitra noho ny tsy fametrahana' },
  total: { fr: 'Total à payer', en: 'Total to pay', mg: 'Totaliny aloa' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

export function monter(el, { b }) {
  const P = b.penalites, A = b.amendes;
  const regles = P.retard.map(r => l('regle', { p1: pct(r.premierMois), p2: pct(r.moisSuivants), ca: ar(r.caMin) })).join(' ; ');
  const montants = P.amendeDefautDepot.map(a => a.montant);
  const decrire = a => a.fixe ? `${ar(a.fixe)} (${l('fixe')})` : `${pct(a.taux)} ${l('de', { base: tr(BASES[a.base]) })}${a.minimum ? ', ' + l('min', { min: ar(a.minimum) }) : ''}`;
  el.innerHTML = `
    <a class="retour" href="#/">${t('retour')}</a>
    <header class="fiche-tete"><h2>${t('module_sanctions')}</h2><p class="lead">${l('intro')}</p></header>
    <div class="grid">
      <div class="card"><h3>${l('base3')}</h3><ul class="puces">
        <li>${esc(l('retard', { regles, min: ar(P.minimumRetard) }))}${art(P.articles.retard)}</li>
        <li>${esc(l('defaut', { min: ar(Math.min(...montants)), max: ar(Math.max(...montants)) }))}${art(P.articles.defautDepot)}</li>
        <li>${esc(l('local', { taux: pct(P.retardLivreII, 0) }))}${art(P.articles.retardLivreII)}</li>
        <li>${esc(l('cumul'))}${art(A.articles.general)}</li></ul></div>
      <div class="card"><h3>${l('office')}${art(A.articles.taxationOffice)}</h3><p>${esc(l('officeTexte'))}${art('CDI 20.01.55')}</p>
        <h3>${l('attenuer')}</h3><ul class="puces"><li>${esc(l('remise'))}${art(A.articles.remise)}</li><li>${esc(l('cga'))}${art(A.articles.cga)}</li></ul></div>
    </div>
    <h3 class="titre-sim">${l('amendes')}</h3>
    <div class="grid">${Object.keys(GROUPES).map(g => `<div class="card"><h3>${esc(tr(GROUPES[g]))}</h3><ul class="puces">${A.liste.filter(a => a.groupe === g).map(a =>
      `<li><b>${esc(tr(LIBELLES[a.id]))}</b> : ${esc(decrire(a))}${art(a.article)}</li>`).join('')}</ul></div>`).join('')}</div>
    <h3 class="titre-sim">${l('sim')}</h3>
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('manquement')}</span><select id="sa-id">${Object.keys(GROUPES).map(g => `<optgroup label="${esc(tr(GROUPES[g]))}">${A.liste.filter(a => a.groupe === g).map(a =>
          `<option value="${a.id}"${a.id === 'insuffisance' ? ' selected' : ''}>${esc(tr(LIBELLES[a.id]))}</option>`).join('')}</optgroup>`).join('')}</select></label>
        <div id="sa-base-bloc"></div>
        ${champMontant('sa-complement', l('complement'), 1000000)}
        ${champCompteur('sa-mois', l('mois'), 3, 0, 120)}
        ${champMontant('sa-ca', l('ca'), 30000000)}
        <label class="check"><input type="checkbox" id="sa-defaut"><span>${l('defautCoche')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${t('module_sanctions')}</span><span>CDI</span></div>
        <div class="rows" id="sa-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="sa-total"></span></div>
        <p class="arr">${t('arrondi')}${art(P.articles.arrondi)}</p>
      </div>
    </div>`;
  const $ = id => el.querySelector('#' + id);
  const formBase = () => {
    const a = A.liste.find(x => x.id === $('sa-id').value);
    $('sa-base-bloc').innerHTML = a.fixe ? '' : champMontant('sa-base', tr(BASES[a.base]), 1000000);
    brancher($('sa-base-bloc'), recalculer);
  };
  const recalculer = () => {
    const id = $('sa-id').value, a = A.liste.find(x => x.id === id);
    const base = a.fixe ? 0 : lireMontant($('sa-base')), complement = lireMontant($('sa-complement'));
    const mois = lireEntier($('sa-mois'), 0, 120), defaut = $('sa-defaut').checked;
    const am = calculAmende(id, base, b);
    const pen = mois ? calculPenalites({ impot: complement, moisRetard: mois, ca: lireMontant($('sa-ca')), defautDepot: defaut }, b)
      : { interets: 0, amende: defaut ? calculPenalites({ impot: 0, moisRetard: 1, ca: lireMontant($('sa-ca')), defautDepot: true }, b).amende : 0 };
    let h = ligne(l('rComplement'), ar(complement));
    h += ligne(l('rAmende', { lib: am.fixe ? l('fixe') : `${pct(am.taux)} × ${ar(base)}` }), ar(am.amende), am.article);
    if (am.minimumApplique) h += ligne(l('rMin'), '', am.article, 'note');
    if (mois) h += ligne(l('rRetard', { n: mois }), ar(pen.interets), P.articles.retard);
    if (defaut) h += ligne(l('rDefaut'), ar(pen.amende), P.articles.defautDepot);
    $('sa-rows').innerHTML = h;
    $('sa-total').textContent = ar(complement + am.amende + pen.interets + (defaut ? pen.amende : 0));
  };
  $('sa-id').addEventListener('change', () => { formBase(); recalculer(); });
  brancher(el.querySelector('#sa-id').closest('.card'), recalculer);
  formBase();
  recalculer();
}
