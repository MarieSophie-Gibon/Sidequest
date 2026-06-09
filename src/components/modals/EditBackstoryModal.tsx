import { useEffect, useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Biography } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  biography: Biography | null;
  onSave: (fields: Partial<Omit<Biography, 'character_id' | 'updated_at'>>) => Promise<void>;
  onClose: () => void;
}

export function EditBackstoryModal({ biography, onSave, onClose }: Props) {
  const t = useThemeClasses();
  const [backstory, setBackstory] = useState(biography?.backstory || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBackstory(biography?.backstory || '');
  }, [biography]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ backstory });
    setSaving(false);
    onClose();
  }

  const inputCls = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none resize-none`;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={handleSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title="Modifier l'histoire" onClose={onClose} />

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>
              Histoire personnelle
            </label>
            <textarea
              rows={12}
              value={backstory}
              onChange={e => setBackstory(e.target.value)}
              placeholder="Le passé de votre personnage, ses origines, ses motivations..."
              className={inputCls}
            />
          </div>

          <ModalActions onCancel={onClose} saveType="submit" saveLabel={saving ? 'Sauvegarde...' : 'Sauvegarder'} />
      </form>
    </div>
  );
}
