// Point d'entrée : charge les données, gère la langue et affiche l'accueil ou une fiche selon le lien (#/irsa/calculer).
import { etat, t, tr, esc } from './ui.js';
import { lireRoute, lien } from './routes.js';
import { rendreFiche } from './fiche.js';
import { FICHES } from './fiches/index.js';

const LANGUES = ['fr', 'en', 'mg'];
const CATEGORIES = ['revenus', 'enregistrement', 'consommation', 'local'];
const json = async u => (await fetch(u)).json();

const [inventaire, b, obligations, ...textes] = await Promise.all([
  json('data/impots.json'), json('data/baremes-2026.json'), json('data/obligations.json'),
  ...LANGUES.map(l => json(`src/i18n/${l}.json`)),
]);
const impots = inventaire.impots;
const TEXTES = Object.fromEntries(LANGUES.map((l, i) => [l, textes[i]]));
try { const l = localStorage.getItem('kh-lang'); if (LANGUES.includes(l)) etat.lang = l; } catch {}

const contenu = document.getElementById('contenu');
let recherche = '', ficheAffichee = null;

function accueil() {
  contenu.innerHTML = `
    <label class="search"><span class="sr">${t('recherche')}</span>
      <input id="q" type="search" placeholder="${esc(t('recherche'))}" value="${esc(recherche)}"></label>
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

  const r = lireRoute(location.hash);
  const impot = r.page === 'fiche' ? impots.find(i => i.id === r.id) : null;
  if (r.id !== ficheAffichee) window.scrollTo(0, 0);
  ficheAffichee = r.id;
  if (impot && FICHES[r.id]) {
    rendreFiche(contenu, { fiche: FICHES[r.id], impot, onglet: r.onglet, b, obligations });
    document.title = `${impot.sigle} · Kajy Hetra`;
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
afficher();
