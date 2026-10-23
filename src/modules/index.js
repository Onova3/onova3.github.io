// Registre des écrans (src/modules/<id>.js). Chaque écran exporte monter(el, contexte).
import * as accueil from './accueil.js';
import * as impots from './impots.js';
import * as calendrier from './calendrier.js';
import * as apprendre from './apprendre.js';
import * as plus from './plus.js';
import * as sanctions from './sanctions.js';
import * as guides from './guides.js';
import * as quiz from './quiz.js';
import * as sources from './sources.js';

export const MODULES_ECRANS = { accueil, impots, calendrier, apprendre, plus, sanctions, guides, quiz, sources };
