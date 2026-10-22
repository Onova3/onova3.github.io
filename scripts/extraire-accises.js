// Extrait le tableau du droit d'accises (CDI, Partie III, annexe 2) de codes/CDI-2026.txt
// vers data/accises-2026.json. Usage : node scripts/extraire-accises.js
// Les lignes que le script ne sait pas lire sont listées à l'écran, sans être devinées :
// elles se corrigent dans CORRECTIONS ci-dessous, après lecture du Code.
import { readFileSync, writeFileSync } from 'node:fs';

const racine = new URL('..', import.meta.url);
const texte = readFileSync(new URL('codes/CDI-2026.txt', racine), 'utf8').split(/\r?\n/);

const debut = texte.findIndex(l => /^ANNEXE 2/.test(l.trim()));
const fin = texte.findIndex((l, i) => i > debut && /^\s*TITRE II\s*$/.test(l));
if (debut < 0 || fin < 0) throw new Error('Annexe 2 introuvable');

// Code tarifaire en début de ligne : 0409.00 00, 09.02, 22 03 00, 2208.40, 39.23.29 90 (coquille du Code)…
const CODE = /^\s{0,6}(\d{2}\.\d{2}\.\d{2} \d{2}|\d{4}\.\d{2}(?: \d{2})?|\d{2} \d{2}(?: \d{2})?|\d{2}\.\d{2})\s{2,}(.*)$/;
// Un taux : Exo, 5%, 2,5 %, 325 %, Ar 50/L, Ar 25 000/Kg, Ar 1440, Ar 5/Pièce
const TAUX = /(exo|\d+(?:,\d+)?\s?%|Ar ?\d{1,3}(?: \d{3})+(?:\/\s?[A-Za-zè]+)?|Ar ?\d+(?:\/\s?[A-Za-zè]+)?)/gi;
const BRUIT = /^(Code des impôts|TAUX ET TARIF|TARIF NUMERO|LOCAL\s+IMPORTE|\d+$)/i;

/** Corrections faites à la main après lecture du Code. */
const CORRECTIONS = {
  // « Par paquet de 20 » est écrit au-dessus de la colonne locale de la position 24.02.
  '2402.10 00': { uniteLocale: 'paquet de 20' }, '2402.20 00': { uniteLocale: 'paquet de 20' }, '2402.90 00': { uniteLocale: 'paquet de 20' },
};

const lireTaux = s => {
  s = s.replace(/\s+/g, ' ').trim();
  if (/^exo$/i.test(s)) return { type: 'exonere' };
  const pct = s.match(/^(\d+(?:,\d+)?) ?%$/);
  if (pct) return { type: 'advalorem', taux: Number(pct[1].replace(',', '.')) / 100 };
  const sp = s.match(/^Ar ?([\d ]+)(?:\/ ?([A-Za-zè]+))?$/);
  if (sp) return { type: 'specifique', montant: Number(sp[1].replace(/ /g, '')), unite: normaliserUnite(sp[2]) };
  return { type: 'inconnu', brut: s };
};
const normaliserUnite = u => ({ l: 'litre', kg: 'kg', 'pièce': 'pièce', piece: 'pièce' })[(u ?? '').toLowerCase()] ?? (u ? u.toLowerCase() : null);

/** Taux d'une ligne, avec leur colonne : seulement ce qui suit la désignation (points de suite ou 3 espaces). */
function tauxDeLigne(ligne, avecCode) {
  const corps = avecCode ? ligne.replace(CODE, (m, c, reste) => ' '.repeat(m.length - reste.length) + reste) : ligne;
  const sep = corps.search(/(…|\.{3,}|\S\s{3,}(?=\S))/);
  // Une ligne qui ne contient que des taux (taux reportés sous la désignation) se lit en entier.
  const depuis = /^\s*(exo|\d+(?:,\d+)?\s?%|Ar ?\d)/i.test(corps) ? 0 : sep < 0 ? corps.length : sep + 1;
  const res = [];
  for (const m of corps.slice(depuis).matchAll(TAUX)) res.push({ brut: m[1], col: depuis + m.index });
  return { res, texte: corps.slice(0, depuis) };
}

const entrees = [];
let courante = null, position = '', positionCode = '', sousTitre = '', sousTitreCode = '', attenteMinimum = false;
const quatre = code => code.replace(/\D/g, '').slice(0, 4);
const fermer = () => { if (courante) entrees.push(courante); courante = null; };

for (let i = debut + 1; i < fin; i++) {
  const ligne = texte[i], net = ligne.trim();
  if (!net || BRUIT.test(net)) continue;
  if (/^DESIGNATION DES SERVICES/.test(net)) { fermer(); courante = { code: 'service', designation: '', taux: [], ligneSource: i + 2 }; position = ''; sousTitre = ''; continue; }
  if (/^(Note explicative|\(\d\))/.test(net)) { fermer(); continue; }
  if (/Sans être|sans être/.test(net) && courante?.taux.length) { attenteMinimum = true; continue; }
  if (/^inférieur à/.test(net)) { attenteMinimum = true; continue; }
  if (attenteMinimum && courante && /^Ar /.test(net)) {
    // Chaque minimum se rattache à la colonne de taux la plus proche.
    for (const m of ligne.matchAll(TAUX)) {
      const proche = courante.taux.reduce((a, t) => (Math.abs(t.col - m.index) < Math.abs(a.col - m.index) ? t : a));
      proche.minimum = m[1];
    }
    attenteMinimum = false;
    continue;
  }
  attenteMinimum = false;
  const m = ligne.match(CODE);
  if (m) {
    fermer();
    const code = m[1].replace(/^(\d{2})\.(\d{2})\.(\d{2}) /, '$1$2.$3 ').replace(/\s+/g, ' ').trim();
    courante = { code, designation: '', taux: [], ligneSource: i + 1, position, positionCode, sousTitre, sousTitreCode };
  } else if (!courante || courante.taux.length) {
    // Texte hors produit : sous-titre (« - Jus d'orange : ») qui sert de contexte aux lignes suivantes.
    fermer();
    if (/^-/.test(net)) { sousTitre = net.replace(/[ :…]+$/, ''); sousTitreCode = positionCode; }
    continue;
  }
  const { res, texte: t } = tauxDeLigne(ligne, Boolean(m));
  courante.designation = (courante.designation + ' ' + t).replace(/\s+/g, ' ').replace(/[ .…]+$/, '').trim();
  courante.taux.push(...res);
  // Une position à 4 chiffres sans taux (« 20.09 Jus de fruits… ») devient le contexte des lignes suivantes.
  if (m && !res.length && /^\d{2}[ .]\d{2}$/.test(courante.code)) { position = courante.designation; positionCode = courante.code; sousTitre = ''; sousTitreCode = ''; }
  // Un en-tête à 6 chiffres sans taux (« 2008.20 Ananas : », « 22 03 00 Bières de malt ») devient un sous-titre.
  else if (m && !res.length && /^(\d{4}\.\d{2}|\d{2} \d{2} \d{2})$/.test(courante.code)) { sousTitre = courante.designation.replace(/[ :]+$/, ''); sousTitreCode = courante.code; }
}
fermer();

const produits = [], anomalies = [];
for (const e of entrees) {
  if (!e.taux.length) {
    if (/^(\d{2}[ .]\d{2}|\d{4}\.\d{2}|\d{2} \d{2} \d{2})$/.test(e.code)) continue; // en-tête de position ou de sous-position
    if (e.code !== 'service') anomalies.push({ ...e, raison: 'aucun taux' });
    continue;
  }
  if (e.taux.length !== 2) { anomalies.push({ ...e, raison: `${e.taux.length} taux trouvé(s)` }); continue; }
  const [local, importe] = e.taux.map(t => ({ ...lireTaux(t.brut), ...(t.minimum ? { valeurMinimale: lireTaux(t.minimum) } : {}) }));
  if ([local, importe].some(x => x.type === 'inconnu')) { anomalies.push({ ...e, raison: 'taux illisible' }); continue; }
  const corr = CORRECTIONS[e.code] ?? {};
  if (corr.uniteLocale) local.unite = corr.uniteLocale;
  // Le contexte ne vaut que pour les produits de la même position (mêmes 4 premiers chiffres).
  const memePos = c => c && quatre(c) === quatre(e.code);
  const contexte = [memePos(e.positionCode) ? e.position : '',
    memePos(e.sousTitreCode) && !e.designation.startsWith(e.sousTitre) ? e.sousTitre : ''].filter(Boolean).join(' › ');
  produits.push({ code: e.code, designation: e.designation.replace(/^[- ]+/, ''), contexte, local, importe, ligneSource: e.ligneSource });
}

writeFileSync(new URL('data/accises-2026.json', racine), JSON.stringify({
  note: "Tableau du droit d'accises (CDI 2026, Partie III, annexe 2), extrait par scripts/extraire-accises.js. Désignations en français, telles que dans le Code. « valeurMinimale » reprend le « Sans être inférieur à » du Code : valeur taxable minimale par unité (CPF II-95).",
  article: 'CDI 03.01.01, 03.01.04, annexe 2',
  produits,
}, null, 1) + '\n');

console.log(`${produits.length} produits extraits, ${anomalies.length} ligne(s) à vérifier.`);
for (const a of anomalies) console.log(`- ligne ${a.ligneSource} · ${a.code} · ${a.designation.slice(0, 70)} → ${a.raison} [${a.taux.map(t => t.brut).join(' | ')}]`);
