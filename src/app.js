// Point d'entrée : charge les données, gère la langue et affiche l'accueil, une fiche (#/irsa/calculer) ou un module (#/calendrier).
import { etat, t, tr, esc } from './ui.js';
import { lireRoute, lien, lienModule } from './routes.js';
import { rendreFiche } from './fiche.js';
import { FICHES } from './fiches/index.js';
import { MODULES_ECRANS } from './modules/index.js';

const LANGUES = ['fr', 'en', 'mg'];
const CATEGORIES = ['revenus', 'enregistrement', 'consommation', 'local'];
const json = async u => (await fetch(u)).json();

const [inventaire, b, obligations, donneesProfils, donneesGuides, donneesQuiz, ...textes] = await Promise.all([
  json('data/impots.json'), json('data/baremes-2026.json'), json('data/obligations.json'), json('data/profils.json'), json('data/guides.json'), json('data/quiz.json'),
  ...LANGUES.map(l => json(`src/i18n/${l}.json`)),
]);
const impots = inventaire.impots, profils = donneesProfils.profils, guides = donneesGuides.guides, quiz = donneesQuiz.chapitres;
const TEXTES = Object.fromEntries(LANGUES.map((l, i) => [l, textes[i]]));
try { const l = localStorage.getItem('kh-lang'); if (LANGUES.includes(l)) etat.lang = l; } catch {}

const contenu = document.getElementById('contenu');
let recherche = '', ficheAffichee = null;

function accueil() {
  contenu.innerHTML = `
    <label class="search"><span class="sr">${t('recherche')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche'))}" value="${esc(recherche)}"></label>
    <section><h2>${t('par_profil')}</h2>
      <div class="profils">${profils.map(p => `<a class="profil" href="${lienModule('calendrier', p.id)}">
        <b>${esc(tr(p.libelle))}</b><span>${esc(tr(p.description))}</span></a>`).join('')}</div></section>
    <section><h2>${t('outils')}</h2>
      <div class="profils"><a class="profil dans-barre" href="${lienModule('calendrier')}"><b>${t('module_calendrier')}</b><span>${t('calendrier_court')}</span></a>
        <a class="profil dans-barre" href="${lienModule('sanctions')}"><b>${t('module_sanctions')}</b><span>${t('sanctions_court')}</span></a>
        <a class="profil dans-barre" href="${lienModule('guides')}"><b>${t('module_guides')}</b><span>${t('guides_court')}</span></a>
        <a class="profil dans-barre" href="${lienModule('quiz')}"><b>${t('module_quiz')}</b><span>${t('quiz_court')}</span></a>
        <a class="profil" href="${lienModule('sources')}"><b>${t('module_sources')}</b><span>${t('sources_court')}</span></a></div></section>
    <div id="liste"></div>`;
  const q = contenu.querySelector('#q');
  q.addEventListener('input', () => { recherche = q.value; liste(); });
  liste();
}

function liste() {
  const q = recherche.trim().toLowerCase();
  const garde = i => !q || [i.sigle, i.nom.fr, i.nom.en, i.nom.mg].some(s => s.toLowerCase().includes(q));
  contenu.querySelector('#liste').innerHTML = CATEGORIES.map(c => {
    const items = impots.filter(i => i.categorie === c && garde(i));
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

function afficher() {
  etat.textes = TEXTES[etat.lang];
  document.documentElement.lang = etat.lang;
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach(bt => bt.setAttribute('aria-pressed', bt.dataset.lang === etat.lang));
  document.getElementById('relire').hidden = etat.lang !== 'mg';
  document.querySelectorAll('[data-i18n-label]').forEach(e => e.setAttribute('aria-label', t(e.dataset.i18nLabel)));

  const r = lireRoute(location.hash);
  const actif = r.page === 'module' ? r.id : 'accueil';
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === actif) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const impot = r.page === 'fiche' ? impots.find(i => i.id === r.id) : null;
  if (r.id !== ficheAffichee) window.scrollTo(0, 0);
  ficheAffichee = r.id;
  if (impot && FICHES[r.id]) {
    rendreFiche(contenu, { fiche: FICHES[r.id], impot, onglet: r.onglet, b, obligations });
    document.title = `${impot.sigle} · Kajy Hetra`;
  } else if (r.page === 'module' && MODULES_ECRANS[r.id]) {
    MODULES_ECRANS[r.id].monter(contenu, { impots, obligations, profils, guides, quiz, b, sous: r.sous });
    document.title = `${t('module_' + r.id)} · Kajy Hetra`;
  } else if (r.page === 'fiche') {
    contenu.innerHTML = `<a class="retour" href="#/">${t('retour')}</a><p class="lead">${t('introuvable')}</p>`;
  } else {
    accueil();
    document.title = 'Kajy Hetra';
  }
}

document.querySelectorAll('[data-lang]').forEach(bt => bt.addEventListener('click', () => {
  etat.lang = bt.dataset.lang;
  try { localStorage.setItem('kh-lang', etat.lang); } catch {}
  afficher();
}));
window.addEventListener('hashchange', afficher);

// Application installable et utilisable hors ligne (sw.js).
const horsLigne = () => { document.getElementById('hors-ligne').hidden = navigator.onLine; };
window.addEventListener('online', horsLigne);
window.addEventListener('offline', horsLigne);
horsLigne();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
afficher();
