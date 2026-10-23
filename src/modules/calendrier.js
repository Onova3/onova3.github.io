// Module Calendrier fiscal : échéances des 12 prochains mois, filtrées par profil (#/calendrier/<profil>).
import { calendrier } from '../calendrier.js';
import { lien, lienModule } from '../routes.js';
import { etat, t, tr, esc, art } from '../ui.js';
import { etatVide } from '../composants.js';
import { composition } from '../bauhaus.js';

const MOIS_MG = ['janoary', 'febroary', 'martsa', 'aprily', 'mey', 'jona', 'jolay', 'aogositra', 'septambra', 'oktobra', 'novambra', 'desambra'];
export const nomMois = (a, m) => etat.lang === 'mg' ? `${MOIS_MG[m - 1]} ${a}`
  : new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString(etat.lang === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const aujourdhui = () => new Date().toISOString().slice(0, 10);

export function monter(el, { impots, obligations, profils, sous }) {
  const profil = profils.find(p => p.id === sous) ?? null;
  const termines = impots.filter(i => i.statut === 'verifie');
  const liste = calendrier({ obligations, impots: termines, ids: profil?.impots ?? null, depuis: aujourdhui(), mois: 12 });
  const parMois = new Map();
  for (const e of liste) {
    const cle = e.date.slice(0, 7);
    if (!parMois.has(cle)) parMois.set(cle, []);
    parMois.get(cle).push(e);
  }
  el.innerHTML = `
    <header class="fiche-tete"><h2>${t('module_calendrier')}</h2>
      <p class="lead">${t('calendrier_lead')}</p></header>
    <nav class="tabs" aria-label="${esc(t('par_profil'))}">
      <a class="tab" href="${lienModule('calendrier')}" aria-selected="${!profil}">${t('tous')}</a>
      ${profils.map(p => `<a class="tab" href="${lienModule('calendrier', p.id)}" aria-selected="${p === profil}">${esc(tr(p.libelle))}</a>`).join('')}
    </nav>
    ${profil ? `<p class="aide">${esc(tr(profil.description))}</p>` : ''}
    <div class="calendrier">${parMois.size ? [...parMois].map(([cle, items]) => {
      const [a, m] = cle.split('-').map(Number);
      return `<section class="card mois"><h3>${esc(nomMois(a, m))}${cle === aujourdhui().slice(0, 7) ? ` <span class="eg">${t('ce_mois')}</span>` : ''}</h3>
        <ul class="echeances">${items.map(e => `<li>
          <span class="jour">${Number(e.date.slice(8))}</span>
          <span><a class="sigle" href="${lien(e.id, 'declarer')}">${esc(e.sigle)}</a> ${esc(tr(e.nom))}<br>
            <span class="aide">${esc(tr(e.texte))}</span>${art(e.article)}</span></li>`).join('')}</ul></section>`;
    }).join('') : etatVide({ message: t('aucune_echeance'), action: profil ? { libelle: t('tous'), href: lienModule('calendrier') } : null }, composition('vide'))}</div>
    <p class="aide">${t('calendrier_note')}</p>`;
}
