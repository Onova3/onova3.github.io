// Seul module qui mémorise des données sur le téléphone (préférences ; plus tard favoris et historique).
// Si le stockage est indisponible (navigation privée, mémoire pleine), l'application continue avec les valeurs par défaut.

const PREFIXE = 'kh-';

/** Valeurs permises et valeur par défaut de chaque préférence. */
export const PREFERENCES = {
  lang: { valeurs: ['fr', 'en', 'mg'], defaut: 'fr' },
  theme: { valeurs: ['auto', 'clair', 'sombre'], defaut: 'auto' },
  taille: { valeurs: ['normale', 'grande', 'tresGrande'], defaut: 'normale' },
};

/** Le stockage du navigateur, ou null s'il est inaccessible. */
function stockageNavigateur() {
  try {
    const s = globalThis.localStorage;
    const test = PREFIXE + 'test';
    s.setItem(test, '1');
    s.removeItem(test);
    return s;
  } catch {
    return null;
  }
}

/**
 * @param {{getItem, setItem, removeItem}|null} support  stockage à utiliser (par défaut celui du navigateur)
 */
export function creerStockage(support = stockageNavigateur()) {
  const memoire = new Map(); // repli : les choix tiennent jusqu'à la fermeture de l'application
  const brut = {
    get: cle => {
      try { if (support) return support.getItem(PREFIXE + cle); } catch {}
      return memoire.has(cle) ? memoire.get(cle) : null;
    },
    set: (cle, valeur) => {
      memoire.set(cle, valeur);
      try { if (support) support.setItem(PREFIXE + cle, valeur); } catch {}
    },
  };
  return {
    disponible: Boolean(support),
    /** Préférence connue de PREFERENCES ; toute valeur inconnue redonne la valeur par défaut. */
    preference(cle) {
      const p = PREFERENCES[cle], v = brut.get(cle);
      return p.valeurs.includes(v) ? v : p.defaut;
    },
    choisir(cle, valeur) {
      if (!PREFERENCES[cle].valeurs.includes(valeur)) return false;
      brut.set(cle, valeur);
      return true;
    },
    /** Données structurées (favoris, historique…) en JSON ; défaut si absentes ou abîmées. */
    lireJSON(cle, defaut) {
      try { const v = brut.get(cle); return v == null ? defaut : JSON.parse(v); } catch { return defaut; }
    },
    ecrireJSON(cle, valeur) { brut.set(cle, JSON.stringify(valeur)); },
  };
}
