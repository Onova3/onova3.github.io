// Fiche Taxe sur les fêtes, spectacles et manifestations diverses (CDI Livre II, Titre XI ; CPF Chap. XX). Textes malgaches à relire.
import { calculFetes } from '../calc/fetes.js';
import { t, tr, fmt, esc, ar, pct, ligne, puce, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { type: 'spectacle', montant: 15000000, billets: 20000000 };
const type = (b, id) => b.fetes.types.find(x => x.id === id);
const variables = b => ({ places: pct(type(b, 'places').taux, 0), recettes: pct(type(b, 'spectacle').taux, 0), caution: pct(b.fetes.cautionnement, 0) });

const comprendre = {
  definition: {
    article: 'CDI 10.11.01, 10.11.06',
    texte: {
      fr: "Toute fête, spectacle ou manifestation à entrée payante paie une taxe à la commune : {places} du prix des places pour le cinéma, les bals, les cirques et les attractions ; {recettes} des recettes pour les concerts, le théâtre, le sport et les cinémas ambulants.",
      en: 'Any festival, show or event with paid entry pays a tax to the commune: {places} of ticket prices for cinema, dances, circuses and attractions; {recettes} of takings for concerts, theatre, sport and travelling cinemas.',
      mg: "Ny fety, fampisehoana na hetsika rehetra mandoa fidirana dia mandoa haba amin'ny kaominina: {places} amin'ny vidin'ny toerana ho an'ny sinema, baly, cirque ary fialam-boly; {recettes} amin'ny vola miditra ho an'ny kaonseritra, tantara an-tsehatra, fanatanjahantena ary sinema mivezivezy.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.11.02, CPF I-120', texte: {
      fr: 'L’organisateur de l’événement, sur les billets ou tickets payants vendus dans la commune.',
      en: 'The event organiser, on paid tickets sold in the commune.',
      mg: "Ny mpikarakara ny hetsika, amin'ny tapakila mandoa amidy ao amin'ny kaominina." } },
  ],
  exonerations: [
    { article: 'CDI 10.11.03', texte: {
      fr: 'Foires et salons publics sans attraction payante ; séances de cinéma associatives pour la jeunesse ; spectacles d’associations d’éducation populaire réservés aux membres ; compétitions scolaires et juniors, matches de bienfaisance, compétitions internationales.',
      en: 'Public fairs and exhibitions without paid attractions; non-profit cinema screenings for young people; popular education association shows for members only; school and junior competitions, charity matches, international competitions.',
      mg: "Tsena fihaonana sy fampirantiana ho an'ny besinimaro tsy misy fialam-boly mandoa; sinema ataon'ny fikambanana ho an'ny tanora; fampisehoana ho an'ny mpikambana ihany; fifaninanana an-tsekoly sy tanora, lalao fiantrana, fifaninanana iraisam-pirenena." } },
    { article: 'CDI 10.11.04', texte: {
      fr: 'Le Maire peut exonérer les événements de bienfaisance, de secours mutuel, de coopératives scolaires ou d’associations de parents, s’ils ont été autorisés au préalable.',
      en: 'The Mayor may exempt charity, mutual aid, school cooperative or parents’ association events, if they were authorised beforehand.',
      mg: "Afaka manafaka ny hetsika fiantrana, fifanampiana, koperativa an-tsekoly na fikambanan'ny ray aman-dreny ny Ben'ny tanàna, raha nahazo alalana mialoha." } },
  ],
  aSavoir: [
    { article: 'CPF I-120', texte: {
      fr: 'L’organisateur déclare l’événement 24 heures avant et verse un cautionnement provisoire de {caution} de la valeur des billets mis en vente.',
      en: 'The organiser declares the event 24 hours beforehand and pays a provisional deposit of {caution} of the value of tickets offered for sale.',
      mg: "Ambaran'ny mpikarakara 24 ora mialoha ny hetsika ary mandoa antoka vonjimaika {caution} amin'ny vidin'ny tapakila amidy." } },
  ],
  exemple: {
    texte: {
      fr: 'Un concert à Antananarivo rapporte {recette} de billets vendus. La taxe est de {impot}. Avant le concert, l’organisateur a versé un cautionnement de {caution} sur {billets} de billets mis en vente.',
      en: 'A concert in Antananarivo takes {recette} in tickets sold. The tax is {impot}. Before the concert, the organiser paid a deposit of {caution} on {billets} of tickets offered for sale.',
      mg: "Kaonseritra any Antananarivo no nahazo {recette} tamin'ny tapakila amidy. {impot} ny haba. Alohan'ny kaonseritra, nandoa antoka {caution} ny mpikarakara tamin'ny tapakila {billets} natolotra hamidy.",
    },
    valeurs: b => {
      const r = calculFetes({ type: EXEMPLE.type, montant: EXEMPLE.montant, billetsMisEnVente: EXEMPLE.billets }, b);
      return { recette: ar(EXEMPLE.montant), impot: ar(r.impot), caution: ar(r.cautionnement), billets: ar(EXEMPLE.billets) };
    },
  },
};

const L = {
  type: { fr: 'Type de manifestation', en: 'Type of event', mg: 'Karazana hetsika' },
  montant: { fr: 'Prix des places vendues ou recettes brutes', en: 'Price of tickets sold or gross takings', mg: 'Vidin’ny toerana amidy na vola miditra' },
  billets: { fr: 'Valeur des billets mis en vente (pour le cautionnement)', en: 'Value of tickets offered for sale (for the deposit)', mg: 'Vidin’ny tapakila natolotra hamidy (ho an’ny antoka)' },
  calcul: { fr: '{taux} × {m}', en: '{taux} × {m}', mg: '{taux} × {m}' },
  caution: { fr: 'Cautionnement provisoire ({taux})', en: 'Provisional deposit ({taux})', mg: 'Antoka vonjimaika ({taux})' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
  parEvt: { fr: 'Par manifestation', en: 'Per event', mg: 'Isaky ny hetsika' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let typeChoisi = EXEMPLE.type;

function monterCalculateur(p, b) {
  const A = b.fetes.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('type')}</span><select id="fe-type">${b.fetes.types.map(x =>
          `<option value="${x.id}"${x.id === typeChoisi ? ' selected' : ''}>${esc(tr(x.libelle))} · ${pct(x.taux, 0)}</option>`).join('')}</select></label>
        ${champMontant('fe-montant', l('montant'), EXEMPLE.montant)}
        ${champMontant('fe-billets', l('billets'), EXEMPLE.billets)}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Fêtes et spectacles', en: 'Festivals and shows', mg: 'Fety sy fampisehoana' })}</span><span>${l('parEvt')}</span></div>
        <div class="rows" id="fe-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="fe-total"></span></div>
        <div class="sub" id="fe-sub"></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('fe-type').addEventListener('change', () => { typeChoisi = $('fe-type').value; });
  const recalculer = () => {
    typeChoisi = $('fe-type').value;
    const m = lireMontant($('fe-montant')), r = calculFetes({ type: typeChoisi, montant: m, billetsMisEnVente: lireMontant($('fe-billets')) }, b);
    $('fe-rows').innerHTML = ligne(l('calcul', { taux: pct(r.type.taux, 0), m: ar(m) }), ar(r.impot), A.taux);
    $('fe-total').textContent = ar(r.impot);
    $('fe-sub').innerHTML = puce(l('caution', { taux: pct(b.fetes.cautionnement, 0) }), ar(r.cautionnement));
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'fetes', impotLocal: true, variables, comprendre, monterCalculateur,
  impotExemple: b => calculFetes({ type: EXEMPLE.type, montant: EXEMPLE.montant }, b).impot };
