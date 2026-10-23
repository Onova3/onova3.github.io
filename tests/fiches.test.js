import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculIRSA, calculIRSASpecial } from '../src/calc/irsa.js';
import { calculIS, acompteDebutActivite } from '../src/calc/is.js';
import { calculIR } from '../src/calc/ir.js';
import { calculIRCM as calculIRCMf } from '../src/calc/ircm.js';
import { calculTVA as calculTVAf, calculDeclarationTVA } from '../src/calc/tva.js';
import { droitVenteImmeuble, droitBail, droitCessionParts, droitSuccession, droitDonation } from '../src/calc/de.js';
import { droitVisa, droitsArmes } from '../src/calc/timbre.js';
import { calculTaxeAssurance } from '../src/calc/assurance.js';
import { ageEnMois, trancheAge, calculTVM, calculTVMForfait } from '../src/calc/tvm.js';
import { calculTTM } from '../src/calc/ttm.js';
import { calculTaxeSpeciale } from '../src/calc/taxeSpeciale.js';
import { calculPrelevement } from '../src/calc/prelevementAlcools.js';
import { calculAccises, chercherProduits } from '../src/calc/accises.js';
import { calculIFT } from '../src/calc/ift.js';
import { calculIFPB } from '../src/calc/ifpb.js';
import { calculPenalitesLocales, calculAmende } from '../src/calc/penalites.js';
import { calculTPC } from '../src/calc/tpc.js';
import { calculTRD } from '../src/calc/trd.js';
import { calculSejour } from '../src/calc/sejour.js';
import { calculLicence, calculLicenceForaine, calculLicenceNuit, calculLicenceTombola } from '../src/calc/licence.js';
import { calculAppareils } from '../src/calc/appareils.js';
import { calculEaux } from '../src/calc/eaux.js';
import { tarifAffiche, calculPanneaux, calculPubliciteMedia } from '../src/calc/publicite.js';
import { calculEauElec } from '../src/calc/eauElec.js';
import { calculFetes } from '../src/calc/fetes.js';
import { calculPylones } from '../src/calc/pylones.js';
import { calculJeuxTv } from '../src/calc/jeuxTv.js';
import { lireRoute, lien, lienModule } from '../src/routes.js';
import { datesEcheance, ajouterMois, calendrier } from '../src/calendrier.js';
import { finPrescription } from '../src/prescription.js';
import { FICHES } from '../src/fiches/index.js';
import { etat, fmt, tr } from '../src/ui.js';

const lire = f => JSON.parse(readFileSync(new URL('../' + f, import.meta.url)));
const b = lire('data/baremes-2026.json');
const obligations = lire('data/obligations.json');
const LANGUES = ['fr', 'en', 'mg'];
const trilingue = o => LANGUES.every(l => typeof o?.[l] === 'string' && o[l].trim() !== '');

// --- IRSA régime spécial (CDI 01.03.16 B) ---
test('IRSA régime spécial : paliers 700 et 2 000 Ar inclus dans le palier inférieur', () => {
  assert.equal(calculIRSASpecial(100000, 700, b).taux, 0.02);
  assert.equal(calculIRSASpecial(100000, 701, b).taux, 0.04);
  assert.equal(calculIRSASpecial(100000, 2000, b).taux, 0.04);
  assert.equal(calculIRSASpecial(100000, 2001, b).taux, 0.10);
});
test('IRSA régime spécial : 300 000 Ar à 1 500 Ar l’unité = 12 000 Ar', () => {
  assert.equal(calculIRSASpecial(300000, 1500, b).impot, 12000);
});
test('IRSA régime spécial : impôt arrondi à la centaine inférieure', () => {
  // 123 456 × 10 % = 12 345,6 → 12 300
  assert.equal(calculIRSASpecial(123456, 5000, b).impot, 12300);
});

// --- Exemple de la fiche IRSA : 1 200 000 Ar brut, 2 personnes à charge ---
test('IRSA exemple de la fiche : 1 200 000 Ar brut, 2 enfants = 138 700 Ar', () => {
  // cotisations 12 000 + 12 000 → base 1 176 000 ;
  // 2 500 + 10 000 + 15 000 + 20 % × 576 000 = 142 700 ; − 4 000 = 138 700
  const r = calculIRSA(1200000, b, { personnesACharge: 2 });
  assert.equal(r.base, 1176000);
  assert.equal(r.bareme, 142700);
  assert.equal(r.impot, 138700);
  assert.equal(FICHES.irsa.impotExemple(b), 138700);
});

// --- IS (CDI 01.02.05, 01.02.05 bis, 01.02.06) ---
test('IS : réduction sur achats, salaires et autres charges admises', () => {
  // 5 % × 36 000 000 = 1 800 000 ; 2 % × (12 000 000 + 5 000 000) = 340 000
  assert.equal(calculIS({ ca: 36000000, achats: 12000000, autresCharges: 5000000 }, b).impot, 1460000);
});
test('IS : taux réduit de 3 %, sans plancher qui dépasse l’impôt avant réduction', () => {
  // base 1 230 000 × 3 % = 36 900, alors que 3 % du CA non arrondi = 37 037
  const r = calculIS({ ca: 1234567, tauxReduit: true }, b);
  assert.equal(r.impot, 36900);
  assert.equal(r.plancherApplique, false);
  const r2 = calculIS({ ca: 1234567, achats: 1000000, tauxReduit: true }, b);
  assert.equal(r2.impot, 36900);
  assert.ok(r2.plancherApplique);
});
test('IS : acompte de début d’activité selon la catégorie', () => {
  assert.equal(acompteDebutActivite(0, b), 16000);
  assert.equal(acompteDebutActivite(1, b), 50000);
  assert.equal(acompteDebutActivite(2, b), 100000);
  assert.equal(acompteDebutActivite(3, b), 150000);
});
test('IS exemple de la fiche : 36 M de CA, 12 M d’achats = 1 560 000 Ar', () => {
  assert.equal(FICHES.is.impotExemple(b), 1560000);
});

// --- IR (CDI 01.01.14, 01.01.16) ---
test('IR : bénéfice arrondi au millier inférieur', () => {
  const r = calculIR({ benefice: 12345678, caHT: 0 }, b);
  assert.equal(r.base, 12345000);
  assert.equal(r.impot, 2469000);
});
test('IR : réduction de 24 000 Ar par personne à charge', () => {
  // 20 % × 100 000 000 − 2 × 24 000
  assert.equal(calculIR({ benefice: 100000000, caHT: 400000000, personnesACharge: 2 }, b).impot, 19952000);
});
test('IR : la réduction ne fait pas descendre sous le minimum de perception', () => {
  // 1 020 000 − 48 000 = 972 000 < 1 000 000
  const r = calculIR({ benefice: 5100000, caHT: 0, personnesACharge: 2 }, b);
  assert.equal(r.impot, 1000000);
  assert.ok(r.minimumApplique);
});
test('IR : minimum selon la catégorie d’activité', () => {
  assert.equal(calculIR({ benefice: 0, caHT: 300000000, categorie: 'activitesProductives' }, b).impot, 3500000);
  assert.equal(calculIR({ benefice: 0, caHT: 300000000, categorie: 'petrolieres' }, b).impot, 3100000);
  assert.equal(calculIR({ benefice: 0, caHT: 1000000000, categorie: 'carburantDetail' }, b).impot, 1000000);
});
test('IR exemple de la fiche : minimum de 7 000 000 Ar appliqué', () => {
  assert.equal(FICHES.ir.impotExemple(b), 7000000);
});

// --- IRM, IRCM, IPVI : exemples des fiches ---
test('IRM exemple de la fiche : 50 M Ar de marché = 4 000 000 Ar', () => {
  assert.equal(FICHES.irm.impotExemple(b), 4000000);
});
test('IRCM : ristournes de coopérative à 10 %, base au millier inférieur', () => {
  // 1 234 567 → 1 234 000 × 10 % = 123 400
  assert.equal(calculIRCMf({ montant: 1234567, nature: 'cooperative' }, b).impot, 123400);
});
test('IRCM exemple de la fiche : 2 M Ar de dividendes = 200 000 Ar', () => {
  assert.equal(FICHES.ircm.impotExemple(b), 200000);
});
test('IPVI exemple de la fiche : terrain vendu 80 M Ar = 4 000 000 Ar', () => {
  // plus-value 25 % × 80 000 000 = 20 000 000 ; 20 %
  assert.equal(FICHES.ipvi.impotExemple(b), 4000000);
});
test('IDH : fiche sans calculateur, redevance lue dans le barème', () => {
  assert.equal(FICHES.idh.monterCalculateur, undefined);
  etat.lang = 'fr';
  assert.match(FICHES.idh.variables(b).petrole, /^8 % jusqu'à 25 000, .* 20 % au-delà \(barils par jour\)$/);
});
test('Toutes les fiches de la phase 1 sont présentes et ont leurs obligations', () => {
  for (const id of ['ir', 'idh', 'irm', 'is', 'irsa', 'ircm', 'ipvi']) {
    assert.ok(FICHES[id], id);
    for (const cle of ['qui', 'ou', 'document', 'quand']) assert.ok(obligations[id]?.[cle]?.length, `${id}.${cle}`);
  }
});

// --- TVA (CDI 06.01.12, 06.01.16, 06.01.23) ---
test('TVA déclaration : collectée moins déductible = à payer', () => {
  const r = calculDeclarationTVA({ ventes: [{ ht: 30000000, taux: 0.2 }], tvaDeductible: 3000000 }, b);
  assert.equal(r.collectee, 6000000);
  assert.equal(r.aPayer, 3000000);
  assert.equal(r.credit, 0);
});
test('TVA déclaration : crédit quand les déductions dépassent la TVA collectée', () => {
  // 20 % × 1 000 000 = 200 000 ; 500 000 déductible → crédit de 300 000
  const r = calculDeclarationTVA({ ventes: [{ ht: 1000000, taux: 0.2 }], tvaDeductible: 500000 }, b);
  assert.equal(r.aPayer, 0);
  assert.equal(r.credit, 300000);
});
test('TVA déclaration : exportations à 0 %, crédit antérieur imputé, arrondi à la centaine', () => {
  // 20 % × 1 234 567 = 246 913,4 ; − 20 000 − 10 000 = 216 913,4 → 216 900
  const r = calculDeclarationTVA({ ventes: [{ ht: 1234567, taux: 0.2 }, { ht: 5000000, taux: 0 }],
    tvaDeductible: 20000, creditAnterieur: 10000 }, b);
  assert.equal(r.aPayer, 216900);
});
test('TVA : taux réduit de 10 % sur le gaz butane (CDI 06.01.12)', () => {
  assert.equal(b.tva.tauxReduitGaz, 0.10);
  assert.equal(calculTVAf({ montant: 50000, taux: b.tva.tauxReduitGaz }).ttc, 55000);
});
test('TVA exemple de la fiche : 30 M de ventes, 3 M déductible = 3 000 000 Ar', () => {
  assert.equal(FICHES.tva.impotExemple(b), 3000000);
});

// --- Droits d'enregistrement (CDI 02.01.05, 02.02.02, 02.02.12, 02.02.39, 02.02.43, 02.03.25) ---
test('DE vente d’immeuble : 5 % du prix, relevé à la valeur administrative', () => {
  assert.equal(droitVenteImmeuble({ prix: 40000000 }, b).impot, 2000000);
  const r = droitVenteImmeuble({ prix: 40000000, valeurAdministrative: 60000000 }, b);
  assert.ok(r.valeurAdministrativeAppliquee);
  assert.equal(r.impot, 3000000);
});
test('DE : base arrondie au millier et minimum de 20 000 Ar', () => {
  // 1 234 567 → 1 234 000 × 5 % = 61 700
  assert.equal(droitVenteImmeuble({ prix: 1234567 }, b).impot, 61700);
  const r = droitVenteImmeuble({ prix: 200000 }, b);
  assert.ok(r.minimumApplique);
  assert.equal(r.impot, 20000);
});
test('DE bail : loyers cumulés sur la durée ; durée indéterminée = un an', () => {
  // 500 000 × 36 = 18 000 000 × 1 %
  assert.equal(droitBail({ loyerMensuel: 500000, dureeMois: 36, usage: 'habitation' }, b).impot, 180000);
  // 500 000 × 12 = 6 000 000 × 2 %
  assert.equal(droitBail({ loyerMensuel: 500000, usage: 'autre' }, b).impot, 120000);
});
test('DE cession de parts : 0,5 %, valeur réelle si plus élevée, minimum', () => {
  assert.equal(droitCessionParts({ prix: 10000000 }, b).impot, 50000);
  assert.equal(droitCessionParts({ prix: 10000000, valeurReelle: 20000000 }, b).impot, 100000);
  assert.equal(droitCessionParts({ prix: 1000000 }, b).impot, 20000);
});
test('DE succession : tarif par héritier, perception suspendue', () => {
  const r = droitSuccession({ lien: 'collaterale', heritiers: 3 }, b);
  assert.equal(r.tarif, 60000);
  assert.ok(r.suspendue);
  assert.equal(r.impot, 0);
});
test('DE donation : 5 %, ou 40 000 Ar par enfant ou petit-enfant', () => {
  assert.equal(droitDonation({ valeur: 20000000 }, b).impot, 1000000);
  assert.equal(droitDonation({ valeur: 20000000, ligneDirecteDescendante: true, donataires: 2 }, b).impot, 80000);
});
test('DE exemple de la fiche : terrain de 40 M Ar = 2 000 000 Ar', () => {
  assert.equal(FICHES.de.impotExemple(b), 2000000);
});

// --- Timbre (CDI 02.05.06 à 02.05.08) ---
test('Timbre : visa 3 ans à demi-tarif, sauf visas transformables', () => {
  assert.equal(droitVisa({ id: 'v3a' }, b).montant, 292500);
  assert.equal(droitVisa({ id: 'v3a', demiTarif: true }, b).montant, 146250);
  assert.equal(droitVisa({ id: 'vtransf', demiTarif: true }, b).montant, 182000);
});
test('Timbre : 3 armes et un permis = 80 000 Ar', () => {
  assert.equal(droitsArmes({ armes: 3, permis: true }, b).total, 80000);
});

// --- Assurance (CDI 02.06.02, 02.06.17) ---
test('Assurance auto d’un particulier : 4,5 % + TACAVA 10 %', () => {
  const r = calculTaxeAssurance({ prime: 600000, categorie: 'autres', tacava: true }, b);
  assert.equal(r.taxe, 27000);
  assert.equal(r.tacava, 60000);
  assert.equal(r.primeTTC, 687000);
  assert.equal(FICHES.assurance.impotExemple(b), 87000);
});
test('Assurance incendie d’un logement : 20 %', () => {
  assert.equal(calculTaxeAssurance({ prime: 1000000, categorie: 'incendieAutre' }, b).total, 200000);
});

// --- TVM (CDI 02.09.06) ---
test('TVM : âge au 1er janvier et tranches (5 ans inclus, puis plus de 5 ans)', () => {
  assert.equal(ageEnMois(2021, 1, 2026), 60);
  assert.equal(trancheAge(60, b), 0);
  assert.equal(trancheAge(61, b), 1);
  assert.equal(trancheAge(240, b), 2);
  assert.equal(trancheAge(241, b), 3);
});
test('TVM : cases du tableau recopiées depuis l’article 02.09.06', () => {
  const v = (classe, energie, annee) => calculTVM({ classe, energie, anneeMiseEnCirculation: annee, anneeImposition: 2026 }, b).taxe;
  assert.equal(v('1-4', 'electrique', 2025), 5000);
  assert.equal(v('10-12', 'diesel', 2018), 105000);
  assert.equal(v('13-15', 'hybride', 2010), 135000);
  assert.equal(v('16+', 'diesel', 1990), 340000);
  assert.equal(v('5-9', 'essence', 2024), 30000);
});
test('TVM exemple de la fiche : 7 CV essence de juin 2018 = 55 000 Ar ; aéronef 2 000 000 Ar', () => {
  assert.equal(FICHES.tvm.impotExemple(b), 55000);
  assert.equal(calculTVMForfait('aeronef', b), 2000000);
});

// --- TTM, taxe spéciale, prélèvement (CDI 03.02.02, 03.02.07, 03.02.18) ---
test('TTM : 5 % des frais, pas du montant envoyé', () => {
  assert.equal(calculTTM(1000, b).taxe, 50);
  assert.equal(calculTTM(2000000000, b).impot, 100000000);
  assert.equal(FICHES.ttm.impotExemple(b), 100000000);
});
test('Taxe spéciale : rhum au litre d’alcool pur', () => {
  // 1 000 l à 40° = 400 LAP × 30 Ar = 12 000 Ar
  const r = calculTaxeSpeciale({ produit: 'rhum', quantite: 1000, degre: 40 }, b);
  assert.equal(r.unites, 400);
  assert.equal(r.impot, 12000);
});
test('Taxe spéciale : cigarettes, bière, whisky', () => {
  assert.equal(calculTaxeSpeciale({ produit: 'cigarettes', quantite: 1 }, b).taxe, 10);
  assert.equal(calculTaxeSpeciale({ produit: 'vinBiere', quantite: 100000 }, b).impot, 600000);
  assert.equal(calculTaxeSpeciale({ produit: 'whisky', quantite: 1000 }, b).impot, 75000);
  assert.equal(FICHES.tsabtj.impotExemple(b), 600000);
});
test('Prélèvement sur les alcools : 4 Ar par litre, export exonéré', () => {
  assert.equal(calculPrelevement({ litres: 100000 }, b).impot, 400000);
  assert.equal(calculPrelevement({ litres: 100000, litresExport: 30000 }, b).impot, 280000);
  assert.equal(FICHES.ppa.impotExemple(b), 400000);
});

// --- Droit d'accises : tableau extrait (annexe 2) et calcul (CDI 03.01.04, CPF II-95) ---
const accises = lire('data/accises-2026.json').produits;
const ligneDA = code => accises.find(p => p.code === code);
test('Accises : 181 lignes extraites, toutes avec deux taux lisibles', () => {
  assert.equal(accises.length, 181);
  for (const p of accises) for (const x of [p.local, p.importe]) assert.ok(['exonere', 'advalorem', 'specifique'].includes(x.type), p.code);
});
test('Accises : lignes témoins recopiées depuis le Code', () => {
  assert.deepEqual([ligneDA('0409.00 00').local.type, ligneDA('0409.00 00').importe.taux], ['exonere', 0.05]);
  const jus = ligneDA('2009.11 00');
  assert.deepEqual([jus.local.taux, jus.local.valeurMinimale.montant, jus.importe.taux, jus.importe.valeurMinimale.montant], [0.025, 50, 0.10, 200]);
  const biere = ligneDA('2203.00 90');
  assert.deepEqual([biere.local.taux, biere.local.valeurMinimale.montant, biere.importe.taux, biere.importe.valeurMinimale], [0.125, 850, 0.5, undefined]);
  assert.deepEqual([ligneDA('2207.10 00').local.montant, ligneDA('2207.10 00').importe.montant], [3050, 4050]);
  assert.deepEqual([ligneDA('2402.20 00').local.montant, ligneDA('2402.20 00').local.unite, ligneDA('2402.20 00').importe.taux], [1440, 'paquet de 20', 3.25]);
  assert.equal(ligneDA('2403.11 00').importe.montant, 25000);
  assert.equal(ligneDA('8703.21 92').importe.taux, 0.10);
  assert.deepEqual([ligneDA('service').local.taux, ligneDA('service').importe.taux], [0.08, 0.08]);
});
test('Accises : ad valorem, valeur minimale, spécifique, exonéré', () => {
  const biere = ligneDA('2203.00 90');
  // 12,5 % × 3 000 000 (au-dessus de 1 000 l × 850 Ar)
  assert.equal(calculAccises(biere, { origine: 'local', valeur: 3000000, quantite: 1000 }, b).impot, 375000);
  // valeur 500 000 < 1 000 × 850 = 850 000 → 12,5 % × 850 000 = 106 250 → 106 200
  const r = calculAccises(biere, { origine: 'local', valeur: 500000, quantite: 1000 }, b);
  assert.ok(r.valeurMinimaleAppliquee);
  assert.equal(r.impot, 106200);
  assert.equal(calculAccises(ligneDA('2402.20 00'), { origine: 'local', quantite: 100 }, b).impot, 144000);
  assert.equal(calculAccises(ligneDA('2402.20 00'), { origine: 'importe', valeur: 1000000 }, b).impot, 3250000);
  assert.equal(calculAccises(ligneDA('0409.00 00'), { origine: 'local', valeur: 1000000 }, b).impot, 0);
  assert.equal(FICHES.da.impotExemple(b), 375000);
});
test('Accises : recherche par nom (sans accents) ou par code', () => {
  assert.ok(chercherProduits(accises, 'biere').some(p => p.code === '2203.00 90'));
  assert.ok(chercherProduits(accises, '2203').length >= 2);
  assert.equal(chercherProduits(accises, '').length, 0);
});

// --- Impôts fonciers (CDI 10.01.07, 10.02.06, 10.02.09, 10.02.10) et pénalité locale (20.01.53.4) ---
test('IFT : tarif par hectare voté, 1 % de la valeur en catégorie 6, minimum 2 000 Ar', () => {
  assert.equal(calculIFT({ categorie: 3, hectares: 2, tarifParHa: 5000 }, b).impot, 10000);
  assert.equal(calculIFT({ categorie: 6, valeurVenale: 20000000 }, b).impot, 200000);
  const r = calculIFT({ categorie: 4, hectares: 0, tarifParHa: 5000 }, b);
  assert.ok(r.minimumApplique);
  assert.equal(r.impot, 2000);
  assert.equal(FICHES.ift.impotExemple(b), 10000);
});
test('IFPB : maison louée, loyers ou évaluation communale si plus élevée', () => {
  // 300 000 × 12 = 3 600 000 × 5 %
  assert.equal(calculIFPB({ usage: 'loue', loyersAnnuels: 3600000 }, b).impot, 180000);
  const r = calculIFPB({ usage: 'loue', loyersAnnuels: 3600000, valeurCommission: 5000000 }, b);
  assert.ok(r.commissionAppliquee);
  assert.equal(r.impot, 250000);
  assert.equal(FICHES.ifpb.impotExemple(b), 180000);
});
test('IFPB : résidence principale à 30 %, majoration sans révision, minimum 5 000 Ar', () => {
  // 2 400 000 × 30 % = 720 000 × 5 % = 36 000
  assert.equal(calculIFPB({ usage: 'residencePrincipale', valeurCommission: 2400000 }, b).impot, 36000);
  // 2 400 000 × 1,05 × 30 % × 5 % = 37 800
  assert.equal(calculIFPB({ usage: 'residencePrincipale', valeurCommission: 2400000, sansRevision: true }, b).impot, 37800);
  const r = calculIFPB({ usage: 'residencePrincipale', valeurCommission: 200000 }, b);
  assert.ok(r.minimumApplique);
  assert.equal(r.impot, 5000);
});
test('Impôts locaux : pénalité de retard de 1 % par mois (CDI 20.01.53.4)', () => {
  const r = calculPenalitesLocales({ impot: 100000, moisRetard: 3 }, b);
  assert.equal(r.interets, 3000);
  assert.equal(r.total, 103000);
  assert.ok(FICHES.ift.impotLocal && FICHES.ifpb.impotLocal);
});

// --- TPC, TRD, taxe de séjour (CDI 10.03.03, 10.04.04, 10.05.03) ---
test('TPC : tarifs votés par objet, forfait professionnel', () => {
  const tarifs = { tarifChien: 5000, tarifAnimal: 5000, tarifArme: 5000 };
  assert.equal(calculTPC({ chiens: 2, armes: 1, ...tarifs }, b).impot, 15000);
  assert.equal(calculTPC({ chiens: 2, tarifChien: 3000, tarifAnimal: 0, tarifArme: 0 }, b).impot, 6000);
  assert.equal(calculTPC({ chiens: 40, ...tarifs, professionnel: true }, b).impot, 25000);
  assert.equal(FICHES.tpc.impotExemple(b), 15000);
});
test('TRD : tarif communal, demi-tarif', () => {
  assert.equal(calculTRD({ tarif: 5000 }, b).impot, 5000);
  assert.equal(calculTRD({ tarif: 5000, demiTarif: true }, b).impot, 2500);
  assert.equal(FICHES.trd.impotExemple(b), 2500);
});
test('Taxe de séjour : nuitées × tarif, plafonds par catégorie', () => {
  assert.deepEqual(b.sejour.categories.map(c => c.max), [2000, 1000, 500]);
  assert.equal(calculSejour({ categorie: 'uneATroisEtoiles', nuitees: 600, tarif: 1000 }, b).impot, 600000);
  assert.equal(FICHES.sejour.impotExemple(b), 600000);
});

// --- Licence, appareils, eaux minérales, publicité (CDI 10.06.08 à 10.09.09) ---
test('Licence d’alcool : tarif annuel par trimestre, majoration de nuit', () => {
  assert.deepEqual(b.licence.communes.map(c => [c.min, c.max]), [[800000, 1500000], [600000, 1000000], [350000, 750000], [300000, 500000], [150000, 250000]]);
  assert.equal(calculLicence({ tarifAnnuel: 600000 }, b).impot, 600000);
  assert.equal(calculLicence({ tarifAnnuel: 600000, etablissementNuit: true }, b).impot, 900000);
  assert.equal(calculLicence({ tarifAnnuel: 600000, trimestres: 1 }, b).impot, 150000);
  assert.equal(FICHES.licence.impotExemple(b), 600000);
});
test('Autres licences : foraine, établissement de nuit, tombola', () => {
  assert.equal(calculLicenceForaine({ jours: 3, tarifParJour: 15000 }).impot, 45000);
  assert.equal(calculLicenceNuit({ mois: 12, tarifParMois: 200000 }).impot, 2400000);
  assert.equal(calculLicenceTombola({ billets: 2000000, taux: 0.10 }).impot, 200000);
});
test('Appareils automatiques : tarifs fixes, demi-tarif au second semestre', () => {
  assert.equal(calculAppareils({ machinesASous: 2, autres: 3 }, b).impot, 1100000);
  assert.equal(calculAppareils({ machinesASous: 2, autres: 3, secondSemestre: true }, b).impot, 550000);
});
test('Eaux minérales : litres (fraction comptée) × tarif communal', () => {
  assert.equal(calculEaux({ litres: 300000, tarifParLitre: 20 }).impot, 6000000);
  assert.equal(calculEaux({ litres: 10.2, tarifParLitre: 20 }).litresTaxes, 11);
  assert.equal(FICHES.eaux.impotExemple(b), 6000000);
});
test('Publicité : paliers des affiches, panneaux au m², audiovisuel 1 %', () => {
  assert.deepEqual([25, 40, 200, 201, 350].map(s => tarifAffiche(s, false, b)), [30, 60, 90, 278, 466]);
  assert.equal(tarifAffiche(40, true, b), 120);
  assert.equal(calculPanneaux({ surfaceM2: 12 }, b).impot, 180000);
  assert.equal(calculPanneaux({ surfaceM2: 12.3 }, b).impot, 195000);
  assert.equal(calculPubliciteMedia({ sommes: 50000000 }, b).impot, 500000);
  assert.equal(FICHES.publicite.impotExemple(b), 180000);
});

// --- Eau et électricité, fêtes, pylônes, jeux radiotélévisés (CDI 10.10 à 10.13) ---
test('Eau et électricité : 10 % du montant hors taxe', () => {
  assert.equal(calculEauElec(80000, b).impot, 8000);
  assert.equal(FICHES['eau-elec'].impotExemple(b), 8000);
});
test('Fêtes et spectacles : 5 % des places, 3 % des recettes, cautionnement 5 %', () => {
  assert.equal(calculFetes({ type: 'places', montant: 1000000 }, b).impot, 50000);
  const r = calculFetes({ type: 'spectacle', montant: 15000000, billetsMisEnVente: 20000000 }, b);
  assert.equal(r.impot, 450000);
  assert.equal(r.cautionnement, 1000000);
  assert.equal(FICHES.fetes.impotExemple(b), 450000);
});
test('Pylônes : tarifs votés plafonnés, par pylône et par antenne', () => {
  assert.equal(calculPylones({ pylones: 3, antennes: 2, tarifPylone: 1000000, tarifAntenne: 600000 }).impot, 4200000);
  assert.equal(FICHES.pylones.impotExemple(b), 4200000);
});
test('Jeux radiotélévisés : 10 Ar par SMS, 20 Ar par appel', () => {
  assert.equal(calculJeuxTv({ sms: 50000, appels: 10000 }, b).impot, 700000);
  assert.equal(FICHES['jeux-tv'].impotExemple(b), 700000);
});
test('Les 29 impôts de l’inventaire ont une fiche et des obligations', () => {
  const ids = lire('data/impots.json').impots.map(i => i.id);
  assert.equal(ids.length, 29);
  for (const id of ids) {
    assert.ok(FICHES[id], `fiche ${id}`);
    assert.ok(obligations[id]?.qui?.length && obligations[id]?.quand?.length, `obligations ${id}`);
  }
});

// --- Calendrier fiscal et profils (phase 5, étape 1) ---
const impotsInv = lire('data/impots.json').impots;
const profils = lire('data/profils.json').profils;
test('Calendrier : échéance mensuelle et fin de mois', () => {
  assert.deepEqual(datesEcheance({ mensuel: 15 }, '2026-10-20', '2027-01-20'), ['2026-11-15', '2026-12-15', '2027-01-15']);
  assert.deepEqual(datesEcheance({ annuel: [[1, 'fin'], [4, 'fin']] }, '2027-01-01', '2027-12-31'), ['2027-01-31', '2027-04-30']);
  assert.deepEqual(datesEcheance({ annuel: [[3, 31], [6, 30]] }, '2026-10-23', '2027-10-23'), ['2027-03-31', '2027-06-30']);
});
test('Calendrier : ajout de mois et bornes', () => {
  assert.equal(ajouterMois('2026-10-23', 12), '2027-10-23');
  assert.equal(ajouterMois('2027-01-31', 1), '2027-02-28');
});
test('Calendrier : profil employeur = IRSA chaque mois le 15, plus le versement semestriel', () => {
  const p = profils.find(x => x.id === 'employeur');
  const c = calendrier({ obligations, impots: impotsInv, ids: p.impots, depuis: '2026-10-23', mois: 12 });
  assert.ok(c.every(e => e.id === 'irsa'));
  assert.equal(c.filter(e => e.date.endsWith('-15')).length, 14); // 12 mensuelles + 15 janvier et 15 juillet
  assert.deepEqual(c.slice(0, 2).map(e => e.date), ['2026-11-15', '2026-12-15']);
});
test('Calendrier : propriétaire = IFT et IFPB (15 octobre, 1er mars, 1er avril)', () => {
  const c = calendrier({ obligations, impots: impotsInv, ids: ['ift', 'ifpb'], depuis: '2026-10-23', mois: 12 });
  assert.deepEqual([...new Set(c.map(e => e.date))], ['2027-03-01', '2027-04-01', '2027-10-15']);
});
test('Échéances structurées bien formées et profils cohérents', () => {
  let n = 0;
  for (const [id, o] of Object.entries(obligations)) {
    if (id === 'note') continue;
    for (const q of o.quand ?? []) if (q.echeance) {
      n++;
      const e = q.echeance;
      assert.ok(e.mensuel ? e.mensuel >= 1 && e.mensuel <= 28 : e.annuel.every(([m, j]) => m >= 1 && m <= 12 && (j === 'fin' || (j >= 1 && j <= 31))), `${id}`);
    }
  }
  assert.equal(n, 34);
  for (const p of profils) {
    assert.ok(trilingue(p.libelle) && trilingue(p.description), p.id);
    for (const id of p.impots) assert.ok(impotsInv.some(i => i.id === id), `${p.id} → ${id}`);
  }
});
test('Routes : modules transversaux', () => {
  assert.deepEqual(lireRoute('#/calendrier'), { page: 'module', id: 'calendrier', sous: null });
  assert.deepEqual(lireRoute('#/calendrier/employeur'), { page: 'module', id: 'calendrier', sous: 'employeur' });
  assert.equal(lienModule('calendrier', 'proprietaire'), '#/calendrier/proprietaire');
});

// --- Module Sanctions : amendes du Livre III (CDI 20.01.54 à 20.01.56.7) ---
test('Amendes : insuffisance 40 % avec minimum de 100 000 Ar', () => {
  assert.equal(calculAmende('insuffisance', 1000000, b).amende, 400000);
  const r = calculAmende('insuffisance', 100000, b);
  assert.ok(r.minimumApplique);
  assert.equal(r.amende, 100000);
});
test('Amendes : IRSA non retenu 40 %, retenu non versé 80 %', () => {
  assert.equal(calculAmende('irsaNonRetenu', 500000, b).amende, 200000);
  assert.equal(calculAmende('irsaNonVerse', 500000, b).amende, 400000);
});
test('Amendes : TVA 10, 40, 80 et 150 %', () => {
  assert.deepEqual(['tvaFacture', 'tvaNonApparente', 'tvaDeductionAbusive', 'tvaDissimulation'].map(id => calculAmende(id, 1000000, b).amende),
    [100000, 400000, 800000, 1500000]);
});
test('Amendes : montants fixes et bases particulières', () => {
  assert.equal(calculAmende('refusDocuments', 0, b).amende, 200000);
  assert.equal(calculAmende('autreInfraction', 0, b).amende, 100000);
  assert.equal(calculAmende('sansComptabilite', 300000000, b).amende, 1500000);
  assert.equal(calculAmende('intermittentNonRetenu', 50000, b).amende, 20000);
});
test('Amendes : chaque amende a un article et un libellé de module', () => {
  for (const a of b.amendes.liste) {
    assert.match(a.article, /^CDI 20\.01\.5/, a.id);
    assert.ok(a.fixe || (a.taux > 0 && a.base), a.id);
  }
  assert.deepEqual(lireRoute('#/sanctions'), { page: 'module', id: 'sanctions', sous: null });
});

// --- Guides et prescription (phase 5, étape 3) ---
const guides = lire('data/guides.json').guides;
test('Guides : trois guides complets, chaque texte en trois langues avec son article', () => {
  assert.deepEqual(guides.map(g => g.id), ['immatriculation', 'payer', 'prescription', 'controle', 'reclamer', 'communication']);
  for (const g of guides) {
    assert.ok(trilingue(g.titre) && trilingue(g.intro), g.id);
    for (const e of g.etapes) { assert.ok(e.article && trilingue(e.titre) && trilingue(e.texte), `${g.id} étape`); }
    for (const d of [...g.droits, ...g.sanctions]) assert.ok(d.article && trilingue(d.texte), `${g.id} droit`);
    for (const d of g.delais) assert.ok(d.article && trilingue(d.duree) && trilingue(d.libelle), `${g.id} délai`);
  }
  assert.deepEqual(lireRoute('#/guides/payer'), { page: 'module', id: 'guides', sous: 'payer' });
});
test('Prescription : 3 ans en général, 10 ans pour une succession non déclarée', () => {
  assert.equal(finPrescription('revenus', 2025), '2028-12-31');
  assert.equal(finPrescription('tva', 2026), '2029-12-31');
  assert.equal(finPrescription('successionNonDeclaree', '2024-05-10'), '2034-05-10');
  assert.equal(finPrescription('fluxIllicites', 2020), '2030-12-31');
});

// --- Navigation ---
test('Routes : accueil, fiche, onglet et onglet inconnu', () => {
  assert.deepEqual(lireRoute(''), { page: 'accueil' });
  assert.deepEqual(lireRoute('#/'), { page: 'accueil' });
  assert.deepEqual(lireRoute('#/irsa'), { page: 'fiche', id: 'irsa', onglet: 'comprendre' });
  assert.deepEqual(lireRoute('#/IRSA/calculer'), { page: 'fiche', id: 'irsa', onglet: 'calculer' });
  assert.deepEqual(lireRoute('#/irsa/nimportequoi'), { page: 'fiche', id: 'irsa', onglet: 'comprendre' });
  assert.equal(lien('irsa'), '#/irsa');
  assert.equal(lien('irsa', 'sanctions'), '#/irsa/sanctions');
});

// --- Contenu : trois langues et un article partout ---
test('Obligations : chaque élément a un article (CPF ou CDI) et un texte fr, en, mg', () => {
  for (const [id, o] of Object.entries(obligations)) {
    if (id === 'note') continue;
    for (const [cle, items] of Object.entries(o)) for (const i of items) {
      assert.match(i.article, /^(CPF|CDI) /, `${id}.${cle}`);
      assert.ok(trilingue(i.texte), `${id}.${cle} : traduction manquante`);
    }
  }
});
test('Fiches : textes Comprendre en trois langues, chacun avec son article', () => {
  for (const f of Object.values(FICHES)) {
    const c = f.comprendre;
    for (const i of [c.definition, ...c.quiPaie, ...c.exonerations, ...(c.aSavoir ?? [])]) {
      assert.ok(i.article, `${f.id} : article manquant`);
      assert.ok(trilingue(i.texte), `${f.id} : traduction manquante`);
    }
    assert.ok(trilingue(c.exemple.texte));
  }
});
test('Fiches : toutes les {variables} des textes sont remplacées, dans les trois langues', () => {
  for (const f of Object.values(FICHES)) {
    const c = f.comprendre, v = f.variables ? f.variables(b) : {};
    for (const lang of LANGUES) {
      etat.lang = lang;
      for (const i of [c.definition, ...c.quiPaie, ...c.exonerations, ...(c.aSavoir ?? [])])
        assert.doesNotMatch(fmt(tr(i.texte), v), /\{\w+\}/, `${f.id} ${lang}`);
      assert.doesNotMatch(fmt(tr(c.exemple.texte), c.exemple.valeurs(b)), /\{\w+\}/, `${f.id} ${lang} exemple`);
    }
  }
  etat.lang = 'fr';
});
test('Interface : les trois fichiers de langue ont les mêmes clés', () => {
  const [fr, en, mg] = LANGUES.map(l => Object.keys(lire(`src/i18n/${l}.json`)).sort());
  assert.deepEqual(en, fr);
  assert.deepEqual(mg, fr);
});
