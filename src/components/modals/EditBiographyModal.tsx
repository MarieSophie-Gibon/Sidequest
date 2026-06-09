import { useState, useEffect } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Biography } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  biography: Biography | null;
  onSave: (fields: Partial<Omit<Biography, 'character_id' | 'updated_at'>>) => Promise<void>;
  onClose: () => void;
}

export function EditBiographyModal({ biography, onSave, onClose }: Props) {
  const t = useThemeClasses();

  const [form, setForm] = useState({
    ideaux: biography?.ideaux || '',
    liens: biography?.liens || '',
    alignement: biography?.alignement || '',
    description_physique: biography?.description_physique || '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      ideaux: biography?.ideaux || '',
      liens: biography?.liens || '',
      alignement: biography?.alignement || '',
      description_physique: biography?.description_physique || '',
    });
  }, [biography]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  }

  const inputCls = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`;
  const labelCls = `text-[10px] ${t.textMuted} uppercase block mb-1`;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={handleSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title="Modifier la biographie" onClose={onClose} />

          <div>
            <label className={labelCls}>Alignement</label>
            <input
              type="text"
              value={form.alignement}
              onChange={e => setForm(f => ({ ...f, alignement: e.target.value }))}
              placeholder="Loyal Bon…"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Apparence</label>
            <textarea
              rows={2}
              value={form.description_physique}
              onChange={e => setForm(f => ({ ...f, description_physique: e.target.value }))}
              placeholder="Grand, cheveux noirs…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Idéaux</label>
            <textarea
              rows={2}
              value={form.ideaux}
              onChange={e => setForm(f => ({ ...f, ideaux: e.target.value }))}
              placeholder="En quoi croyez-vous ?"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Liens</label>
            <textarea
              rows={2}
              value={form.liens}
              onChange={e => setForm(f => ({ ...f, liens: e.target.value }))}
              placeholder="Qu'est-ce qui vous retient ?"
              className={`${inputCls} resize-none`}
            />
          </div>

          <ModalActions onCancel={onClose} saveType="submit" saveLabel={saving ? 'Sauvegarde…' : 'Sauvegarder'} />
      </form>
    </div>
  );
}
