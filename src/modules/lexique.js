// Lexique (#/lexique) : termes des fiches expliqués simplement, avec l'article du Code quand il existe (data/lexique.json).
import { t, tr, esc, art } from '../ui.js';
import { normaliser } from '../recherche.js';
import { etatVide } from '../composants.js';
import { composition } from '../bauhaus.js';

let filtre = '';

export function monter(el, { lexique }) {
  const tries = () => [...lexique].sort((a, b) => tr(a.terme).localeCompare(tr(b.terme), 'fr'));
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('lexique')}</h2><p class="lead">${t('lexique_court')}</p></header>
    <label class="search"><span class="sr">${t('lexique_recherche')}</span>
      <input id="lx-q" type="search" placeholder="${esc(t('lexique_recherche'))}" value="${esc(filtre)}" autocomplete="off"></label>
    <dl class="lexique" id="lx-liste"></dl>`;
  const maj = () => {
    const q = normaliser(filtre);
    const termes = tries().filter(x => !q || normaliser(tr(x.terme) + ' ' + tr(x.definition)).includes(q));
    el.querySelector('#lx-liste').innerHTML = termes.length
      ? termes.map(x => `<div class="terme" id="terme-${x.id}"><dt>${esc(tr(x.terme))}</dt><dd>${esc(tr(x.definition))}${x.article ? art(x.article) : `<small class="art art--vide">${t('lexique_sans_article')}</small>`}</dd></div>`).join('')
      : etatVide({ message: t('aucun_terme'), action: { libelle: t('effacer_recherche'), attrs: 'data-effacer' } }, composition('vide'));
  };
  const q = el.querySelector('#lx-q');
  q.addEventListener('input', () => { filtre = q.value; maj(); });
  el.addEventListener('click', e => { if (e.target.closest('[data-effacer]')) { filtre = ''; q.value = ''; maj(); q.focus(); } });
  maj();
}
