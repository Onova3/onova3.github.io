// Service worker : garde l'application sur le téléphone pour qu'elle marche sans réseau.
// Changer VERSION à chaque mise en ligne, et à chaque changement des barèmes : c'est ce qui déclenche le bandeau « Nouvelle version disponible ». Un test vérifie que FICHIERS liste tous les fichiers de src/ et data/.
const VERSION = 'kh-0.9.2';
// Date de mise à jour des barèmes (data/baremes-2026.json, « misAJour ») : un test oblige à la recopier ici,
// donc tout changement des barèmes produit un nouveau service worker et le bandeau de mise à jour.
const BAREMES = '2026-10-22';
const FICHIERS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'src/logo.js',
  'src/polices.css',
  'src/design.css',
  'src/composants.js',
  'src/contraste.js',
  'src/partage.js',
  'src/bauhaus.js',
  'src/etats.js',
  'src/memoire.js',
  'src/mise-a-jour.js',
  'src/recherche.js',
  'src/signaler.js',
  'src/modules/lexique.js',
  'data/mots-courants.json',
  'data/lexique.json',
  'data/pages.json',
  'assets/polices/archivo-800.woff2',
  'assets/polices/public-sans.woff2',
  'assets/polices/jetbrains-mono.woff2',
  'assets/icones/apple-touch-icon-180.png',
  'assets/icones/favicon.svg',
  'assets/icones/icone-16.png',
  'assets/icones/icone-192.png',
  'assets/icones/icone-32.png',
  'assets/icones/icone-512.png',
  'assets/icones/icone-64.png',
  'assets/icones/icone-maskable-192.png',
  'assets/icones/icone-maskable-512.png',
  'assets/icones/icone-ronde-192.png',
  'assets/icones/icone-ronde-512.png',
  'data/accises-2026.json',
  'data/baremes-2026.json',
  'data/guides.json',
  'data/impots.json',
  'data/obligations.json',
  'data/profils.json',
  'data/quiz.json',
  'src/app.js',
  'src/bienvenue.js',
  'src/bienvenue-ecran.js',
  'src/stockage.js',
  'src/reglages.js',
  'src/version.js',
  'src/modules/accueil.js',
  'src/modules/impots.js',
  'src/modules/apprendre.js',
  'src/modules/plus.js',
  'src/calc/accises.js',
  'src/calc/appareils.js',
  'src/calc/assurance.js',
  'src/calc/de.js',
  'src/calc/eauElec.js',
  'src/calc/eaux.js',
  'src/calc/fetes.js',
  'src/calc/ifpb.js',
  'src/calc/ift.js',
  'src/calc/ipvi.js',
  'src/calc/ir.js',
  'src/calc/ircm.js',
  'src/calc/irm.js',
  'src/calc/irsa.js',
  'src/calc/is.js',
  'src/calc/jeuxTv.js',
  'src/calc/licence.js',
  'src/calc/outils.js',
  'src/calc/penalites.js',
  'src/calc/prelevementAlcools.js',
  'src/calc/publicite.js',
  'src/calc/pylones.js',
  'src/calc/sejour.js',
  'src/calc/taxeSpeciale.js',
  'src/calc/timbre.js',
  'src/calc/tpc.js',
  'src/calc/trd.js',
  'src/calc/ttm.js',
  'src/calc/tva.js',
  'src/calc/tvm.js',
  'src/calendrier.js',
  'src/fiche.js',
  'src/fiches/appareils.js',
  'src/fiches/assurance.js',
  'src/fiches/da.js',
  'src/fiches/de.js',
  'src/fiches/eauElec.js',
  'src/fiches/eaux.js',
  'src/fiches/fetes.js',
  'src/fiches/idh.js',
  'src/fiches/ifpb.js',
  'src/fiches/ift.js',
  'src/fiches/index.js',
  'src/fiches/ipvi.js',
  'src/fiches/ir.js',
  'src/fiches/ircm.js',
  'src/fiches/irm.js',
  'src/fiches/irsa.js',
  'src/fiches/is.js',
  'src/fiches/jeuxTv.js',
  'src/fiches/licence.js',
  'src/fiches/ppa.js',
  'src/fiches/publicite.js',
  'src/fiches/pylones.js',
  'src/fiches/sejour.js',
  'src/fiches/timbre.js',
  'src/fiches/tpc.js',
  'src/fiches/trd.js',
  'src/fiches/tsabtj.js',
  'src/fiches/ttm.js',
  'src/fiches/tva.js',
  'src/fiches/tvm.js',
  'src/i18n/en.json',
  'src/i18n/fr.json',
  'src/i18n/mg.json',
  'src/modules/calendrier.js',
  'src/modules/guides.js',
  'src/modules/index.js',
  'src/modules/quiz.js',
  'src/modules/sanctions.js',
  'src/modules/sources.js',
  'src/prescription.js',
  'src/quiz.js',
  'src/routes.js',
  'src/style.css',
  'src/ui.js',
];

// Installation : tous les fichiers de l'application sont mis en cache. La nouvelle version attend ensuite
// que l'utilisateur touche « Mettre à jour » dans le bandeau « Nouvelle version disponible » (src/mise-a-jour.js).
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION + '-' + BAREMES).then(c => c.addAll(FICHIERS)));
});

self.addEventListener('message', e => {
  if (e.data === 'activer') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== VERSION + '-' + BAREMES).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/** Les PDF des codes ne sont jamais téléchargés ni gardés d'office : ils restent sur le réseau. */
const reseauSeulement = url => /\.pdf$/i.test(new URL(url).pathname);

// Hors connexion : chaque version sert ses propres fichiers depuis le cache ; le réseau ne sert qu'à ce qui manque.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || reseauSeulement(e.request.url)) return;
  e.respondWith(caches.open(VERSION + '-' + BAREMES).then(async cache => {
    const enCache = await cache.match(e.request, { ignoreSearch: true });
    if (enCache) return enCache;
    const r = await fetch(e.request);
    if (r.ok && new URL(e.request.url).origin === self.location.origin) cache.put(e.request, r.clone());
    return r;
  }));
});
