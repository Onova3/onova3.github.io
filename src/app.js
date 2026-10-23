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

import { squelette, etatErreur, ERREUR_DEMARRAGE, confirmer } from './etats.js';
import { creerMemoire } from './memoire.js';
import { surveillerVersions } from './mise-a-jour.js';
import { etatVide } from './composants.js';
import { composition } from './bauhaus.js';

const LANGUES = ['fr', 'en', 'mg'];
const json = async u => { const r = await fetch(u); if (!r.ok) throw new Error(`${u} : ${r.status}`); return r.json(); };

// Données chargées au démarrage (voir demarrer()).
let impots, b, obligations, profils, guides, quiz, motsCourants, lexique, pages, TEXTES;
async function chargerDonnees() {
  const [inventaire, bareme, oblig, donneesProfils, donneesGuides, donneesQuiz, donneesMots, donneesLexique, donneesPages, ...textes] = await Promise.all([
    json('data/impots.json'), json('data/baremes-2026.json'), json('data/obligations.json'), json('data/profils.json'), json('data/guides.json'), json('data/quiz.json'),
    json('data/mots-courants.json'), json('data/lexique.json'), json('data/pages.json'),
    ...LANGUES.map(l => json(`src/i18n/${l}.json`)),
  ]);
  impots = inventaire.impots; b = bareme; obligations = oblig;
  profils = donneesProfils.profils; guides = donneesGuides.guides; quiz = donneesQuiz.chapitres;
  motsCourants = donneesMots.mots; lexique = donneesLexique.termes; pages = donneesPages.pages;
  TEXTES = Object.fromEntries(LANGUES.map((l, i) => [l, textes[i]]));
}

// Réglages mémorisés (src/stockage.js) : langue, thème, taille du texte.
const stockage = creerStockage();
const memoire = creerMemoire(stockage); // favoris, consultations récentes, historique des calculs
const sombreSysteme = matchMedia('(prefers-color-scheme: dark)');
function appliquerApparence() {
  const racine = document.documentElement, choix = stockage.preference('theme');
  racine.dataset.theme = attributTheme(choix, sombreSysteme.matches);
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
    if (!document.querySelector('.bienvenue')) confirmer(t('reglage_enregistre'));
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
  if (!TEXTES) return; // données pas encore chargées
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
  const ctx = { impots, obligations, profils, guides, quiz, motsCourants, lexique, pages, b, sous: r.sous ?? null, reglages, memoire };
  if (impot && FICHES[r.id]) {
    rendreFiche(contenu, { fiche: FICHES[r.id], impot, onglet: r.onglet, b, obligations, memoire });
    document.title = `${impot.sigle} · Hetrako`;
  } else if (r.page === 'module' && MODULES_ECRANS[r.id]) {
    MODULES_ECRANS[r.id].monter(contenu, ctx);
    document.title = `${t('module_' + r.id)} · Hetrako`;
  } else if (r.page === 'fiche') {
    contenu.innerHTML = etatVide({ message: t('introuvable'), action: { libelle: t('tous_impots'), href: '#/impots' } }, composition('vide'));
  } else {
    MODULES_ECRANS.accueil.monter(contenu, ctx);
    document.title = 'Hetrako';
  }
}

window.addEventListener('hashchange', afficher);

// Bandeau discret hors connexion ; petite confirmation quand la connexion revient.
const horsLigne = () => { document.getElementById('hors-ligne').hidden = navigator.onLine; };
window.addEventListener('online', () => { horsLigne(); if (TEXTES) confirmer(t('connexion_retablie')); });
window.addEventListener('offline', horsLigne);
horsLigne();
// Nouvelle version (application ou barèmes) : bandeau avec « Mettre à jour » (src/mise-a-jour.js).
surveillerVersions({ surNouvelleVersion: activer => {
  const bandeau = document.getElementById('maj');
  bandeau.hidden = false;
  document.getElementById('maj-bouton').onclick = () => { bandeau.hidden = true; activer(); };
} });

// Démarrage : blocs gris pendant le chargement, message d'erreur et « Réessayer » si les données ne se lisent pas.
async function demarrer() {
  contenu.innerHTML = squelette();
  try {
    await chargerDonnees();
  } catch (e) {
    document.getElementById('demarrage')?.remove();
    contenu.innerHTML = etatErreur(ERREUR_DEMARRAGE[etat.lang] ?? ERREUR_DEMARRAGE.fr);
    contenu.querySelector('[data-reessayer]').addEventListener('click', demarrer, { once: true });
    contenu.querySelector('[data-reessayer]').focus();
    return;
  }
  afficher();
  document.getElementById('demarrage')?.remove();
  if (doitAfficher(stockage.lireJSON(CLE_BIENVENUE, null))) presentation();
}
demarrer();
