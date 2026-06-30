import { useState } from 'react';
import type { Spell, SpellSlot } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { CirclePlus, ChevronDown, Sword, Sparkles, Shield, Funnel } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const hasActiveFilter = filterLevel !== null || filterType !== null;

  const castingTypeMeta: Record<NonNullable<Spell['casting_type']>, { label: string; icon: typeof Sword }> = {
    action: { label: 'Action', icon: Sword },
    bonus: { label: 'Bonus', icon: Sparkles },
    reaction: { label: 'Réaction', icon: Shield },
  };

  const getLevelBadgeClass = (level: number) => {
    if (level <= 0) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25';
    if (level === 1) return 'text-blue-200 bg-blue-500/16 border-blue-400/35';
    if (level === 2) return 'text-violet-200 bg-violet-500/16 border-violet-400/35';
    if (level === 3) return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/25';
    if (level === 4) return 'text-violet-300 bg-violet-500/10 border-violet-500/25';
    if (level === 5) return 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25';
    if (level === 6) return 'text-rose-300 bg-rose-500/10 border-rose-500/25';
    if (level === 7) return 'text-orange-300 bg-orange-500/10 border-orange-500/25';
    if (level === 8) return 'text-amber-300 bg-amber-500/10 border-amber-500/25';
    return 'text-red-300 bg-red-500/10 border-red-500/25';
  };

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
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider`}>Emplacements de Sorts</h4>
          <span className={`text-[9px] ${t.textMuted} uppercase`}>Cliquer un niveau pour ajuster</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
            {spellSlots.map((slot) => (
              <div
                key={slot.level}
                onClick={() => onOpenEditSpellSlot(slot)}
                className={`${t.inputBg} p-3 rounded-xl border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold ${t.textPrimary} font-mono shrink-0`}>Niv.{slot.level}</span>
                  <div className="flex gap-1.5 flex-wrap justify-end">
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
                          <svg className="w-5 h-5 transform rotate-45" viewBox="0 0 24 24">
                            <rect
                              x="4"
                              y="4"
                              width="15"
                              height="15"
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
              </div>
            ))}
        </div>
      </div>
      )}

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider`}>Votre Grimoire</h4>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              className={`w-6 h-6 flex items-center justify-center rounded-xl border transition-all ${
                showFilters || hasActiveFilter
                  ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                  : `${t.cardBg} ${t.cardBorder} ${t.textMuted}`
              } hover:brightness-110 active:scale-90`}
              aria-label="Filtrer"
            >
              <Funnel size={14} />
            </button>
            <button
              onClick={onOpenAddSpell}
              className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}
            >
              <CirclePlus size={16} />
            </button>
          </div>
        </div>

        {(showFilters || hasActiveFilter) && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {Array.from(new Set(spells.map(s => Number(s.level)))).sort((a, b) => a - b).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterLevel(prev => prev === lvl ? null : lvl)}
                className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border transition-all ${
                  filterLevel === lvl
                    ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                    : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`
                }`}
              >
                {lvl === 0 ? 'Mineur' : `Niv ${lvl}`}
              </button>
            ))}
            <span className={`w-px self-stretch ${t.cardBorder} border-l mx-0.5`} />
            {([{ key: 'action', label: 'Action' }, { key: 'bonus', label: 'Bonus' }, { key: 'reaction', label: 'Réaction' }] as const).map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterType(prev => prev === opt.key ? null : opt.key)}
                className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg border transition-all ${
                  filterType === opt.key
                    ? `${t.accentBg} ${t.accentBorder} ${t.accent}`
                    : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {[...spells]
            .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, 'fr'))
            .filter(s => filterLevel === null || Number(s.level) === filterLevel)
            .filter(s => filterType === null || s.casting_type === filterType)
            .map((spell) => {
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
                      <span className="text-[8px] font-bold text-cyan-300 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/50 uppercase leading-none tracking-wide shadow-[0_0_6px_rgba(34,211,238,0.5)]">Conc.</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {spell.components && spell.components.length > 0 && (
                      <span className="text-[9px] font-mono font-semibold text-slate-400 bg-slate-500/15 px-1.5 py-0.5 rounded-lg border border-slate-500/30">{spell.components.join('·')}</span>
                    )}
                    {spell.casting_type && (() => {
                      const meta = castingTypeMeta[spell.casting_type];
                      const CastIcon = meta.icon;
                      return (
                        <span className={`text-[9px] font-mono ${t.textSecondary} uppercase ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder} flex items-center gap-1`}>
                          <CastIcon size={10} />
                          {meta.label}
                        </span>
                      );
                    })()}
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-lg border ${getLevelBadgeClass(spell.level)}`}>
                      {spell.level === 0 ? 'Mineur' : `Niv ${spell.level}`}
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2" onClick={() => onEditSpell(spell)}>
                    <div className="flex items-center flex-wrap gap-1">
                      {spell.damage && (
                        <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-400/50 shadow-[0_0_6px_rgba(251,113,133,0.5)]">⚔ {spell.damage}</span>
                      )}
                      {spell.upcast_damage && (
                        <span className="text-[9px] font-mono font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded-md border border-violet-400/50">Niv.sup {spell.upcast_damage}</span>
                      )}
                      {spell.is_aoe && spell.save_type && (
                        <span className={`text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20`}>🛡 JS {spell.save_type}{spell.save_effect ? ` · ${spell.save_effect}` : ''}</span>
                      )}
                      {(spell.range || spell.duration) && (
                        <span className={`text-[9px] ${t.textMuted} font-mono ${t.cardBg} px-1.5 py-0.5 rounded-md border ${t.cardBorder}`}>
                          {[spell.range, spell.duration ? `⏱ ${spell.duration}` : null].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {spell.material_components && (
                        <span className={`text-[9px] ${t.textMuted} font-mono ${t.cardBg} px-1.5 py-0.5 rounded-md border ${t.cardBorder}`}>
                          M: {spell.material_components}
                        </span>
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
