// Registre des modules transversaux (src/modules/<id>.js). Chaque module exporte monter(el, contexte).
import * as calendrier from './calendrier.js';
import * as sanctions from './sanctions.js';

export const MODULES_ECRANS = { calendrier, sanctions };
