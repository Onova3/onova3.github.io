// Fiche Taxe de séjour (CDI Livre II, Titre V ; CPF Chap. XVI). Textes malgaches à relire.
import { calculSejour } from '../calc/sejour.js';
import { t, tr, fmt, esc, ar, ligne, champMontant, champCommunal, lireMontant, lireCommunal, brancher } from '../ui.js';

const EXEMPLE = { categorie: 'uneATroisEtoiles', nuitees: 600 };
const cat = (b, id) => b.sejour.categories.find(x => x.id === id);
const variables = b => ({ luxe: ar(cat(b, 'quatreCinqEtoiles').max), std: ar(cat(b, 'uneATroisEtoiles').max), autres: ar(cat(b, 'autres').max) });

const comprendre = {
  definition: {
    article: 'CDI 10.05.01, 10.05.03',
    texte: {
      fr: "La taxe de séjour est payée par les clients des hôtels et hébergements, pour chaque nuit. L'hôtelier l'ajoute à la facture et la reverse chaque mois à la commune (et à la Région pour les hôtels de 4 étoiles et plus).",
      en: 'The tourist tax is paid by guests of hotels and lodgings, for each night. The hotelier adds it to the bill and pays it monthly to the commune (and to the Region for hotels with 4 stars or more).',
      mg: "Ny haba fitoerana dia aloan'ny mpanjifa any amin'ny hotely sy toerana fandraisana, isaky ny alina. Ny tompon'ny hotely no manampy azy amin'ny faktiora ary mandoa azy isam-bolana amin'ny kaominina (sy amin'ny Faritra ho an'ny hotely 4 kintana na mihoatra).",
    },
  },
  quiPaie: [
    { article: 'CDI 10.05.03', texte: {
      fr: 'Plafonds par nuit : {luxe} par chambre (hôtel 4 ou 5 étoiles), {std} par chambre (1 à 3 étoiles), {autres} par adulte (Ravinala, chambres d’hôtes, pensions, établissements non classés). La commune vote ses tarifs dans ces limites.',
      en: 'Ceilings per night: {luxe} per room (4- or 5-star hotel), {std} per room (1 to 3 stars), {autres} per adult (Ravinala, guest rooms, boarding houses, unclassified). The commune votes its rates within these limits.',
      mg: "Fetra ambony isaky ny alina: {luxe} isaky ny efitra (hotely 4 na 5 kintana), {std} isaky ny efitra (1 ka hatramin'ny 3 kintana), {autres} isaky ny olon-dehibe (Ravinala, trano fandraisam-bahiny kely, tsy voasokajy). Ny kaominina no mandany ny tahany ao anatin'ireo fetra ireo." } },
    { article: 'CDI 10.05.02', texte: {
      fr: 'L’exploitant de tout hébergement payant la perçoit et la reverse.',
      en: 'The operator of any paid accommodation collects and pays it over.',
      mg: "Ny mpitantana toerana fandraisana mandoa rehetra no mandray sy mandoa azy." } },
  ],
  exonerations: [
    { article: 'CDI 10.05.02', texte: {
      fr: 'Seuls les hébergements payants sont visés : être logé gratuitement chez de la famille ou des amis n’entraîne pas de taxe.',
      en: 'Only paid accommodation is covered: staying free with family or friends involves no tax.',
      mg: "Ny toerana fandraisana mandoa ihany no voakasika: tsy misy haba raha mipetraka maimaimpoana any amin'ny fianakaviana na namana." } },
  ],
  aSavoir: [
    { article: 'CDI 10.05.01', texte: {
      fr: 'Hôtels de 3 étoiles et moins : tout va à la commune. Hôtels de 4 étoiles et plus : 25 % pour la commune, 75 % pour la Région.',
      en: 'Hotels with 3 stars or fewer: all goes to the commune. Hotels with 4 stars or more: 25% to the commune, 75% to the Region.',
      mg: "Hotely 3 kintana na latsaka: ho an'ny kaominina avokoa. Hotely 4 kintana na mihoatra: 25 % ho an'ny kaominina, 75 % ho an'ny Faritra." } },
  ],
  exemple: {
    texte: {
      fr: 'Un hôtel 2 étoiles de Nosy Be a loué 600 nuitées-chambres en juillet. Si la commune applique le plafond, il reverse {impot} au plus tard le 10 août.',
      en: 'A 2-star hotel in Nosy Be rented 600 room-nights in July. If the commune applies the ceiling, it pays {impot} by 10 August.',
      mg: "Hotely 2 kintana any Nosy Be no nanofa efitra 600 alina tamin'ny jolay. Raha ny fetra ambony no ampiharin'ny kaominina, {impot} no aloany farany ny 10 aogositra.",
    },
    valeurs: b => ({ impot: ar(calculSejour({ ...EXEMPLE, tarif: cat(b, EXEMPLE.categorie).max }, b).impot) }),
  },
};

const UNITES = { chambre: { fr: 'nuitées-chambres', en: 'room-nights', mg: 'efitra × alina' }, adulte: { fr: 'nuitées-adultes', en: 'adult-nights', mg: 'olon-dehibe × alina' } };
const L = {
  categorie: { fr: 'Catégorie de l’établissement', en: 'Category of establishment', mg: 'Sokajin’ny toerana' },
  nuitees: { fr: 'Nombre de {u} dans le mois', en: 'Number of {u} in the month', mg: 'Isan’ny {u} tamin’ny volana' },
  tarif: { fr: 'Tarif voté par ma commune, par nuit', en: 'Rate voted by my commune, per night', mg: 'Taha nolanian’ny kaominako, isaky ny alina' },
  regle: { fr: 'Plafond fixé par le Code : {max}.', en: 'Ceiling set by the Code: {max}.', mg: "Fetra ambony napetraky ny Fehezan-dalàna: {max}." },
  calcul: { fr: '{n} {u} × {m}', en: '{n} {u} × {m}', mg: '{n} {u} × {m}' },
  total: { fr: 'Taxe à reverser', en: 'Tax to pay over', mg: 'Haba haloa' },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let categorie = EXEMPLE.categorie;

function monterCalculateur(p, b) {
  const A = b.sejour.articles, c = cat(b, categorie), u = tr(UNITES[c.unite]);
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('categorie')}</span><select id="sej-cat">${b.sejour.categories.map(x =>
          `<option value="${x.id}"${x.id === categorie ? ' selected' : ''}>${esc(tr(x.libelle))}</option>`).join('')}</select></label>
        ${champMontant('sej-n', l('nuitees', { u }), EXEMPLE.nuitees).replace('<span class="u">Ar</span>', '')}
        ${champCommunal({ id: 'sej-tarif', libelle: l('tarif'), valeur: c.max, max: c.max, article: A.tarif, regle: l('regle', { max: ar(c.max) }) + ' ' + t('valeur_exemple') })}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Taxe de séjour', en: 'Tourist tax', mg: 'Haba fitoerana' })}</span><span>${l('parMois')}</span></div>
        <div class="rows" id="sej-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="sej-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('sej-cat').addEventListener('change', () => { categorie = $('sej-cat').value; monterCalculateur(p, b); });
  const recalculer = () => {
    const n = lireMontant($('sej-n')), tarif = lireCommunal(p, 'sej-tarif'), r = calculSejour({ categorie, nuitees: n, tarif }, b);
    $('sej-rows').innerHTML = ligne(l('calcul', { n: n.toLocaleString('fr-FR'), u, m: ar(tarif) }), ar(r.impot), A.tarif);
    $('sej-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'sejour', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculSejour({ ...EXEMPLE, tarif: cat(b, EXEMPLE.categorie).max }, b).impot };
