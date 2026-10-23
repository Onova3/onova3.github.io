// Module Quiz (#/quiz, #/quiz/<chapitre>) : questions de révision tirées de data/quiz.json. Textes malgaches à relire.
import { corriger } from '../quiz.js';
import { lienModule } from '../routes.js';
import { t, tr, fmt, esc, art } from '../ui.js';

const L = {
  index: { fr: 'Quiz de révision', en: 'Revision quiz', mg: 'Fanontaniana famerenana' },
  indexLead: { fr: 'Testez-vous chapitre par chapitre. Chaque réponse renvoie à son article.', en: 'Test yourself chapter by chapter. Each answer points to its article.', mg: "Andramo ny tenanao isaky ny toko. Misy andininy isaky ny valiny." },
  nb: { fr: '{n} questions', en: '{n} questions', mg: '{n} fanontaniana' },
  juste: { fr: 'Bonne réponse.', en: 'Correct.', mg: 'Marina.' },
  faux: { fr: 'Pas tout à fait.', en: 'Not quite.', mg: 'Tsy marina.' },
  score: { fr: 'Score : {b} / {t}', en: 'Score: {b} / {t}', mg: 'Isa: {b} / {t}' },
  recommencer: { fr: 'Recommencer', en: 'Start again', mg: 'Averina' },
};
const l = (k, vars) => fmt(tr(L[k]), vars);
const choixTexte = c => (typeof c === 'string' ? c : tr(c));

function index(el, chapitres) {
  el.innerHTML = `
    <a class="retour" href="#/">${t('retour')}</a>
    <header class="fiche-tete"><h2>${l('index')}</h2><p class="lead">${l('indexLead')}</p></header>
    <div class="profils">${chapitres.map(c => `<a class="profil" href="${lienModule('quiz', c.id)}"><b>${esc(tr(c.titre))}</b><span>${l('nb', { n: c.questions.length })}</span></a>`).join('')}</div>`;
}

export function monter(el, { quiz, sous }) {
  const c = quiz.find(x => x.id === sous);
  if (!c) return index(el, quiz);
  const reponses = c.questions.map(() => null);
  el.innerHTML = `
    <a class="retour" href="${lienModule('quiz')}">← ${l('index')}</a>
    <header class="fiche-tete"><h2>${esc(tr(c.titre))}</h2></header>
    <ol class="etapes">${c.questions.map((q, i) => `<li class="card quiz-q" data-q="${i}">
      <h3>${esc(tr(q.question))}</h3>
      <div class="quiz-choix">${q.choix.map((ch, j) => `<button type="button" class="chip" data-c="${j}">${esc(choixTexte(ch))}</button>`).join('')}</div>
      <p class="aide" hidden></p></li>`).join('')}</ol>
    <div class="ticket" style="margin-top:18px" aria-live="polite"><div class="rows"><div class="row"><span id="qz-score"></span>
      <button type="button" class="chip" id="qz-reset">${l('recommencer')}</button></div></div></div>`;
  const majScore = () => { const r = corriger(c.questions, reponses); el.querySelector('#qz-score').textContent = l('score', { b: r.bonnes, t: r.total }); };
  el.querySelectorAll('.quiz-q').forEach(li => {
    const i = Number(li.dataset.q), q = c.questions[i];
    li.querySelectorAll('[data-c]').forEach(bt => bt.addEventListener('click', () => {
      if (reponses[i] != null) return;
      reponses[i] = Number(bt.dataset.c);
      li.querySelectorAll('[data-c]').forEach(b => {
        b.disabled = true;
        if (Number(b.dataset.c) === q.bonne) b.classList.add('bon');
      });
      if (reponses[i] !== q.bonne) bt.classList.add('mauvais');
      const p = li.querySelector('p');
      p.hidden = false;
      p.innerHTML = `<b>${l(reponses[i] === q.bonne ? 'juste' : 'faux')}</b> ${esc(tr(q.explication))}${art(q.article)}`;
      majScore();
    }));
  });
  el.querySelector('#qz-reset').addEventListener('click', () => monter(el, { quiz, sous }));
  majScore();
}
