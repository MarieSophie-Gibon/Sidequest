/**
 * Réglages publics de SideQuest.
 */

/** Pseudo Ko-fi (https://ko-fi.com/<pseudo>). Vide = le bouton de don n'est pas affiché. */
export const KOFI_USERNAME = 'marieso';

export const KOFI_URL = KOFI_USERNAME ? `https://ko-fi.com/${KOFI_USERNAME}` : null;

/** Widget de don Ko-fi intégré (code fourni par Ko-fi, sans le fil d'actualité). */
export const KOFI_EMBED_URL = KOFI_USERNAME
  ? `https://ko-fi.com/${KOFI_USERNAME}/?hidefeed=true&widget=true&embed=true&preview=true`
  : null;
