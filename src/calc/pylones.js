/**
 * Taxe sur les pylônes, relais, antennes ou mâts (CDI 10.12.02, 10.12.03) : tarifs votés par la commune sous des maxima.
 * Un pylône est taxé une seule fois quel que soit le nombre d'équipements ; une antenne sur un autre support est taxée par élément.
 * @param {object} d { pylones = 0, antennes = 0, tarifPylone, tarifAntenne }
 */
export function calculPylones({ pylones = 0, antennes = 0, tarifPylone, tarifAntenne }) {
  const lignes = { pylones: pylones * tarifPylone, antennes: antennes * tarifAntenne };
  return { lignes, impot: lignes.pylones + lignes.antennes };
}
