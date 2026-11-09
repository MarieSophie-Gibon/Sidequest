import type { ReactNode } from 'react';
import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { ChevronDown } from 'lucide-react';
import { ModalActions, ModalHeader } from '../modals/ModalControls';
import type { Breakdown } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import { useInputClass } from './useInputClass';

/** Coque de modale identique aux modales D&D existantes. */
export function Pf1Modal({ title, onClose, onSave, children }: { title: ReactNode; onClose: () => void; onSave?: () => void; children: ReactNode }) {
  const t = useThemeClasses();
  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90dvh] flex flex-col`}>
        <ModalHeader title={title} onClose={onClose} />
        <div className="space-y-3 overflow-y-auto min-h-0 pr-1">{children}</div>
        {onSave && <ModalActions onCancel={onClose} onSave={onSave} />}
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  const t = useThemeClasses();
  return <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>{children}</label>;
}


/** Champ numérique tolérant la saisie vide ou « - » en cours de frappe. */
export function NumField({ label, value, onChange, min, max }: { label?: ReactNode; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const cls = useInputClass();
  const [draft, setDraft] = useState(String(value));
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }
  return (
    <div>
      {label !== undefined && <FieldLabel>{label}</FieldLabel>}
      <input
        type="number"
        inputMode="numeric"
        value={draft}
        min={min}
        max={max}
        onChange={e => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value === '' || e.target.value === '-' || Number.isNaN(n)) return;
          const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, Math.trunc(n)));
          setLastValue(clamped);
          onChange(clamped);
        }}
        onBlur={() => setDraft(String(value))}
        className={`${cls} font-mono`}
      />
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder }: { label: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const cls = useInputClass();
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className={cls} />
    </div>
  );
}

/** Bouton à bascule au style des boutons secondaires / accent. */
export function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  const t = useThemeClasses();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all active:scale-95 ${active ? `bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder} shadow-sm` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
    >
      {children}
    </button>
  );
}

/** Détail d'un calcul : « Base 10 · Armure +3 · Dex +3 ». */
export function BreakdownText({ breakdown }: { breakdown: Breakdown }) {
  const t = useThemeClasses();
  if (breakdown.parts.length === 0) return <span className={`text-[10px] ${t.textMuted}`}>Aucun bonus</span>;
  return (
    <span className={`text-[10px] ${t.textMuted} leading-snug`}>
      {breakdown.parts.map(([label, v], i) => (
        <span key={label + i}>
          {i > 0 && ' · '}
          {label} <span className="font-mono">{i === 0 && label === 'Base' ? v : signed(v)}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Encart repliable (fermé par défaut), même rendu que les sections de l'onglet Capacités.
 * `aside` reste visible fermé : bouton d'ajout, résumé chiffré…
 */
export function Pf1Collapsible({ title, aside, defaultOpen = false, children }: { title: ReactNode; aside?: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const t = useThemeClasses();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
      <div className={`flex justify-between items-center gap-2 ${open ? 'mb-3' : ''}`}>
        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex items-center gap-1.5 flex-1 min-w-0 text-left">
          <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${open ? 'rotate-0' : '-rotate-90'}`} />
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider truncate`}>{title}</h4>
        </button>
        {aside && <div className="flex items-center gap-2 shrink-0">{aside}</div>}
      </div>
      {open && children}
    </div>
  );
}
