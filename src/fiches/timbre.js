// Fiche Droits de timbre (CDI Partie II, SP I, Chap. V). Barème consultable plutôt que calculateur. Textes malgaches à relire.
import { droitVisa, droitsArmes } from '../calc/timbre.js';
import { t, tr, fmt, esc, ar, pct, ligne, champCompteur, lireEntier, brancher } from '../ui.js';

const variables = b => ({ reduc: pct(b.timbre.reductionMissionnairesEtudiants, 0), arme: ar(b.timbre.impotAnnuelParArme), permis: ar(b.timbre.permisArme) });

const comprendre = {
  definition: {
    article: 'CDI 02.05.01, 02.05.06 à 02.05.08',
    texte: {
      fr: "Les droits de timbre du Code 2026 sont des montants fixes payés pour obtenir certains documents : surtout les visas des étrangers, et les permis et l'impôt annuel sur les armes à feu.",
      en: 'Stamp duties in the 2026 Code are fixed amounts paid to obtain certain documents: mainly visas for foreigners, and firearm permits and the annual firearm tax.',
      mg: "Ny haban-tsonia ao amin'ny Fehezan-dalàna 2026 dia vola raikitra aloa mba hahazoana taratasy sasany: indrindra ny visan'ny vahiny, ary ny fahazoan-dalana sy ny hetra isan-taona amin'ny basy.",
    },
  },
  quiPaie: [
    { article: 'CDI 02.05.06', texte: {
      fr: 'Les étrangers qui demandent un visa : le montant dépend de la durée du séjour.',
      en: 'Foreigners applying for a visa: the amount depends on the length of stay.',
      mg: "Ny vahiny mangataka visa: miankina amin'ny faharetan'ny fitoerana ny vola." } },
    { article: 'CDI 02.05.07, 02.05.08', texte: {
      fr: 'Les détenteurs d’armes à feu : {arme} par arme et par an, plus {permis} à chaque délivrance ou renouvellement du permis.',
      en: 'Firearm holders: {arme} per weapon per year, plus {permis} at each issue or renewal of the permit.',
      mg: "Ny manana basy: {arme} isaky ny basy isan-taona, miampy {permis} isaky ny hanomezana na hanavaozana ny fahazoan-dalana." } },
  ],
  exonerations: [
    { article: 'CDI 02.05.06', texte: {
      fr: 'Demi-tarif ({reduc} de réduction) pour les missionnaires et leurs conjoints résidant à Madagascar, et pour les étudiants étrangers des grandes écoles. Exonération pour les missions officielles avec passeport diplomatique ou de service.',
      en: 'Half rate ({reduc} off) for missionaries and their spouses living in Madagascar, and for foreign students at the grandes écoles. Exemption for official missions with a diplomatic or service passport.',
      mg: "Antsasa-bidy ({reduc} fihenana) ho an'ny misionera sy ny vadiny monina eto Madagasikara, ary ho an'ny mpianatra vahiny ao amin'ny sekoly ambony. Tsy mandoa ny iraka ofisialy manana pasipaoro diplaomatika na fanompoana." } },
    { article: 'CDI 02.05.07, 02.05.09', texte: {
      fr: 'Armes des militaires, forces de l’ordre et agents publics en service, et armes neuves en magasin.',
      en: 'Weapons of soldiers, police and public officers on duty, and new weapons in shops.',
      mg: "Ny basin'ny miaramila, mpitandro filaminana ary mpiasam-panjakana, ary ny basy vaovao any amin'ny fivarotana." } },
  ],
  aSavoir: [
    { article: 'CDI 02.05.05', texte: {
      fr: 'L’ancien tarif général du timbre (timbre de dimension, timbre sur les effets…) est abrogé : il ne reste que ces droits de délivrance de documents.',
      en: 'The former general stamp tariff (paper-size stamp, stamp on bills…) has been repealed: only these document fees remain.',
      mg: "Nofoanana ny tahan'ny haban-tsonia taloha: ireo haba amin'ny fanomezana taratasy ireo ihany no sisa." } },
  ],
  exemple: {
    texte: {
      fr: 'Une étudiante française inscrite dans une grande école d’Antananarivo demande un visa de 3 ans : au lieu de {plein}, elle paie {reduit}.',
      en: 'A French student enrolled at a grande école in Antananarivo applies for a 3-year visa: instead of {plein}, she pays {reduit}.',
      mg: "Mpianatra frantsay ao amin'ny sekoly ambony iray any Antananarivo no mangataka visa 3 taona: {reduit} no aloany fa tsy {plein}.",
    },
    valeurs: b => ({ plein: ar(droitVisa({ id: 'v3a' }, b).montant), reduit: ar(droitVisa({ id: 'v3a', demiTarif: true }, b).montant) }),
  },
};

const L = {
  recherche: { fr: 'Rechercher (ex. 3 mois, sortie)', en: 'Search (e.g. 3 months, exit)', mg: 'Hitady (oh. 3 volana, fialana)' },
  demi: { fr: 'Missionnaire ou étudiant d’une grande école (demi-tarif)', en: 'Missionary or grande école student (half rate)', mg: 'Misionera na mpianatra sekoly ambony (antsasa-bidy)' },
  visas: { fr: 'Visas', en: 'Visas', mg: 'Visa' },
  armes: { fr: 'Armes à feu', en: 'Firearms', mg: 'Basy' },
  nbArmes: { fr: 'Nombre d’armes possédées au 1er janvier', en: 'Number of weapons held on 1 January', mg: "Isan'ny basy amin'ny 1 janoary" },
  permis: { fr: 'Je demande ou renouvelle mon permis cette année', en: 'I am applying for or renewing my permit this year', mg: 'Mangataka na manavao fahazoan-dalana aho amin\'ity taona ity' },
  impotArmes: { fr: 'Impôt annuel : {n} arme(s)', en: 'Annual tax: {n} weapon(s)', mg: 'Hetra isan-taona: basy {n}' },
  droitPermis: { fr: 'Droit de permis', en: 'Permit fee', mg: 'Haba fahazoan-dalana' },
  total: { fr: 'Total à payer', en: 'Total to pay', mg: 'Totaliny aloa' },
  aucun: { fr: 'Aucun visa ne correspond.', en: 'No visa matches.', mg: 'Tsy misy visa mifanaraka.' },
  plein: { fr: 'plein tarif', en: 'full rate', mg: 'vidiny feno' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.timbre.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <h3>${l('visas')}<small class="art">${A.visas}</small></h3>
        <label class="search"><span class="sr">${l('recherche')}</span><input id="tb-q" type="search" placeholder="${esc(l('recherche'))}"></label>
        <label class="check"><input type="checkbox" id="tb-demi"><span>${l('demi')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${l('visas')}</span><span>Ar</span></div>
        <div class="rows" id="tb-rows"></div>
      </div>
    </div>
    <h3 class="titre-sim">${l('armes')}<small class="art">${A.impotArmes}</small></h3>
    <div class="grid" id="tb-armes">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champCompteur('tb-nb', l('nbArmes'), 1, 0, 50)}
        <label class="check"><input type="checkbox" id="tb-permis"><span>${l('permis')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${l('armes')}</span><span>${tr({ fr: 'Par an', en: 'Per year', mg: 'Isan-taona' })}</span></div>
        <div class="rows" id="tb-arows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="tb-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const visas = () => {
    const q = $('tb-q').value.trim().toLowerCase(), demi = $('tb-demi').checked;
    const rows = b.timbre.visas.filter(v => !q || tr(v.libelle).toLowerCase().includes(q)).map(v => {
      const r = droitVisa({ id: v.id, demiTarif: demi }, b);
      return ligne(esc(tr(v.libelle)) + (demi && !r.reduit ? ` (${l('plein')})` : ''), ar(r.montant));
    }).join('');
    $('tb-rows').innerHTML = rows || `<p class="aide">${l('aucun')}</p>`;
  };
  const armes = () => {
    const n = lireEntier($('tb-nb'), 0, 50), r = droitsArmes({ armes: n, permis: $('tb-permis').checked }, b);
    $('tb-arows').innerHTML = ligne(l('impotArmes', { n }), ar(r.impotAnnuel), A.impotArmes) + (r.permis ? ligne(l('droitPermis'), ar(r.permis), A.permisArme) : '');
    $('tb-total').textContent = ar(r.total);
  };
  brancher(p.querySelector('.card'), visas);
  brancher($('tb-armes'), armes);
  visas();
  armes();
}

export default { id: 'timbre', variables, comprendre, monterCalculateur, impotExemple: b => b.timbre.impotAnnuelParArme };
