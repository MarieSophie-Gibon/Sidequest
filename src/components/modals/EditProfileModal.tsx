import { useEffect, useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
}

export function EditProfileModal({ activeChar, syncCharacterField, onClose }: Props) {
  const t = useThemeClasses();
  const [levelInput, setLevelInput] = useState(String(activeChar.level));
  const [profInput, setProfInput] = useState(String(activeChar.proficiency_bonus ?? 2));

  useEffect(() => {
    setLevelInput(String(activeChar.level));
  }, [activeChar.level]);

  useEffect(() => {
    setProfInput(String(activeChar.proficiency_bonus ?? 2));
  }, [activeChar.proficiency_bonus]);

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title="Identité du Héros" onClose={onClose} />
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Nom</label>
            <input type="text" value={activeChar.name} onChange={(e) => syncCharacterField('name', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Race</label>
              <input type="text" value={activeChar.race} onChange={(e) => syncCharacterField('race', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Classe</label>
              <input type="text" value={activeChar.class} onChange={(e) => syncCharacterField('class', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Sous-classe</label>
            <input type="text" value={activeChar.subclass} onChange={(e) => syncCharacterField('subclass', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Niveau</label>
              <input
                type="number"
                min="1"
                max="20"
                value={levelInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setLevelInput(nextValue);
                  if (nextValue === '') return;
                  syncCharacterField('level', Math.max(1, Math.min(20, Number(nextValue))));
                }}
                onBlur={() => {
                  if (levelInput === '') setLevelInput(String(activeChar.level));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Maîtrise</label>
              <input
                type="number"
                min="1"
                max="10"
                value={profInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setProfInput(nextValue);
                  if (nextValue === '') return;
                  syncCharacterField('proficiency_bonus', Math.max(1, Math.min(10, Number(nextValue))));
                }}
                onBlur={() => {
                  if (profInput === '') setProfInput(String(activeChar.proficiency_bonus ?? 2));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
          </div>
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
