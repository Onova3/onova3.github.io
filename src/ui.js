// Outils d'affichage partagés : langue, formats, briques HTML du ticket « avis d'imposition ».
export const etat = { lang: 'fr', textes: {} };

export const t = (k, vars) => fmt(etat.textes[k] ?? k, vars);
/** Texte trilingue { fr, en, mg } → texte dans la langue choisie. */
export const tr = o => (o && typeof o === 'object' ? o[etat.lang] ?? o.fr : o ?? '');
export const fmt = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

const LOC = { fr: 'fr-FR', en: 'en-US', mg: 'fr-FR' };
export const nombre = n => Math.round(n).toLocaleString(LOC[etat.lang]).replace(/[  ]/g, ' ');
export const ar = n => nombre(n) + ' Ar';
export const pct = (n, d = 1) => (n * 100).toLocaleString(LOC[etat.lang], { maximumFractionDigits: d }) + ' %';
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export const art = a => (a ? `<small class="art">${esc(a)}</small>` : '');
export const ligne = (libelle, montant, article = '', cls = '') =>
  `<div class="row ${cls}"><span>${libelle}${art(article)}</span><span>${montant}</span></div>`;
export const puce = (k, v) => `<span class="chip"><b>${k}</b>${v}</span>`;

export const champMontant = (id, libelle, valeur) =>
  `<label class="f"><span>${libelle}</span><span class="in"><input type="text" inputmode="numeric" class="money" id="${id}" value="${nombre(valeur)}"><span class="u">Ar</span></span></label>`;
export const champCompteur = (id, libelle, valeur, min, max) =>
  `<div class="f"><span id="${id}-l">${libelle}</span><div class="step">
    <button type="button" data-pas="-1" data-cible="${id}" aria-label="−">−</button>
    <input type="number" id="${id}" min="${min}" max="${max}" value="${valeur}" aria-labelledby="${id}-l">
    <button type="button" data-pas="1" data-cible="${id}" aria-label="+">+</button></div></div>`;
export const lireMontant = el => Number(String(el.value).replace(/\D/g, '')) || 0;

/**
 * Champ « taux ou tarif voté par ma commune » (impôts locaux).
 * Affiche la règle légale (fourchette, plafond ou absence de borne) et un avertissement si la saisie en sort.
 * @param {object} o { id, libelle, valeur, min = null, max = null, unite = 'Ar', article, regle }
 */
export function champCommunal({ id, libelle, valeur, min = null, max = null, unite = 'Ar', article, regle }) {
  return `<div class="f communal" data-min="${min ?? ''}" data-max="${max ?? ''}">
    <span>${libelle}</span>
    <span class="in"><input type="text" inputmode="numeric" class="money" id="${id}" value="${nombre(valeur)}"><span class="u">${unite}</span></span>
    <span class="aide">${regle}${article ? `<small class="art">${esc(article)}</small>` : ''}</span>
    <span class="warn" id="${id}-hors" hidden></span></div>`;
}

/** Contrôle d'un champ communal : renvoie la valeur lue et affiche l'avertissement si elle sort de la fourchette légale. */
export function lireCommunal(racine, id) {
  const input = racine.querySelector('#' + id), bloc = input.closest('.communal'), v = lireMontant(input);
  const min = bloc.dataset.min === '' ? null : Number(bloc.dataset.min), max = bloc.dataset.max === '' ? null : Number(bloc.dataset.max);
  const hors = (min !== null && v < min) || (max !== null && v > max);
  const avis = racine.querySelector(`#${id}-hors`);
  avis.hidden = !hors;
  avis.textContent = hors ? t('hors_fourchette') : '';
  return v;
}
export const lireEntier = (el, min, max) => Math.max(min, Math.min(max, Math.floor(Number(el.value)) || 0));

/** Branche les champs d'un conteneur : recalcul à chaque saisie, mise en forme des montants, compteurs +/−. */
export function brancher(racine, recalculer) {
  racine.querySelectorAll('input, select').forEach(i => { i.addEventListener('input', recalculer); i.addEventListener('change', recalculer); });
  racine.querySelectorAll('input.money').forEach(i => {
    i.addEventListener('focus', () => { i.value = String(lireMontant(i) || ''); });
    i.addEventListener('blur', () => { i.value = nombre(lireMontant(i)); });
  });
  racine.querySelectorAll('[data-pas]').forEach(b => b.addEventListener('click', () => {
    const i = racine.querySelector('#' + b.dataset.cible);
    i.value = lireEntier({ value: Number(i.value) + Number(b.dataset.pas) }, Number(i.min), Number(i.max));
    recalculer();
  }));
}
