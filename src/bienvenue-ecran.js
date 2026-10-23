// Affichage du premier lancement par-dessus l'application (logique dans src/bienvenue.js). Textes malgaches à relire.
import { avancer, DIAPOSITIVES } from './bienvenue.js';
import { t } from './ui.js';
import { logoHTML } from './logo.js';

const LANGUES = [['fr', 'Français'], ['en', 'English'], ['mg', 'Malagasy']];
const ICONES = {
  calculer: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11v6M8 15h2M12 15h2"/>',
  comprendre: '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>',
  horsLigne: '<path d="M3 9a14 14 0 0 1 18 0M6.5 12.5a9 9 0 0 1 11 0M10 16a4 4 0 0 1 4 0"/><circle cx="12" cy="19" r="1"/>',
};
const icone = id => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[id]}</svg>`;

/**
 * Ouvre le parcours. L'application derrière devient inactive (inert) jusqu'à l'acceptation.
 * @param {{ reglages, onFin: () => void }} options
 */
export function ouvrirBienvenue({ reglages, onFin }) {
  const fond = [document.querySelector('.wrap'), document.getElementById('barre')];
  fond.forEach(e => { e.inert = true; });
  const boite = document.createElement('div');
  boite.className = 'bienvenue';
  boite.setAttribute('role', 'dialog');
  boite.setAttribute('aria-modal', 'true');
  boite.setAttribute('aria-labelledby', 'bv-titre');
  document.body.append(boite);
  let etat = { etape: 'langue', diapo: 0 };

  const fermer = () => { boite.remove(); fond.forEach(e => { e.inert = false; }); onFin(); };

  function rendre() {
    if (etat.etape === 'fin') return fermer();
    const corps = { langue, presentation, avertissement }[etat.etape]();
    boite.innerHTML = `<div class="bv-carte">${corps}</div>`;
    brancher();
    (boite.querySelector('[data-focus]') ?? boite.querySelector('button'))?.focus();
  }

  const langue = () => `
    <div class="bv-logo">${logoHTML({ empile: true, taille: 80 })}</div>
    <h2 id="bv-titre">${t('bv_langue_titre')}</h2>
    <p class="lead">Fidio ny fiteny · Choose your language</p>
    <div class="bv-langues">${LANGUES.map(([code, nom]) =>
      `<button type="button" class="bv-langue" data-lang="${code}" aria-pressed="${reglages.lire('lang') === code}" ${reglages.lire('lang') === code ? 'data-focus' : ''}>${nom}</button>`).join('')}</div>
    <button type="button" class="bouton bv-principal" data-action="suivant">${t('bv_continuer')}</button>`;

  const presentation = () => `
    <div class="bv-haut"><span class="sr" id="bv-titre">${t('bv_presentation')}</span>
      <button type="button" class="bv-passer" data-action="passer">${t('bv_passer')}</button></div>
    <div class="bv-diapos" tabindex="-1">${DIAPOSITIVES.map((d, i) => `
      <section class="bv-diapo" aria-roledescription="${t('bv_diapo')}" aria-label="${i + 1} / ${DIAPOSITIVES.length}">
        <div class="bv-icone">${icone(d)}</div>
        <h2>${t('bv_' + d + '_titre')}</h2><p class="lead">${t('bv_' + d + '_texte')}</p>
      </section>`).join('')}</div>
    <div class="bv-points" aria-hidden="true">${DIAPOSITIVES.map((d, i) => `<span class="${i === etat.diapo ? 'on' : ''}"></span>`).join('')}</div>
    <button type="button" class="bouton bv-principal" data-action="suivant" data-focus>${t('bv_suivant')}</button>`;

  const avertissement = () => `
    <div class="bv-icone bv-alerte"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 20h20zM12 10v4M12 17v.5"/></svg></div>
    <h2 id="bv-titre">${t('bv_avert_titre')}</h2>
    <p class="lead">${t('bv_avert_texte')}</p>
    <label class="check bv-accord"><input type="checkbox" id="bv-ok" data-focus><span>${t('bv_avert_accord')}</span></label>
    <button type="button" class="bouton bv-principal" data-action="accepter" disabled>${t('bv_commencer')}</button>`;

  function brancher() {
    boite.querySelectorAll('[data-lang]').forEach(bt => bt.addEventListener('click', () => {
      reglages.changer('lang', bt.dataset.lang);
      rendre();
    }));
    const ok = boite.querySelector('#bv-ok');
    if (ok) ok.addEventListener('change', () => { boite.querySelector('[data-action=accepter]').disabled = !ok.checked; });
    const diapos = boite.querySelector('.bv-diapos');
    if (diapos) {
      diapos.scrollLeft = etat.diapo * diapos.clientWidth;
      diapos.addEventListener('scroll', () => {
        const i = Math.round(diapos.scrollLeft / diapos.clientWidth);
        if (i === etat.diapo) return;
        etat = { ...etat, diapo: i };
        boite.querySelectorAll('.bv-points span').forEach((s, j) => s.classList.toggle('on', j === i));
      }, { passive: true });
    }
    boite.querySelectorAll('[data-action]').forEach(bt => bt.addEventListener('click', () => {
      const suivant = avancer(etat, bt.dataset.action);
      if (suivant.etape === 'presentation' && etat.etape === 'presentation' && diapos) {
        etat = suivant;
        diapos.scrollTo({ left: etat.diapo * diapos.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        boite.querySelectorAll('.bv-points span').forEach((s, j) => s.classList.toggle('on', j === etat.diapo));
        return;
      }
      etat = suivant;
      rendre();
    }));
  }

  rendre();
}
