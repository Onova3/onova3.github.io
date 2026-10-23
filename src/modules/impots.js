// Onglet Impôts (#/impots) : les 29 impôts par catégorie, avec un filtre. listeImpots sert aussi à la recherche de l'accueil.
import { lien } from '../routes.js';
import { FICHES } from '../fiches/index.js';
import { t, tr, esc } from '../ui.js';

const CATEGORIES = ['revenus', 'enregistrement', 'consommation', 'local'];

/** Impôts dont le sigle ou le nom (dans une des trois langues) contient la recherche. Fonction pure. */
export function filtrerImpots(impots, recherche) {
  const q = recherche.trim().toLowerCase();
  return impots.filter(i => !q || [i.sigle, i.nom.fr, i.nom.en, i.nom.mg].some(s => s.toLowerCase().includes(q)));
}

export function listeImpots(impots, recherche) {
  const garde = new Set(filtrerImpots(impots, recherche));
  return CATEGORIES.map(c => {
    const items = impots.filter(i => i.categorie === c && garde.has(i));
    if (!items.length) return '';
    return `<section><h2>${t('cat_' + c)}</h2><ul class="impots">${items.map(i => {
      const dispo = Boolean(FICHES[i.id]);
      const corps = `<span class="sigle">${esc(i.sigle)}</span>
        <span class="nom">${esc(tr(i.nom))}<small>CDI · ${esc(i.refCDI)}</small></span>
        <span class="statut">${dispo ? t('fiche_dispo') : `${t('statut_' + i.statut)} · ${t('phase')} ${i.phase}`}</span>`;
      return `<li>${dispo ? `<a class="impot dispo" href="${lien(i.id)}">${corps}</a>` : `<div class="impot">${corps}</div>`}</li>`;
    }).join('')}</ul></section>`;
  }).join('') || `<p class="lead">${t('aucun_resultat')}</p>`;
}

let recherche = '';

export function monter(el, { impots }) {
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('nav_impots')}</h2></header>
    <label class="search"><span class="sr">${t('recherche')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche'))}" value="${esc(recherche)}" autocomplete="off"></label>
    <div id="liste"></div>`;
  const q = el.querySelector('#q'), out = el.querySelector('#liste');
  const maj = () => { out.innerHTML = listeImpots(impots, recherche); };
  q.addEventListener('input', () => { recherche = q.value; maj(); });
  maj();
}
