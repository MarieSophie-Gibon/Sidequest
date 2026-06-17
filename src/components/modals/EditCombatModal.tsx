import { useEffect, useState } from 'react';
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
  const [numberInputs, setNumberInputs] = useState({
    ac: String(activeChar.ac),
    initiative: String(activeChar.initiative),
    passive_perception: String(activeChar.passive_perception),
    speed: String(activeChar.speed),
    proficiency_bonus: String(activeChar.proficiency_bonus ?? 2),
  });

  useEffect(() => {
    setNumberInputs({
      ac: String(activeChar.ac),
      initiative: String(activeChar.initiative),
      passive_perception: String(activeChar.passive_perception),
      speed: String(activeChar.speed),
      proficiency_bonus: String(activeChar.proficiency_bonus ?? 2),
    });
  }, [activeChar.ac, activeChar.initiative, activeChar.passive_perception, activeChar.speed, activeChar.proficiency_bonus]);

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Combat" onClose={onClose} />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>CA</label>
              <input
                type="number"
                value={numberInputs.ac}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNumberInputs(prev => ({ ...prev, ac: nextValue }));
                  if (nextValue === '') return;
                  syncCharacterField('ac', Number(nextValue));
                }}
                onBlur={() => {
                  if (numberInputs.ac === '') setNumberInputs(prev => ({ ...prev, ac: String(activeChar.ac) }));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Initiative</label>
              <input
                type="number"
                value={numberInputs.initiative}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNumberInputs(prev => ({ ...prev, initiative: nextValue }));
                  if (nextValue === '') return;
                  syncCharacterField('initiative', Number(nextValue));
                }}
                onBlur={() => {
                  if (numberInputs.initiative === '') setNumberInputs(prev => ({ ...prev, initiative: String(activeChar.initiative) }));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Perception P.</label>
              <input
                type="number"
                value={numberInputs.passive_perception}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNumberInputs(prev => ({ ...prev, passive_perception: nextValue }));
                  if (nextValue === '') return;
                  syncCharacterField('passive_perception', Number(nextValue));
                }}
                onBlur={() => {
                  if (numberInputs.passive_perception === '') setNumberInputs(prev => ({ ...prev, passive_perception: String(activeChar.passive_perception) }));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Vitesse (m)</label>
              <input
                type="number"
                value={numberInputs.speed}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNumberInputs(prev => ({ ...prev, speed: nextValue }));
                  if (nextValue === '') return;
                  syncCharacterField('speed', Number(nextValue));
                }}
                onBlur={() => {
                  if (numberInputs.speed === '') setNumberInputs(prev => ({ ...prev, speed: String(activeChar.speed) }));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Maîtrise</label>
              <input
                type="number"
                min="1"
                max="10"
                value={numberInputs.proficiency_bonus}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setNumberInputs(prev => ({ ...prev, proficiency_bonus: nextValue }));
                  if (nextValue === '') return;
                  syncCharacterField('proficiency_bonus', Math.max(1, Math.min(10, Number(nextValue))));
                }}
                onBlur={() => {
                  if (numberInputs.proficiency_bonus === '') {
                    setNumberInputs(prev => ({ ...prev, proficiency_bonus: String(activeChar.proficiency_bonus ?? 2) }));
                  }
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Dé de vie</label>
              <select value={activeChar.hit_die_type ?? 'd8'} onChange={(e) => syncCharacterField('hit_die_type', e.target.value as 'd6' | 'd8' | 'd10' | 'd12')} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}>
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
              </select>
            </div>
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
