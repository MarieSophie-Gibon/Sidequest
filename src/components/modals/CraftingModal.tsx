import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Hammer, Plus, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Item } from '../../types/rpg.types';
import type { CraftingRecipeInput } from '../../hooks/useCharacterData';
import { ModalActions, ModalHeader } from './ModalControls';

interface CraftingComponentDraft {
  rowId: string;
  itemId: string;
  quantityInput: string;
}

interface Props {
  items: Item[];
  onSubmit: (recipe: CraftingRecipeInput) => Promise<boolean | void>;
  onClose: () => void;
}

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const ITEM_CATEGORIES: Array<{ value: CraftingRecipeInput['category']; label: string }> = [
  { value: 'objet', label: 'Objet' },
  { value: 'potion', label: 'Potion' },
  { value: 'parchemin', label: 'Parchemin' },
  { value: 'objet_magique', label: 'Objet magique' },
  { value: 'composant', label: 'Composant' },
  { value: 'arme', label: 'Arme' },
  { value: 'armure', label: 'Armure' },
];

function formatHoursLabel(hours: number) {
  if (Number.isInteger(hours)) return String(hours);
  return hours.toFixed(1).replace(/\.0$/, '');
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
  triggerClassName: string;
  menuClassName: string;
  optionClassName: string;
  activeOptionClassName: string;
  disabledOptionClassName: string;
  mutedClassName: string;
  chevronClassName: string;
}

function CustomDropdown({
  value,
  options,
  placeholder,
  onChange,
  triggerClassName,
  menuClassName,
  optionClassName,
  activeOptionClassName,
  disabledOptionClassName,
  mutedClassName,
  chevronClassName,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={triggerClassName}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate ${selectedOption ? '' : mutedClassName}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={12}
          className={`${chevronClassName} transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className={menuClassName} role="listbox">
          {options.length === 0 ? (
            <div className={`${optionClassName} ${disabledOptionClassName}`}>Aucune option</div>
          ) : (
            options.map(option => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`${optionClassName} ${
                    option.disabled
                      ? disabledOptionClassName
                      : isActive
                        ? activeOptionClassName
                        : ''
                  }`}
                >
                  {option.label}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function CraftingModal({ items, onSubmit, onClose }: Props) {
  const t = useThemeClasses();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goldValueInput, setGoldValueInput] = useState('10');
  const [category, setCategory] = useState<CraftingRecipeInput['category']>('objet');
  const [componentRows, setComponentRows] = useState<CraftingComponentDraft[]>([
    { rowId: crypto.randomUUID(), itemId: '', quantityInput: '1' },
  ]);

  const availableItems = useMemo(
    () => items.filter(item => item.quantity > 0 && item.category === 'composant'),
    [items],
  );

  const selectedIds = componentRows
    .map(row => row.itemId)
    .filter(itemId => itemId !== '');

  const goldValue = Number(goldValueInput) || 0;
  const computedHours = Math.max(8, (goldValue / 10) * 4);
  const computedDays = computedHours / 8;

  const hasRowsWithoutItem = componentRows.some(row => !row.itemId);

  const totalComponents = componentRows.filter(row => row.itemId).length;

  const dropdownTriggerClass = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl px-2.5 py-2 w-full text-xs focus:outline-none flex items-center justify-between gap-2`;
  const dropdownMenuClass = `${t.cardBg} border ${t.cardBorder} rounded-xl mt-1 p-1 shadow-xl max-h-44 overflow-y-auto absolute z-30 w-full`;
  const dropdownOptionClass = `w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all`;
  const dropdownActiveClass = `${t.accentBg} ${t.accent} font-semibold`;
  const dropdownDisabledClass = `${t.textMuted} opacity-45 cursor-not-allowed`;

  const categoryOptions: DropdownOption[] = ITEM_CATEGORIES.map(option => ({
    value: option.value,
    label: option.label,
  }));

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const components = componentRows
            .filter(row => !!row.itemId)
            .map(row => ({
              itemId: row.itemId,
              quantity: Math.max(1, Math.floor(Number(row.quantityInput) || 1)),
            }));

          const ok = await onSubmit({
            name,
            description,
            goldValue: Math.max(0, goldValue),
            category,
            components,
          });

          if (ok) onClose();
        }}
        className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}
      >
        <ModalHeader title="Artisanat" onClose={onClose} />

        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input
              type="text"
              placeholder="ex: Arc long composite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`}
              required
            />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea
              placeholder="Details de fabrication..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-20 resize-none focus:outline-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Valeur (po)</label>
              <input
                type="number"
                min="1"
                value={goldValueInput}
                onChange={(e) => setGoldValueInput(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
                required
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Type cree</label>
              <CustomDropdown
                value={category}
                options={categoryOptions}
                placeholder="Choisir un type"
                onChange={(nextCategory) => setCategory(nextCategory as CraftingRecipeInput['category'])}
                triggerClassName={dropdownTriggerClass}
                menuClassName={dropdownMenuClass}
                optionClassName={dropdownOptionClass}
                activeOptionClassName={dropdownActiveClass}
                disabledOptionClassName={dropdownDisabledClass}
                mutedClassName={t.textMuted}
                chevronClassName={t.textMuted}
              />
            </div>
          </div>

          <div className={`${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5`}>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Temps requis</label>
            <div className={`text-xs ${t.textPrimary} font-semibold flex items-center gap-1.5`}>
              <Hammer size={14} className={t.accent} />
              {`${formatHoursLabel(computedHours)} heures (soit ${formatHoursLabel(computedDays)} jours de 8h)`}
            </div>
          </div>

          <div className={`${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5 space-y-2`}>
            <div className="flex items-center justify-between gap-2">
              <label className={`text-[10px] ${t.textMuted} uppercase`}>Composants a consommer</label>
              <button
                type="button"
                onClick={() => {
                  setComponentRows(prev => [
                    ...prev,
                    { rowId: crypto.randomUUID(), itemId: '', quantityInput: '1' },
                  ]);
                }}
                className={`${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder} border rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 transition-all hover:brightness-105`}
              >
                <Plus size={12} />
                Ajouter
              </button>
            </div>

            <div className="space-y-2">
              {componentRows.map((row) => {
                const currentItem = availableItems.find(item => item.id === row.itemId);
                const maxQty = currentItem?.quantity ?? 1;

                return (
                  <div key={row.rowId} className="grid grid-cols-[1fr_84px_34px] gap-2 items-center">
                    <CustomDropdown
                      value={row.itemId}
                      options={availableItems.map(item => {
                        const alreadyTaken = selectedIds.includes(item.id) && item.id !== row.itemId;
                        return {
                          value: item.id,
                          label: `${item.name} (×${item.quantity})`,
                          disabled: alreadyTaken,
                        };
                      })}
                      placeholder={availableItems.length === 0 ? 'Aucun composant disponible' : 'Choisir un composant'}
                      onChange={(nextId) => {
                        setComponentRows(prev => prev.map(existing =>
                          existing.rowId === row.rowId
                            ? { ...existing, itemId: nextId }
                            : existing,
                        ));
                      }}
                      triggerClassName={`${dropdownTriggerClass} rounded-lg px-2 py-2`}
                      menuClassName={dropdownMenuClass}
                      optionClassName={dropdownOptionClass}
                      activeOptionClassName={dropdownActiveClass}
                      disabledOptionClassName={dropdownDisabledClass}
                      mutedClassName={t.textMuted}
                      chevronClassName={t.textMuted}
                    />

                    <input
                      type="number"
                      min="1"
                      max={maxQty}
                      value={row.quantityInput}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setComponentRows(prev => prev.map(existing =>
                          existing.rowId === row.rowId
                            ? { ...existing, quantityInput: nextValue }
                            : existing,
                        ));
                      }}
                      onBlur={() => {
                        setComponentRows(prev => prev.map(existing => {
                          if (existing.rowId !== row.rowId) return existing;
                          const parsed = Math.max(1, Math.floor(Number(existing.quantityInput) || 1));
                          const clamped = Math.min(parsed, maxQty);
                          return { ...existing, quantityInput: String(clamped) };
                        }));
                      }}
                      className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2 py-2 text-xs focus:outline-none font-mono`}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setComponentRows(prev => {
                          if (prev.length <= 1) return prev;
                          return prev.filter(existing => existing.rowId !== row.rowId);
                        });
                      }}
                      className="w-8 h-8 rounded-lg border border-rose-500/40 text-rose-400 bg-rose-500/15 flex items-center justify-center transition-all hover:bg-rose-500/25"
                      aria-label="Retirer le composant"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            <p className={`text-[10px] ${t.textMuted}`}>
              {`Composants selectionnes: ${totalComponents}`}
            </p>
          </div>
        </div>

        <ModalActions
          onCancel={onClose}
          saveType="submit"
          saveLabel="Fabriquer"
        />

        {(hasRowsWithoutItem || totalComponents === 0) && (
          <p className="text-[10px] text-amber-300 text-center -mt-2">
            Selectionnez au moins un composant valide pour finaliser la fabrication.
          </p>
        )}
      </form>
    </div>
  );
}
