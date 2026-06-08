import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
}

export function EditProfileModal({ activeChar, syncCharacterField, onClose }: Props) {
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase`}>Identité du Héros</h3>
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Nom</label>
            <input type="text" value={activeChar.name} onChange={(e) => syncCharacterField('name', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Classe</label>
              <input type="text" value={activeChar.class} onChange={(e) => syncCharacterField('class', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Sous-classe</label>
              <input type="text" value={activeChar.subclass} onChange={(e) => syncCharacterField('subclass', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Niveau</label>
              <input type="number" min="1" max="20" value={activeChar.level} onChange={(e) => syncCharacterField('level', Math.max(1, Math.min(20, Number(e.target.value))))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Maîtrise</label>
              <input type="number" min="1" max="10" value={activeChar.proficiency_bonus || 2} onChange={(e) => syncCharacterField('proficiency_bonus', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
          </div>
        </div>
        <button type="button" onClick={onClose} className={`w-full bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md border ${t.btnPrimaryBorder} hover:brightness-110 active:scale-95`}>Valider & Fermer</button>
      </div>
    </div>
  );
}
