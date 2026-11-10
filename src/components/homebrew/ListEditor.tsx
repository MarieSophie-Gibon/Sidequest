import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';

interface Props<T extends { id: string; name: string }> {
  items: T[];
  onChange: (next: T[]) => void;
  /** Nouvel élément à ajouter (identifiant déjà généré). */
  createItem: () => T;
  addLabel: string;
  placeholder?: string;
  emptyText?: string;
  /** Champs propres à la catégorie, affichés sous le nom. */
  renderExtra?: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  /** Suppression personnalisée (ex. détacher les éléments reliés) ; sinon simple retrait. */
  onRemove?: (item: T) => void;
}

/** Liste éditable d'une catégorie du système : renommer, réordonner, supprimer, ajouter. */
export function ListEditor<T extends { id: string; name: string }>({
  items, onChange, createItem, addLabel, placeholder = 'Nom', emptyText = 'Aucun élément.', renderExtra, onRemove,
}: Props<T>) {
  const t = useThemeClasses();
  const input = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2.5 py-1.5 text-xs w-full min-w-0 focus:outline-none`;
  const iconBtn = `p-1 rounded-md ${t.textMuted} transition-colors disabled:opacity-25`;

  const update = (id: string, patch: Partial<T>) => onChange(items.map(i => (i.id === id ? { ...i, ...patch } : i)));
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {items.length === 0 && <p className={`text-[11px] ${t.textMuted} italic`}>{emptyText}</p>}
      {items.map((item, index) => (
        <div key={item.id} className={`${t.inputBg} border ${t.cardBorder} rounded-xl p-2 space-y-1.5`}>
          <div className="flex items-center gap-1">
            <input value={item.name} placeholder={placeholder} maxLength={60} onChange={e => update(item.id, { name: e.target.value } as Partial<T>)} className={input} />
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={`${iconBtn} hover:text-sky-300`} aria-label="Monter"><ArrowUp size={13} /></button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className={`${iconBtn} hover:text-sky-300`} aria-label="Descendre"><ArrowDown size={13} /></button>
            <button
              type="button"
              onClick={() => (onRemove ? onRemove(item) : onChange(items.filter(i => i.id !== item.id)))}
              className={`${iconBtn} hover:text-rose-300`}
              aria-label={`Supprimer ${item.name || 'cet élément'}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
          {renderExtra && <div className="flex flex-wrap items-center gap-2">{renderExtra(item, patch => update(item.id, patch))}</div>}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-dashed ${t.cardBorder} text-[11px] font-semibold ${t.textSecondary} hover:brightness-110 transition-all`}
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}
