import { CirclePlus, Package } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Item } from '../../types/rpg.types';
import type { HbItemCategory } from '../../systems/homebrew/types';
import { Pf1Collapsible } from '../pf1e/ui';

interface Props {
  categories: HbItemCategory[];
  items: Item[];
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: Item) => void;
  onToggleEquip: (id: string) => void;
}

const OTHER = '__autres';

/** Inventaire homebrew : un encart par catégorie du MJ (Armes, Armures, Équipement…). */
export function HomebrewInventoryTab({ categories, items, onAddItem, onEditItem, onToggleEquip }: Props) {
  const t = useThemeClasses();
  const known = new Set(categories.map(c => c.id));
  // Objets dont la catégorie n'existe plus (supprimée par le MJ) : regroupés à part.
  const orphans = items.filter(i => !known.has(i.category ?? ''));
  const groups = orphans.length > 0 ? [...categories, { id: OTHER, name: 'Autres objets', fields: [] }] : categories;
  const iconBtn = `w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`;

  if (groups.length === 0) {
    return <p className={`text-[11px] ${t.textMuted} italic text-center py-4`}>Le MJ n’a défini aucune catégorie d’inventaire.</p>;
  }

  return (
    <div className="space-y-2 tab-grid">
      {groups.map(cat => {
        const list = cat.id === OTHER ? orphans : items.filter(i => i.category === cat.id);
        return (
          <Pf1Collapsible
            key={cat.id}
            defaultOpen
            title={`${cat.name || 'Sans nom'}${list.length ? ` (${list.length})` : ''}`}
            aside={cat.id !== OTHER && (
              <button type="button" onClick={() => onAddItem(cat.id)} className={iconBtn} aria-label={`Ajouter dans ${cat.name}`}>
                <CirclePlus size={16} />
              </button>
            )}
          >
            {list.length === 0 ? (
              <p className={`text-[11px] ${t.textMuted} italic`}>Aucun objet.</p>
            ) : (
              <div className="space-y-1.5">
                {list.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onEditItem(item)}
                    className={`px-3 py-2 rounded-xl border ${item.equipped ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`} cursor-pointer hover:brightness-105 transition-all`}
                  >
                    <div className="flex items-center gap-2">
                      <Package size={12} className={t.textMuted} />
                      <span className={`text-xs font-bold ${t.textPrimary} flex-1 min-w-0 truncate`}>{item.name}</span>
                      {item.quantity > 1 && <span className={`text-[10px] font-mono ${t.textMuted}`}>×{item.quantity}</span>}
                      {item.damage && <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-400/40">⚔ {item.damage}</span>}
                      {!!item.defense_bonus && <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-400/40">+{item.defense_bonus}</span>}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onToggleEquip(item.id); }}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase border transition-all active:scale-95 ${item.equipped ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textMuted}`}`}
                      >
                        {item.equipped ? 'Équipé' : 'Sac'}
                      </button>
                    </div>
                    {item.description && <p className={`text-[10px] ${t.textSecondary} mt-1 line-clamp-2`}>{item.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </Pf1Collapsible>
        );
      })}
    </div>
  );
}
