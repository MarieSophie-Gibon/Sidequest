import { useState, useEffect } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { ModalActions, ModalHeader } from './ModalControls';
import type { NewNoteState } from '../../hooks/useCharacterData';

interface Props {
  newNote: NewNoteState;
  setNewNote: (note: NewNoteState) => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onClose: () => void;
}

export function AddNoteModal({ newNote, setNewNote, onSubmit, onClose }: Props) {
  const t = useThemeClasses();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSaving(false);
  }, [newNote.id]);

  const inputCls = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`;
  const labelCls = `text-[10px] ${t.textMuted} uppercase block mb-1`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit(e);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form
        onSubmit={handleSubmit}
        className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}
      >
        <ModalHeader title={newNote.id ? 'Modifier la note' : 'Nouvelle note'} onClose={onClose} />

        <div>
          <label className={labelCls}>Titre *</label>
          <input
            type="text"
            value={newNote.title}
            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Titre de la note…"
            className={inputCls}
            required
            autoFocus
          />
        </div>

        <div>
          <label className={labelCls}>Contenu</label>
          <textarea
            rows={8}
            value={newNote.content}
            onChange={e => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Écrivez vos notes ici…"
            className={`${inputCls} resize-none`}
          />
        </div>

        <ModalActions
          onCancel={onClose}
          saveType="submit"
          saveLabel={saving ? 'Sauvegarde…' : newNote.id ? 'Modifier' : 'Créer'}
        />
      </form>
    </div>
  );
}
