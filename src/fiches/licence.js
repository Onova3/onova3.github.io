// Fiche Impôt de licence (CDI Livre II, Titre VI ; CPF Titre III). Textes malgaches à relire.
import { calculLicence, calculLicenceForaine, calculLicenceNuit, calculLicenceTombola } from '../calc/licence.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, champCompteur, champCommunal, lireMontant, lireEntier, lireCommunal, brancher } from '../ui.js';

const EXEMPLE = { commune: 'urbaine1', trimestres: 4, jours: 3, mois: 12, billets: 2000000 };
const commune = (b, id) => b.licence.communes.find(c => c.id === id);
const variables = b => {
  const L = b.licence;
  return { majo: pct(L.majorationEtablissementNuit, 0), foraine: ar(L.foraineMinParJour), nuit: ar(L.nuitMaxParMois), tombola: pct(L.tombolaMaxTaux, 0),
    hc: `${ar(commune(b, 'horsCategorie').min)} – ${ar(commune(b, 'horsCategorie').max)}`, r2: `${ar(commune(b, 'rurale2').min)} – ${ar(commune(b, 'rurale2').max)}` };
};
const exempleImpot = b => calculLicence({ tarifAnnuel: commune(b, EXEMPLE.commune).min, trimestres: EXEMPLE.trimestres }, b).impot;

const comprendre = {
  definition: {
    article: 'CDI 10.06.01, 10.06.08',
    texte: {
      fr: "Pour vendre de l'alcool, un commerce paie chaque année un impôt de licence. Chaque commune vote son tarif dans une fourchette qui dépend de sa catégorie : de {hc} pour une commune hors catégorie, jusqu'à {r2} pour une commune rurale de 2e catégorie.",
      en: 'To sell alcohol, a business pays a licence tax every year. Each commune votes its rate within a range that depends on its category: from {hc} for a special-category commune, down to {r2} for a 2nd-category rural commune.',
      mg: "Mba hivarotana toaka, mandoa hetra fahazoan-dalana isan-taona ny fivarotana. Ny kaominina tsirairay no mandany ny tahany ao anatin'ny fetra miankina amin'ny sokajiny: {hc} ho an'ny kaominina ivelan'ny sokajy, hatramin'ny {r2} ho an'ny kaominina ambanivohitra sokajy 2.",
    },
  },
  quiPaie: [
    { article: 'CPF III-06, CDI 10.06.05', texte: {
      fr: 'Licence de 1re catégorie : vente en gros (12 litres ou 12 bouteilles et plus). 2e catégorie : vente au détail, à emporter (1re classe) ou sur place (2e classe).',
      en: '1st-category licence: wholesale (12 litres or 12 bottles and more). 2nd category: retail, take-away (1st class) or on the premises (2nd class).',
      mg: "Fahazoan-dalana sokajy 1: varotra ambongadiny (12 litatra na 12 tavoahangy na mihoatra). Sokajy 2: varotra antsinjarany, entina (kilasy 1) na sotroina eo an-toerana (kilasy 2)." } },
    { article: 'CDI 10.06.08, 10.06.09', texte: {
      fr: 'Établissements de nuit (night-club, dancing) : majoration de {majo}. Buvette temporaire lors d’une fête (licence foraine) : tarif par jour voté par la commune, au moins {foraine}.',
      en: 'Night venues (nightclub, dance hall): {majo} surcharge. Temporary bar at an event (fair licence): daily rate voted by the commune, at least {foraine}.',
      mg: "Toerana fialam-boly amin'ny alina (night-club, dihy): fiakarana {majo}. Fisotroana vonjimaika amin'ny fety (fahazoan-dalana foraine): taha isan'andro lanian'ny kaominina, farafahakeliny {foraine}." } },
    { article: 'CDI 10.06.79 à 10.06.81', texte: {
      fr: 'Autres licences, votées par la commune sous des plafonds : établissements de nuit ({nuit} par mois au plus), tombolas ({tombola} des billets au plus), stands de foire, commerces ambulants, billards et jeux vidéo.',
      en: 'Other licences, voted by the commune under ceilings: night venues ({nuit} a month at most), raffles ({tombola} of tickets at most), fair stalls, street trading, billiards and video games.',
      mg: "Fahazoan-dalana hafa, lanian'ny kaominina ambanin'ny fetra: toerana fialam-boly amin'ny alina ({nuit} isam-bolana farafahabetsany), tombola ({tombola} amin'ny tapakila farafahabetsany), tsena fihaonana, mpivarotra mivezivezy, biliara sy lalao video." } },
  ],
  exonerations: [
    { article: 'CDI 10.06.06', texte: {
      fr: 'Producteurs qui vendent leur propre production en gros sur place ; cantines militaires et mess ; restaurants universitaires ; buvettes du Parlement ; pharmaciens (alcool nature) ; restaurants et hôtels-restaurants autorisés par le Ministère du Tourisme ; éthanol combustible. Buffets de gares et d’aérogares, cantines d’entreprises : réduction jusqu’à 50 %.',
      en: 'Producers selling their own output wholesale on site; military canteens and messes; university restaurants; Parliament bars; pharmacists (pure alcohol); restaurants and hotel-restaurants authorised by the Ministry of Tourism; fuel ethanol. Station and airport buffets, company canteens: reduction of up to 50%.',
      mg: "Mpamokatra mivarotra ny vokatrany ambongadiny eo an-toerana; fisakafoanana miaramila; trano fisakafoanan'ny oniversite; fisotroana ao amin'ny Parlemanta; mpivarotra fanafody (alikaola madio); trano fisakafoanana sy hotely nahazo alalana tamin'ny Minisiteran'ny Fizahantany; etanola fandrehitra. Fisakafoanana amin'ny gara sy seranam-piaramanidina, fisakafoanan'ny orinasa: fihenana hatramin'ny 50 %." } },
  ],
  aSavoir: [
    { article: 'CDI 10.06.08, CPF III-47', texte: {
      fr: 'L’impôt se paie par trimestre et d’avance, au plus tard le 15e jour du trimestre. Tout trimestre commencé est dû en entier.',
      en: 'The tax is paid quarterly in advance, by the 15th day of the quarter. Any quarter started is due in full.',
      mg: "Aloa isaky ny telo volana sy mialoha ny hetra, farany ny andro faha-15 amin'ny telo volana. Aloa manontolo ny telo volana efa nanomboka." } },
    { article: 'CDI 10.06.81', texte: {
      fr: 'Les plafonds des stands de foire, commerces ambulants, billards et jeux vidéo sont un pourcentage du « minimum de perception de l’impôt synthétique », dont le Code ne fixe pas le montant : ils ne sont pas calculés ici.',
      en: 'Ceilings for fair stalls, street trading, billiards and video games are a percentage of the “synthetic tax minimum charge”, whose amount the Code does not set: they are not calculated here.',
      mg: "Ny fetra ho an'ny tsena fihaonana, mpivarotra mivezivezy, biliara sy lalao video dia isan-jaton'ny « hetra kely indrindra amin'ny hetra tsotra », izay tsy voafaritry ny Fehezan-dalàna ny habetsany: tsy kajiana eto izy ireo." } },
  ],
  exemple: {
    texte: {
      fr: 'Un bar-épicerie d’une commune urbaine de 1re catégorie vend de la bière au détail. Si la commune a voté le minimum de la fourchette, la licence coûte {impot} par an, soit {trimestre} par trimestre, à payer avant le 15e jour de chaque trimestre.',
      en: 'A bar-grocery in a 1st-category urban commune sells beer retail. If the commune voted the bottom of the range, the licence costs {impot} a year, i.e. {trimestre} per quarter, payable by the 15th day of each quarter.',
      mg: "Fivarotana kely sady fisotroana ao amin'ny kaominina an-tanàn-dehibe sokajy 1 no mivarotra labiera antsinjarany. Raha ny farany ambany amin'ny fetra no nolanian'ny kaominina, {impot} isan-taona ny fahazoan-dalana, izany hoe {trimestre} isaky ny telo volana, aloa alohan'ny andro faha-15 amin'ny telo volana tsirairay.",
    },
    valeurs: b => ({ impot: ar(exempleImpot(b)), trimestre: ar(exempleImpot(b) / 4) }),
  },
};

const L = {
  mode: { fr: 'Type de licence', en: 'Type of licence', mg: 'Karazana fahazoan-dalana' },
  alcool: { fr: 'Vente d’alcool', en: 'Alcohol sales', mg: 'Fivarotana toaka' },
  foraine: { fr: 'Foraine', en: 'Fair', mg: 'Foraine' },
  nuit: { fr: 'Établissement de nuit', en: 'Night venue', mg: 'Fialam-boly alina' },
  tombola: { fr: 'Tombola', en: 'Raffle', mg: 'Tombola' },
  commune: { fr: 'Catégorie de ma commune', en: 'Category of my commune', mg: "Sokajin'ny kaominako" },
  tarif: { fr: 'Tarif annuel voté par ma commune', en: 'Annual rate voted by my commune', mg: 'Taha isan-taona nolanian’ny kaominako' },
  fourchette: { fr: 'Fourchette légale : {min} à {max}.', en: 'Legal range: {min} to {max}.', mg: 'Fetra ara-dalàna: {min} ka hatramin’ny {max}.' },
  nuitAlcool: { fr: 'Établissement de nuit (night-club, dancing) : majoration de {majo}', en: 'Night venue (nightclub, dance hall): {majo} surcharge', mg: "Toerana fialam-boly amin'ny alina: fiakarana {majo}" },
  trimestres: { fr: 'Trimestres d’exploitation dans l’année', en: 'Quarters of trading in the year', mg: 'Telo volana niasana tamin’ny taona' },
  jours: { fr: 'Nombre de jours (périodes de 24 heures)', en: 'Number of days (24-hour periods)', mg: 'Isan’ny andro (24 ora)' },
  tarifJour: { fr: 'Tarif par jour voté par ma commune', en: 'Daily rate voted by my commune', mg: 'Taha isan’andro nolanian’ny kaominako' },
  minimum: { fr: 'Minimum fixé par le Code : {min}.', en: 'Minimum set by the Code: {min}.', mg: 'Farafahakeliny napetraky ny Fehezan-dalàna: {min}.' },
  plafond: { fr: 'Plafond fixé par le Code : {max}.', en: 'Ceiling set by the Code: {max}.', mg: 'Fetra ambony napetraky ny Fehezan-dalàna: {max}.' },
  mois: { fr: 'Nombre de mois', en: 'Number of months', mg: 'Isan’ny volana' },
  tarifMois: { fr: 'Tarif mensuel voté par ma commune', en: 'Monthly rate voted by my commune', mg: 'Taha isam-bolana nolanian’ny kaominako' },
  billets: { fr: 'Montant des billets mis en vente', en: 'Value of tickets offered for sale', mg: 'Vidin’ny tapakila amidy' },
  tauxTombola: { fr: 'Taux voté par ma commune, en %', en: 'Rate voted by my commune, in %', mg: 'Taha nolanian’ny kaominako, amin’ny %' },
  annuel: { fr: 'Tarif annuel', en: 'Annual rate', mg: 'Taha isan-taona' },
  majoL: { fr: 'Majoration établissement de nuit ({majo})', en: 'Night-venue surcharge ({majo})', mg: 'Fiakarana ({majo})' },
  trimestre: { fr: 'Par trimestre × {n}', en: 'Per quarter × {n}', mg: 'Isaky ny telo volana × {n}' },
  calcul: { fr: '{n} × {m}', en: '{n} × {m}', mg: '{n} × {m}' },
  total: { fr: 'Licence à payer', en: 'Licence to pay', mg: 'Fahazoan-dalana aloa' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let mode = 'alcool', idCommune = EXEMPLE.commune;

function monterCalculateur(p, b) {
  const Lb = b.licence, A = Lb.articles, v = variables(b), c = commune(b, idCommune);
  const formulaires = {
    alcool: `<label class="f"><span>${l('commune')}</span><select id="lic-commune">${Lb.communes.map(x =>
        `<option value="${x.id}"${x.id === idCommune ? ' selected' : ''}>${esc(tr(x.libelle))}</option>`).join('')}</select></label>
      ${champCommunal({ id: 'lic-tarif', libelle: l('tarif'), valeur: c.min, min: c.min, max: c.max, article: A.tarif,
        regle: l('fourchette', { min: ar(c.min), max: ar(c.max) }) + ' ' + t('valeur_exemple') })}
      <label class="check"><input type="checkbox" id="lic-nuit"><span>${l('nuitAlcool', { majo: v.majo })}</span></label>
      ${champCompteur('lic-trim', l('trimestres'), EXEMPLE.trimestres, 1, 4)}`,
    foraine: `${champCompteur('lic-jours', l('jours'), EXEMPLE.jours, 1, 365)}
      ${champCommunal({ id: 'lic-tjour', libelle: l('tarifJour'), valeur: Lb.foraineMinParJour, min: Lb.foraineMinParJour, article: A.foraine,
        regle: l('minimum', { min: ar(Lb.foraineMinParJour) }) + ' ' + t('valeur_exemple') })}`,
    nuit: `${champCompteur('lic-mois', l('mois'), EXEMPLE.mois, 1, 12)}
      ${champCommunal({ id: 'lic-tmois', libelle: l('tarifMois'), valeur: Lb.nuitMaxParMois, max: Lb.nuitMaxParMois, article: A.autres,
        regle: l('plafond', { max: ar(Lb.nuitMaxParMois) }) + ' ' + t('valeur_exemple') })}`,
    tombola: `${champMontant('lic-billets', l('billets'), EXEMPLE.billets)}
      ${champCommunal({ id: 'lic-ttombola', libelle: l('tauxTombola'), valeur: Lb.tombolaMaxTaux * 100, max: Lb.tombolaMaxTaux * 100, unite: '%', article: A.autres,
        regle: l('plafond', { max: pct(Lb.tombolaMaxTaux, 0) }) + ' ' + t('valeur_exemple') })}`,
  };
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <div class="f"><span>${l('mode')}</span><div class="seg seg2x2" role="group">${['alcool', 'foraine', 'nuit', 'tombola'].map(m =>
          `<button type="button" data-mode="${m}" aria-pressed="${m === mode}">${l(m)}</button>`).join('')}</div></div>
        ${formulaires[mode]}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Licence', en: 'Licence', mg: 'Fahazoan-dalana' })}</span><span>${l(mode)}</span></div>
        <div class="rows" id="lic-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="lic-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  p.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => { mode = bt.dataset.mode; monterCalculateur(p, b); }));
  $('lic-commune')?.addEventListener('change', () => { idCommune = $('lic-commune').value; monterCalculateur(p, b); });
  const recalculer = () => {
    let h = '', impot = 0;
    if (mode === 'alcool') {
      const tarif = lireCommunal(p, 'lic-tarif'), nuit = $('lic-nuit').checked, n = lireEntier($('lic-trim'), 1, 4);
      const r = calculLicence({ tarifAnnuel: tarif, etablissementNuit: nuit, trimestres: n }, b);
      h = ligne(l('annuel'), ar(tarif), A.tarif) + (nuit ? ligne(l('majoL', { majo: v.majo }), ar(r.annuel - tarif), A.tarif) : '')
        + ligne(l('trimestre', { n }), `${ar(r.parTrimestre)} × ${n}`, A.paiement);
      impot = r.impot;
    } else if (mode === 'foraine') {
      const n = lireEntier($('lic-jours'), 1, 365), m = lireCommunal(p, 'lic-tjour');
      impot = calculLicenceForaine({ jours: n, tarifParJour: m }).impot;
      h = ligne(l('calcul', { n, m: ar(m) }), ar(impot), A.foraine);
    } else if (mode === 'nuit') {
      const n = lireEntier($('lic-mois'), 1, 12), m = lireCommunal(p, 'lic-tmois');
      impot = calculLicenceNuit({ mois: n, tarifParMois: m }).impot;
      h = ligne(l('calcul', { n, m: ar(m) }), ar(impot), A.autres);
    } else {
      const billets = lireMontant($('lic-billets')), taux = lireCommunal(p, 'lic-ttombola') / 100;
      impot = calculLicenceTombola({ billets, taux }).impot;
      h = ligne(`${pct(taux)} × ${ar(billets)}`, ar(impot), A.autres);
    }
    $('lic-rows').innerHTML = h;
    $('lic-total').textContent = ar(impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'licence', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: exempleImpot };
