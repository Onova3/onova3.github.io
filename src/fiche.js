// Gabarit commun des fiches impôt : en-tête + 4 onglets (Comprendre, Calculer, Déclarer et payer, Sanctions).
// Le contenu propre à chaque impôt vient de src/fiches/<id>.js ; les obligations du CPF de data/obligations.json.
import { t, tr, fmt, esc, art, ar, pct, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from './ui.js';
import { ONGLETS, lien } from './routes.js';
import { calculPenalites, calculPenalitesLocales } from './calc/penalites.js';
import { texteResultat, lireTicket, partager } from './partage.js';
import { etatVide } from './composants.js';
import { confirmer } from './etats.js';
import { composition } from './bauhaus.js';
import { lireValeurs, remettreValeurs } from './memoire.js';
import { lienSignalement } from './signaler.js';
import { VERSION } from './version.js';

// Les textes peuvent contenir des {variables} (taux, seuils) tirées du barème par fiche.variables(b).
const liste = (items = [], vars = {}) => `<ul class="puces">${items.map(i => `<li>${esc(fmt(tr(i.texte), vars))}${art(i.article)}</li>`).join('')}</ul>`;
const carte = (titre, items, vars) => (items?.length ? `<div class="card"><h3>${titre}</h3>${liste(items, vars)}</div>` : '');

export function rendreFiche(el, { fiche, impot, onglet, b, obligations, memoire }) {
  const favori = memoire.estFavori(fiche.id);
  el.innerHTML = `
    <header class="fiche-tete">
      <div class="fiche-haut">
        <div class="etiquettes"><span class="sigle-g">${esc(impot.sigle)}</span>
          <span class="refs">CDI · ${esc(impot.refCDI)}</span><span class="refs">CPF · ${esc(impot.refCPF ?? '—')}</span></div>
        <button type="button" class="etoile" id="favori" aria-pressed="${favori}" aria-label="${esc(t('favori_ajouter'))}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg></button>
      </div>
      <h2>${esc(tr(impot.nom))}</h2>
    </header>
    <nav class="tabs" role="tablist">${ONGLETS.map(o =>
      `<a class="tab" role="tab" href="${lien(fiche.id, o)}" aria-selected="${o === onglet}">${t('onglet_' + o)}</a>`).join('')}</nav>
    <section class="panel" role="tabpanel" id="panneau"></section>
    <p class="signaler"><a href="${lienSignalement(signalement(impot, onglet))}">${t('signaler_erreur')}</a></p>`;
  memoire.noterConsultation(fiche.id);
  signalerSuite(el.querySelector('nav.tabs'));
  el.querySelector('#favori').addEventListener('click', e => {
    const ajoute = memoire.basculerFavori(fiche.id);
    e.currentTarget.setAttribute('aria-pressed', ajoute);
    confirmer(t(ajoute ? 'favori_ajoute' : 'favori_retire'));
  });
  const panneaux = { comprendre, calculer, declarer, sanctions };
  const panneau = el.querySelector('#panneau');
  if (onglet === 'calculer') {
    // Un calcul rouvert depuis l'historique : on remet d'abord le bon mode (bouton data-mode), puis les valeurs.
    const calcul = memoire.prendreRestauration(fiche.id);
    panneaux.calculer(panneau, fiche, b);
    if (calcul) {
      if (calcul.mode) panneau.querySelector(`[data-mode="${CSS.escape(calcul.mode)}"]`)?.click();
      remettreValeurs(panneau, calcul.valeurs);
    }
    suivreCalculs(panneau, impot, memoire);
  } else panneaux[onglet](panneau, fiche, b, obligations[fiche.id] ?? {});
  completerResultats(panneau, impot);
  // Certains calculateurs se redessinent (changement de mode) : on complète à nouveau leurs résultats.
  new MutationObserver(() => completerResultats(panneau, impot)).observe(panneau, { childList: true });
}

/**
 * Onglets qui ne tiennent pas en largeur : l'onglet actif est amené à l'écran et un dégradé sur le bord
 * indique qu'il reste des onglets à faire glisser (classes suite-gauche et suite-droite).
 */
function signalerSuite(nav) {
  const maj = () => {
    nav.classList.toggle('suite-gauche', nav.scrollLeft > 4);
    nav.classList.toggle('suite-droite', nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
  };
  nav.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  nav.addEventListener('scroll', maj, { passive: true });
  new ResizeObserver(maj).observe(nav);
  maj();
}

const signalement = (impot, onglet) => ({
  sujet: `Hetrako — ${t('signaler_erreur')} : ${impot.sigle} (${t('onglet_' + onglet)})`,
  lignes: [t('signaler_corps'), '', '', '—', `${impot.sigle} · ${tr(impot.nom)}`, location.href, `Hetrako ${VERSION} · ${document.documentElement.lang}`],
});

/** Enregistre le calcul dans l'historique quelques secondes après la dernière saisie de l'utilisateur. */
function suivreCalculs(panneau, impot, memoire) {
  let minuteur = null;
  const noter = () => {
    const ticket = panneau.querySelector('.ticket'), v = ticket?.querySelector('.total .v');
    if (!v) return;
    memoire.noterCalcul({
      fiche: impot.id, sigle: impot.sigle,
      mode: panneau.querySelector('[data-mode][aria-pressed=true]')?.dataset.mode ?? null,
      valeurs: lireValeurs(panneau),
      libelle: ticket.querySelector('.total .k')?.textContent.trim() ?? '', total: v.textContent.trim(),
      date: new Date().toISOString(),
    });
  };
  const planifier = e => { if (!e.isTrusted) return; clearTimeout(minuteur); minuteur = setTimeout(noter, 1500); };
  panneau.addEventListener('input', planifier);
  panneau.addEventListener('change', planifier);
  panneau.addEventListener('click', e => { if (e.target.closest('[data-pas], [data-mode], .produit, .seg button')) planifier(e); });
}

/**
 * Ajoute à chaque résultat (.ticket) l'aperçu du montant sous le formulaire, le bouton « Partager le résultat »
 * et la mention « Estimation pédagogique ». Affichage seulement : aucun calcul n'est modifié.
 */
function completerResultats(panneau, impot) {
  panneau.querySelectorAll('.ticket').forEach((ticket, i) => {
    const v = ticket.querySelector('.total .v');
    if (!v || ticket.dataset.complete) return;
    ticket.dataset.complete = '1';
    if (!ticket.id) ticket.id = 'resultat-' + i;
    ticket.insertAdjacentHTML('beforeend', `<div class="ticket-actions">
      <button type="button" class="bouton bouton--secondaire bouton--plein" data-partager>${t('partager_resultat')}</button>
      <p class="mention">${t('mention_estimation')}</p></div>`);
    const bouton = ticket.querySelector('[data-partager]');
    bouton.addEventListener('click', async () => {
      const { lignes, total } = lireTicket(ticket);
      const issue = await partager(texteResultat({ titre: `${impot.sigle} · ${tr(impot.nom)}`, lignes, total, mention: t('mention_estimation'), lien: location.href }), 'Hetrako');
      if (issue === 'copie') confirmer(t('resultat_copie'));
      if (issue === 'echec') confirmer(t('partage_impossible'));
    });
    // Aperçu du montant juste avant le résultat, sur téléphone (masqué sur grand écran par la feuille de style).
    const apercu = document.createElement('div');
    apercu.className = 'apercu';
    apercu.setAttribute('aria-hidden', 'true');
    apercu.innerHTML = `<div><span class="k">${esc(ticket.querySelector('.total .k')?.textContent ?? '')}</span><span class="v"></span></div>
      <a class="bouton" href="#${ticket.id}" tabindex="-1">${t('voir_calcul_detaille')}</a>`;
    apercu.querySelector('a').addEventListener('click', e => { e.preventDefault(); ticket.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    ticket.before(apercu);
    const copier = () => { apercu.querySelector('.v').textContent = v.textContent; };
    new MutationObserver(copier).observe(v, { childList: true, characterData: true, subtree: true });
    copier();
  });
}

function comprendre(p, f, b) {
  const c = f.comprendre, ex = c.exemple, v = f.variables ? f.variables(b) : {};
  p.innerHTML = `
    <p class="lead">${esc(fmt(tr(c.definition.texte), v))}${art(c.definition.article)}</p>
    <div class="grid">${carte(t('qui_paie'), c.quiPaie, v)}${carte(t('exonere'), c.exonerations, v)}${carte(t('a_savoir'), c.aSavoir, v)}</div>
    <div class="card exemple-vie">
      <span class="eg">${t('exemple_vie')}</span>
      <p>${esc(fmt(tr(ex.texte), ex.valeurs(b)))}</p>
      <a class="bouton" href="${lien(f.id, 'calculer')}">${t('voir_calcul')}</a>
    </div>`;
}

function calculer(p, f, b) {
  if (!f.monterCalculateur) { p.innerHTML = etatVide({ message: t('sans_calcul'), action: { libelle: t('onglet_comprendre'), href: lien(f.id) } }, composition('vide')); return; }
  f.monterCalculateur(p, b);
}

function declarer(p, f, b, ob) {
  const blocs = ['qui', 'ou', 'document', 'quand'].map(k => carte(t('decl_' + k), ob[k])).join('');
  p.innerHTML = `<p class="lead">${t('decl_intro')}</p>${blocs ? `<div class="grid">${blocs}</div>` : `<p>${t('a_completer')}</p>`}`;
}

/** Impôts locaux (Livre II) : pénalité de retard à taux unique par mois (CDI 20.01.53.4). */
function sanctionsLocales(p, f, b, ob) {
  const P = b.penalites;
  p.innerHTML = `
    <p class="lead">${t('sanc_intro')}</p>
    <div class="grid">
      <div class="card"><h3>${t('sanc_retard')}${art(P.articles.retardLivreII)}</h3>
        <ul class="puces"><li>${t('sanc_local', { taux: pct(P.retardLivreII, 0) })}</li></ul></div>
      ${carte(t('sanc_specifique'), ob.sanctions)}
    </div>
    <h3 class="titre-sim">${t('sim_titre')}</h3>
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champMontant('pen-impot', t('f_impot_du'), f.impotExemple ? f.impotExemple(b) : 50000)}
        ${champCompteur('pen-mois', t('f_mois'), 3, 1, 120)}
      </div>
      <div class="ticket ticket--alerte" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${t('onglet_sanctions')}</span><span>CDI</span></div>
        <div class="rows" id="pen-rows"></div>
        <div class="total"><span class="k">${t('r_total')}</span><span class="v" id="pen-total"></span></div>
        <p class="arr">${t('arrondi')}${art(P.articles.arrondi)}</p>
      </div>
    </div>
    <p><a class="bouton" href="#/sanctions">${t('voir_sanctions')}</a></p>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const impot = lireMontant($('pen-impot')), mois = lireEntier($('pen-mois'), 1, 120);
    const r = calculPenalitesLocales({ impot, moisRetard: mois }, b);
    $('pen-rows').innerHTML = ligne(t('r_impot'), ar(impot)) + ligne(t('r_interets', { n: mois }), ar(r.interets), P.articles.retardLivreII);
    $('pen-total').textContent = ar(r.total);
  };
  brancher(p, recalculer);
  recalculer();
}

function sanctions(p, f, b, ob) {
  if (f.impotLocal) return sanctionsLocales(p, f, b, ob);
  const P = b.penalites;
  const regles = P.retard.map(r => `<li>${t('regle_retard', { ca: ar(r.caMin), p1: pct(r.premierMois), p2: pct(r.moisSuivants) })}</li>`).join('')
    + `<li>${t('regle_min', { min: ar(P.minimumRetard) })}</li>`;
  const amendes = P.amendeDefautDepot.map(a => `<li>${t('regle_amende', { ca: ar(a.caMin), montant: ar(a.montant) })}</li>`).join('');
  p.innerHTML = `
    <p class="lead">${t('sanc_intro')}</p>
    <div class="grid">
      <div class="card"><h3>${t('sanc_retard')}${art(P.articles.retard)}</h3><ul class="puces">${regles}</ul></div>
      <div class="card"><h3>${t('sanc_defaut')}${art(P.articles.defautDepot)}</h3><ul class="puces">${amendes}</ul></div>
      ${carte(t('sanc_specifique'), ob.sanctions)}
    </div>
    <h3 class="titre-sim">${t('sim_titre')}</h3>
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        ${champMontant('pen-impot', t('f_impot_du'), f.impotExemple ? f.impotExemple(b) : 500000)}
        ${champCompteur('pen-mois', t('f_mois'), 3, 1, 120)}
        ${champMontant('pen-ca', t('f_ca'), 30000000)}
        <label class="check"><input type="checkbox" id="pen-defaut" checked><span>${t('f_defaut')}</span></label>
      </div>
      <div class="ticket ticket--alerte" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${t('onglet_sanctions')}</span><span>CDI · CPF</span></div>
        <div class="rows" id="pen-rows"></div>
        <div class="total"><span class="k">${t('r_total')}</span><span class="v" id="pen-total"></span></div>
        <p class="arr">${t('arrondi')}${art(P.articles.arrondi)}</p>
      </div>
    </div>
    <p><a class="bouton" href="#/sanctions">${t('voir_sanctions')}</a></p>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const impot = lireMontant($('pen-impot')), mois = lireEntier($('pen-mois'), 1, 120), defaut = $('pen-defaut').checked;
    const r = calculPenalites({ impot, moisRetard: mois, ca: lireMontant($('pen-ca')), defautDepot: defaut }, b);
    $('pen-rows').innerHTML = ligne(t('r_impot'), ar(impot))
      + ligne(t('r_interets', { n: mois }), ar(r.interets), P.articles.retard)
      + (r.minimumApplique ? ligne(t('r_min_retard', { min: ar(P.minimumRetard) }), '', '', 'note') : '')
      + (defaut ? ligne(t('r_amende'), ar(r.amende), P.articles.defautDepot) : '');
    $('pen-total').textContent = ar(r.total);
  };
  brancher(p, recalculer);
  recalculer();
}
