import type { ReactNode } from 'react';
import { AlertTriangle, Heart, Sparkles } from 'lucide-react';
import type { Character } from '../../types/rpg.types';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { DND_CONDITIONS } from '../modals/EditConditionsModal';
import { setValue, signed, statModifier, statValue, type HomebrewData } from '../../systems/homebrew/sheet';


interface Props {
  activeChar: Character;
  data: HomebrewData;
  hpPercent: number;
  activeConditions: string[];
  onChange: (next: HomebrewData) => void;
  onOpenAvatar: () => void;
  onOpenProfile: () => void;
  onOpenHealth: () => void;
  onOpenConditions: () => void;
  onOpenStats: () => void;
  renderAvatar: () => ReactNode;
}

const STAT_COLORS = ['text-rose-400', 'text-cyan-400', 'text-emerald-400', 'text-indigo-400', 'text-teal-400', 'text-amber-400'];

/** En-tête d'une fiche homebrew : identité, PV, jauges du système et caractéristiques. */
export function HomebrewCombatHUD({
  activeChar, data, hpPercent, activeConditions, onChange,
  onOpenAvatar, onOpenProfile, onOpenHealth, onOpenConditions, onOpenStats, renderAvatar,
}: Props) {
  const t = useThemeClasses();
  const { structure } = data;
  const identity = [activeChar.class, activeChar.race].filter(Boolean).join(' • ');
  const inspiration = structure.specials.find(sp => sp.type === 'checkbox');
  const stepBtn = `w-5 h-5 flex items-center justify-center rounded-md ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-xs font-bold active:scale-90`;

  return (
    <header className={`relative ${t.cardBg} border ${t.cardBorder} rounded-2xl mb-2 shadow-md ${t.cardShadow} overflow-hidden shrink-0`}>
      <div className="flex items-stretch">
        <div onClick={onOpenAvatar} className="relative w-36 min-w-36 cursor-pointer active:scale-95 transition-all overflow-hidden">
          <div className="absolute inset-0 w-full h-full">{renderAvatar()}</div>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          {structure.identity.showLevel && (
            <span className="absolute top-0 right-0 z-10 text-[9px] font-extrabold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-bl-md border-b border-l border-white/20 font-mono leading-none">
              Niv. {activeChar.level}
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 z-10" onClick={(e) => { e.stopPropagation(); onOpenProfile(); }}>
            <p className="text-[11px] font-extrabold text-white truncate leading-tight drop-shadow-md">{activeChar.name}</p>
            {identity && <p className="text-[9px] text-white/80 font-medium truncate leading-tight mt-0.5">{identity}</p>}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 p-3 min-w-0">
          <div onClick={onOpenHealth} className={`${t.inputBg} border ${t.cardBorder} px-3 py-2 rounded-xl cursor-pointer hover:opacity-80 active:scale-98 transition-all shadow-sm`}>
            <div className="flex items-center justify-between gap-1.5 mb-1.5 leading-none">
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-rose-500 animate-pulse" />
                <span className={`text-[10px] ${t.textMuted} font-extrabold uppercase tracking-wide`}>PV</span>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono">
                <span className={`text-sm font-extrabold ${activeChar.hp_current < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{activeChar.hp_current}</span>
                {activeChar.hp_temp > 0 && <span className="text-cyan-400 text-[10px] font-extrabold">+{activeChar.hp_temp}</span>}
                <span className={`text-[10px] ${t.textMuted}`}>/{activeChar.hp_max}</span>
              </div>
            </div>
            <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ease-out bg-linear-to-r ${t.hpBar}`} style={{ width: `${Math.max(0, hpPercent)}%` }} />
            </div>
          </div>

          {/* Jauges du système (Mana, Stress…) */}
          {structure.gauges.map(g => {
            const v = data.values.gauges[g.id] ?? { current: g.defaultMax, max: g.defaultMax };
            const set = (current: number) => onChange(setValue(data, 'gauges', g.id, { ...v, current: Math.max(0, Math.min(v.max, current)) }));
            return (
              <div key={g.id} className={`${t.inputBg} border ${t.cardBorder} px-3 py-1.5 rounded-xl flex items-center justify-between gap-2`}>
                <span className={`text-[10px] ${t.textMuted} font-extrabold uppercase tracking-wide truncate`}>{g.name}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" className={stepBtn} onClick={() => set(v.current - 1)}>−</button>
                  <span className="text-xs font-mono font-bold text-sky-300">{v.current}<span className={`${t.textMuted} font-normal`}>/{v.max}</span></span>
                  <button type="button" className={stepBtn} onClick={() => set(v.current + 1)}>+</button>
                </div>
              </div>
            );
          })}

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenConditions}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${
                activeConditions.length > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm' : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
              }`}
            >
              {activeConditions.length > 0 ? (
                <span className="flex items-center gap-0.5 truncate">
                  {activeConditions.slice(0, 1).map(key => {
                    const cond = DND_CONDITIONS.find(c => c.key === key);
                    return <span key={key}>{cond?.icon} {cond?.label}</span>;
                  })}
                  {activeConditions.length > 1 && <span>+{activeConditions.length - 1}</span>}
                </span>
              ) : (<><AlertTriangle size={12} /><span>États</span></>)}
            </button>
            {inspiration ? (
              <button
                type="button"
                onClick={() => onChange(setValue(data, 'specials', inspiration.id, !data.values.specials[inspiration.id]))}
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${
                  data.values.specials[inspiration.id] ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                }`}
              >
                <Sparkles size={12} /> <span className="truncate">{inspiration.name}</span>
              </button>
            ) : <span />}
          </div>

          {structure.stats.length > 0 && (
            <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${Math.min(structure.stats.length, 6)}, minmax(0, 1fr))` }} onClick={onOpenStats}>
              {structure.stats.map((s, i) => {
                const value = statValue(data, s.id);
                return (
                  <div key={s.id} className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer active:scale-95 transition-all`}>
                    <span className={`text-[8px] ${t.textMuted} uppercase font-extrabold block leading-none truncate px-0.5`}>{s.short || s.name}</span>
                    <span className={`text-sm font-extrabold font-mono ${STAT_COLORS[i % STAT_COLORS.length]} block mt-0.5 leading-none`}>
                      {s.showMod ? signed(statModifier(data, s.id)) : value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
