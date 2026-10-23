// Registre des modules transversaux (src/modules/<id>.js). Chaque module exporte monter(el, contexte).
import * as calendrier from './calendrier.js';
import * as sanctions from './sanctions.js';
import * as guides from './guides.js';
import * as quiz from './quiz.js';
import * as sources from './sources.js';

export const MODULES_ECRANS = { calendrier, sanctions, guides, quiz, sources };
