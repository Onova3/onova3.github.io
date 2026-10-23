// Point d'entrée : charge les données, applique les réglages et affiche l'écran demandé par le lien (#/, #/impots, #/irsa/calculer…).
import { etat, t } from './ui.js';
import { lireRoute, ongletBarre, lienRetour } from './routes.js';
import { rendreFiche } from './fiche.js';
import { FICHES } from './fiches/index.js';
import { MODULES_ECRANS } from './modules/index.js';
import { creerStockage } from './stockage.js';
import { themeEffectif, attributTheme, couleurBarre, TAILLES } from './reglages.js';
import { CLE as CLE_BIENVENUE, doitAfficher, marquerAccepte } from './bienvenue.js';
import { ouvrirBienvenue } from './bienvenue-ecran.js';

const LANGUES = ['fr', 'en', 'mg'];
const json = async u => (await fetch(u)).json();

const [inventaire, b, obligations, donneesProfils, donneesGuides, donneesQuiz, ...textes] = await Promise.all([
  json('data/impots.json'), json('data/baremes-2026.json'), json('data/obligations.json'), json('data/profils.json'), json('data/guides.json'), json('data/quiz.json'),
  ...LANGUES.map(l => json(`src/i18n/${l}.json`)),
]);
const impots = inventaire.impots, profils = donneesProfils.profils, guides = donneesGuides.guides, quiz = donneesQuiz.chapitres;
const TEXTES = Object.fromEntries(LANGUES.map((l, i) => [l, textes[i]]));

// Réglages mémorisés (src/stockage.js) : langue, thème, taille du texte.
const stockage = creerStockage();
const sombreSysteme = matchMedia('(prefers-color-scheme: dark)');
function appliquerApparence() {
  const racine = document.documentElement, choix = stockage.preference('theme'), attr = attributTheme(choix);
  if (attr) racine.dataset.theme = attr; else delete racine.dataset.theme;
  racine.style.fontSize = TAILLES[stockage.preference('taille')] + '%';
  document.querySelectorAll('meta[name=theme-color]').forEach(m => m.remove());
  const meta = Object.assign(document.createElement('meta'), { name: 'theme-color', content: couleurBarre(themeEffectif(choix, sombreSysteme.matches)) });
  document.head.append(meta);
}
const reglages = {
  memorise: stockage.disponible,
  lire: cle => stockage.preference(cle),
  changer(cle, valeur) {
    if (!stockage.choisir(cle, valeur)) return;
    if (cle === 'lang') etat.lang = valeur;
    appliquerApparence();
    afficher();
  },
  revoirPresentation: () => presentation(),
};

// Premier lancement (src/bienvenue.js) : langue, présentation, avertissement à accepter.
function presentation() {
  ouvrirBienvenue({ reglages, onFin: () => stockage.ecrireJSON(CLE_BIENVENUE, marquerAccepte(new Date().toISOString().slice(0, 10))) });
}
etat.lang = stockage.preference('lang');
appliquerApparence();
sombreSysteme.addEventListener('change', appliquerApparence);

const contenu = document.getElementById('contenu');
const retour = document.getElementById('retour');
let routePrecedente = null;

function afficher() {
  etat.textes = TEXTES[etat.lang];
  document.documentElement.lang = etat.lang;
  document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-label]').forEach(e => e.setAttribute('aria-label', t(e.dataset.i18nLabel)));
  document.getElementById('relire').hidden = etat.lang !== 'mg';

  const r = lireRoute(location.hash);
  const onglet = ongletBarre(r);
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === onglet) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });

  // Flèche de retour pour les écrans ouverts par-dessus un onglet (fiches, guides, quiz…).
  const versRetour = lienRetour(r);
  retour.hidden = !versRetour;
  if (versRetour) retour.innerHTML = `<a href="${versRetour}" aria-label="${t('retour_court')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg><span>${t('retour_court')}</span></a>`;

  const cle = `${r.page}/${r.id ?? ''}/${r.sous ?? ''}`;
  const nouvelEcran = cle !== routePrecedente?.cle;
  if (nouvelEcran && r.id !== routePrecedente?.id) window.scrollTo(0, 0);
  contenu.classList.toggle('dessus', r.page === 'fiche' && routePrecedente?.page !== 'fiche' && nouvelEcran);
  routePrecedente = { cle, id: r.id, page: r.page };

  const impot = r.page === 'fiche' ? impots.find(i => i.id === r.id) : null;
  const ctx = { impots, obligations, profils, guides, quiz, b, sous: r.sous ?? null, reglages };
  if (impot && FICHES[r.id]) {
    rendreFiche(contenu, { fiche: FICHES[r.id], impot, onglet: r.onglet, b, obligations });
    document.title = `${impot.sigle} · Kajy Hetra`;
  } else if (r.page === 'module' && MODULES_ECRANS[r.id]) {
    MODULES_ECRANS[r.id].monter(contenu, ctx);
    document.title = `${t('module_' + r.id)} · Kajy Hetra`;
  } else if (r.page === 'fiche') {
    contenu.innerHTML = `<p class="lead">${t('introuvable')}</p>`;
  } else {
    MODULES_ECRANS.accueil.monter(contenu, ctx);
    document.title = 'Kajy Hetra';
  }
}

window.addEventListener('hashchange', afficher);

// Application installable et utilisable hors ligne (sw.js).
const horsLigne = () => { document.getElementById('hors-ligne').hidden = navigator.onLine; };
window.addEventListener('online', horsLigne);
window.addEventListener('offline', horsLigne);
horsLigne();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
afficher();
document.getElementById('demarrage')?.remove();
if (doitAfficher(stockage.lireJSON(CLE_BIENVENUE, null))) presentation();
