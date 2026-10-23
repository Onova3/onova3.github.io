// Module Sources (#/sources) : textes utilisés, date de mise à jour des barèmes et limites de l'application. Textes malgaches à relire.
import { t, tr, esc } from '../ui.js';

const L = {
  titre: { fr: 'Sources et limites', en: 'Sources and limits', mg: 'Loharano sy fetra' },
  lead: { fr: 'Chaque taux, seuil ou délai de Kajy Hetra est rattaché à un article de ces textes. Aucun chiffre ne vient d’un site tiers.', en: 'Every rate, threshold or time limit in Kajy Hetra is tied to an article of these texts. No figure comes from a third-party site.', mg: "Ny taha, fetra ary fe-potoana rehetra ao amin'ny Kajy Hetra dia mifandray amin'ny andininy ao amin'ireo lahatsoratra ireo. Tsy misy isa avy amin'ny tranonkala hafa." },
  textes: { fr: 'Textes utilisés', en: 'Texts used', mg: 'Lahatsoratra ampiasaina' },
  maj: { fr: 'Barèmes mis à jour le', en: 'Rates updated on', mg: 'Nohavaozina ny taha tamin’ny' },
  annee: { fr: 'Année d’imposition', en: 'Tax year', mg: 'Taom-pandoavana' },
  verifies: { fr: 'Impôts vérifiés', en: 'Taxes checked', mg: 'Hetra voamarina' },
  pdf: { fr: 'Télécharger les codes (PDF)', en: 'Download the codes (PDF)', mg: 'Haka ny fehezan-dalàna (PDF)' },
  limites: { fr: 'Limites', en: 'Limits', mg: 'Fetra' },
  l1: { fr: 'Kajy Hetra explique et fait des simulations ; ce n’est ni un logiciel de déclaration ni un avis fiscal.', en: 'Kajy Hetra explains and simulates; it is neither filing software nor tax advice.', mg: "Manazava sy manao tombana ny Kajy Hetra; tsy rindrambaiko fanambarana na torohevitra ara-ketra izy." },
  l2: { fr: 'Les changements de la LFR 2026 sont reportés dans les barèmes, mais pas encore dans le texte des codes.', en: 'LFR 2026 changes are included in the rates, but not yet in the text of the codes.', mg: "Tafiditra ao amin'ny taha ny fanovana LFR 2026, fa tsy mbola ao amin'ny lahatsoratry ny fehezan-dalàna." },
  l3: { fr: 'Les points que le texte ne tranche pas sont listés avec le choix fait par l’application.', en: 'Points the text leaves open are listed with the choice made by the application.', mg: "Voatanisa miaraka amin'ny safidy natao ireo teboka tsy mazava ao amin'ny lahatsoratra." },
  l4: { fr: 'Les textes en malgache n’ont pas encore été relus par un locuteur natif.', en: 'Malagasy texts have not yet been reviewed by a native speaker.', mg: "Tsy mbola novakian'ny teratany ny lahatsoratra malagasy." },
  aVerifier: { fr: 'Voir la liste des points à vérifier', en: 'See the list of points to check', mg: 'Jereo ny lisitry ny teboka hamarinina' },
};
const l = k => tr(L[k]);
const dateLisible = iso => { const [a, m, j] = iso.split('-'); return `${j}/${m}/${a}`; };

export function monter(el, { b, impots }) {
  const verifies = impots.filter(i => i.statut === 'verifie').length;
  el.innerHTML = `
    <header class="fiche-tete"><h2>${l('titre')}</h2><p class="lead">${l('lead')}</p></header>
    <div class="grid">
      <div class="card"><h3>${l('textes')}</h3><ol class="puces">${b.textes.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <p class="aide"><a href="codes/CDI-LFI-2026.pdf">CDI 2026 (PDF)</a> · <a href="codes/CPF-LFI-2026.pdf">CPF 2026 (PDF)</a></p></div>
      <div class="ticket"><div class="rows">
        <div class="row"><span>${l('maj')}</span><span>${dateLisible(b.misAJour)}</span></div>
        <div class="row"><span>${l('annee')}</span><span>${b.annee}</span></div>
        <div class="row"><span>${l('verifies')}</span><span>${verifies} / ${impots.length}</span></div>
      </div></div>
      <div class="card"><h3>${l('limites')}</h3><ul class="puces">${['l1', 'l2', 'l3', 'l4'].map(k => `<li>${l(k)}</li>`).join('')}</ul>
        <p class="aide"><a href="docs/A-VERIFIER.md">${l('aVerifier')}</a></p></div>
    </div>`;
}
