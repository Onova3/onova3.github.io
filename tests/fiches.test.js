import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculIRSA, calculIRSASpecial } from '../src/calc/irsa.js';
import { calculIS, acompteDebutActivite } from '../src/calc/is.js';
import { calculIR } from '../src/calc/ir.js';
import { calculIRCM as calculIRCMf } from '../src/calc/ircm.js';
import { lireRoute, lien } from '../src/routes.js';
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
