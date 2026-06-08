import { useState } from 'react';
import type { Spell, SpellSlot } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { CirclePlus, ChevronDown } from 'lucide-react';

interface DnDSpellcastingProps {
  spellSlots: SpellSlot[];
  spells: Spell[];
  spellDc: number;
  spellAttack: number;
  onOpenEditSpellSlot: (slot: SpellSlot) => void;
  onToggleSpellSlot: (level: number, slotIndex: number) => void;
  onOpenAddSpell: () => void;
  onEditSpell: (spell: Spell) => void;
  onEditSpellcasting: () => void;
}

export function DnDSpellcasting({
  spellSlots,
  spells,
  spellDc,
  spellAttack,
  onOpenEditSpellSlot,
  onToggleSpellSlot,
  onOpenAddSpell,
  onEditSpell,
  onEditSpellcasting,
}: DnDSpellcastingProps) {
  const t = useThemeClasses();
  const accentHex = t.accent.includes('violet') ? '#a78bfa' : '#3b82f6';
  const accentDimHex = t.accent.includes('violet') ? '#7c3aed' : '#2563eb';
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div onClick={onEditSpellcasting} className={`${t.cardBg} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} cursor-pointer hover:brightness-95 active:scale-[0.98] transition-all flex items-center justify-between`}>
        <h4 className={`text-[10px] font-semibold ${t.textPrimary} uppercase tracking-wider`}>Incantation</h4>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] ${t.textMuted} font-semibold`}>DD <span className={`font-mono font-bold ${t.textPrimary}`}>{spellDc}</span></span>
          <span className={`text-[11px] ${t.textMuted} font-semibold`}>Mod.Sort <span className="font-mono font-bold text-emerald-500">{spellAttack >= 0 ? `+${spellAttack}` : spellAttack}</span></span>
        </div>
      </div>

      {spellSlots.length > 0 && (
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider`}>Emplacements de Sorts</h4>
        </div>
        <div className="space-y-2.5">
            {spellSlots.map((slot) => (
              <div
                key={slot.level}
                onClick={() => onOpenEditSpellSlot(slot)}
                className={`flex justify-between items-center ${t.inputBg} p-3 rounded-xl border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}
              >
                <span className={`text-xs font-bold ${t.textPrimary} font-mono`}>Niveau {slot.level}</span>
                <div className="flex gap-2">
                  {Array.from({ length: slot.max }).map((_, i) => {
                    const isUsed = i >= slot.current;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSpellSlot(slot.level, i);
                        }}
                        className="focus:outline-none"
                      >
                        <svg className="w-6 h-6 transform rotate-45" viewBox="0 0 24 24">
                          <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            fill={!isUsed ? `${accentHex}40` : 'transparent'}
                            stroke={!isUsed ? accentDimHex : '#64748b'}
                            strokeWidth="2"
                          />
                          {!isUsed && <rect x="8" y="8" width="8" height="8" fill={`${accentHex}60`} />}
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
      )}

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider`}>Votre Grimoire</h4>
          <button
            onClick={onOpenAddSpell}
            className={`w-8 h-8 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}
          >
            <CirclePlus size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {spells.map((spell) => {
            const isExpanded = expandedSpell === spell.id;
            return (
              <div key={spell.id} className={`${t.inputBg} rounded-xl border ${t.cardBorder} overflow-hidden transition-all`}>
                <div
                  className="flex justify-between items-center p-3 cursor-pointer hover:brightness-95 active:scale-[0.99] transition-all"
                  onClick={() => setExpandedSpell(isExpanded ? null : spell.id)}
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown size={12} className={`${t.textMuted} transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                    <span className={`text-xs font-bold ${t.textPrimary}`}>{spell.name}</span>
                    {spell.concentration && (
                      <span className="text-[8px] font-bold text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 uppercase leading-none">C</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {spell.casting_type && (
                      <span className={`text-[9px] font-mono ${t.textSecondary} uppercase ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder}`}>
                        {spell.casting_type === 'bonus' ? 'Bonus' : spell.casting_type === 'reaction' ? 'Réaction' : 'Action'}
                      </span>
                    )}
                    <span className={`text-[9px] font-mono ${t.textSecondary} uppercase ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder}`}>
                      {spell.level === 0 ? 'Mineur' : `Niv ${spell.level}`}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2" onClick={() => onEditSpell(spell)}>
                    <div className="flex items-center justify-between">
                      {spell.damage && (
                        <span className={`text-[9px] font-mono font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20`}>⚔ {spell.damage}</span>
                      )}
                      {spell.is_aoe && spell.save_type && (
                        <span className={`text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20`}>🛡 JS {spell.save_type}{spell.save_effect ? ` · ${spell.save_effect}` : ''}</span>
                      )}
                      {spell.range && (
                        <span className={`text-[9px] ${t.textMuted} font-mono`}>{spell.range}</span>
                      )}
                    </div>
                    {spell.desc && (
                      <p className={`text-[10px] ${t.textSecondary} leading-relaxed ${t.cardBg} p-2 rounded-lg border ${t.cardBorder}`}>
                        {spell.desc}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
