// « Signaler une erreur » : ouvre un message pré-rempli dans l'application e-mail du téléphone.

/** Adresse de contact choisie par le propriétaire du projet. */
export const CONTACT = 'aureliozafindaza@gmail.com';

/**
 * Lien mailto, fonction pure.
 * @param {{sujet: string, lignes: string[]}} m
 */
export const lienSignalement = ({ sujet, lignes }, contact = CONTACT) =>
  `mailto:${contact}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(lignes.join('\n'))}`;
