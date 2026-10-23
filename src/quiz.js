// Correction du quiz (data/quiz.json), fonctions pures.

/** Valeur du barème au chemin « a.b.0.c ». */
export const lireChemin = (objet, chemin) => chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), objet);

/**
 * @param {Array} questions  questions d'un chapitre ({ bonne })
 * @param {Array<number|null>} reponses  indice choisi pour chaque question (null : pas répondu)
 * @returns {{ bonnes: number, repondues: number, total: number }}
 */
export function corriger(questions, reponses) {
  let bonnes = 0, repondues = 0;
  questions.forEach((q, i) => {
    if (reponses[i] == null) return;
    repondues++;
    if (reponses[i] === q.bonne) bonnes++;
  });
  return { bonnes, repondues, total: questions.length };
}
