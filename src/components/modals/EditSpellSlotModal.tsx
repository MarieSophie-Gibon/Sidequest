import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewSpellSlotState } from '../../hooks/useCharacterData';
import { Sparkle } from 'lucide-react';

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
        <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase font-mono flex items-center gap-1.5`}>
          <Sparkle size={16} /> Niveau {newSpellSlot.level}
        </h3>
        <div className="space-y-3">
          <div className={`${t.inputBg} p-3 rounded-xl border ${t.inputBorder} text-[10px] ${t.textMuted} leading-normal space-y-1`}>
            <p className={`font-bold ${t.accent}`}>Maximums officiels :</p>
            <p>• Niv. 1 → 4 slots • Niv. 2-5 → 3 • Niv. 6-7 → 2 • Niv. 8-9 → 1</p>
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} block mb-1`}>Slots restants (max. {newSpellSlot.max})</label>
            <input type="number" min="0" max={newSpellSlot.max} value={newSpellSlot.current} onChange={(e) => setNewSpellSlot(prev => ({ ...prev, current: Math.min(newSpellSlot.max, Number(e.target.value)) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs font-mono font-bold text-center focus:outline-none`} />
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${t.cardBorder}`}>
          <button type="button" onClick={onClose} className={`${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold py-2.5 rounded-xl text-xs uppercase border ${t.btnSecondaryBorder} tracking-wider transition-all`}>Annuler</button>
          <button type="button" onClick={onSave} className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md border ${t.btnPrimaryBorder} hover:brightness-110 active:scale-95 transition-all`}>Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
