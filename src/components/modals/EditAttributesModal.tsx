import { useEffect, useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character, CoreAttribute } from '../../types/rpg.types';
import { BarChart3 } from 'lucide-react';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  coreAttributes: CoreAttribute[];
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
}

export function EditAttributesModal({ coreAttributes, syncCharacterField, onClose }: Props) {
  const t = useThemeClasses();
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setScoreInputs(Object.fromEntries(coreAttributes.map((stat) => [stat.key, String(stat.score)])));
  }, [coreAttributes]);

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title={<span className="flex items-center gap-2 font-mono"><BarChart3 size={16} /> Caractéristiques</span>} onClose={onClose} />
        <div className="grid grid-cols-2 gap-3">
          {coreAttributes.map(stat => (
            <div key={stat.short}>
              <label className={`text-[10px] uppercase font-semibold block mb-1 ${stat.color}`}>{stat.label}</label>
              <input
                type="number"
                min="1" max="30"
                value={scoreInputs[stat.key] ?? String(stat.score)}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setScoreInputs(prev => ({ ...prev, [stat.key]: nextValue }));

                  if (nextValue === '') return;

                  syncCharacterField(stat.key, Math.max(1, Math.min(30, Number(nextValue))));
                }}
                onBlur={() => {
                  if ((scoreInputs[stat.key] ?? '') === '') {
                    setScoreInputs(prev => ({ ...prev, [stat.key]: String(stat.score) }));
                  }
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-center font-mono font-bold focus:outline-none`}
              />
            </div>
          ))}
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
