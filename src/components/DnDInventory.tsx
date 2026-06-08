import type { Item } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { CirclePlus, Sword, Shield, Package } from 'lucide-react';

interface Props {
  items: Item[];
  onToggleItemEquip: (itemId: string) => void;
  onOpenAddItem: () => void;
}

export function DnDInventory({ items, onToggleItemEquip, onOpenAddItem }: Props) {
  const t = useThemeClasses();

  const weapons = items.filter(i => i.category === 'arme');
  const armors = items.filter(i => i.category === 'armure');
  const objects = items.filter(i => !i.category || i.category === 'objet');

  return (
    <div className="space-y-2">
      {/* Equipment section */}
      {(weapons.length > 0 || armors.length > 0) && (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3 flex items-center gap-1.5`}>
            <Sword size={14} /> Équipement
          </h4>
          <div className="space-y-2">
            {weapons.map(item => (
              <div key={item.id} className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder} flex items-center gap-3`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}>
                  <Sword size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-bold ${t.textPrimary} block truncate`}>{item.name}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.damage && <span className={`text-[9px] font-mono ${t.accent}`}>{item.damage}</span>}
                    {item.range && <span className={`text-[9px] ${t.textMuted}`}>• {item.range}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleItemEquip(item.id)}
                  className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all shrink-0 ${
                    item.equipped
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                  }`}
                >
                  {item.equipped ? 'ÉQUIPÉ' : 'SAC'}
                </button>
              </div>
            ))}
            {armors.map(item => (
              <div key={item.id} className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder} flex items-center gap-3`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}>
                  <Shield size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-bold ${t.textPrimary} block truncate`}>{item.name}</span>
                  {item.defense_bonus !== undefined && item.defense_bonus > 0 && (
                    <span className={`text-[9px] font-mono ${t.accent} mt-0.5 block`}>+{item.defense_bonus} CA</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleItemEquip(item.id)}
                  className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all shrink-0 ${
                    item.equipped
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                  }`}
                >
                  {item.equipped ? 'ÉQUIPÉ' : 'SAC'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objects/Inventory section */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}>
            <Package size={14} /> Inventaire
          </h4>
          <button
            onClick={onOpenAddItem}
            className={`w-8 h-8 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}
          >
            <CirclePlus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {objects.length > 0 ? (
            objects.map((item) => (
              <div key={item.id} className={`flex justify-between items-center ${t.inputBg} p-2.5 rounded-xl border ${t.cardBorder}`}>
                <div>
                  <span className={`text-xs font-bold ${t.textPrimary} block`}>{item.name}</span>
                  <span className={`text-[9px] ${t.textMuted} block mt-0.5`}>Qté : {item.quantity}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleItemEquip(item.id)}
                  className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all ${
                    item.equipped
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                  }`}
                >
                  {item.equipped ? 'ÉQUIPÉ' : 'SAC'}
                </button>
              </div>
            ))
          ) : (
            <p className={`text-xs ${t.textMuted} italic text-center p-4`}>Votre inventaire est vide.</p>
          )}
        </div>
      </div>
    </div>
  );
}
