// Fiche Taxe spéciale sur les boissons alcooliques et les tabacs (CDI Partie III, Titre II, Chap. I). Textes malgaches à relire.
import { calculTaxeSpeciale } from '../calc/taxeSpeciale.js';
import { t, tr, fmt, esc, ar, pct, ligne, champMontant, champCompteur, lireMontant, lireEntier, brancher } from '../ui.js';

const EXEMPLE = { produit: 'vinBiere', quantite: 100000, degre: 40 };
const UNITES = {
  lap: { fr: 'litre d’alcool pur', en: 'litre of pure alcohol', mg: 'litatra alikaola madio' },
  bouteille70cl: { fr: 'bouteille de 70 cl', en: '70 cl bottle', mg: 'tavoahangy 70 cl' },
  litre: { fr: 'litre', en: 'litre', mg: 'litatra' },
  paquet: { fr: 'étui ou paquet', en: 'case or pack', mg: 'fonony na paoma' },
  sachet: { fr: 'sachet', en: 'pouch', mg: 'fonosana kely' },
};
const QUANTITE = {
  lap: { fr: 'Volume de rhum, en litres', en: 'Volume of rum, in litres', mg: 'Habetsahan’ny toaka, amin’ny litatra' },
  bouteille70cl: { fr: 'Nombre de bouteilles de 70 cl', en: 'Number of 70 cl bottles', mg: 'Isan’ny tavoahangy 70 cl' },
  litre: { fr: 'Volume, en litres', en: 'Volume, in litres', mg: 'Habetsahana, amin’ny litatra' },
  paquet: { fr: 'Nombre d’étuis ou de paquets', en: 'Number of cases or packs', mg: 'Isan’ny fonony na paoma' },
  sachet: { fr: 'Nombre de sachets', en: 'Number of pouches', mg: 'Isan’ny fonosana kely' },
};

const variables = b => {
  const p = id => b.taxeSpeciale.produits.find(x => x.id === id).montant;
  const r = b.taxeSpeciale.repartition;
  return { rhum: ar(p('rhum')), whisky: ar(p('whisky')), biere: ar(p('vinBiere')), autres: ar(p('autresAlcools')),
    cigares: ar(p('cigares')), cigarettes: ar(p('cigarettes')), macher: ar(p('tabacMacher')),
    jeunesse: pct(r.FNPDJSL, 0), tabac: pct(r.OFNALAT, 0), culture: pct(r.LOVAKO, 0) };
};

const comprendre = {
  definition: {
    article: 'CDI 03.02.01, 03.02.03',
    texte: {
      fr: "La taxe spéciale est un petit montant fixe sur chaque litre d'alcool et chaque paquet de tabac fabriqué ou importé. Son produit finance la jeunesse et les sports ({jeunesse}), la lutte contre le tabac ({tabac}) et la culture ({culture}).",
      en: 'The special tax is a small fixed amount on each litre of alcohol and each pack of tobacco made or imported. It funds youth and sports ({jeunesse}), tobacco control ({tabac}) and culture ({culture}).',
      mg: "Ny haba manokana dia vola raikitra kely amin'ny litatra alikaola sy paoman-paraky vokarina na afarana. Mamatsy ny tanora sy ny fanatanjahantena ({jeunesse}), ny ady amin'ny paraky ({tabac}) ary ny kolontsaina ({culture}) izany.",
    },
  },
  quiPaie: [
    { article: 'CDI 03.02.01', texte: {
      fr: 'Les fabricants et les importateurs de boissons alcooliques et de tabacs. Le consommateur la paie indirectement, dans le prix.',
      en: 'Manufacturers and importers of alcoholic drinks and tobacco. Consumers pay it indirectly, in the price.',
      mg: "Ny mpamokatra sy ny mpanafatra zava-pisotro misy alikaola sy paraky. Ny mpanjifa no mandoa azy ankolaka, ao anatin'ny vidiny." } },
    { article: 'CDI 03.02.02', texte: {
      fr: 'Boissons : rhum {rhum} par litre d’alcool pur ; whisky {whisky} par bouteille de 70 cl ; vin et bière {biere} par litre ; autres alcools {autres} par litre.',
      en: 'Drinks: rum {rhum} per litre of pure alcohol; whisky {whisky} per 70 cl bottle; wine and beer {biere} per litre; other spirits {autres} per litre.',
      mg: "Zava-pisotro: toaka {rhum} isaky ny litatra alikaola madio; whisky {whisky} isaky ny tavoahangy 70 cl; divay sy labiera {biere} isaky ny litatra; alikaola hafa {autres} isaky ny litatra." } },
    { article: 'CDI 03.02.02', texte: {
      fr: 'Tabacs : cigares {cigares} par étui ; cigarettes et tabac à fumer {cigarettes} par paquet ; tabac à mâcher {macher} par sachet.',
      en: 'Tobacco: cigars {cigares} per case; cigarettes and smoking tobacco {cigarettes} per pack; chewing tobacco {macher} per pouch.',
      mg: "Paraky: sigara {cigares} isaky ny fonony; sigara sy paraky fifoka {cigarettes} isaky ny paoma; paraky hanina {macher} isaky ny fonosana." } },
  ],
  exonerations: [
    { article: 'CDI 03.02.01', texte: {
      fr: 'Aucune exonération n’est prévue par ces articles. Pour les produits faits à partir d’alcool fort local, la taxe est retenue en amont, chez le fournisseur.',
      en: 'These articles provide no exemption. For products made from local strong alcohol, the tax is withheld upstream, at the supplier.',
      mg: "Tsy misy fanafahana voalazan'ireo andininy ireo. Ho an'ny vokatra avy amin'ny toaka mahery eto an-toerana, esorina mialoha any amin'ny mpamatsy ny haba." } },
  ],
  aSavoir: [
    { article: 'CDI 03.02.02', texte: {
      fr: 'Litre d’alcool pur = volume × degré ÷ 100. Un litre de rhum à 40° contient 0,4 litre d’alcool pur.',
      en: 'Litre of pure alcohol = volume × strength ÷ 100. A litre of 40° rum contains 0.4 litre of pure alcohol.',
      mg: "Litatra alikaola madio = habetsahana × hamafin'ny alikaola ÷ 100. Ny litatra toaka 40° dia misy alikaola madio 0,4 litatra." } },
    { article: 'CDI 03.02.05', texte: {
      fr: 'Cette taxe s’ajoute au droit d’accises et au prélèvement sur les alcools.',
      en: 'This tax comes on top of excise duty and the alcohol levy.',
      mg: "Ampiana amin'ny haba manokana sy ny fakana amin'ny toaka ity haba ity." } },
  ],
  exemple: {
    texte: {
      fr: 'Sur un paquet de cigarettes, la taxe spéciale est de {cigarettes} ; sur une bouteille de bière de 65 cl, elle est de {biere65}. Une brasserie qui produit 100 000 litres de bière dans le mois déclare {brasserie} avant le 15 du mois suivant.',
      en: 'On a pack of cigarettes the special tax is {cigarettes}; on a 65 cl bottle of beer it is {biere65}. A brewery producing 100,000 litres of beer in a month declares {brasserie} by the 15th of the following month.',
      mg: "Amin'ny paoman-tsigara iray, {cigarettes} ny haba manokana; amin'ny tavoahangy labiera 65 cl, {biere65}. Ny orinasa mpanao labiera mamokatra 100 000 litatra amin'ny volana dia manambara {brasserie} alohan'ny faha-15 amin'ny volana manaraka.",
    },
    valeurs: b => ({
      cigarettes: ar(calculTaxeSpeciale({ produit: 'cigarettes', quantite: 1 }, b).taxe),
      biere65: (calculTaxeSpeciale({ produit: 'vinBiere', quantite: 0.65 }, b).taxe).toLocaleString('fr-FR') + ' Ar',
      brasserie: ar(calculTaxeSpeciale({ produit: 'vinBiere', quantite: 100000 }, b).impot),
    }),
  },
};

const L = {
  produit: { fr: 'Produit', en: 'Product', mg: 'Vokatra' },
  degre: { fr: 'Degré d’alcool (°)', en: 'Alcohol strength (°)', mg: "Hamafin'ny alikaola (°)" },
  unites: { fr: '{q} × {m} par {unite}', en: '{q} × {m} per {unite}', mg: '{q} × {m} isaky ny {unite}' },
  lap: { fr: 'Alcool pur : {v} l × {d}° ÷ 100', en: 'Pure alcohol: {v} l × {d}° ÷ 100', mg: 'Alikaola madio: {v} l × {d}° ÷ 100' },
  total: { fr: 'Taxe spéciale à payer', en: 'Special tax to pay', mg: 'Haba manokana aloa' },
  parMois: { fr: 'Par mois', en: 'Per month', mg: 'Isam-bolana' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
let produit = EXEMPLE.produit;

function monterCalculateur(p, b) {
  const A = b.taxeSpeciale.articles, prod = b.taxeSpeciale.produits.find(x => x.id === produit);
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="f"><span>${l('produit')}</span><select id="ts-produit">${b.taxeSpeciale.produits.map(x =>
          `<option value="${x.id}"${x.id === produit ? ' selected' : ''}>${esc(tr(x.libelle))} · ${ar(x.montant)}</option>`).join('')}</select></label>
        ${champMontant('ts-q', tr(QUANTITE[prod.unite]), EXEMPLE.quantite).replace('<span class="u">Ar</span>', '')}
        ${prod.unite === 'lap' ? champCompteur('ts-degre', l('degre'), EXEMPLE.degre, 0, 100) : ''}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · ${tr({ fr: 'Taxe spéciale', en: 'Special tax', mg: 'Haba manokana' })}</span><span>${l('parMois')}</span></div>
        <div class="rows" id="ts-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="ts-total"></span></div>
        <p class="arr">${t('arrondi')}<small class="art">${b.penalites.articles.arrondi}</small></p>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  $('ts-produit').addEventListener('change', () => { produit = $('ts-produit').value; monterCalculateur(p, b); });
  const recalculer = () => {
    const q = lireMontant($('ts-q')), degre = prod.unite === 'lap' ? lireEntier($('ts-degre'), 0, 100) : 0;
    const r = calculTaxeSpeciale({ produit, quantite: q, degre }, b);
    let h = prod.unite === 'lap' ? ligne(l('lap', { v: q.toLocaleString('fr-FR'), d: degre }), r.unites.toLocaleString('fr-FR') + ' l', A.taux) : '';
    h += ligne(l('unites', { q: r.unites.toLocaleString('fr-FR'), unite: tr(UNITES[prod.unite]), m: ar(prod.montant) }), ar(r.taxe), A.taux);
    $('ts-rows').innerHTML = h;
    $('ts-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'tsabtj', variables, comprendre, monterCalculateur, impotExemple: b => calculTaxeSpeciale(EXEMPLE, b).impot };
