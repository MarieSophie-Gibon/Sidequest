/**
 * Sidequest installée comme application (PWA) sur ordinateur : la fenêtre prend exactement
 * la largeur de l'app (le cadre au fond d'écran, `max-w-md` dans App.tsx). Sans effet dans
 * un onglet de navigateur ou sur mobile.
 *
 * Chrome et Edge autorisent window.resizeTo() dans une fenêtre d'application installée ;
 * ailleurs l'appel est simplement ignoré.
 */

/** Largeur de l'app en rem : doit suivre `max-w-md` (28rem) du conteneur principal. */
const APP_WIDTH_REM = 28;
const MAX_HEIGHT = 900;

export function fitDesktopWindowToMobile() {
  const installed = window.matchMedia('(display-mode: standalone)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (!installed || touchDevice) return;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const appWidth = Math.round(APP_WIDTH_REM * rem);
  if (window.innerWidth === appWidth) return;

  // resizeTo() règle la taille extérieure : on ajoute le cadre de la fenêtre (bordures).
  const frame = window.outerWidth - window.innerWidth;
  // On garde la hauteur choisie, sauf si la fenêtre est plus haute qu'un téléphone.
  const height = Math.min(window.outerHeight > MAX_HEIGHT ? MAX_HEIGHT : window.outerHeight, window.screen.availHeight);
  try {
    window.resizeTo(appWidth + frame, height);
  } catch {
    /* navigateur qui refuse le redimensionnement : on garde la fenêtre telle quelle */
  }
}
