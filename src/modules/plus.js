// Onglet Plus (#/plus) : réglages mémorisés (langue, thème, taille du texte), historique des calculs (#/plus/historique),
// sources, signaler une erreur, à propos (#/plus/a-propos).
import { lienModule } from '../routes.js';
import { PREFERENCES } from '../stockage.js';
import { VERSION } from '../version.js';
import { t, esc, etat } from '../ui.js';
import { lien } from '../routes.js';
import { etatVide } from '../composants.js';
import { composition } from '../bauhaus.js';
import { confirmer } from '../etats.js';
import { lienSignalement } from '../signaler.js';

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

const dateHeure = iso => new Date(iso).toLocaleString(etat.lang === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Historique des 20 derniers calculs : chaque ligne rouvre la fiche avec ses valeurs. */
function historique(el, memoire) {
  const liste = memoire.historique();
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('historique')}</h2><p class="lead">${t('historique_lead')}</p></header>
    ${liste.length ? `<ul class="impots">${liste.map((h, i) => `<li><a class="impot dispo" href="${lien(h.fiche, 'calculer')}" data-h="${i}">
        <span class="sigle">${esc(h.sigle)}</span>
        <span class="nom">${esc(h.total)}<small>${esc(h.libelle)} · ${esc(dateHeure(h.date))}</small></span>
        <span class="fleche" aria-hidden="true">→</span></a></li>`).join('')}</ul>
      <p style="margin-top:24px"><button type="button" class="bouton bouton--secondaire" id="effacer-historique">${t('historique_effacer')}</button></p>`
    : etatVide({ message: t('aucun_calcul'), action: { libelle: t('tous_impots'), href: lienModule('impots') } }, composition('vide'))}`;
  el.querySelectorAll('[data-h]').forEach(a => a.addEventListener('click', () => memoire.preparerRestauration(liste[Number(a.dataset.h)])));
  el.querySelector('#effacer-historique')?.addEventListener('click', () => { memoire.effacerHistorique(); historique(el, memoire); confirmer(t('historique_efface')); });
}

const signalementGeneral = () => lienSignalement({
  sujet: `Hetrako — ${t('signaler_erreur')}`,
  lignes: [t('signaler_corps'), '', '', '—', location.href, `Hetrako ${VERSION} · ${document.documentElement.lang}`],
});

export function monter(el, { b, sous, reglages, memoire }) {
  if (sous === 'a-propos') return aPropos(el);
  if (sous === 'historique') return historique(el, memoire);
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
      <li><a href="${lienModule('plus', 'historique')}"><b>${t('historique')}</b><span>${t('historique_court', { n: memoire.historique().length })}</span></a></li>
      <li><a href="${lienModule('sources')}"><b>${t('module_sources')}</b><span>${t('maj_baremes')} ${dateLisible(b.misAJour)}</span></a></li>
      <li><button type="button" id="revoir"><b>${t('revoir_presentation')}</b><span>${t('revoir_court')}</span></button></li>
      <li><a href="${signalementGeneral()}"><b>${t('signaler_erreur')}</b><span>${t('signaler_court')}</span></a></li>
      <li><a href="${lienModule('plus', 'a-propos')}"><b>${t('a_propos')}</b><span>${t('version')} ${VERSION}</span></a></li>
    </ul>`;
  el.querySelector('#revoir').addEventListener('click', () => reglages.revoirPresentation());
  el.querySelectorAll('[data-reglage]').forEach(bt => bt.addEventListener('click', () => {
    reglages.changer(bt.dataset.reglage, bt.dataset.valeur);
  }));
}
