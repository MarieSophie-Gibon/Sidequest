import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { signed, type HbBreakdown } from '../../systems/homebrew/sheet';

/** Petit champ numérique (entiers) tolérant la saisie vide ou « - » en cours de frappe. */
export function MiniNum({ value, onChange, min, max, label, className = 'w-14' }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string; className?: string;
}) {
  const t = useThemeClasses();
  const [draft, setDraft] = useState(String(value));
  const [last, setLast] = useState(value);
  if (value !== last) { setLast(value); setDraft(String(value)); }
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={draft}
      min={min}
      max={max}
      onClick={e => e.stopPropagation()}
      onChange={e => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value === '' || e.target.value === '-' || Number.isNaN(n)) return;
        const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, Math.trunc(n)));
        setLast(clamped);
        onChange(clamped);
      }}
      onBlur={() => setDraft(String(value))}
      className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-1.5 py-1 text-xs font-mono text-center focus:outline-none ${className}`}
    />
  );
}

/** Détail d'un calcul : « DEX +3 · Maîtrise +2 ». */
export function HbBreakdownText({ breakdown }: { breakdown: HbBreakdown }) {
  const t = useThemeClasses();
  if (breakdown.parts.length === 0) return null;
  return (
    <span className={`text-[10px] ${t.textMuted}`}>
      {breakdown.parts.map(([label, value]) => `${label} ${signed(value)}`).join(' · ')}
    </span>
  );
}
