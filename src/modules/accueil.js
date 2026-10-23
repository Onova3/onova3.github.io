// Onglet Accueil (#/) : recherche, profils « Je suis… » et raccourcis. Enrichi à l'étape 4 (favoris, derniers consultés).
import { lienModule } from '../routes.js';
import { t, tr, esc } from '../ui.js';
import { listeImpots } from './impots.js';

let recherche = '';

export function monter(el, { impots, profils }) {
  el.innerHTML = `
    <label class="search"><span class="sr">${t('recherche')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche'))}" value="${esc(recherche)}" autocomplete="off"></label>
    <div id="resultats"></div>
    <div id="hors-recherche">
      <section><h2>${t('par_profil')}</h2>
        <div class="profils carrousel">${profils.map(p => `<a class="profil" href="${lienModule('calendrier', p.id)}">
          <b>${esc(tr(p.libelle))}</b><span>${esc(tr(p.description))}</span></a>`).join('')}</div></section>
      <section><h2>${t('raccourcis')}</h2>
        <div class="profils">
          <a class="profil" href="${lienModule('impots')}"><b>${t('nav_impots')}</b><span>${t('impots_court')}</span></a>
          <a class="profil" href="${lienModule('calendrier')}"><b>${t('module_calendrier')}</b><span>${t('calendrier_court')}</span></a>
          <a class="profil" href="${lienModule('apprendre')}"><b>${t('nav_apprendre')}</b><span>${t('apprendre_court')}</span></a>
        </div></section>
    </div>`;
  const q = el.querySelector('#q');
  const maj = () => {
    const actif = recherche.trim() !== '';
    el.querySelector('#resultats').innerHTML = actif ? listeImpots(impots, recherche) : '';
    el.querySelector('#hors-recherche').hidden = actif;
  };
  q.addEventListener('input', () => { recherche = q.value; maj(); });
  maj();
}
