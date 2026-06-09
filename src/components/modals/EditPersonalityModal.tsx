import { useState, useEffect } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Biography } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  biography: Biography | null;
  onSave: (fields: Partial<Omit<Biography, 'character_id' | 'updated_at'>>) => Promise<void>;
  onClose: () => void;
}

export function EditPersonalityModal({ biography, onSave, onClose }: Props) {
  const t = useThemeClasses();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    traits_principaux: biography?.traits_principaux || '',
    defauts: biography?.defauts || '',
  });

  useEffect(() => {
    setForm({
      traits_principaux: biography?.traits_principaux || '',
      defauts: biography?.defauts || '',
    });
  }, [biography]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  const inputCls = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none resize-none`;
  const labelCls = `text-[10px] ${t.textMuted} uppercase block mb-1`;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={handleSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl animate-scaleUp h-[80dvh] max-h-[90vh] flex flex-col`}>
        <ModalHeader title="Traits et Defauts" onClose={onClose} />

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 pt-4">
          <div>
            <label className={labelCls}>Traits de personnalite</label>
            <textarea
              rows={8}
              value={form.traits_principaux}
              onChange={e => setForm(prev => ({ ...prev, traits_principaux: e.target.value }))}
              placeholder="Comment vous comportez-vous ?"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Defauts</label>
            <textarea
              rows={8}
              value={form.defauts}
              onChange={e => setForm(prev => ({ ...prev, defauts: e.target.value }))}
              placeholder="Quelle est votre faiblesse ?"
              className={inputCls}
            />
          </div>
        </div>

        <ModalActions onCancel={onClose} saveType="submit" saveLabel={saving ? 'Sauvegarde...' : 'Sauvegarder'} />
      </form>
    </div>
  );
}
