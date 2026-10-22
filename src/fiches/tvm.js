// Fiche Taxe sur les véhicules à moteur (CDI Partie II, SP II ; CPF Titre I, ST II, Chap. IX bis). Textes malgaches à relire.
import { calculTVM, calculTVMForfait } from '../calc/tvm.js';
import { etat, t, tr, fmt, esc, ar, ligne, champCompteur, lireEntier, brancher } from '../ui.js';

const ANNEE = 2026;
const EXEMPLE = { classe: '5-9', energie: 'essence', annee: 2018, mois: 6 };

const CLASSES = {
  '1-4': { fr: '1 à 4 CV (motos : jusqu’à 250 cm³)', en: '1 to 4 HP (motorbikes: up to 250 cc)', mg: '1 ka hatramin’ny 4 CV (moto: hatramin’ny 250 cm³)' },
  '5-9': { fr: '5 à 9 CV (motos : 251 à 500 cm³)', en: '5 to 9 HP (motorbikes: 251 to 500 cc)', mg: '5 ka hatramin’ny 9 CV (moto: 251 ka hatramin’ny 500 cm³)' },
  '10-12': { fr: '10 à 12 CV (motos : 501 à 1 000 cm³)', en: '10 to 12 HP (motorbikes: 501 to 1,000 cc)', mg: '10 ka hatramin’ny 12 CV (moto: 501 ka hatramin’ny 1 000 cm³)' },
  '13-15': { fr: '13 à 15 CV (motos : plus de 1 000 cm³)', en: '13 to 15 HP (motorbikes: over 1,000 cc)', mg: '13 ka hatramin’ny 15 CV (moto: mihoatra ny 1 000 cm³)' },
  '16+': { fr: 'Plus de 15 CV', en: 'Over 15 HP', mg: 'Mihoatra ny 15 CV' },
};
const ENERGIES = {
  essence: { fr: 'Essence', en: 'Petrol', mg: 'Lasantsy' }, diesel: { fr: 'Diesel', en: 'Diesel', mg: 'Gazoala' },
  electrique: { fr: 'Électrique', en: 'Electric', mg: 'Herinaratra' }, hybride: { fr: 'Hybride', en: 'Hybrid', mg: 'Hybride' },
};
const TRANCHES = [
  { fr: '5 ans ou moins', en: '5 years or less', mg: '5 taona na latsaka' },
  { fr: 'plus de 5 ans à 10 ans', en: 'over 5 to 10 years', mg: 'mihoatra ny 5 ka hatramin’ny 10 taona' },
  { fr: 'plus de 10 ans à 20 ans', en: 'over 10 to 20 years', mg: 'mihoatra ny 10 ka hatramin’ny 20 taona' },
  { fr: 'plus de 20 ans', en: 'over 20 years', mg: 'mihoatra ny 20 taona' },
];

const variables = b => {
  const v = b.tvm;
  return { min: ar(v.tarifs['1-4'].electrique[0]), max: ar(v.tarifs['16+'].diesel[3]), plaisance: ar(v.plaisance), maritime: ar(v.autresEnginsMaritimes), aeronef: ar(v.aeronef) };
};

const comprendre = {
  definition: {
    article: 'CDI 02.09.01, 02.09.06',
    texte: {
      fr: "Chaque année, le détenteur d'un véhicule à moteur immatriculé paie une taxe. Pour les voitures et les motos, elle dépend de la puissance, de l'énergie (essence, diesel, électrique, hybride) et de l'âge du véhicule : de {min} à {max} par an.",
      en: 'Every year, the holder of a registered motor vehicle pays a tax. For cars and motorbikes it depends on power, energy source (petrol, diesel, electric, hybrid) and age: from {min} to {max} a year.',
      mg: "Isan-taona, mandoa haba ny tompon'ny fiara misy motera voasoratra. Ho an'ny fiara sy moto, miankina amin'ny herin'ny motera, ny angovo (lasantsy, gazoala, herinaratra, hybride) ary ny taonan'ny fiara izany: {min} ka hatramin'ny {max} isan-taona.",
    },
  },
  quiPaie: [
    { article: 'CDI 02.09.02', texte: {
      fr: 'Tous les véhicules soumis à immatriculation, quel que soit leur usage : voitures, utilitaires, motos, scooters, véhicules ferroviaires.',
      en: 'All vehicles subject to registration, whatever their use: cars, vans, motorbikes, scooters, rail vehicles.',
      mg: "Ny fiara rehetra tsy maintsy soratana, na inona na inona fampiasana azy: fiara, fiara fitaterana entana, moto, scooter, fiaran-dalamby." } },
    { article: 'CDI 02.09.06', texte: {
      fr: 'Bateaux de plaisance (7 m et plus, ou moteur de 22 chevaux et plus, jet-skis de 90 kW et plus) : {plaisance} par an. Autres engins maritimes : {maritime}. Aéronefs : {aeronef}.',
      en: 'Pleasure boats (7 m or more, or 22 hp engine or more, jet skis of 90 kW or more): {plaisance} a year. Other marine craft: {maritime}. Aircraft: {aeronef}.',
      mg: "Sambo fialamboly (7 m na mihoatra, na motera 22 soavaly na mihoatra, jet-ski 90 kW na mihoatra): {plaisance} isan-taona. Fitaovana an-dranomasina hafa: {maritime}. Fiaramanidina: {aeronef}." } },
  ],
  exonerations: [
    { article: 'CDI 02.09.03', texte: {
      fr: 'Ambulances et pompiers, véhicules administratifs, engins agricoles, et véhicules exonérés par les conventions internationales.',
      en: 'Ambulances and fire engines, government vehicles, farm machinery, and vehicles exempted by international agreements.',
      mg: "Fiara mpitondra marary sy mpamonjy voina, fiaram-panjakana, milina fambolena, ary fiara tsy iharan'ny haba noho ny fifanarahana iraisam-pirenena." } },
  ],
  aSavoir: [
    { article: 'CDI 02.09.06', texte: {
      fr: 'L’âge se compte à partir de la première mise en circulation, au 1er janvier de l’année d’imposition. Plus le véhicule est ancien, plus la taxe est élevée.',
      en: 'Age is counted from first registration, as of 1 January of the tax year. The older the vehicle, the higher the tax.',
      mg: "Isaina manomboka amin'ny fandehanana voalohany ny taona, amin'ny 1 janoary amin'ny taona iainana. Arakaraka ny hahantitra ny fiara no hiakaran'ny haba." } },
    { article: 'CPF I-102 bis', texte: {
      fr: 'La taxe se paie en ligne et donne un QR code à coller sur le pare-brise. Elle suit la plaque : en cas de vente, elle reste valable pour le nouveau propriétaire jusqu’à la fin de l’année.',
      en: 'The tax is paid online and gives a QR code to stick on the windscreen. It follows the plate: if the vehicle is sold, it stays valid for the new owner until the end of the year.',
      mg: "Aloa an-tserasera ny haba ary manome QR code hapetaka amin'ny fitaratra. Manaraka ny laharana izy: raha amidy ny fiara, mbola manan-kery ho an'ny tompony vaovao hatramin'ny faran'ny taona." } },
  ],
  exemple: {
    texte: {
      fr: 'Nirina a une voiture à essence de 7 CV, mise en circulation en juin 2018. Au 1er janvier 2026, elle a plus de 5 ans : la taxe est de {taxe}, à payer en ligne avant le 31 janvier.',
      en: 'Nirina has a 7 HP petrol car, first registered in June 2018. On 1 January 2026 it is over 5 years old: the tax is {taxe}, payable online by 31 January.',
      mg: "Manana fiara lasantsy 7 CV i Nirina, nandeha voalohany tamin'ny jona 2018. Amin'ny 1 janoary 2026, mihoatra ny 5 taona izy: {taxe} ny haba, aloa an-tserasera alohan'ny 31 janoary.",
    },
    valeurs: b => ({ taxe: ar(calculTVM({ classe: EXEMPLE.classe, energie: EXEMPLE.energie, anneeMiseEnCirculation: EXEMPLE.annee, moisMiseEnCirculation: EXEMPLE.mois, anneeImposition: ANNEE }, b).taxe) }),
  },
};

const MOIS = { fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  mg: ['janoary', 'febroary', 'martsa', 'aprily', 'mey', 'jona', 'jolay', 'aogositra', 'septambra', 'oktobra', 'novambra', 'desambra'] };
const L = {
  type: { fr: 'Type', en: 'Type', mg: 'Karazany' },
  terrestre: { fr: 'Voiture ou moto', en: 'Car or motorbike', mg: 'Fiara na moto' },
  plaisance: { fr: 'Bateau de plaisance', en: 'Pleasure boat', mg: 'Sambo fialamboly' },
  maritime: { fr: 'Autre engin maritime', en: 'Other marine craft', mg: 'Fitaovana an-dranomasina hafa' },
  aeronef: { fr: 'Aéronef', en: 'Aircraft', mg: 'Fiaramanidina' },
  classe: { fr: 'Puissance fiscale', en: 'Fiscal horsepower', mg: 'Herin’ny motera' },
  energie: { fr: 'Énergie', en: 'Energy source', mg: 'Angovo' },
  annee: { fr: 'Année de première mise en circulation', en: 'Year first registered', mg: 'Taona nandehanana voalohany' },
  mois: { fr: 'Mois', en: 'Month', mg: 'Volana' },
  age: { fr: 'Âge au 1er janvier {an} : {tranche}', en: 'Age on 1 January {an}: {tranche}', mg: 'Taona amin’ny 1 janoary {an}: {tranche}' },
  tarif: { fr: 'Tarif', en: 'Rate', mg: 'Sarany' },
  forfait: { fr: 'Forfait annuel par appareil', en: 'Annual flat rate per craft', mg: 'Vola raikitra isan-taona' },
  total: { fr: 'Taxe {an}', en: '{an} tax', mg: 'Haba {an}' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let type = 'terrestre';

function monterCalculateur(p, b) {
  const A = b.tvm.articles;
  const options = (obj, actuel) => Object.keys(obj).map(k => `<option value="${k}"${k === actuel ? ' selected' : ''}>${esc(tr(obj[k]))}</option>`).join('');
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('type')}</span><select id="tvm-type">${['terrestre', 'plaisance', 'maritime', 'aeronef'].map(k =>
          `<option value="${k}"${k === type ? ' selected' : ''}>${l(k)}</option>`).join('')}</select></label>
        ${type === 'terrestre' ? `
        <label class="f"><span>${l('classe')}</span><select id="tvm-classe">${options(CLASSES, EXEMPLE.classe)}</select></label>
        <label class="f"><span>${l('energie')}</span><select id="tvm-energie">${options(ENERGIES, EXEMPLE.energie)}</select></label>
        ${champCompteur('tvm-annee', l('annee'), EXEMPLE.annee, 1950, ANNEE)}
        <label class="f"><span>${l('mois')}</span><select id="tvm-mois">${MOIS[etat.lang].map((m, i) =>
          `<option value="${i + 1}"${i + 1 === EXEMPLE.mois ? ' selected' : ''}>${m}</option>`).join('')}</select></label>` : ''}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · TVM</span><span>${ANNEE}</span></div>
        <div class="rows" id="tvm-rows"></div>
        <div class="total"><span class="k">${l('total', { an: ANNEE })}</span><span class="v" id="tvm-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('tvm-type').addEventListener('change', () => { type = $('tvm-type').value; monterCalculateur(p, b); });
  const recalculer = () => {
    if (type !== 'terrestre') {
      const m = calculTVMForfait(type, b);
      $('tvm-rows').innerHTML = ligne(l('forfait'), ar(m), A.tarif);
      $('tvm-total').textContent = ar(m);
      return;
    }
    const classe = $('tvm-classe').value, energie = $('tvm-energie').value;
    const r = calculTVM({ classe, energie, anneeMiseEnCirculation: lireEntier($('tvm-annee'), 1950, ANNEE),
      moisMiseEnCirculation: Number($('tvm-mois').value), anneeImposition: ANNEE }, b);
    $('tvm-rows').innerHTML = ligne(esc(tr(CLASSES[classe])), esc(tr(ENERGIES[energie])))
      + ligne(l('age', { an: ANNEE, tranche: tr(TRANCHES[r.tranche]) }), '', A.tarif) + ligne(l('tarif'), ar(r.taxe), A.tarif);
    $('tvm-total').textContent = ar(r.taxe);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default {
  id: 'tvm', variables, comprendre, monterCalculateur,
  impotExemple: b => calculTVM({ classe: EXEMPLE.classe, energie: EXEMPLE.energie, anneeMiseEnCirculation: EXEMPLE.annee, moisMiseEnCirculation: EXEMPLE.mois, anneeImposition: ANNEE }, b).taxe,
};
