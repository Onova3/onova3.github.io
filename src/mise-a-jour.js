// Application installable et hors ligne : enregistrement du service worker (sw.js), bandeau « Nouvelle version disponible »
// et bouton « Installer l'application » quand le navigateur le permet.

/** Une nouvelle version attend si un service worker est installé alors qu'un autre contrôle déjà la page. Fonction pure. */
export const nouvelleVersionEnAttente = ({ enAttente, controleur }) => Boolean(enAttente && controleur);

/**
 * @param {{ surNouvelleVersion: (activer: () => void) => void }} o
 */
export function surveillerVersions({ surNouvelleVersion }) {
  if (!('serviceWorker' in navigator)) return;
  let rechargement = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (rechargement) return;
    rechargement = true;
    location.reload();
  });
  const proposer = reg => {
    if (!nouvelleVersionEnAttente({ enAttente: reg.waiting, controleur: navigator.serviceWorker.controller })) return;
    surNouvelleVersion(() => reg.waiting?.postMessage('activer'));
  };
  navigator.serviceWorker.register('sw.js').then(reg => {
    proposer(reg);
    reg.addEventListener('updatefound', () => {
      const nouveau = reg.installing;
      nouveau?.addEventListener('statechange', () => { if (nouveau.state === 'installed') proposer(reg); });
    });
    // Vérifie s'il existe une nouvelle version au retour sur l'application.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
}

// Installation : le navigateur annonce qu'il sait installer l'application (Chrome et Edge sur Android et ordinateur).
let invitation = null;
const abonnes = new Set();
const prevenir = () => abonnes.forEach(f => f(Boolean(invitation)));
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); invitation = e; prevenir(); });
  window.addEventListener('appinstalled', () => { invitation = null; prevenir(); });
}

export const installationPossible = () => Boolean(invitation);
/** Appelle f(true|false) chaque fois que l'installation devient possible ou impossible. */
export const surInstallation = f => { abonnes.add(f); return () => abonnes.delete(f); };
/** @returns {Promise<'accepted'|'dismissed'|'indisponible'>} */
export async function installer() {
  if (!invitation) return 'indisponible';
  const e = invitation;
  invitation = null;
  e.prompt();
  const { outcome } = await e.userChoice;
  prevenir();
  return outcome;
}
/** Déjà ouverte comme application installée (plein écran, sans barre d'adresse). */
export const dejaInstallee = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
