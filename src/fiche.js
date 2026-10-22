// Gabarit commun des fiches impôt : en-tête + 4 onglets (Comprendre, Calculer, Déclarer et payer, Sanctions).
// Le contenu propre à chaque impôt vient de src/fiches/<id>.js ; les obligations du CPF de data/obligations.json.
import { t, tr, fmt, esc, art, ar, pct, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from './ui.js';
import { ONGLETS, lien } from './routes.js';
import { calculPenalites, calculPenalitesLocales } from './calc/penalites.js';

// Les textes peuvent contenir des {variables} (taux, seuils) tirées du barème par fiche.variables(b).
const liste = (items = [], vars = {}) => `<ul class="puces">${items.map(i => `<li>${esc(fmt(tr(i.texte), vars))}${art(i.article)}</li>`).join('')}</ul>`;
const carte = (titre, items, vars) => (items?.length ? `<div class="card"><h3>${titre}</h3>${liste(items, vars)}</div>` : '');

export function rendreFiche(el, { fiche, impot, onglet, b, obligations }) {
  el.innerHTML = `
    <a class="retour" href="#/">${t('retour')}</a>
    <header class="fiche-tete">
      <span class="sigle-g">${esc(impot.sigle)}</span>
      <h2>${esc(tr(impot.nom))}</h2>
      <p class="refs">CDI · ${esc(impot.refCDI)} — CPF · ${esc(impot.refCPF ?? '—')}</p>
    </header>
    <nav class="tabs" role="tablist">${ONGLETS.map(o =>
      `<a class="tab" role="tab" href="${lien(fiche.id, o)}" aria-selected="${o === onglet}">${t('onglet_' + o)}</a>`).join('')}</nav>
    <section class="panel" role="tabpanel" id="panneau"></section>`;
  const panneaux = { comprendre, calculer, declarer, sanctions };
  panneaux[onglet](el.querySelector('#panneau'), fiche, b, obligations[fiche.id] ?? {});
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
  if (!f.monterCalculateur) { p.innerHTML = `<p class="lead">${t('sans_calcul')}</p>`; return; }
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
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${t('onglet_sanctions')}</span><span>CDI</span></div>
        <div class="rows" id="pen-rows"></div>
        <div class="total"><span class="k">${t('r_total')}</span><span class="v" id="pen-total"></span></div>
        <p class="arr">${t('arrondi')}${art(P.articles.arrondi)}</p>
      </div>
    </div>`;
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
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${t('onglet_sanctions')}</span><span>CDI · CPF</span></div>
        <div class="rows" id="pen-rows"></div>
        <div class="total"><span class="k">${t('r_total')}</span><span class="v" id="pen-total"></span></div>
        <p class="arr">${t('arrondi')}${art(P.articles.arrondi)}</p>
      </div>
    </div>`;
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
