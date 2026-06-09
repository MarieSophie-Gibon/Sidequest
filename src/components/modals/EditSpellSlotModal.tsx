import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewSpellSlotState } from '../../hooks/useCharacterData';
import { Sparkle } from 'lucide-react';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  newSpellSlot: NewSpellSlotState;
  setNewSpellSlot: React.Dispatch<React.SetStateAction<NewSpellSlotState>>;
  onSave: () => void;
  onClose: () => void;
}

export function EditSpellSlotModal({ newSpellSlot, setNewSpellSlot, onSave, onClose }: Props) {
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title={<span className="flex items-center gap-1.5"><Sparkle size={16} /> Niveau {newSpellSlot.level}</span>} onClose={onClose} />
        <div className="space-y-3">
          <div className={`${t.inputBg} p-3 rounded-xl border ${t.inputBorder} text-[10px] ${t.textMuted} leading-normal space-y-1`}>
            <p className={`font-bold ${t.accent}`}>Maximums officiels :</p>
            <p>• Niv. 1 → 4 slots • Niv. 2-5 → 3 • Niv. 6-7 → 2 • Niv. 8-9 → 1</p>
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} block mb-1`}>Emplacements disponibles (max total)</label>
            <input
              type="number"
              min="0"
              max="12"
              value={newSpellSlot.max}
              onChange={(e) => {
                const nextMax = Math.max(0, Number(e.target.value) || 0);
                setNewSpellSlot(prev => ({
                  ...prev,
                  max: nextMax,
                  current: Math.min(prev.current, nextMax),
                }));
              }}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs font-mono font-bold text-center focus:outline-none`}
            />
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} block mb-1`}>Slots restants (max. {newSpellSlot.max})</label>
            <input
              type="number"
              min="0"
              max={newSpellSlot.max}
              value={newSpellSlot.current}
              onChange={(e) => setNewSpellSlot(prev => ({ ...prev, current: Math.min(prev.max, Math.max(0, Number(e.target.value) || 0)) }))}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs font-mono font-bold text-center focus:outline-none`}
            />
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onSave} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
