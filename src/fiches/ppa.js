// Fiche Prélèvement sur les produits alcooliques (CDI Partie III, Titre II, Chap. II ; CPF I-103). Textes malgaches à relire.
import { calculPrelevement } from '../calc/prelevementAlcools.js';
import { t, tr, fmt, ar, ligne, champMontant, lireMontant, brancher } from '../ui.js';

const EXEMPLE = { litres: 100000, litresExport: 0 };
const variables = b => ({ parLitre: ar(b.prelevementAlcools.parLitre) });

const comprendre = {
  definition: {
    article: 'CDI 03.02.06 à 03.02.08',
    texte: {
      fr: "Le prélèvement sur les produits alcooliques est de {parLitre} par litre de boisson alcoolique ou alcoolisée fabriquée et mise en vente à Madagascar. Il finance la lutte contre la fraude fiscale.",
      en: 'The alcohol levy is {parLitre} per litre of alcoholic drink made and sold in Madagascar. It funds the fight against tax fraud.',
      mg: "Ny fakana amin'ny toaka dia {parLitre} isaky ny litatra zava-pisotro misy alikaola vokarina sy amidy eto Madagasikara. Mamatsy ny ady amin'ny hosoka ara-ketra izany.",
    },
  },
  quiPaie: [
    { article: 'CDI 03.02.06', texte: {
      fr: 'Les fabricants de boissons alcooliques et alcoolisées, sur les quantités mises à la consommation chaque mois.',
      en: 'Manufacturers of alcoholic drinks, on quantities released for consumption each month.',
      mg: "Ny mpamokatra zava-pisotro misy alikaola, amin'ny habetsahana navoaka ho amin'ny fanjifana isam-bolana." } },
  ],
  exonerations: [
    { article: 'CDI 03.02.07', texte: {
      fr: 'Les boissons fabriquées pour l’exportation, qui voyagent avec un titre de mouvement.',
      en: 'Drinks made for export, travelling with a movement document.',
      mg: "Ny zava-pisotro vokarina hahondrana, mandeha miaraka amin'ny taratasy fivezivezena." } },
  ],
  aSavoir: [
    { article: 'CDI 03.02.06', texte: {
      fr: 'Contrairement à la taxe spéciale, il ne vise que les fabricants (pas les importateurs) et ne dépend pas du type de boisson.',
      en: 'Unlike the special tax, it only applies to manufacturers (not importers) and does not depend on the type of drink.',
      mg: "Tsy toy ny haba manokana, ny mpamokatra ihany no voakasika (fa tsy ny mpanafatra) ary tsy miankina amin'ny karazana zava-pisotro." } },
  ],
  exemple: {
    texte: {
      fr: 'Une brasserie de Toamasina met en vente 100 000 litres de bière en mars. Elle déclare et paie {impot} de prélèvement avant le 15 avril.',
      en: 'A brewery in Toamasina releases 100,000 litres of beer in March. It files and pays {impot} of levy by 15 April.',
      mg: "Orinasa mpanao labiera any Toamasina no mamoaka 100 000 litatra labiera amin'ny martsa. Manambara sy mandoa fakana {impot} alohan'ny 15 aprily izy.",
    },
    valeurs: b => ({ impot: ar(calculPrelevement(EXEMPLE, b).impot) }),
  },
};

const L = {
  litres: { fr: 'Litres mis à la consommation dans le mois', en: 'Litres released for consumption in the month', mg: 'Litatra navoaka tamin’ny volana' },
  export: { fr: 'Dont litres exportés', en: 'Of which litres exported', mg: 'Ao anatin’izany, litatra naondrana' },
  taxables: { fr: '{n} litres taxables × {m}', en: '{n} taxable litres × {m}', mg: 'Litatra {n} × {m}' },
  total: { fr: 'Prélèvement à payer', en: 'Levy to pay', mg: 'Fakana aloa' },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.prelevementAlcools.articles, sansAr = s => s.replace('<span class="u">Ar</span>', '<span class="u">l</span>');
  p.innerHTML = `
    <div class="grid">
      <div class="card"><span class="eg">${t('exemple')}</span>
        ${sansAr(champMontant('ppa-litres', l('litres'), EXEMPLE.litres))}${sansAr(champMontant('ppa-export', l('export'), EXEMPLE.litresExport))}</div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Prélèvement', en: 'Levy', mg: 'Fakana' })}</span><span>${l('parMois')}</span></div>
        <div class="rows" id="ppa-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ppa-total"></span></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const r = calculPrelevement({ litres: lireMontant($('ppa-litres')), litresExport: lireMontant($('ppa-export')) }, b);
    $('ppa-rows').innerHTML = ligne(l('taxables', { n: r.taxables.toLocaleString('fr-FR'), m: ar(b.prelevementAlcools.parLitre) }), ar(r.montant), A.taux);
    $('ppa-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'ppa', variables, comprendre, monterCalculateur, impotExemple: b => calculPrelevement(EXEMPLE, b).impot };
