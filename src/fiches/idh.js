// Fiche IDH, sans calculateur (CDI Partie I, Titre I, ST II ; CPF Titre I, ST II, Chap. II). Textes malgaches à relire.
import { tr, fmt, nombre, pct } from '../ui.js';

const UNITES = {
  petroleBrut: { fr: 'barils par jour', en: 'barrels per day', mg: 'barily isan-andro' },
  gazNaturel: { fr: 'm³ standard par jour', en: 'standard m³ per day', mg: 'm³ isan-andro' },
};
const AU_DELA = { fr: 'au-delà', en: 'above', mg: 'mihoatra' };
const JUSQUA = { fr: "jusqu'à", en: 'up to', mg: "hatramin'ny" };

/** « 8 % jusqu'à 25 000, 10 % jusqu'à 50 000 … 20 % au-delà (barils par jour) » à partir du barème. */
const tranches = (r, cle) => r[cle].tranches.map(x => x.jusqua === null
  ? `${pct(x.taux)} ${tr(AU_DELA)}` : `${pct(x.taux)} ${tr(JUSQUA)} ${nombre(x.jusqua)}`).join(', ') + ` (${tr(UNITES[cle])})`;

const variables = b => ({
  petrole: tranches(b.idh.redevance, 'petroleBrut'), gaz: tranches(b.idh.redevance, 'gazNaturel'),
  taux: pct(b.ir.taux, 0), report: b.idh.reportDeficitExploitation,
});

const comprendre = {
  definition: {
    article: 'CDI 01.01.26, 01.01.31',
    texte: {
      fr: "Les sociétés pétrolières (recherche, exploitation, transport, transformation d'hydrocarbures) ont un régime propre : une redevance sur ce qu'elles extraient, et l'impôt direct sur les hydrocarbures (IDH) sur leur bénéfice, qui remplace l'IR et l'IRCM.",
      en: 'Oil companies (exploration, production, transport, processing of hydrocarbons) have their own regime: a royalty on what they extract, and the direct hydrocarbon tax (IDH) on their profit, which replaces IR and IRCM.',
      mg: "Manana rafitra manokana ny orinasa solika (fikarohana, fitrandrahana, fitaterana, fanodinana): haba amin'izay trandrahiny, ary ny IDH amin'ny tombony azony, izay misolo ny IR sy ny IRCM.",
    },
  },
  quiPaie: [
    { article: 'CDI 01.01.26', texte: {
      fr: 'Les sociétés qui prospectent, recherchent, exploitent, transportent ou transforment des hydrocarbures à Madagascar et dans ses zones maritimes, au sens du Code pétrolier.',
      en: 'Companies that prospect, explore, produce, transport or process hydrocarbons in Madagascar and its maritime zones, as defined by the Petroleum Code.',
      mg: "Ny orinasa mikaroka, mitrandraka, mitatitra na manodina solika eto Madagasikara sy any amin'ny faritry ny ranomasina, araka ny Fehezan-dalàna momba ny solika." } },
    { article: 'CDI 01.01.42', texte: {
      fr: 'Les sociétés étrangères liées par un contrat de service à risque à une entreprise nationale paient l’IR, au taux des entreprises industrielles, à la place de l’IDH.',
      en: 'Foreign companies under a risk service contract with a national company pay IR, at the industrial-company rate, in place of IDH.',
      mg: "Ny orinasa vahiny manana fifanarahana tolotra misy risika amin'ny orinasa nasionaly dia mandoa IR, amin'ny tahan'ny orinasa indostrialy, ho solon'ny IDH." } },
  ],
  exonerations: [
    { article: 'CDI 01.01.28', texte: {
      fr: 'La redevance ne s’applique pas aux quantités consommées pour la production, réinjectées dans le gisement, perdues ou inutilisées.',
      en: 'The royalty does not apply to quantities used for production, reinjected into the field, lost or unused.',
      mg: "Tsy iharan'ny haba ny solika ampiasaina amin'ny famokarana, averina ao anaty lavaka, very na tsy ampiasaina." } },
    { article: 'CDI 01.01.31', texte: {
      fr: 'Les autres impôts (TVA, droits d’enregistrement…) restent dus selon le droit commun.',
      en: 'Other taxes (VAT, registration duties…) remain due under ordinary rules.',
      mg: "Mbola aloa araka ny fitsipika ankapobeny ny hetra hafa (TVA, haba fanoratana…)." } },
  ],
  aSavoir: [
    { article: 'CDI 01.01.27', texte: {
      fr: 'Redevance sur le pétrole brut : {petrole}.',
      en: 'Royalty on crude oil: {petrole}.',
      mg: 'Haba amin’ny solika tsy voadio: {petrole}.' } },
    { article: 'CDI 01.01.27', texte: {
      fr: 'Redevance sur le gaz naturel : {gaz}. Pour l’huile lourde et le bitume, les taux sont fixés dans les contrats.',
      en: 'Royalty on natural gas: {gaz}. For heavy oil and bitumen, rates are set in the contracts.',
      mg: "Haba amin'ny entona voajanahary: {gaz}. Ho an'ny solika mavesatra sy bitume, ny fifanarahana no mamaritra ny taha." } },
    { article: 'CDI 01.01.39', texte: {
      fr: 'L’IDH se calcule comme l’IR ({taux} du bénéfice, arrondi au millier), avec des acomptes en cours d’année. La redevance payée est déductible du bénéfice.',
      en: 'IDH is calculated like IR ({taux} of profit, rounded to the thousand), with instalments during the year. The royalty paid is deductible from profit.',
      mg: "Kajiana toy ny IR ny IDH ({taux} amin'ny tombony, boribory ho amin'ny arivo), miaraka amin'ny fandoavana mialoha. Azo esorina amin'ny tombony ny haba naloa." } },
    { article: 'CDI 01.01.40', texte: {
      fr: 'Les pertes d’exploration se déduisent des bénéfices d’exploitation jusqu’à épuisement ; une perte d’exploitation se reporte sur {report} exercices.',
      en: 'Exploration losses are deducted from production profits until used up; a production loss is carried forward for {report} years.',
      mg: "Esorina amin'ny tombony amin'ny fitrandrahana ny fatiantoka tamin'ny fikarohana mandra-pahalany; ny fatiantoka amin'ny fitrandrahana dia afindra mandritra ny taom-piasana {report}." } },
  ],
  exemple: {
    texte: {
      fr: 'Une société exploite un gisement de pétrole dans le canal de Mozambique. Chaque année, elle paie la redevance sur le pétrole extrait, puis l’IDH sur son bénéfice, au même taux que l’IR ({taux}). Ces calculs dépendent des contrats pétroliers : Kajy Hetra n’a pas de calculateur pour cet impôt.',
      en: 'A company operates an oil field in the Mozambique Channel. Each year it pays the royalty on oil extracted, then IDH on its profit, at the same rate as IR ({taux}). These calculations depend on the petroleum contracts: Kajy Hetra has no calculator for this tax.',
      mg: "Orinasa iray mitrandraka solika ao amin'ny lakandranon'i Mozambika. Isan-taona, mandoa ny haba amin'ny solika voatrandraka izy, avy eo ny IDH amin'ny tombony, amin'ny taha mitovy amin'ny IR ({taux}). Miankina amin'ny fifanarahana momba ny solika ireo kajy ireo: tsy manana fitaovana fikajiana ho an'ity hetra ity ny Kajy Hetra.",
    },
    valeurs: b => ({ taux: pct(b.ir.taux, 0) }),
  },
};

export default { id: 'idh', variables, comprendre };
