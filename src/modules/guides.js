// Module Guides (#/guides, #/guides/<id>) : guides pas à pas tirés de data/guides.json.
// Le guide « prescription » ajoute un petit calculateur (src/prescription.js). Textes malgaches à relire.
import { finPrescription, REGLES } from '../prescription.js';
import { lienModule } from '../routes.js';
import { t, tr, fmt, esc, art, champCompteur, lireEntier, brancher } from '../ui.js';

const REGLES_LIB = {
  revenus: { fr: 'Impôt sur les revenus, IRCM, IS, IRSA', en: 'Income tax, IRCM, synthetic tax, IRSA', mg: 'IR, IRCM, IS, IRSA' },
  foncier: { fr: 'Impôts fonciers', en: 'Property taxes', mg: 'Hetra amin’ny tany sy trano' },
  tva: { fr: 'TVA, taxe sur les assurances', en: 'VAT, insurance tax', mg: 'TVA, haba amin’ny fiantohana' },
  indirects: { fr: 'Droit d’accises et impôts indirects', en: 'Excise and indirect taxes', mg: 'Haba manokana sy hetra ankolaka' },
  enregistrement: { fr: 'Droits d’enregistrement (année de l’enregistrement)', en: 'Registration duties (year of registration)', mg: 'Haba fanoratana (taona nanoratana)' },
  fluxIllicites: { fr: 'Contrôle lancé pour flux financiers illicites', en: 'Audit started over illicit financial flows', mg: 'Fanaraha-maso noho ny vola tsy ara-dalàna' },
};
const L = {
  index: { fr: 'Guides pas à pas', en: 'Step-by-step guides', mg: 'Torolalana tsikelikely' },
  indexLead: { fr: 'Les démarches du Code des procédures fiscales, étape par étape, avec leurs articles.', en: 'Procedures from the Tax Procedures Code, step by step, with their articles.', mg: "Ny dingana ao amin'ny Fehezan-dalàna momba ny fomba, tsikelikely, miaraka amin'ny andininy." },
  etapes: { fr: 'Étape par étape', en: 'Step by step', mg: 'Tsikelikely' },
  droits: { fr: 'Mes droits', en: 'My rights', mg: 'Ny zoko' },
  delais: { fr: 'Délais à retenir', en: 'Time limits to remember', mg: 'Fe-potoana tokony hotadidiana' },
  risques: { fr: 'Ce que je risque', en: 'What I risk', mg: 'Izay mety hitranga' },
  calcTitre: { fr: 'Jusqu’à quand l’administration peut-elle revenir sur mon impôt ?', en: 'Until when can the tax office go back on my tax?', mg: "Mandra-pahoviana no afaka miverina amin'ny hetrako ny fitondrana?" },
  impot: { fr: 'Impôt', en: 'Tax', mg: 'Hetra' },
  annee: { fr: 'Année de l’impôt (ou de l’exigibilité)', en: 'Tax year (or year due)', mg: "Taonan'ny hetra" },
  reponse: { fr: 'L’administration peut agir jusqu’au {date}.', en: 'The tax office can act until {date}.', mg: "Afaka mihetsika hatramin'ny {date} ny fitondrana." },
  rappel: { fr: 'Sauf interruption (redressement, réclamation, acompte…) qui fait repartir le délai.', en: 'Unless interrupted (adjustment, complaint, instalment…), which restarts the period.', mg: 'Raha tsy misy fanapahana (fanitsiana, fitarainana, fandoavana…) izay mamerina ny fe-potoana.' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
const dateLisible = iso => { const [a, m, j] = iso.split('-'); return `${j}/${m}/${a}`; };

function index(el, guides) {
  el.innerHTML = `
    <header class="fiche-tete"><h2>${l('index')}</h2><p class="lead">${l('indexLead')}</p></header>
    <div class="profils">${guides.map(g => `<a class="profil" href="${lienModule('guides', g.id)}"><b>${esc(tr(g.titre))}</b><span>${esc(tr(g.intro)).slice(0, 110)}…</span></a>`).join('')}</div>`;
}

function calculateurPrescription(el) {
  const bloc = el.querySelector('#presc');
  bloc.innerHTML = `
    <div class="grid">
      <div class="card">
        <label class="f"><span>${l('impot')}</span><select id="pr-regle">${Object.keys(REGLES_LIB).map(k => `<option value="${k}">${esc(tr(REGLES_LIB[k]))}</option>`).join('')}</select></label>
        ${champCompteur('pr-annee', l('annee'), new Date().getFullYear() - 1, 2000, 2100)}
      </div>
      <div class="ticket" aria-live="polite"><div class="rows" id="pr-res"></div></div>
    </div>`;
  const recalculer = () => {
    const regle = bloc.querySelector('#pr-regle').value, annee = lireEntier(bloc.querySelector('#pr-annee'), 2000, 2100);
    bloc.querySelector('#pr-res').innerHTML = `<p class="lead">${esc(l('reponse', { date: dateLisible(finPrescription(regle, annee)) }))}${art(REGLES[regle].article)}</p>
      <p class="aide">${l('rappel')}${art('CPF IX-21, IX-22')}</p>`;
  };
  brancher(bloc, recalculer);
  recalculer();
}

export function monter(el, { guides, sous }) {
  const g = guides.find(x => x.id === sous);
  if (!g) return index(el, guides);
  const liste = items => `<ul class="puces">${items.map(i => `<li>${esc(tr(i.texte))}${art(i.article)}</li>`).join('')}</ul>`;
  el.innerHTML = `
    <header class="fiche-tete"><h2>${esc(tr(g.titre))}</h2><p class="lead">${esc(tr(g.intro))}</p></header>
    ${g.id === 'prescription' ? `<h3 class="titre-sim">${l('calcTitre')}</h3><div id="presc"></div>` : ''}
    <h3 class="titre-sim">${l('etapes')}</h3>
    <ol class="etapes">${g.etapes.map(e => `<li class="card"><h3>${esc(tr(e.titre))}</h3><p>${esc(tr(e.texte))}${art(e.article)}</p></li>`).join('')}</ol>
    <div class="grid" style="margin-top:18px">
      <div class="card"><h3>${l('droits')}</h3>${liste(g.droits)}</div>
      <div class="card"><h3>${l('delais')}</h3><div class="rows">${g.delais.map(d =>
        `<div class="row"><span>${esc(tr(d.libelle))}${art(d.article)}</span><span>${esc(tr(d.duree))}</span></div>`).join('')}</div></div>
      ${g.sanctions.length ? `<div class="card"><h3>${l('risques')}</h3>${liste(g.sanctions)}</div>` : ''}
    </div>`;
  if (g.id === 'prescription') calculateurPrescription(el);
}
