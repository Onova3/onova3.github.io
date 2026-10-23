// Affichage du premier lancement par-dessus l'application (logique dans src/bienvenue.js). Textes malgaches à relire.
import { avancer, DIAPOSITIVES } from './bienvenue.js';
import { t } from './ui.js';
import { logoHTML } from './logo.js';
import { composition } from './bauhaus.js';

const LANGUES = [['fr', 'Français'], ['en', 'English'], ['mg', 'Malagasy']];

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
    boite.innerHTML = `<div class="bv-carte${etat.etape === 'presentation' ? ' bv-carte--presentation' : ''}">${corps}</div>`;
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

  // Chaque écran a sa composition Bauhaus dans la moitié haute ; en bas : 1 / 3, titre, texte, Passer et Suivant.
  const presentation = () => `
    <span class="sr" id="bv-titre">${t('bv_presentation')}</span>
    <div class="bv-diapos" tabindex="-1">${DIAPOSITIVES.map((d, i) => `
      <section class="bv-diapo" aria-roledescription="${t('bv_diapo')}" aria-label="${i + 1} / ${DIAPOSITIVES.length}">
        ${composition(d)}
        <span class="bv-compteur">${i + 1} / ${DIAPOSITIVES.length}</span>
        <h2>${t('bv_' + d + '_titre')}</h2><p class="lead">${t('bv_' + d + '_texte')}</p>
      </section>`).join('')}</div>
    <div class="bv-actions">
      <button type="button" class="bv-passer" data-action="passer">${t('bv_passer')}</button>
      <button type="button" class="bouton bv-principal" data-action="suivant" data-focus>${t('bv_suivant')}</button>
    </div>`;

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
