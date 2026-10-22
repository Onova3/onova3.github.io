import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculIRSA, calculIRSASpecial } from '../src/calc/irsa.js';
import { lireRoute, lien } from '../src/routes.js';
import { FICHES } from '../src/fiches/index.js';

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
test('Obligations CPF : chaque élément a un article CPF et un texte fr, en, mg', () => {
  for (const [id, o] of Object.entries(obligations)) {
    if (id === 'note') continue;
    for (const [cle, items] of Object.entries(o)) for (const i of items) {
      assert.match(i.article, /^CPF /, `${id}.${cle}`);
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
test('Interface : les trois fichiers de langue ont les mêmes clés', () => {
  const [fr, en, mg] = LANGUES.map(l => Object.keys(lire(`src/i18n/${l}.json`)).sort());
  assert.deepEqual(en, fr);
  assert.deepEqual(mg, fr);
});
