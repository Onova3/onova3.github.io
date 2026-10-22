// Fiche IRSA (CDI Partie I, Titre III ; CPF Titre I, ST II, Chap. V). Textes malgaches à relire.
import { calculIRSA, calculIRSASpecial } from '../calc/irsa.js';
import { t, tr, fmt, ar, pct, ligne, puce, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { brut: 1200000, personnesACharge: 2, remuneration: 300000, tauxUnitaire: 1500 };

const comprendre = {
  definition: {
    article: 'CDI 01.03.01, CPF I-20',
    texte: {
      fr: "L'IRSA est l'impôt sur les salaires et revenus assimilés gagnés à Madagascar. Le salarié ne fait aucune démarche : l'employeur calcule l'impôt et le retient chaque mois directement sur la paie.",
      en: 'IRSA is the tax on salaries and similar income earned in Madagascar. The employee does nothing: the employer calculates the tax and withholds it from the pay every month.',
      mg: "Ny IRSA dia hetra amin'ny karama sy ny vola miditra mitovy aminy azo eto Madagasikara. Tsy misy zavatra atao ny mpiasa: ny mpampiasa no manao ny kajy sy manala azy mivantana amin'ny karama isam-bolana.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.03.02', texte: {
      fr: 'Les salariés du public et du privé, en emploi permanent, temporaire ou occasionnel : salaire, primes, gratifications, mois supplémentaires.',
      en: 'Public and private employees, in permanent, temporary or occasional jobs: salary, bonuses, gratuities, extra months.',
      mg: "Ny mpiasan'ny fanjakana sy ny tsy miankina, maharitra, vonjimaika na indraindray: karama, tambiny, fanomezana, volana fanampiny." } },
    { article: 'CDI 01.03.02', texte: {
      fr: 'Le personnel des ONG, organismes internationaux, ambassades, bureaux d’études et projets, quel que soit leur financement.',
      en: 'Staff of NGOs, international bodies, embassies, consultancies and projects, however they are funded.',
      mg: "Ny mpiasan'ny ONG, sampan-draharaha iraisam-pirenena, masoivoho, birao fanadihadiana ary tetikasa, na avy aiza na avy aiza ny vola." } },
    { article: 'CDI 01.03.02', texte: {
      fr: 'Les pensions alimentaires obligatoires (sauf celles versées aux enfants à charge) et les rentes viagères.',
      en: 'Compulsory maintenance payments (except those paid to dependent children) and life annuities.',
      mg: "Ny fanampiana ara-tsakafo tsy maintsy aloa (afa-tsy izay omena ny ankizy iantohana) sy ny vola omena mandra-pahafaty." } },
    { article: 'CDI 01.03.04, 01.03.05', texte: {
      fr: 'Les personnes qui résident à Madagascar, et celles qui vivent à l’étranger pour leurs revenus de source malgache.',
      en: 'People who live in Madagascar, and people living abroad for their income from Malagasy sources.',
      mg: "Ny olona monina eto Madagasikara, ary ireo monina any ivelany amin'ny vola azony avy eto Madagasikara." } },
    { article: 'CDI 01.03.07, 01.03.08', texte: {
      fr: 'Les avantages en nature (voiture, logement, téléphone…) s’ajoutent au salaire, selon les règles d’évaluation du Code.',
      en: 'Benefits in kind (car, housing, phone…) are added to the salary, valued by the rules of the Code.',
      mg: "Ampiana amin'ny karama ny tombontsoa ara-materialy (fiara, trano, finday…), araka ny fomba fanombanana voalazan'ny Fehezan-dalàna." } },
  ],
  exonerations: [
    { article: 'CDI 01.03.03 1°, 2°', texte: {
      fr: 'Les pensions versées en réparation d’un dommage, et les pensions de retraite civiles et militaires.',
      en: 'Pensions paid as compensation for damage, and civil and military retirement pensions.',
      mg: "Ny fisotroan-dronono sy ny vola omena ho onitra noho ny fahavoazana." } },
    { article: 'CDI 01.03.03 3°', texte: {
      fr: 'Les allocations familiales, dans la limite de ce qui est versé dans le secteur public.',
      en: 'Family allowances, up to the amount paid in the public sector.',
      mg: "Ny tambin-karama ho an'ny fianakaviana, hatramin'ny ambaratonga omena any amin'ny sehatry ny fanjakana." } },
    { article: 'CDI 01.03.03 6°', texte: {
      fr: 'Les rémunérations des associés-gérants majoritaires de SARL.',
      en: 'Pay of majority partner-managers of limited liability companies (SARL).',
      mg: "Ny karaman'ny mpitantana tompon'ny ankamaroan'ny anjara ao amin'ny SARL." } },
    { article: 'CDI 01.03.03 7°', texte: {
      fr: 'L’indemnité de départ à la retraite, si elle ne dépasse pas une année de salaire.',
      en: 'Retirement severance pay, if it does not exceed one year of salary.',
      mg: "Ny tambin-karama rehefa misotro ronono, raha tsy mihoatra ny karama herintaona." } },
    { article: 'CDI 01.03.03 8°', texte: {
      fr: 'La cantine (dans une limite fixée par texte réglementaire) et les frais médicaux justifiés.',
      en: 'Canteen meals (within a limit set by regulation) and documented medical costs.',
      mg: "Ny sakafo any am-piasana (araka ny fetra napetraky ny didy) sy ny fandaniana ara-pahasalamana misy porofo." } },
    { article: 'CDI 01.03.03 9°', texte: {
      fr: 'Les heures supplémentaires, dans la limite de 20 heures.',
      en: 'Overtime, up to 20 hours.',
      mg: "Ny ora fanampiny, hatramin'ny 20 ora." } },
    { article: 'CDI 01.03.02', texte: {
      fr: 'Les allocations versées aux volontaires (loi n° 2015-015 sur le volontariat).',
      en: 'Allowances paid to volunteers (Law 2015-015 on volunteering).',
      mg: "Ny vola omena ny mpilatsaka an-tsitrapo (lalàna n° 2015-015)." } },
  ],
  aSavoir: [
    { article: 'CDI 01.03.19', texte: {
      fr: 'Personnes à charge : enfants de moins de 21 ans (25 ans s’ils étudient, sans limite s’ils sont infirmes) et parents sans ressources. La réduction va au conjoint qui perçoit les allocations familiales.',
      en: 'Dependants: children under 21 (25 if studying, no limit if disabled) and parents without income. The reduction goes to the spouse who receives family allowances.',
      mg: "Olona iantohana: ankizy latsaky ny 21 taona (25 taona raha mianatra, tsy misy fetra raha marary maharitra) ary ray aman-dreny tsy manana fidiram-bola. Ny vady mandray ny tambin-karama ho an'ny fianakaviana no mahazo ny fihenana." } },
    { article: 'CDI 01.03.13', texte: {
      fr: 'Avec plusieurs employeurs, chacun retient l’impôt sur ce qu’il paie ; l’administration calcule ensuite le montant définitif.',
      en: 'With several employers, each one withholds tax on what it pays; the tax office then calculates the final amount.',
      mg: "Raha maromaro ny mpampiasa, samy manala ny hetra amin'izay aloany avy; ny biraon'ny hetra avy eo no manao ny kajy farany." } },
    { article: 'CDI 01.03.15', texte: {
      fr: 'Si l’employeur a trop versé par erreur, il peut déduire l’excédent de ses versements des 6 mois suivants.',
      en: 'If the employer paid too much by mistake, it can offset the excess against payments over the next 6 months.',
      mg: "Raha nandoa be loatra tsy nahy ny mpampiasa, azony esorina amin'ny fandoavana ao anatin'ny 6 volana manaraka ilay ambiny." } },
  ],
  exemple: {
    texte: {
      fr: 'Rina, comptable à Antananarivo, gagne {brut} brut par mois et a deux enfants de moins de 21 ans. Son employeur retient {impot} d’IRSA sur sa paie et les verse aux impôts dans les 15 premiers jours du mois suivant.',
      en: 'Rina, an accountant in Antananarivo, earns {brut} gross a month and has two children under 21. The employer withholds {impot} of IRSA from the pay and pays it to the tax office within the first 15 days of the following month.',
      mg: "Rina, mpitantam-bola any Antananarivo, mahazo karama {brut} isam-bolana ary manan-janaka roa latsaky ny 21 taona. Manala IRSA {impot} amin'ny karamany ny mpampiasa ary mandoa izany any amin'ny hetra ao anatin'ny 15 andro voalohany amin'ny volana manaraka.",
    },
    valeurs: b => ({ brut: ar(EXEMPLE.brut), impot: ar(calculIRSA(EXEMPLE.brut, b, { personnesACharge: EXEMPLE.personnesACharge }).impot) }),
  },
};

const L = {
  commun: { fr: 'Droit commun', en: 'Standard scale', mg: 'Fitsipika ankapobeny' },
  special: { fr: 'Régime spécial', en: 'Special regime', mg: 'Fitsipika manokana' },
  brut: { fr: 'Salaire brut mensuel', en: 'Monthly gross salary', mg: 'Karama manontolo isam-bolana' },
  charges: { fr: 'Personnes à charge', en: 'Dependants', mg: 'Olona iantohana' },
  cotis: { fr: 'Déduire les cotisations salariales CNaPS et OSTIE', en: 'Deduct employee CNaPS and OSTIE contributions', mg: 'Esorina ny latsakemboka CNaPS sy OSTIE' },
  cotisNote: { fr: 'Taux et plafond des cotisations : fixés hors du Code des impôts, à confirmer auprès de la CNaPS et de l’OSTIE.',
    en: 'Contribution rates and cap are set outside the Tax Code: confirm with CNaPS and OSTIE.',
    mg: "Ny tahan'ny latsakemboka sy ny fetrany dia tsy ao amin'ny Fehezan-dalàna momba ny hetra: hamarino amin'ny CNaPS sy OSTIE." },
  brutL: { fr: 'Salaire brut', en: 'Gross salary', mg: 'Karama manontolo' },
  cnaps: { fr: 'Cotisation retraite CNaPS ({taux})', en: 'CNaPS pension contribution ({taux})', mg: 'Latsakemboka CNaPS ({taux})' },
  ostie: { fr: 'Cotisation santé OSTIE ({taux})', en: 'OSTIE health contribution ({taux})', mg: 'Latsakemboka OSTIE ({taux})' },
  base: { fr: 'Base imposable, arrondie à la centaine inférieure', en: 'Taxable base, rounded down to the hundred', mg: "Fototra iainan'ny hetra, boribory ho amin'ny zato ambany" },
  tranche: { fr: 'De {de} à {a} : {taux}', en: '{de} to {a}: {taux}', mg: "{de} hatramin'ny {a}: {taux}" },
  trancheSup: { fr: 'Au-delà de {de} : {taux}', en: 'Above {de}: {taux}', mg: "Mihoatra ny {de}: {taux}" },
  bareme: { fr: 'IRSA selon le barème', en: 'IRSA from the scale', mg: 'IRSA araka ny tahany' },
  reduction: { fr: 'Réduction : {n} personne(s) à charge', en: 'Reduction: {n} dependant(s)', mg: 'Fihenana: olona iantohana {n}' },
  minimum: { fr: 'Minimum de perception appliqué', en: 'Minimum charge applied', mg: 'Hetra kely indrindra nampiharina' },
  exonere: { fr: 'Base inférieure ou égale à {seuil} : pas d’IRSA', en: 'Base of {seuil} or less: no IRSA', mg: "Fototra tsy mihoatra ny {seuil}: tsy misy IRSA" },
  total: { fr: 'IRSA à payer', en: 'IRSA to pay', mg: 'IRSA aloa' },
  net: { fr: 'Salaire net', en: 'Net salary', mg: 'Karama madio' },
  eff: { fr: 'Taux effectif', en: 'Effective rate', mg: 'Taha marina' },
  remu: { fr: 'Rémunération versée', en: 'Amount paid', mg: 'Vola naloa' },
  unitaire: { fr: 'Taux unitaire (prix d’une unité : pièce, heure, tâche…)', en: 'Unit rate (price of one unit: piece, hour, task…)', mg: "Sanda isaky ny singa (vidin'ny singa iray: zavatra, ora, asa…)" },
  specialNote: { fr: 'Pour certaines rémunérations exceptionnelles ou à taux unitaire, dont la liste est fixée par arrêté du Ministre chargé de la réglementation fiscale.',
    en: 'For certain exceptional or unit-rate payments, listed by order of the Minister in charge of tax regulation.',
    mg: "Ho an'ny karama manokana na isaky ny singa sasany, voatanisa ao amin'ny didim-pitondrana navoakan'ny Minisitra misahana ny hetra." },
  palier: { fr: 'Taux unitaire jusqu’à {max} : {taux}', en: 'Unit rate up to {max}: {taux}', mg: "Sanda hatramin'ny {max}: {taux}" },
  palierSup: { fr: 'Taux unitaire au-delà de {max} : {taux}', en: 'Unit rate above {max}: {taux}', mg: 'Sanda mihoatra ny {max}: {taux}' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

let mode = 'commun';

function monterCalculateur(p, b) {
  const A = b.irsa.articles, art016 = 'CDI 01.03.16';
  const formulaire = mode === 'commun' ? `
      ${champMontant('irsa-brut', l('brut'), EXEMPLE.brut)}
      ${champCompteur('irsa-charges', l('charges'), EXEMPLE.personnesACharge, 0, 20)}
      <label class="check"><input type="checkbox" id="irsa-cotis" checked><span>${l('cotis')}</span></label>
      <p class="aide">${l('cotisNote')}</p>` : `
      <p class="aide">${l('specialNote')}</p>
      ${champMontant('irsa-remu', l('remu'), EXEMPLE.remuneration)}
      ${champMontant('irsa-unitaire', l('unitaire'), EXEMPLE.tauxUnitaire)}`;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <div class="seg" role="group">
          <button type="button" data-mode="commun" aria-pressed="${mode === 'commun'}">${l('commun')}</button>
          <button type="button" data-mode="special" aria-pressed="${mode === 'special'}">${l('special')}</button>
        </div>
        ${formulaire}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · IRSA</span><span>${t('par_mois')}</span></div>
        <div class="rows" id="irsa-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="irsa-total"></span></div>
        <div class="sub" id="irsa-sub"></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  p.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => { mode = bt.dataset.mode; monterCalculateur(p, b); }));
  const $ = id => p.querySelector('#' + id);

  const recalculer = mode === 'commun' ? () => {
    const brut = lireMontant($('irsa-brut')), n = lireEntier($('irsa-charges'), 0, 20), cotis = $('irsa-cotis').checked;
    const r = calculIRSA(brut, b, { personnesACharge: n, deduireCotisations: cotis });
    const c = b.cotisationsSociales, seuil = b.irsa.tranches[0].a;
    let h = ligne(l('brutL'), ar(brut), A.base);
    if (cotis) h += ligne(l('cnaps', { taux: pct(c.cnapsSalarie) }), '− ' + ar(r.cnaps), 'CDI 01.03.09 1°', 'neg')
      + ligne(l('ostie', { taux: pct(c.ostieSalarie) }), '− ' + ar(r.ostie), 'CDI 01.03.09 2°', 'neg');
    h += ligne(l('base'), ar(r.base), art016);
    if (r.base <= seuil) h += ligne(l('exonere', { seuil: ar(seuil) }), '', A.bareme, 'note');
    else {
      h += r.tranches.filter(x => x.montant > 0 && x.taux > 0).map(x => ligne(
        x.a === null ? l('trancheSup', { de: ar(x.de), taux: pct(x.taux, 0) }) : l('tranche', { de: ar(x.de), a: ar(x.a), taux: pct(x.taux, 0) }),
        ar(x.impot), A.bareme + ' A')).join('');
      h += ligne(l('bareme'), ar(r.bareme), A.bareme);
      if (r.reduction > 0) h += ligne(l('reduction', { n }), '− ' + ar(r.reduction), A.personnesACharge, 'neg');
      if (r.minimumApplique) h += ligne(l('minimum'), ar(b.irsa.minimum), A.bareme, 'note');
    }
    $('irsa-rows').innerHTML = h;
    $('irsa-total').textContent = ar(r.impot);
    $('irsa-sub').innerHTML = puce(l('net'), ar(r.net)) + puce(l('eff'), brut ? pct(r.impot / brut) : '0 %');
  } : () => {
    const remu = lireMontant($('irsa-remu')), unitaire = lireMontant($('irsa-unitaire'));
    const r = calculIRSASpecial(remu, unitaire, b);
    const pal = r.palier.tauxUnitaireMax === null
      ? l('palierSup', { max: ar(b.irsa.regimeSpecial.at(-2).tauxUnitaireMax), taux: pct(r.taux, 0) })
      : l('palier', { max: ar(r.palier.tauxUnitaireMax), taux: pct(r.taux, 0) });
    $('irsa-rows').innerHTML = ligne(l('remu'), ar(remu)) + ligne(pal, pct(r.taux, 0), art016 + ' B');
    $('irsa-total').textContent = ar(r.impot);
    $('irsa-sub').innerHTML = puce(l('net'), ar(remu - r.impot));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default {
  id: 'irsa',
  comprendre,
  monterCalculateur,
  impotExemple: b => calculIRSA(EXEMPLE.brut, b, { personnesACharge: EXEMPLE.personnesACharge }).impot,
};
