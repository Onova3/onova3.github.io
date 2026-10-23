// Onglet Apprendre (#/apprendre) : guides, sanctions, quiz ; le lexique arrive à l'étape 4.
import { lienModule } from '../routes.js';
import { t } from '../ui.js';

export function monter(el) {
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('nav_apprendre')}</h2><p class="lead">${t('apprendre_lead')}</p></header>
    <div class="profils">
      <a class="profil" href="${lienModule('guides')}"><b>${t('module_guides')}</b><span>${t('guides_court')}</span></a>
      <a class="profil" href="${lienModule('sanctions')}"><b>${t('module_sanctions')}</b><span>${t('sanctions_court')}</span></a>
      <a class="profil" href="${lienModule('quiz')}"><b>${t('module_quiz')}</b><span>${t('quiz_court')}</span></a>
      <a class="profil" href="${lienModule('lexique')}"><b>${t('lexique')}</b><span>${t('lexique_court')}</span></a>
    </div>`;
}
