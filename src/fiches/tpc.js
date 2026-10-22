// Fiche Taxe de protection civile (CDI Livre II, Titre III ; CPF Chap. XIV). Textes malgaches à relire.
import { calculTPC } from '../calc/tpc.js';
import { t, tr, fmt, ar, ligne, champCompteur, champCommunal, lireEntier, lireCommunal, brancher } from '../ui.js';

const EXEMPLE = { chiens: 2, animaux: 0, armes: 1 };
const variables = b => ({ chien: ar(b.tpc.maxParChien), animal: ar(b.tpc.maxParAnimal), arme: ar(b.tpc.maxParArmeBlanche), forfait: ar(b.tpc.forfaitProfessionnel) });
const tarifsMax = b => ({ tarifChien: b.tpc.maxParChien, tarifAnimal: b.tpc.maxParAnimal, tarifArme: b.tpc.maxParArmeBlanche });

const comprendre = {
  definition: {
    article: 'CDI 10.03.01, 10.03.03',
    texte: {
      fr: "La taxe de protection civile est une petite taxe annuelle de la commune sur la possession de chiens, d'animaux dangereux domestiqués et d'armes blanches. La commune vote ses tarifs sans dépasser {chien} par chien, {animal} par animal et {arme} par arme blanche.",
      en: 'The civil protection tax is a small annual commune tax on owning dogs, dangerous domesticated animals and bladed weapons. The commune votes its rates, up to {chien} per dog, {animal} per animal and {arme} per bladed weapon.',
      mg: "Ny haba fiarovana sivily dia haba kely isan-taona an'ny kaominina amin'ny fananana alika, biby mampidi-doza novolena ary fitaovam-piadiana maranitra. Ny kaominina no mandany ny tahany, tsy mihoatra ny {chien} isaky ny alika, {animal} isaky ny biby ary {arme} isaky ny fitaovam-piadiana maranitra.",
    },
  },
  quiPaie: [
    { article: 'CDI 10.03.02', texte: {
      fr: 'Le propriétaire au 1er janvier (à défaut le détenteur) de chiens d’au moins 3 mois, d’animaux dangereux domestiqués ou d’armes blanches.',
      en: 'The owner on 1 January (failing that the keeper) of dogs at least 3 months old, dangerous domesticated animals or bladed weapons.',
      mg: "Ny tompony amin'ny 1 janoary (raha tsy izany, izay mitazona) alika 3 volana farafahakeliny, biby mampidi-doza novolena na fitaovam-piadiana maranitra." } },
    { article: 'CDI 10.03.03', texte: {
      fr: 'Éleveurs et marchands de chiens ou d’animaux dangereux, vendeurs d’armes blanches : forfait de {forfait}, quel que soit le nombre.',
      en: 'Breeders and dealers of dogs or dangerous animals, sellers of bladed weapons: flat rate of {forfait}, whatever the number.',
      mg: "Mpiompy sy mpivarotra alika na biby mampidi-doza, mpivarotra fitaovam-piadiana maranitra: vola raikitra {forfait}, na firy na firy." } },
  ],
  exonerations: [
    { article: 'CDI 10.03.02', texte: {
      fr: 'Un chien par personne (ou par couple) de 60 ans et plus ; un ou deux chiens guides d’une personne handicapée ; chiens policiers ; armes des forces de l’ordre et des agents de sécurité en service ; diplomates étrangers (sous réserve de réciprocité).',
      en: 'One dog per person (or couple) aged 60 or over; one or two guide dogs for a disabled person; police dogs; weapons of security forces and guards on duty; foreign diplomats (subject to reciprocity).',
      mg: "Alika iray isaky ny olona (na mpivady) 60 taona na mihoatra; alika mpitarika iray na roa an'ny olona manana fahasembanana; alika polisy; fitaovam-piadian'ny mpitandro filaminana sy mpiambina; diplaomaty vahiny (raha misy fifamaliana)." } },
  ],
  aSavoir: [
    { article: 'CDI 10.03.06', texte: {
      fr: 'La taxe est payée au régisseur de recettes de la commune du lieu de résidence.',
      en: 'The tax is paid to the revenue officer of the commune where you live.',
      mg: "Aloa any amin'ny mpitahiry vola ao amin'ny kaominina onenana ny haba." } },
  ],
  exemple: {
    texte: {
      fr: 'Andry a deux chiens de garde et une machette déclarée comme arme blanche. Si la commune applique les tarifs maximum, Andry paie {impot} par an, à déclarer avant le 15 janvier.',
      en: 'Andry has two guard dogs and a machete declared as a bladed weapon. If the commune applies the maximum rates, Andry pays {impot} a year, to declare by 15 January.',
      mg: "Manana alika mpiambina roa sy antsy lava iray i Andry. Raha ny taha ambony indrindra no ampiharin'ny kaominina, {impot} isan-taona no aloan'i Andry, ambara alohan'ny 15 janoary.",
    },
    valeurs: b => ({ impot: ar(calculTPC({ ...EXEMPLE, ...tarifsMax(b) }, b).impot) }),
  },
};

const L = {
  chiens: { fr: 'Chiens de 3 mois ou plus', en: 'Dogs aged 3 months or more', mg: 'Alika 3 volana na mihoatra' },
  animaux: { fr: 'Animaux dangereux domestiqués', en: 'Dangerous domesticated animals', mg: 'Biby mampidi-doza novolena' },
  armes: { fr: 'Armes blanches', en: 'Bladed weapons', mg: 'Fitaovam-piadiana maranitra' },
  tarif: { fr: 'Tarif voté par ma commune · {objet}', en: 'Rate voted by my commune · {objet}', mg: 'Taha nolanian’ny kaominako · {objet}' },
  regle: { fr: 'Plafond fixé par le Code : {max}.', en: 'Ceiling set by the Code: {max}.', mg: "Fetra ambony napetraky ny Fehezan-dalàna: {max}." },
  pro: { fr: 'Éleveur ou marchand d’animaux, vendeur d’armes blanches (forfait)', en: 'Animal breeder or dealer, seller of bladed weapons (flat rate)', mg: 'Mpiompy na mpivarotra biby, mpivarotra fitaovam-piadiana (vola raikitra)' },
  ligne: { fr: '{n} × {m}', en: '{n} × {m}', mg: '{n} × {m}' },
  forfait: { fr: 'Forfait professionnel', en: 'Professional flat rate', mg: 'Vola raikitra ho an’ny mpandraharaha' },
  total: { fr: 'Taxe à payer', en: 'Tax to pay', mg: 'Haba aloa' },
  parAn: { fr: 'Par an', en: 'Per year', mg: 'Isan-taona' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);

function monterCalculateur(p, b) {
  const A = b.tpc.articles, T = b.tpc;
  const tarif = (id, objet, max) => champCommunal({ id, libelle: l('tarif', { objet: l(objet) }), valeur: max, max, article: A.tarif, regle: l('regle', { max: ar(max) }) + ' ' + t('valeur_exemple') });
  p.innerHTML = `
    <div class="grid">
      <div class="card">
        <span class="eg">${t('exemple')}</span>
        <label class="check"><input type="checkbox" id="tpc-pro"><span>${l('pro')}</span></label>
        ${champCompteur('tpc-chiens', l('chiens'), EXEMPLE.chiens, 0, 50)}
        ${champCompteur('tpc-animaux', l('animaux'), EXEMPLE.animaux, 0, 50)}
        ${champCompteur('tpc-armes', l('armes'), EXEMPLE.armes, 0, 50)}
        ${tarif('tpc-tchien', 'chiens', T.maxParChien)}${tarif('tpc-tanimal', 'animaux', T.maxParAnimal)}${tarif('tpc-tarme', 'armes', T.maxParArmeBlanche)}
      </div>
      <div class="ticket" aria-live="polite">
        <div class="t-head"><span>${t('avis')} · TPC</span><span>${l('parAn')}</span></div>
        <div class="rows" id="tpc-rows"></div>
        <div class="total"><span class="k">${l('total')}</span><span class="v" id="tpc-total"></span></div>
      </div>
    </div>`;
  const $ = id => p.querySelector('#' + id);
  const recalculer = () => {
    const d = { chiens: lireEntier($('tpc-chiens'), 0, 50), animaux: lireEntier($('tpc-animaux'), 0, 50), armes: lireEntier($('tpc-armes'), 0, 50),
      tarifChien: lireCommunal(p, 'tpc-tchien'), tarifAnimal: lireCommunal(p, 'tpc-tanimal'), tarifArme: lireCommunal(p, 'tpc-tarme'), professionnel: $('tpc-pro').checked };
    const r = calculTPC(d, b);
    $('tpc-rows').innerHTML = r.forfait ? ligne(l('forfait'), ar(r.impot), A.tarif)
      : [['chiens', d.chiens, d.tarifChien], ['animaux', d.animaux, d.tarifAnimal], ['armes', d.armes, d.tarifArme]].filter(x => x[1])
        .map(([k, n, m]) => ligne(`${l(k)} : ${l('ligne', { n, m: ar(m) })}`, ar(n * m), A.tarif)).join('');
    $('tpc-total').textContent = ar(r.impot);
  };
  brancher(p.querySelector('.card'), recalculer);
  recalculer();
}

export default { id: 'tpc', impotLocal: true, variables, comprendre, monterCalculateur, impotExemple: b => calculTPC({ ...EXEMPLE, ...tarifsMax(b) }, b).impot };
