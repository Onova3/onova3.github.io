// Onglet Plus (#/plus) : réglages mémorisés (langue, thème, taille du texte), sources, à propos (#/plus/a-propos).
import { lienModule } from '../routes.js';
import { PREFERENCES } from '../stockage.js';
import { VERSION } from '../version.js';
import { t } from '../ui.js';

const LIBELLES_LANG = { fr: 'Français', en: 'English', mg: 'Malagasy' };
const dateLisible = iso => { const [a, m, j] = iso.split('-'); return `${j}/${m}/${a}`; };

function choix(cle, actuel, libelle) {
  const id = `reg-${cle}`;
  return `<div class="reglage" role="group" aria-labelledby="${id}">
    <span class="f" id="${id}">${t(cle === 'lang' ? 'reglage_langue' : 'reglage_' + cle)}</span>
    <div class="seg seg3">${PREFERENCES[cle].valeurs.map(v =>
      `<button type="button" data-reglage="${cle}" data-valeur="${v}" aria-pressed="${v === actuel}">${libelle(v)}</button>`).join('')}</div>
  </div>`;
}

function aPropos(el) {
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('a_propos')}</h2></header>
    <div class="ticket"><div class="t-head"><span>Hetrako</span><span>v${VERSION}</span></div>
      <div class="rows">
        <div class="row"><span>${t('version')}</span><span>${VERSION}</span></div>
      </div>
      <p class="lead" style="margin-top:14px">${t('tagline')}</p>
      <p class="aide">${t('pied')}</p>
      <p class="aide">${t('a_propos_relire')}</p>
    </div>`;
}

export function monter(el, { b, sous, reglages }) {
  if (sous === 'a-propos') return aPropos(el);
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('nav_plus')}</h2></header>
    <section class="card">
      <h3>${t('reglages')}</h3>
      ${choix('lang', reglages.lire('lang'), v => LIBELLES_LANG[v])}
      ${choix('theme', reglages.lire('theme'), v => t('theme_' + v))}
      ${choix('taille', reglages.lire('taille'), v => t('taille_' + v))}
      ${reglages.memorise ? '' : `<p class="aide">${t('stockage_indisponible')}</p>`}
    </section>
    <ul class="menu">
      <li><a href="${lienModule('sources')}"><b>${t('module_sources')}</b><span>${t('maj_baremes')} ${dateLisible(b.misAJour)}</span></a></li>
      <li><button type="button" id="revoir"><b>${t('revoir_presentation')}</b><span>${t('revoir_court')}</span></button></li>
      <li><a href="${lienModule('plus', 'a-propos')}"><b>${t('a_propos')}</b><span>${t('version')} ${VERSION}</span></a></li>
    </ul>`;
  el.querySelector('#revoir').addEventListener('click', () => reglages.revoirPresentation());
  el.querySelectorAll('[data-reglage]').forEach(bt => bt.addEventListener('click', () => {
    reglages.changer(bt.dataset.reglage, bt.dataset.valeur);
  }));
}
