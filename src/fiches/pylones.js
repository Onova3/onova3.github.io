// Fiche Taxe sur les pylônes, relais, antennes ou mâts (CDI Livre II, Titre XII ; CPF Chap. XXI). Textes malgaches à relire.
import { calculPylones } from '../calc/pylones.js';
import { t, tr, fmt, ar, pct, ligne, champCompteur, champCommunal, lireEntier, lireCommunal, brancher } from '../ui.js';

const EXEMPLE = { pylones: 3, antennes: 2 };
const tarifsMax = b => ({ tarifPylone: b.pylones.maxParPylone, tarifAntenne: b.pylones.maxParAntenne });
const variables = b => ({ pylone: ar(b.pylones.maxParPylone), antenne: ar(b.pylones.maxParAntenne), commune: pct(b.pylones.repartition.commune, 0), region: pct(b.pylones.repartition.region, 0) });

const comprendre = {
  definition: {
    article: 'CDI 10.12.01, 10.12.03',
    texte: {
      fr: "Les opérateurs de télécommunication et de radio-télévision paient chaque année une taxe sur leurs pylônes et antennes, partagée entre la commune ({commune}) et la Région ({region}). La commune vote ses tarifs sans dépasser {pylone} par pylône et {antenne} par antenne posée sur un autre support.",
      en: 'Telecom and broadcasting operators pay an annual tax on their pylons and antennas, shared between the commune ({commune}) and the Region ({region}). The commune votes its rates, up to {pylone} per pylon and {antenne} per antenna on another support.',
      mg: "Mandoa haba isan-taona amin'ny tilikambo sy antenina ny orinasa mpandraharaha fifandraisana sy radio-fahitalavitra, zaraina amin'ny kaominina ({commune}) sy ny Faritra ({region}). Ny kaominina no mandany ny tahany, tsy mihoatra ny {pylone} isaky ny tilikambo sy {antenne} isaky ny antenina amin'ny fitohanana hafa.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.12.02', texte: {
      fr: 'Le propriétaire des pylônes, relais, antennes ou mâts au 1er janvier, même s’ils sont installés sur un terrain privé. Un pylône est taxé une seule fois, quel que soit le nombre d’équipements qu’il porte.',
      en: 'The owner of the pylons, relays, antennas or masts on 1 January, even if installed on private land. A pylon is taxed once, whatever the number of devices it carries.',
      mg: "Ny tompon'ny tilikambo, relais, antenina na andry amin'ny 1 janoary, na apetraka amin'ny tany manokana aza. Indray mandeha ihany no iharan'ny haba ny tilikambo, na firy na firy ny fitaovana eo aminy." } },
  ],
  exonerations: [
    { article: 'CDI 10.12.02', texte: {
      fr: 'Un équipement installé au dernier trimestre n’est taxé qu’à partir du 1er janvier suivant.',
      en: 'Equipment installed in the last quarter is taxed only from the following 1 January.',
      mg: "Ny fitaovana napetraka tamin'ny telo volana farany dia iharan'ny haba manomboka amin'ny 1 janoary manaraka ihany." } },
  ],
  aSavoir: [
    { article: 'CPF I-122', texte: {
      fr: 'Une seule échéance : déclaration et paiement le 15 octobre au plus tard.',
      en: 'A single deadline: return and payment by 15 October.',
      mg: "Fe-potoana tokana: fanambarana sy fandoavana farany ny 15 oktobra." } },
  ],
  exemple: {
    texte: {
      fr: 'Un opérateur a 3 pylônes et 2 antennes sur des toits dans une commune qui applique les plafonds : il paie {impot} avant le 15 octobre.',
      en: 'An operator has 3 pylons and 2 rooftop antennas in a commune applying the ceilings: it pays {impot} by 15 October.',
      mg: "Mpandraharaha iray manana tilikambo 3 sy antenina 2 eny an-tafo ao amin'ny kaominina mampihatra ny fetra ambony: {impot} no aloany alohan'ny 15 oktobra.",
    },
    valeurs: b => ({ impot: ar(calculPylones({ ...EXEMPLE, ...tarifsMax(b) }).impot) }),
  },
};

const L = {
  pylones: { fr: 'Pylônes', en: 'Pylons', mg: 'Tilikambo' },
  antennes: { fr: 'Antennes, mâts, relais sur un autre support', en: 'Antennas, masts, relays on another support', mg: 'Antenina, andry, relais amin’ny fitohanana hafa' },
  tarif: { fr: 'Tarif voté par ma commune · {objet}', en: 'Rate voted by my commune · {objet}', mg: 'Taha nolanian’ny kaominako · {objet}' },
  regle: { fr: 'Plafond fixé par le Code : {max}.', en: 'Ceiling set by the Code: {max}.', mg: 'Fetra ambony napetraky ny Fehezan-dalàna: {max}.' },
  calcul: { fr: '{lib} : {n} × {m}', en: '{lib}: {n} × {m}', mg: '{lib}: {n} × {m}' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const P = b.pylones, A = P.articles;
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champCompteur('py-n', l('pylones'), EXEMPLE.pylones, 0, 1000)}
        ${champCompteur('py-a', l('antennes'), EXEMPLE.antennes, 0, 1000)}
        ${champCommunal({ id: 'py-tp', libelle: l('tarif', { objet: l('pylones') }), valeur: P.maxParPylone, max: P.maxParPylone, article: A.tarif, regle: l('regle', { max: ar(P.maxParPylone) }) + ' ' + t('valeur_exemple') })}
        ${champCommunal({ id: 'py-ta', libelle: l('tarif', { objet: l('antennes') }), valeur: P.maxParAntenne, max: P.maxParAntenne, article: A.tarif, regle: l('regle', { max: ar(P.maxParAntenne) }) + ' ' + t('valeur_exemple') })}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Pylônes', en: 'Pylons', mg: 'Tilikambo' })}</span><span>${l('parAn')}</span></div>
        <div class="rows" id="py-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="py-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const d = { pylones: lireEntier($('py-n'), 0, 1000), antennes: lireEntier($('py-a'), 0, 1000), tarifPylone: lireCommunal(p, 'py-tp'), tarifAntenne: lireCommunal(p, 'py-ta') };
    const r = calculPylones(d);
    $('py-rows').innerHTML = [['pylones', d.pylones, d.tarifPylone, r.lignes.pylones], ['antennes', d.antennes, d.tarifAntenne, r.lignes.antennes]]
      .filter(x => x[1]).map(([k, n, m, total]) => ligne(l('calcul', { lib: l(k), n, m: ar(m) }), ar(total), A.tarif)).join('');
    $('py-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'pylones', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculPylones({ ...EXEMPLE, ...tarifsMax(b) }).impot };
