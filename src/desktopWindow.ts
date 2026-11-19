/**
 * Sidequest installée comme application (PWA) sur ordinateur : la fenêtre prend la largeur de l'app
 * (`max-w-md` dans App.tsx) et toute la hauteur de l'écran. Si le navigateur impose une largeur
 * minimale plus grande, l'app remplit la fenêtre (variante `desktop-app`). Sans effet dans
 * un onglet de navigateur ou sur mobile.
 *
 * Chrome et Edge autorisent window.resizeTo() dans une fenêtre d'application installée ;
 * ailleurs l'appel est simplement ignoré.
 */

/** Largeur de l'app en rem : doit suivre `max-w-md` (28rem) du conteneur principal. */
const APP_WIDTH_REM = 28;

export function fitDesktopWindowToMobile() {
  const installed = window.matchMedia('(display-mode: standalone)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (!installed || touchDevice) return;

  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const appWidth = Math.round(APP_WIDTH_REM * rem);
  const screenHeight = window.screen.availHeight;
  if (window.innerWidth === appWidth && window.outerHeight === screenHeight) return;

  // resizeTo() règle la taille extérieure : on ajoute le cadre de la fenêtre (bordures).
  const frame = window.outerWidth - window.innerWidth;
  // Toute la hauteur de l'écran (hors barre des tâches), fenêtre collée en haut.
  const top = (window.screen as Screen & { availTop?: number }).availTop ?? 0;
  try {
    window.moveTo(window.screenX, top);
    window.resizeTo(appWidth + frame, screenHeight);
  } catch {
    /* navigateur qui refuse le redimensionnement : on garde la fenêtre telle quelle */
  }
}
