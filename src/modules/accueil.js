// Onglet Accueil (#/) : langue, recherche par mots courants, prochaine échéance, raccourcis par profil,
// favoris, fiches consultées récemment et liste des impôts.
import { calendrier } from '../calendrier.js';
import { lien, lienModule } from '../routes.js';
import { t, tr, esc, art } from '../ui.js';
import { listeImpots } from './impots.js';
import { nomMois } from './calendrier.js';
import { etatVide } from '../composants.js';
import { composition } from '../bauhaus.js';
import { FICHES } from '../fiches/index.js';

const LANGUES = [['fr', 'FR'], ['en', 'EN'], ['mg', 'MG']];
/** Raccourcis : chacun mène à un écran existant (fiche, calendrier filtré ou onglet Apprendre). */
const RACCOURCIS = [
  { id: 'salarie', href: '#/irsa/calculer' },
  { id: 'commercant', href: lienModule('calendrier', 'entrepreneur') },
  { id: 'proprietaire', href: lienModule('calendrier', 'proprietaire') },
  { id: 'etudiant', href: lienModule('apprendre') },
];
let recherche = '';

function prochaineEcheance(impots, obligations) {
  const verifies = impots.filter(i => i.statut === 'verifie');
  const [e] = calendrier({ obligations, impots: verifies, depuis: new Date().toISOString().slice(0, 10), mois: 12 });
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

const ligneFiche = i => `<li><a class="impot dispo" href="${lien(i.id)}"><span class="sigle">${esc(i.sigle)}</span>
  <span class="nom">${esc(tr(i.nom))}<small>CDI · ${esc(i.refCDI)}</small></span><span class="fleche" aria-hidden="true">→</span></a></li>`;

function favoris(impots, memoire) {
  const liste = memoire.favoris().map(id => impots.find(i => i.id === id)).filter(i => i && FICHES[i.id]);
  return `<section><h2>${t('favoris')}</h2>${liste.length
    ? `<ul class="impots">${liste.map(ligneFiche).join('')}</ul>`
    : etatVide({ message: t('aucun_favori'), action: { libelle: t('tous_impots'), href: lienModule('impots') } }, composition('vide'))}</section>`;
}

function recents(impots, memoire) {
  const liste = memoire.recents().map(id => impots.find(i => i.id === id)).filter(i => i && FICHES[i.id]);
  return liste.length ? `<section><h2>${t('recents')}</h2><ul class="impots">${liste.map(ligneFiche).join('')}</ul></section>` : '';
}

export function monter(el, { impots, obligations, motsCourants, reglages, memoire }) {
  const langue = reglages.lire('lang');
  el.innerHTML = `
    <div class="accueil-langue"><div class="seg seg3" role="group" aria-label="${esc(t('reglage_langue'))}">${LANGUES.map(([code, nom]) =>
      `<button type="button" data-lang="${code}" aria-pressed="${code === langue}" lang="${code}">${nom}</button>`).join('')}</div></div>
    <label class="search"><span class="sr">${t('recherche_courante')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche_courante'))}" value="${esc(recherche)}" autocomplete="off"></label>
    <div id="resultats"></div>
    <div id="hors-recherche">
      ${prochaineEcheance(impots, obligations)}
      <section><h2>${t('par_profil')}</h2>
        <div class="profils">${RACCOURCIS.map(r => `<a class="profil profil--simple" href="${r.href}"><b>${t('raccourci_' + r.id)}</b></a>`).join('')}</div>
        <a class="tous-profils" href="${lienModule('calendrier')}">${t('tous_profils')} →</a></section>
      ${recents(impots, memoire)}
      ${favoris(impots, memoire)}
      ${listeImpots(impots, '')}
    </div>`;
  el.querySelectorAll('[data-lang]').forEach(bt => bt.addEventListener('click', () => reglages.changer('lang', bt.dataset.lang)));
  const q = el.querySelector('#q');
  const maj = () => {
    const actif = recherche.trim() !== '';
    el.querySelector('#resultats').innerHTML = actif ? listeImpots(impots, recherche, motsCourants) : '';
    el.querySelector('#hors-recherche').hidden = actif;
  };
  q.addEventListener('input', () => { recherche = q.value; maj(); });
  el.addEventListener('click', e => { if (e.target.closest('[data-effacer]')) { recherche = ''; q.value = ''; maj(); q.focus(); } });
  maj();
}
