// Fiche Taxe annuelle sur les appareils automatiques (CDI Livre II, Titre VII ; CPF Chap. XVII). Textes malgaches à relire.
import { calculAppareils } from '../calc/appareils.js';
import { t, tr, fmt, ar, ligne, champCompteur, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { machinesASous: 2, autres: 3 };
const variables = b => ({ sous: ar(b.appareils.machineASous), autre: ar(b.appareils.autre) });

const comprendre = {
  definition: {
    article: 'CDI 10.07.01',
    texte: {
      fr: "Chaque appareil automatique exploité dans une commune paie une taxe annuelle fixée par le Code : {sous} par machine à sous, {autre} pour les autres appareils.",
      en: 'Each automatic machine operated in a commune pays an annual tax set by the Code: {sous} per slot machine, {autre} for other machines.',
      mg: "Ny milina mandeha ho azy tsirairay ampiasaina ao amin'ny kaominina dia mandoa haba isan-taona voafaritry ny Fehezan-dalàna: {sous} isaky ny milina filokana, {autre} ho an'ny milina hafa.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.07.01', texte: {
      fr: 'L’exploitant des appareils : machines à sous ({sous}) et autres appareils automatiques ({autre}).',
      en: 'The machine operator: slot machines ({sous}) and other automatic machines ({autre}).',
      mg: "Ny mpitantana ny milina: milina filokana ({sous}) sy milina mandeha ho azy hafa ({autre})." } },
  ],
  exonerations: [
    { article: 'CPF I-114', texte: {
      fr: 'Aucune exonération n’est prévue. Seule réduction : demi-tarif la première année pour un appareil mis en service au second semestre.',
      en: 'No exemption is provided. The only reduction: half rate in the first year for a machine put into service in the second half.',
      mg: "Tsy misy fanafahana. Fihenana tokana: antsasa-bidy amin'ny taona voalohany ho an'ny milina natomboka tamin'ny enim-bolana faharoa." } },
  ],
  aSavoir: [
    { article: 'CPF I-114', texte: {
      fr: 'La taxe se paie d’avance, à la mise en service, puis chaque année avant le 31 janvier.',
      en: 'The tax is paid in advance, when the machine is put into service, then every year by 31 January.',
      mg: "Aloa mialoha ny haba, rehefa atomboka ny milina, avy eo isan-taona alohan'ny 31 janoary." } },
  ],
  exemple: {
    texte: {
      fr: 'Une salle de jeux d’Antananarivo exploite 2 machines à sous et 3 autres appareils : elle paie {impot} par an, avant le 31 janvier.',
      en: 'A games room in Antananarivo operates 2 slot machines and 3 other machines: it pays {impot} a year, by 31 January.',
      mg: "Efitrano filalaovana any Antananarivo no mampiasa milina filokana 2 sy milina hafa 3: {impot} isan-taona no aloany, alohan'ny 31 janoary.",
    },
    valeurs: b => ({ impot: ar(calculAppareils(EXEMPLE, b).impot) }),
  },
};

const L = {
  sous: { fr: 'Machines à sous', en: 'Slot machines', mg: 'Milina filokana' },
  autres: { fr: 'Autres appareils automatiques', en: 'Other automatic machines', mg: 'Milina hafa' },
  semestre: { fr: 'Première année, mise en service au second semestre (demi-tarif)', en: 'First year, put into service in the second half (half rate)', mg: "Taona voalohany, natomboka tamin'ny enim-bolana faharoa (antsasa-bidy)" },
  calcul: { fr: '{lib} : {n} × {m}', en: '{lib}: {n} × {m}', mg: '{lib}: {n} × {m}' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.appareils.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champCompteur('app-sous', l('sous'), EXEMPLE.machinesASous, 0, 500)}
        ${champCompteur('app-autres', l('autres'), EXEMPLE.autres, 0, 500)}
        <label class="check"><input type="checkbox" id="app-sem"><span>${l('semestre')}</span></label>
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Appareils', en: 'Machines', mg: 'Milina' })}</span><span>${l('parAn')}</span></div>
        <div class="rows" id="app-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="app-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const d = { machinesASous: lireEntier($('app-sous'), 0, 500), autres: lireEntier($('app-autres'), 0, 500), secondSemestre: $('app-sem').checked };
    const r = calculAppareils(d, b), k = d.secondSemestre ? b.appareils.demiTarifSecondSemestre : 1;
    $('app-rows').innerHTML = [['sous', d.machinesASous, b.appareils.machineASous, r.lignes.machinesASous], ['autres', d.autres, b.appareils.autre, r.lignes.autres]]
      .filter(x => x[1]).map(([k2, n, m, total]) => ligne(l('calcul', { lib: l(k2), n, m: ar(m * k) }), ar(total), d.secondSemestre ? 'CPF I-114' : A.tarif)).join('');
    $('app-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'appareils', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculAppareils(EXEMPLE, b).impot };
