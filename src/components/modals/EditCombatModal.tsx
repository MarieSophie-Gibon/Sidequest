import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
}

export function EditCombatModal({ activeChar, syncCharacterField, onClose }: Props) {
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Combat" onClose={onClose} />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>CA</label>
              <input type="number" value={activeChar.ac} onChange={(e) => syncCharacterField('ac', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Initiative</label>
              <input type="number" value={activeChar.initiative} onChange={(e) => syncCharacterField('initiative', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Perception P.</label>
              <input type="number" value={activeChar.passive_perception} onChange={(e) => syncCharacterField('passive_perception', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Vitesse (m)</label>
              <input type="number" value={activeChar.speed} onChange={(e) => syncCharacterField('speed', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Maîtrise</label>
              <input type="number" min="1" max="10" value={activeChar.proficiency_bonus || 2} onChange={(e) => syncCharacterField('proficiency_bonus', Number(e.target.value))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`} />
            </div>
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
