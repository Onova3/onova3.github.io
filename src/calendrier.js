// Calcul du calendrier fiscal à partir des échéances structurées de data/obligations.json (fonctions pures).
// Une échéance est { mensuel: jour } ou { annuel: [[mois, jour | 'fin'], ...] }.

const dernierJour = (annee, mois) => new Date(Date.UTC(annee, mois, 0)).getUTCDate();
const iso = (a, m, j) => `${a}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;

/** Dates (AAAA-MM-JJ) d'une échéance comprises entre deux dates incluses. */
export function datesEcheance(spec, debut, fin) {
  const [a0, m0] = debut.split('-').map(Number), [a1, m1] = fin.split('-').map(Number);
  const res = [];
  for (let a = a0, m = m0; a < a1 || (a === a1 && m <= m1); m === 12 ? (a++, m = 1) : m++) {
    const jours = spec.mensuel ? [spec.mensuel] : (spec.annuel ?? []).filter(([mm]) => mm === m).map(([, j]) => j);
    for (const j of jours) res.push(iso(a, m, j === 'fin' ? dernierJour(a, m) : Math.min(j, dernierJour(a, m))));
  }
  return res.filter(d => d >= debut && d <= fin);
}

/** Ajoute un nombre de mois à une date AAAA-MM-JJ (jour ramené au dernier jour du mois si besoin). */
export function ajouterMois(date, n) {
  const [a, m, j] = date.split('-').map(Number);
  const total = a * 12 + (m - 1) + n, na = Math.floor(total / 12), nm = total % 12 + 1;
  return iso(na, nm, Math.min(j, dernierJour(na, nm)));
}

/**
 * Échéances à venir, triées par date.
 * @param {object} d { obligations, impots, ids = null (tous), depuis: 'AAAA-MM-JJ', mois = 12 }
 * @returns [{ date, id, sigle, nom, texte, article }]
 */
export function calendrier({ obligations, impots, ids = null, depuis, mois = 12 }) {
  const fin = ajouterMois(depuis, mois);
  const res = [];
  for (const impot of impots) {
    if (ids && !ids.includes(impot.id)) continue;
    for (const q of obligations[impot.id]?.quand ?? []) {
      if (!q.echeance) continue;
      for (const date of datesEcheance(q.echeance, depuis, fin))
        res.push({ date, id: impot.id, sigle: impot.sigle, nom: impot.nom, texte: q.texte, article: q.article });
    }
  }
  return res.sort((x, y) => x.date.localeCompare(y.date) || x.sigle.localeCompare(y.sigle));
}
