import type { ReactNode } from 'react';
import type { Character } from '../../types/rpg.types';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { DND_CONDITIONS } from '../modals/EditConditionsModal';
import { Heart, AlertTriangle, BookOpen, Shield } from 'lucide-react';
import type { Pf1Sheet } from '../../systems/pf1e/types';
import { signed, STAT_KEYS } from '../../systems/pf1e/rules';

const STAT_STYLE = {
  str: { short: 'FOR', color: 'text-rose-400' },
  dex: { short: 'DEX', color: 'text-cyan-400' },
  con: { short: 'CON', color: 'text-emerald-400' },
  int: { short: 'INT', color: 'text-indigo-400' },
  wis: { short: 'SAG', color: 'text-teal-400' },
  cha: { short: 'CHA', color: 'text-amber-400' },
} as const;

interface Props {
  activeChar: Character;
  sheet: Pf1Sheet;
  hasArmor: boolean;
  hpPercent: number;
  activeConditions: string[];
  onOpenAvatar: () => void;
  onOpenProfile: () => void;
  onOpenHealth: () => void;
  onOpenConditions: () => void;
  onOpenHelp: () => void;
  onOpenBuild: () => void;
  onOpenDefense: () => void;
  renderAvatar: () => ReactNode;
}

/** En-tête de combat Pathfinder 1e : même mise en page que le HUD D&D. */
export function Pf1CombatHUD({
  activeChar, sheet, hasArmor, hpPercent, activeConditions,
  onOpenAvatar, onOpenProfile, onOpenHealth, onOpenConditions, onOpenHelp, onOpenBuild, onOpenDefense, renderAvatar,
}: Props) {
  const t = useThemeClasses();
  const cell = `${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer hover:${t.accentBorder} transition-all`;
  const label = `text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`;

  return (
    <header className={`relative ${t.cardBg} border ${t.cardBorder} rounded-2xl mb-2 shadow-md ${t.cardShadow} overflow-hidden shrink-0`}>
      <div className="flex items-stretch">
        <div onClick={onOpenAvatar} className="relative w-36 min-w-36 cursor-pointer active:scale-95 transition-all overflow-hidden">
          <div className="absolute inset-0 w-full h-full">{renderAvatar()}</div>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute top-0 right-0 z-10 text-[9px] font-extrabold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-bl-md border-b border-l border-white/20 font-mono leading-none">
            Niv. {sheet.level}
          </span>
          <div className="absolute bottom-0 left-0 right-0 p-2 z-10" onClick={(e) => { e.stopPropagation(); onOpenProfile(); }}>
            <p className="text-[11px] font-extrabold text-white truncate leading-tight drop-shadow-md">{activeChar.name}</p>
            <p className="text-[9px] text-white/80 font-medium truncate leading-tight mt-0.5">
              {activeChar.class} • {activeChar.race}
            </p>
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
            <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-600/30 shadow-inner">
              <div className={`h-full transition-all duration-500 ease-out bg-linear-to-r ${t.hpBar}`} style={{ width: `${Math.max(0, hpPercent)}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenHelp}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`}
            >
              <BookOpen size={12} />
              <span>Aide</span>
            </button>
            <button
              onClick={onOpenConditions}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${
                activeConditions.length > 0 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm' : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
              }`}
            >
              {activeConditions.length > 0 ? (
                <span className="flex items-center gap-0.5 truncate">
                  {activeConditions.slice(0, 2).map(key => {
                    const cond = DND_CONDITIONS.find(c => c.key === key);
                    return <span key={key} className="text-[10px]">{cond?.icon} {cond?.label}</span>;
                  })}
                  {activeConditions.length > 2 && <span>+{activeConditions.length - 2}</span>}
                </span>
              ) : (
                <><AlertTriangle size={12} /><span>États</span></>
              )}
            </button>
          </div>

          <div className="grid grid-cols-6 gap-1" onClick={onOpenBuild}>
            {STAT_KEYS.map(key => (
              <div key={key} className={`${t.inputBg} border ${t.cardBorder} hover:${t.accentBorder} rounded-lg py-1.5 text-center cursor-pointer active:scale-95 transition-all`}>
                <span className={`text-[8px] ${t.textMuted} uppercase font-extrabold block leading-none`}>{STAT_STYLE[key].short}</span>
                <span className={`text-sm font-extrabold font-mono ${STAT_STYLE[key].color} block mt-0.5 leading-none`}>{signed(sheet.mods[key])}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-1" onClick={onOpenDefense}>
            <div className={cell}>
              <span className={label}>BBA</span>
              <span className={`text-sm font-extrabold font-mono ${t.accent} block mt-0.5 leading-none`}>{signed(sheet.bab)}</span>
            </div>
            <div className={`relative ${cell}`}>
              <span className={label}>CA</span>
              <span className={`text-sm font-extrabold font-mono ${t.accent} block mt-0.5 leading-none`}>{sheet.ac.total}</span>
              {hasArmor && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-sky-500/30 border border-sky-300 shadow-sm">
                  <Shield size={9} className="text-white" />
                </span>
              )}
            </div>
            <div className={cell}>
              <span className={label}>INIT</span>
              <span className="text-sm font-extrabold font-mono text-cyan-500 block mt-0.5 leading-none">{signed(sheet.initiative.total)}</span>
            </div>
            <div className={cell}>
              <span className={label}>BMO</span>
              <span className="text-sm font-extrabold font-mono text-emerald-500 block mt-0.5 leading-none">{signed(sheet.cmb.total)}</span>
            </div>
            <div className={cell}>
              <span className={label}>VIT</span>
              <span className={`text-sm font-extrabold font-mono ${t.textPrimary} block mt-0.5 leading-none`}>{activeChar.speed}m</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
