// Service worker : garde l'application sur le téléphone pour qu'elle marche sans réseau.
// Changer VERSION à chaque mise en ligne. Un test vérifie que FICHIERS liste tous les fichiers de src/ et data/.
const VERSION = 'kh-0.2.0';
const FICHIERS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icone.svg',
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

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Réponse immédiate depuis le cache, mise à jour en arrière-plan (polices et PDF compris, gardés après la première visite).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const enCache = await cache.match(e.request, { ignoreSearch: true });
    const reseau = fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque') cache.put(e.request, r.clone());
      return r;
    }).catch(() => enCache);
    return enCache || reseau;
  }));
});
