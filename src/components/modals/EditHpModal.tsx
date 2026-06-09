import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  applyDamage: (amount: number) => void;
  applyHealing: (amount: number) => void;
  onClose: () => void;
}

export function EditHpModal({ activeChar, syncCharacterField, applyDamage, applyHealing, onClose }: Props) {
  const [hpActionValue, setHpActionValue] = useState('');
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Vitalité" onClose={onClose} />
        <div className={`grid grid-cols-3 gap-2 ${t.inputBg} p-3 rounded-xl border ${t.inputBorder}`}>
          <div className="text-center">
            <label className={`text-[9px] ${t.textMuted} font-bold block mb-1 uppercase`}>Act.</label>
            <input type="number" value={activeChar.hp_current} onChange={(e) => syncCharacterField('hp_current', Math.min(activeChar.hp_max, Math.max(0, Number(e.target.value))))} className={`${t.cardBg} border ${t.cardBorder} text-emerald-400 rounded-xl p-2 w-full text-center font-mono font-bold focus:outline-none text-sm`} />
          </div>
          <div className="text-center">
            <label className={`text-[9px] ${t.textMuted} font-bold block mb-1 uppercase`}>Temp</label>
            <input type="number" value={activeChar.hp_temp} onChange={(e) => syncCharacterField('hp_temp', Math.max(0, Number(e.target.value)))} className={`${t.cardBg} border ${t.cardBorder} text-cyan-400 rounded-xl p-2 w-full text-center font-mono font-bold focus:outline-none text-sm`} />
          </div>
          <div className="text-center">
            <label className={`text-[9px] ${t.textMuted} font-bold block mb-1 uppercase`}>Max</label>
            <input type="number" value={activeChar.hp_max} onChange={(e) => syncCharacterField('hp_max', Math.max(1, Number(e.target.value)))} className={`${t.cardBg} border ${t.cardBorder} ${t.textSecondary} rounded-xl p-2 w-full text-center font-mono font-bold focus:outline-none text-sm`} />
          </div>
        </div>
        <div className="space-y-2.5">
          <span className={`text-[9px] ${t.textMuted} font-bold uppercase tracking-wider block`}>Calculateur</span>
          <input type="number" placeholder="Valeur" value={hpActionValue} onChange={(e) => setHpActionValue(e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-center font-mono font-semibold focus:outline-none`} />
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { applyDamage(Number(hpActionValue)); setHpActionValue(''); }} className="bg-rose-500/20 border border-rose-500/40 text-rose-400 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 active:scale-95 transition-all">Dégâts</button>
            <button type="button" onClick={() => { applyHealing(Number(hpActionValue)); setHpActionValue(''); }} className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 active:scale-95 transition-all">Soins</button>
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
