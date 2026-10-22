// Fiche Taxe sur la publicité (CDI Livre II, Titre IX ; CPF Chap. XIX). Textes malgaches à relire.
import { calculAffiches, calculPanneaux, calculPubliciteMedia } from '../calc/publicite.js';
import { t, tr, fmt, ar, pct, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { nombre: 200, surfaceDm2: 40, surfaceM2: 12, sommes: 50000000 };
const variables = b => {
  const P = b.publicite;
  return { a25: ar(P.affiches[0].max), a50: ar(P.affiches[1].max), a2m: ar(P.affiches[2].max), plus: ar(P.afficheParM2AuDela),
    panneau: ar(P.panneauParM2An), media: pct(P.audiovisuelTaux, 0) };
};

const comprendre = {
  definition: {
    article: 'CDI 10.09.01, 10.09.06',
    texte: {
      fr: "Toute publicité commerciale affichée dans une commune (affiches, panneaux, enseignes lumineuses, véhicules, banderoles) paie une taxe à la commune. La publicité à la télévision, à la radio, dans la presse ou en ligne paie une autre taxe de {media}, qui finance toutes les collectivités.",
      en: 'Any commercial advertising displayed in a commune (posters, billboards, illuminated signs, vehicles, banners) pays a tax to the commune. Advertising on TV, radio, in the press or online pays a separate {media} tax, which funds all local authorities.',
      mg: "Ny dokam-barotra rehetra aseho ao amin'ny kaominina (afisy, takelaka, jiro, fiara, sora-baventy) dia mandoa haba amin'ny kaominina. Ny dokam-barotra amin'ny fahitalavitra, radio, gazety na aterineto dia mandoa haba hafa {media}, izay mamatsy ny vondrom-bahoaka rehetra.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.09.04', texte: {
      fr: 'Affiches papier, par affiche (plafonds) : {a25} jusqu’à 25 dm², {a50} jusqu’à 50 dm², {a2m} jusqu’à 2 m², puis {plus} de plus par m² ; le double pour une affiche protégée ou placée dans un lieu public ou un transport public.',
      en: 'Paper posters, per poster (ceilings): {a25} up to 25 dm², {a50} up to 50 dm², {a2m} up to 2 m², then {plus} more per m²; double for a protected poster or one placed in a public place or on public transport.',
      mg: "Afisy taratasy, isaky ny afisy (fetra ambony): {a25} hatramin'ny 25 dm², {a50} hatramin'ny 50 dm², {a2m} hatramin'ny 2 m², avy eo {plus} fanampiny isaky ny m²; avo roa ho an'ny afisy voaaro na apetraka amin'ny toerana ho an'ny besinimaro na fiara fitaterana." } },
    { article: 'CDI 10.09.04', texte: {
      fr: 'Panneaux peints, enseignes et affiches lumineuses : {panneau} par m² et par an au plus.',
      en: 'Painted billboards, illuminated signs and posters: {panneau} per m² per year at most.',
      mg: "Takelaka voaloko, jiro sy afisy mamirapiratra: {panneau} isaky ny m² isan-taona farafahabetsany." } },
    { article: 'CDI 10.09.07, 10.09.09', texte: {
      fr: 'Télévision, radio, presse écrite ou en ligne : {media} des sommes payées par les annonceurs, hors commission d’agence et hors TVA, collectés par la régie publicitaire.',
      en: 'TV, radio, print or online: {media} of the sums paid by advertisers, excluding agency commission and VAT, collected by the advertising agency.',
      mg: "Fahitalavitra, radio, gazety na aterineto: {media} amin'ny vola aloan'ny mpanao doka, tsy misy komisiona sy TVA, angonin'ny mpitantana ny doka." } },
  ],
  exonerations: [
    { article: 'CDI 10.09.03, 10.09.07', texte: {
      fr: 'État, collectivités et établissements publics ; officiers ministériels ; pharmacies et établissements sanitaires ; affiches à caractère informatif ; messages d’intérêt national pour des œuvres d’utilité publique.',
      en: 'State, local authorities and public bodies; ministerial officers; pharmacies and health facilities; informational posters; national-interest messages for public-interest causes.',
      mg: "Fanjakana, vondrom-bahoaka sy sampam-panjakana; mpiasan'ny fitsarana; toeram-pivarotam-panafody sy toeram-pitsaboana; afisy fampahafantarana; hafatra ho tombontsoam-pirenena ho an'ny asa ilaina ho an'ny besinimaro." } },
  ],
  aSavoir: [
    { article: 'CDI 10.09.04', texte: {
      fr: 'Les montants du Code sont des limites : chaque commune vote ses tarifs chaque année, sans les dépasser. Le calculateur montre les montants maximum.',
      en: 'The Code’s amounts are limits: each commune votes its rates each year, without exceeding them. The calculator shows the maximum amounts.',
      mg: "Fetra ireo vola ao amin'ny Fehezan-dalàna: ny kaominina tsirairay no mandany ny tahany isan-taona, tsy mihoatra azy ireo. Ny vola ambony indrindra no asehon'ny fitaovana fikajiana." } },
  ],
  exemple: {
    texte: {
      fr: 'Une marque de boissons pose un panneau publicitaire de 12 m² au bord d’une route à Toamasina : au plus {panneau} par an, à payer avant de l’installer. Une campagne radio de {sommes} paie {media}, versés par la radio avant le 15 du mois suivant.',
      en: 'A drinks brand puts up a 12 m² billboard by a road in Toamasina: at most {panneau} a year, to pay before installing it. A radio campaign of {sommes} pays {media}, paid by the radio station by the 15th of the following month.',
      mg: "Marika zava-pisotro iray no mametraka takelaka 12 m² amoron-dalana any Toamasina: {panneau} isan-taona farafahabetsany, aloa alohan'ny hametrahana azy. Fampielezana amin'ny radio {sommes} dia mandoa {media}, aloan'ny radio alohan'ny faha-15 amin'ny volana manaraka.",
    },
    valeurs: b => ({ panneau: ar(calculPanneaux({ surfaceM2: EXEMPLE.surfaceM2 }, b).impot), sommes: ar(EXEMPLE.sommes), media: ar(calculPubliciteMedia({ sommes: EXEMPLE.sommes }, b).impot) }),
  },
};

const L = {
  affiches: { fr: 'Affiches papier', en: 'Paper posters', mg: 'Afisy taratasy' },
  panneaux: { fr: 'Panneaux', en: 'Billboards', mg: 'Takelaka' },
  media: { fr: 'Radio, TV, presse', en: 'Radio, TV, press', mg: 'Radio, TV, gazety' },
  nombre: { fr: 'Nombre d’affiches', en: 'Number of posters', mg: 'Isan’ny afisy' },
  surfaceDm2: { fr: 'Surface d’une affiche (dm²)', en: 'Area of one poster (dm²)', mg: 'Velaran’ny afisy iray (dm²)' },
  preparee: { fr: 'Affiche protégée, ou placée dans un lieu public ou un transport public (tarif double)', en: 'Protected poster, or placed in a public place or on public transport (double rate)', mg: 'Afisy voaaro, na apetraka amin’ny toerana ho an’ny besinimaro na fiara fitaterana (avo roa)' },
  surfaceM2: { fr: 'Surface du panneau (m²)', en: 'Billboard area (m²)', mg: 'Velaran’ny takelaka (m²)' },
  lumineux: { fr: 'Panneau ou enseigne lumineuse', en: 'Illuminated billboard or sign', mg: 'Takelaka na jiro mamirapiratra' },
  sommes: { fr: 'Sommes payées à la régie (hors commission et hors TVA)', en: 'Amounts paid to the agency (excl. commission and VAT)', mg: 'Vola naloa (tsy misy komisiona sy TVA)' },
  presse: { fr: 'Presse écrite (sinon audiovisuel ou en ligne)', en: 'Print press (otherwise broadcast or online)', mg: 'Gazety (raha tsy izany fahitalavitra, radio na aterineto)' },
  unitaire: { fr: '{n} affiches × {m} (maximum)', en: '{n} posters × {m} (maximum)', mg: 'Afisy {n} × {m} (farafahabetsany)' },
  m2: { fr: '{n} m² × {m} (maximum, par an)', en: '{n} m² × {m} (maximum, per year)', mg: '{n} m² × {m} (farafahabetsany, isan-taona)' },
  tauxL: { fr: '{taux} × {s}', en: '{taux} × {s}', mg: '{taux} × {s}' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let mode = 'panneaux';

function monterCalculateur(p, b) {
  const A = b.publicite.articles;
  const formulaires = {
    affiches: `${champCompteur('pub-n', l('nombre'), EXEMPLE.nombre, 1, 100000)}${champCompteur('pub-dm2', l('surfaceDm2'), EXEMPLE.surfaceDm2, 1, 10000)}
      <label class="check"><input type="checkbox" id="pub-prep"><span>${l('preparee')}</span></label>`,
    panneaux: `${champCompteur('pub-m2', l('surfaceM2'), EXEMPLE.surfaceM2, 1, 1000)}<label class="check"><input type="checkbox" id="pub-lum"><span>${l('lumineux')}</span></label>`,
    media: `${champMontant('pub-sommes', l('sommes'), EXEMPLE.sommes)}<label class="check"><input type="checkbox" id="pub-presse"><span>${l('presse')}</span></label>`,
  };
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <div class="seg seg3" role="group">${['affiches', 'panneaux', 'media'].map(m => `<button type="button" data-mode="${m}" aria-pressed="${m === mode}">${l(m)}</button>`).join('')}</div>
        ${formulaires[mode]}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Publicité', en: 'Advertising', mg: 'Dokam-barotra' })}</span><span>${l(mode)}</span></div>
        <div class="rows" id="pub-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="pub-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  p.querySelectorAll('[data-mode]').forEach(bt => bt.addEventListener('click', () => { mode = bt.dataset.mode; monterCalculateur(p, b); }));
  const recalculer = () => {
    let h, impot;
    if (mode === 'affiches') {
      const n = lireEntier($('pub-n'), 1, 100000), r = calculAffiches({ nombre: n, surfaceDm2: lireEntier($('pub-dm2'), 1, 10000), preparee: $('pub-prep').checked }, b);
      h = ligne(l('unitaire', { n, m: ar(r.unitaire) }), ar(r.impot), A.tarif); impot = r.impot;
    } else if (mode === 'panneaux') {
      const n = lireEntier($('pub-m2'), 1, 1000), r = calculPanneaux({ surfaceM2: n, lumineux: $('pub-lum').checked }, b);
      h = ligne(l('m2', { n, m: ar(r.tarif) }), ar(r.impot), A.tarif); impot = r.impot;
    } else {
      const s = lireMontant($('pub-sommes')), r = calculPubliciteMedia({ sommes: s, presse: $('pub-presse').checked }, b);
      h = ligne(l('tauxL', { taux: pct(r.taux, 0), s: ar(s) }), ar(r.impot), A.audiovisuel); impot = r.impot;
    }
    $('pub-rows').innerHTML = h;
    $('pub-total').textContent = ar(impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'publicite', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculPanneaux({ surfaceM2: EXEMPLE.surfaceM2 }, b).impot };
