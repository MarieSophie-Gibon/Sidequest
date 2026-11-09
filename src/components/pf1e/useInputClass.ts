import { useThemeClasses } from '../../contexts/AppSettingsContext';

/** Classes d'un champ de saisie, identiques aux modales D&D. */
export function useInputClass() {
  const t = useThemeClasses();
  return `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`;
}
