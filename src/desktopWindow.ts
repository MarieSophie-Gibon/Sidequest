/**
 * Sidequest installée comme application (PWA) sur ordinateur : la fenêtre prend le format
 * d'un téléphone. Sans effet dans un onglet de navigateur ou sur mobile.
 *
 * Chrome et Edge autorisent window.resizeTo() dans une fenêtre d'application installée ;
 * ailleurs l'appel est simplement ignoré.
 */
const MOBILE_WIDTH = 430;
const MOBILE_HEIGHT = 900;

export function fitDesktopWindowToMobile() {
  const installed = window.matchMedia('(display-mode: standalone)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (!installed || touchDevice) return;

  // Ne redimensionne que si la fenêtre est nettement plus large qu'un téléphone :
  // une taille ajustée à la main par l'utilisateur est conservée.
  if (window.outerWidth <= MOBILE_WIDTH + 100) return;

  const height = Math.min(MOBILE_HEIGHT, window.screen.availHeight);
  try {
    window.resizeTo(MOBILE_WIDTH, height);
  } catch {
    /* navigateur qui refuse le redimensionnement : on garde la fenêtre telle quelle */
  }
}
