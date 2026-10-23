// Premier lancement : logique pure du parcours (langue → présentation → avertissement).
// L'état est mémorisé par src/stockage.js sous la clé 'bienvenue'.

export const CLE = 'bienvenue';
/** À augmenter si le texte de l'avertissement change : il sera redemandé à tous. */
export const VERSION_AVERTISSEMENT = 1;
export const ETAPES = ['langue', 'presentation', 'avertissement'];
export const DIAPOSITIVES = ['calculer', 'comprendre', 'horsLigne'];

/** Le parcours s'affiche tant que l'avertissement en vigueur n'a pas été accepté. */
export const doitAfficher = memorise => !(memorise && memorise.accepte === VERSION_AVERTISSEMENT);

/**
 * Étape suivante du parcours.
 * @param {{etape: string, diapo: number}} etat
 * @param {'suivant'|'passer'|'accepter'} action
 * @returns {{etape: string, diapo: number}}  etape 'fin' quand le parcours est terminé
 */
export function avancer({ etape, diapo = 0 }, action) {
  if (etape === 'langue') return { etape: 'presentation', diapo: 0 };
  if (etape === 'presentation') {
    if (action === 'passer' || diapo >= DIAPOSITIVES.length - 1) return { etape: 'avertissement', diapo: 0 };
    return { etape, diapo: diapo + 1 };
  }
  if (etape === 'avertissement' && action === 'accepter') return { etape: 'fin', diapo: 0 };
  return { etape, diapo };
}

/** Ce qui est mémorisé à la fin du parcours. */
export const marquerAccepte = date => ({ accepte: VERSION_AVERTISSEMENT, le: date });
