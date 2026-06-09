import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
}

export function EditSpellcastingModal({ activeChar, syncCharacterField, onClose }: Props) {
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Incantation" onClose={onClose} />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>DD de Sort</label>
              <input type="number" value={activeChar.spell_dc} onChange={(e) => syncCharacterField('spell_dc', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
              <p className={`text-[9px] ${t.textMuted} mt-1 italic`}>8 + mod.sort + maîtrise</p>
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Mod. Attaque</label>
              <input type="number" value={activeChar.spell_attack} onChange={(e) => syncCharacterField('spell_attack', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
              <p className={`text-[9px] ${t.textMuted} mt-1 italic`}>mod.sort + maîtrise</p>
            </div>
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
