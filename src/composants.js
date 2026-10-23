// Composants de base du système de design (styles dans src/design.css). Fonctions qui renvoient du HTML,
// et calculs d'affichage purs (largeur des barres par tranche).
import { esc } from './ui.js';

export const bouton = (texte, { variante = '', plein = false, attrs = '' } = {}) =>
  `<button type="button" class="h-btn${variante ? ' h-btn--' + variante : ''}${plein ? ' h-btn--plein' : ''}" ${attrs}>${esc(texte)}</button>`;

export const titreSection = texte => `<h3 class="h-section">${esc(texte)}</h3>`;

export const champ = (id, libelle, valeur = '', unite = '') =>
  `<label class="h-champ"><span>${esc(libelle)}</span><span class="h-saisie"><input type="text" inputmode="numeric" id="${id}" value="${esc(valeur)}">${unite ? `<span class="h-unite">${esc(unite)}</span>` : ''}</span></label>`;

export const compteur = (id, libelle, valeur, min = 0, max = 99) =>
  `<div class="h-champ"><span id="${id}-l">${esc(libelle)}</span><div class="h-compteur">
    <button type="button" data-pas="-1" aria-label="−">−</button>
    <input type="number" id="${id}" min="${min}" max="${max}" value="${valeur}" aria-labelledby="${id}-l">
    <button type="button" data-pas="1" aria-label="+">+</button></div></div>`;

export const caseACocher = (id, libelle, coche = false) =>
  `<label class="h-case"><input type="checkbox" id="${id}"${coche ? ' checked' : ''}><span>${esc(libelle)}</span></label>`;

export const onglets = (items, actif) =>
  `<nav class="h-onglets" role="tablist">${items.map(([id, texte, href]) =>
    `<a role="tab" href="${href}" aria-selected="${id === actif}">${esc(texte)}</a>`).join('')}</nav>`;

export const ligneListe = ({ sigle, nom, detail = '', href = '#' }) =>
  `<li><a class="h-ligne" href="${href}"><span class="h-sigle">${esc(sigle)}</span><span class="h-nom">${esc(nom)}${detail ? `<small>${esc(detail)}</small>` : ''}</span><span class="h-fleche" aria-hidden="true">→</span></a></li>`;

export const pastille = (etiquette, valeur, { alerte = false } = {}) =>
  `<span class="h-pastille${alerte ? ' h-pastille--alerte' : ''}"><b>${esc(etiquette)}</b>${esc(valeur)}</span>`;

/**
 * Largeur (en %) de chaque barre du barème : part de la base imposée dans chaque tranche, rapportée à la plus large.
 * Fonction pure. @param {{de:number, a:number|null}[]} tranches  @param {number} base
 * @returns {number[]} pourcentages de 0 à 100
 */
export function largeursTranches(tranches, base) {
  const parts = tranches.map(({ de, a }) => Math.max(0, Math.min(base, a ?? Infinity) - de));
  const max = Math.max(...parts);
  return parts.map(p => (max > 0 ? Math.round((p / max) * 1000) / 10 : 0));
}

/**
 * Bloc de résultat. @param {{lignes: {libelle, montant, article?}[], tranches?: {libelle, part, montant}[],
 *   libelleTotal, total, pastilles?: string[], mention}} r  montants déjà formatés
 */
export function blocResultat(r) {
  const lignes = r.lignes.map(l => `<div class="h-ligne-calc"><span>${esc(l.libelle)}${l.article ? `<small class="h-article">${esc(l.article)}</small>` : ''}</span><span>${esc(l.montant)}</span></div>`).join('');
  const tranches = r.tranches?.length ? `<div class="h-tranches">${r.tranches.map(t =>
    `<div class="h-tranche"><span>${esc(t.libelle)}</span><span class="h-piste"><span class="h-jauge" style="width:${t.part}%"></span></span><span>${esc(t.montant)}</span></div>`).join('')}</div>` : '';
  return `<section class="h-resultat">${lignes}${tranches}
    <div class="h-double-trait" aria-hidden="true"></div>
    <div class="h-total"><span class="h-etiquette">${esc(r.libelleTotal)}</span><span class="h-montant">${esc(r.total)}</span></div>
    ${r.pastilles?.length ? `<div class="h-pastilles" style="margin-top:16px">${r.pastilles.join('')}</div>` : ''}
    <p class="h-mention">${esc(r.mention)}</p></section>`;
}
