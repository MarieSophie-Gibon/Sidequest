import type { ReactNode } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Check, X } from 'lucide-react';

interface ModalHeaderProps {
  title: ReactNode;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  const t = useThemeClasses();

  return (
    <div className={`flex items-center justify-between border-b ${t.cardBorder} pb-2`}>
      <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase`}>{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className={`w-8 h-8 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textMuted} hover:brightness-95 active:scale-95 transition-all`}
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ModalActionsProps {
  onCancel: () => void;
  onSave?: () => void;
  saveType?: 'button' | 'submit';
  saveLabel?: string;
}

export function ModalActions({
  onCancel,
  onSave,
  saveType = 'button',
  saveLabel = 'Sauvegarder',
}: ModalActionsProps) {
  const t = useThemeClasses();

  return (
    <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${t.cardBorder}`}>
      <button
        type="button"
        onClick={onCancel}
        className={`${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold py-2.5 rounded-xl text-xs uppercase border ${t.btnSecondaryBorder} tracking-wider transition-all flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-95`}
      >
        <X size={14} />
        Annuler
      </button>
      <button
        type={saveType}
        onClick={saveType === 'button' ? onSave : undefined}
        className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md border ${t.btnPrimaryBorder} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5`}
      >
        <Check size={14} />
        {saveLabel}
      </button>
    </div>
  );
}
