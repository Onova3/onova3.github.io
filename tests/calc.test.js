import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculIRSA, calculIRSASpecial } from '../src/calc/irsa.js';
import { calculIS } from '../src/calc/is.js';
import { calculIR, calculIRM, calculIPVI } from '../src/calc/ir.js';
import { calculIRCM } from '../src/calc/ircm.js';
import { calculTVA } from '../src/calc/tva.js';
import { calculPenalites } from '../src/calc/penalites.js';

const b = JSON.parse(readFileSync(new URL('../data/baremes-2026.json', import.meta.url)));
const sansCotis = { deduireCotisations: false };

test('IRSA : base 784 000 Ar, 1 personne à charge = 62 300 Ar', () => {
  assert.equal(calculIRSA(784000, b, { ...sansCotis, personnesACharge: 1 }).impot, 62300);
});
test('IRSA : minimum de 3 000 Ar quand les réductions descendent plus bas', () => {
  const r = calculIRSA(441000, b, { ...sansCotis, personnesACharge: 3 });
  assert.equal(r.impot, 3000);
  assert.ok(r.minimumApplique);
});
test('IRSA : rien sous 350 000 Ar de base', () => {
  assert.equal(calculIRSA(350000, b, sansCotis).impot, 0);
});
test('IRSA : tranche à 25 % au-delà de 4 M Ar', () => {
  // 2 500 + 10 000 + 15 000 + 680 000 + 25 % de 1 000 000
  assert.equal(calculIRSA(5000000, b, sansCotis).impot, 957500);
});
test('IRSA : cotisations plafonnées à 2 400 000 Ar', () => {
  const r = calculIRSA(5000000, b);
  assert.equal(r.cnaps, 24000);
  assert.equal(r.ostie, 24000);
});
test('IRSA régime spécial : taux unitaire 1 500 Ar = 4 %', () => {
  assert.equal(calculIRSASpecial(100000, 1500, b).taux, 0.04);
});

test('IS : 5 % moins 2 % des achats', () => {
  const r = calculIS({ ca: 36000000, achats: 12000000 }, b);
  assert.equal(r.impot, 1560000);
  assert.equal(r.regime, 'synthetique');
});
test('IS : plancher de 3 % du CA', () => {
  const r = calculIS({ ca: 36000000, achats: 60000000 }, b);
  assert.equal(r.impot, 1080000);
  assert.ok(r.plancherApplique);
});
test('IS : seuils 200 M (option) et 400 M (réel obligatoire)', () => {
  assert.equal(calculIS({ ca: 250000000 }, b).regime, 'option-possible');
  assert.equal(calculIS({ ca: 400000000 }, b).regime, 'reel-obligatoire');
});
test('IS : base arrondie à la dizaine de milliers', () => {
  assert.equal(calculIS({ ca: 1234567 }, b).base, 1230000);
});

test('IR : 20 % du bénéfice quand il dépasse le minimum', () => {
  assert.equal(calculIR({ benefice: 50000000, caHT: 500000000 }, b).impot, 10000000);
});
test('IR : minimum 1 000 000 + 1 % du CA pour une entreprise en perte', () => {
  const r = calculIR({ benefice: -5000000, caHT: 300000000, categorie: 'autres' }, b);
  assert.equal(r.impot, 4000000);
  assert.ok(r.minimumApplique);
});
test('IRM 8 % et IPVI 20 %', () => {
  assert.equal(calculIRM(10000000, b).impot, 800000);
  assert.equal(calculIPVI(30000000, b).impot, 6000000);
});

test('IRCM : abattement de 50 % sur les dividendes', () => {
  assert.equal(calculIRCM({ montant: 2000000, nature: 'dividendes' }, b).impot, 200000);
});
test('IRCM : intérêts au millier inférieur', () => {
  const r = calculIRCM({ montant: 1234567, nature: 'interets' }, b);
  assert.equal(r.base, 1234000);
  assert.equal(r.impot, 246800);
});

test('TVA : HT vers TTC et retour', () => {
  assert.equal(calculTVA({ montant: 100000, taux: 0.2 }).ttc, 120000);
  assert.equal(Math.round(calculTVA({ montant: 120000, taux: 0.2, depuis: 'TTC' }).ht), 100000);
});

test('Pénalités : 1 %/mois sous 100 M, minimum 10 000 Ar', () => {
  const r = calculPenalites({ impot: 500000, moisRetard: 1, ca: 30000000 }, b);
  assert.equal(r.interets, 10000);
  assert.ok(r.minimumApplique);
});
test('Pénalités : 3 % puis 1 % au-delà de 400 M, mois commencé dû', () => {
  const r = calculPenalites({ impot: 1000000, moisRetard: 2.2, ca: 500000000 }, b);
  assert.equal(r.interets, 50000);
});
test('Amende défaut de dépôt selon le CA (LFR 2026)', () => {
  assert.equal(calculPenalites({ impot: 0, moisRetard: 1, ca: 30000000, defautDepot: true }, b).amende, 20000);
  assert.equal(calculPenalites({ impot: 0, moisRetard: 1, ca: 300000000, defautDepot: true }, b).amende, 100000);
});
