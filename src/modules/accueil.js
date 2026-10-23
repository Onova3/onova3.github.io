// Onglet Accueil (#/) : langue, recherche, prochaine échéance, profils « Je suis… » et liste des impôts.
import { calendrier } from '../calendrier.js';
import { lien, lienModule } from '../routes.js';
import { t, tr, esc, art } from '../ui.js';
import { listeImpots } from './impots.js';
import { nomMois } from './calendrier.js';

const LANGUES = [['fr', 'FR'], ['en', 'EN'], ['mg', 'MG']];
let recherche = '';

function prochaineEcheance(impots, obligations) {
  const [e] = calendrier({ obligations, impots, depuis: new Date().toISOString().slice(0, 10), mois: 12 });
  if (!e) return '';
  const [a, m, j] = e.date.split('-').map(Number);
  return `<section class="echeance" aria-labelledby="ech-titre">
    <h2 class="sr" id="ech-titre">${t('prochaine_echeance')}</h2>
    <span class="eg">${t('prochaine_echeance')}</span>
    <div class="date"><span class="jour-g">${j}</span><span class="mois-g">${esc(nomMois(a, m))}</span></div>
    <a class="quoi" href="${lien(e.id, 'declarer')}"><span class="sigle">${esc(e.sigle)}</span> ${esc(tr(e.nom))}</a>
    <p class="aide">${esc(tr(e.texte))}${art(e.article)}</p>
    <a class="bouton bouton--secondaire" href="${lienModule('calendrier')}">${t('voir_calendrier')}</a>
  </section>`;
}

export function monter(el, { impots, obligations, profils, reglages }) {
  const langue = reglages.lire('lang');
  el.innerHTML = `
    <div class="accueil-langue"><div class="seg seg3" role="group" aria-label="${esc(t('reglage_langue'))}">${LANGUES.map(([code, nom]) =>
      `<button type="button" data-lang="${code}" aria-pressed="${code === langue}" lang="${code}">${nom}</button>`).join('')}</div></div>
    <label class="search"><span class="sr">${t('recherche')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche'))}" value="${esc(recherche)}" autocomplete="off"></label>
    <div id="resultats"></div>
    <div id="hors-recherche">
      ${prochaineEcheance(impots, obligations)}
      <section><h2>${t('par_profil')}</h2>
        <div class="profils">${profils.map(p => `<a class="profil profil--simple" href="${lienModule('calendrier', p.id)}"><b>${esc(tr(p.libelle))}</b><span>${esc(tr(p.description))}</span></a>`).join('')}</div></section>
      ${listeImpots(impots, '')}
    </div>`;
  el.querySelectorAll('[data-lang]').forEach(bt => bt.addEventListener('click', () => reglages.changer('lang', bt.dataset.lang)));
  const q = el.querySelector('#q');
  const maj = () => {
    const actif = recherche.trim() !== '';
    el.querySelector('#resultats').innerHTML = actif ? listeImpots(impots, recherche) : '';
    el.querySelector('#hors-recherche').hidden = actif;
  };
  q.addEventListener('input', () => { recherche = q.value; maj(); });
  el.addEventListener('click', e => { if (e.target.closest('[data-effacer]')) { recherche = ''; q.value = ''; maj(); q.focus(); } });
  maj();
}
