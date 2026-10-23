// États des écrans, réutilisables partout : chargement, erreur, confirmation (l'état vide est etatVide dans src/composants.js,
// le bandeau hors connexion est dans index.html). Styles dans src/style.css.
import { esc } from './ui.js';

/** Chargement : blocs gris animés plutôt qu'une page blanche. Animation coupée si le téléphone le demande. */
export function squelette({ lignes = 6 } = {}) {
  const blocs = Array.from({ length: lignes }, (_, i) => `<span class="sq-ligne" style="width:${[100, 82, 94, 68, 88, 74][i % 6]}%"></span>`).join('');
  return `<div class="squelette" aria-busy="true"><span class="sq-titre"></span><span class="sq-bloc"></span>${blocs}</div>`;
}

/** Erreur : un message clair et un bouton « Réessayer » (data-reessayer). */
export function etatErreur({ titre, message, reessayer }) {
  return `<div class="etat-erreur" role="alert">
    <span class="etat-erreur-signe" aria-hidden="true">!</span>
    <p class="titre-vide">${esc(titre)}</p><p>${esc(message)}</p>
    <button type="button" class="bouton" data-reessayer>${esc(reessayer)}</button></div>`;
}

/** Textes de l'erreur de démarrage, disponibles même si les fichiers de langue n'ont pas pu être chargés. */
export const ERREUR_DEMARRAGE = {
  fr: { titre: 'Impossible de charger les barèmes', message: 'Les données de l’application n’ont pas pu être lues. Vérifiez la connexion pour une première ouverture, puis réessayez.', reessayer: 'Réessayer' },
  en: { titre: 'Unable to load the rates', message: 'The application data could not be read. Check your connection if this is the first opening, then try again.', reessayer: 'Try again' },
  mg: { titre: 'Tsy voaray ny taha', message: 'Tsy voavaky ny angon-drakitry ny fampiharana. Hamarino ny tambajotra raha fanokafana voalohany, ary andramo indray.', reessayer: 'Andramo indray' },
};

/** Durée d'affichage d'une confirmation, plus longue pour un message long (de 2,5 à 6 secondes). */
export const dureeConfirmation = message => Math.min(6000, Math.max(2500, 1500 + String(message).length * 50));

let minuteur = null;
/** Confirmation : petit message temporaire en bas de l'écran, lu par les lecteurs d'écran. */
export function confirmer(message) {
  let zone = document.getElementById('confirmation');
  if (!zone) {
    zone = Object.assign(document.createElement('div'), { id: 'confirmation', className: 'confirmation' });
    zone.setAttribute('role', 'status');
    zone.setAttribute('aria-live', 'polite');
    document.body.append(zone);
  }
  zone.textContent = message;
  zone.classList.add('visible');
  clearTimeout(minuteur);
  minuteur = setTimeout(() => zone.classList.remove('visible'), dureeConfirmation(message));
}
