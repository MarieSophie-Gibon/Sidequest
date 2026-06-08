import type { ReactNode } from 'react';
import type { Character, CoreAttribute } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { DND_CONDITIONS } from './modals/EditConditionsModal';
import { Heart, Sparkles, Star, AlertTriangle } from 'lucide-react';

interface DnDCombatHUDProps {
  activeChar: Character;
  hpPercent: number;
  activeConditions: string[];
  coreAttributes: CoreAttribute[];
  getModValue: (score: number) => number;
  onOpenAvatar: () => void;
  onOpenProfile: () => void;
  onOpenHealth: () => void;
  onOpenConditions: () => void;
  onOpenCombatEdit: () => void;
  onOpenAttributesEdit: () => void;
  onToggleInspiration: () => void;
  renderAvatar: () => ReactNode;
}

export function DnDCombatHUD({
  activeChar,
  hpPercent,
  activeConditions,
  coreAttributes,
  getModValue,
  onOpenAvatar,
  onOpenProfile,
  onOpenHealth,
  onOpenConditions,
  onOpenCombatEdit,
  onOpenAttributesEdit,
  onToggleInspiration,
  renderAvatar,
}: DnDCombatHUDProps) {
  const t = useThemeClasses();

  return (
    <header className={`relative ${t.cardBg} border ${t.cardBorder} rounded-2xl mb-2 shadow-md ${t.cardShadow} overflow-hidden shrink-0`}>
      <div className="flex items-stretch">
        {/* COL 1: Avatar with overlay info */}
        <div
          onClick={onOpenAvatar}
          className="relative w-36 min-w-36 cursor-pointer active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full">{renderAvatar()}</div>
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          {/* Level badge top-right */}
          <span className="absolute top-0 right-0 z-10 text-[9px] font-extrabold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-bl-md border-b border-l border-white/20 font-mono leading-none">
            Niv. {activeChar.level}
          </span>
          {/* Name, class, subclass bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2 z-10" onClick={(e) => { e.stopPropagation(); onOpenProfile(); }}>
            <p className="text-[11px] font-extrabold text-white truncate leading-tight drop-shadow-md">
              {activeChar.name}
            </p>
            <p className="text-[9px] text-white/80 font-medium truncate leading-tight mt-0.5">
              {activeChar.class}{activeChar.subclass ? ` • ${activeChar.subclass}` : ''}
            </p>
          </div>
        </div>

        {/* COL 2: Stats */}
        <div className="flex-1 flex flex-col gap-2 p-3 min-w-0">
          {/* Row 1: HP bar */}
          <div
            onClick={onOpenHealth}
            className={`${t.inputBg} border ${t.cardBorder} px-3 py-2 rounded-xl cursor-pointer hover:opacity-80 active:scale-98 transition-all shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5 leading-none">
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-rose-500 animate-pulse" />
                <span className={`text-[10px] ${t.textMuted} font-extrabold uppercase tracking-wide`}>PV</span>
              </div>
              <div className="flex items-baseline gap-0.5 font-mono">
                <span className="text-sm font-extrabold text-emerald-400">{activeChar.hp_current}</span>
                {activeChar.hp_temp > 0 && (
                  <span className="text-cyan-400 text-[10px] font-extrabold">+{activeChar.hp_temp}</span>
                )}
                <span className={`text-[10px] ${t.textMuted}`}>/{activeChar.hp_max}</span>
              </div>
            </div>
            <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-600/30 shadow-inner">
              <div
                className={`h-full transition-all duration-500 ease-out bg-linear-to-r ${t.hpBar}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Row 2: Inspiration - Conditions */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onToggleInspiration}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${
                activeChar.heroic_inspiration
                  ? `bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder} shadow-sm`
                  : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
              }`}
            >
              <span className="text-xs">{activeChar.heroic_inspiration ? <Sparkles size={12} className="text-yellow-400" /> : <Star size={12} />}</span>
              <span>Inspi</span>
            </button>

            <button
              onClick={onOpenConditions}
              className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none ${
                activeConditions.length > 0
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm'
                  : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
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

          {/* Row 3: Core attributes */}
          <div className="grid grid-cols-6 gap-1" onClick={onOpenAttributesEdit}>
            {coreAttributes.map((stat) => (
              <div
                key={stat.short}
                className={`${t.inputBg} border ${t.cardBorder} hover:${t.accentBorder} rounded-lg py-1.5 text-center cursor-pointer active:scale-95 transition-all`}
              >
                <span className={`text-[8px] ${t.textMuted} uppercase font-extrabold block leading-none`}>{stat.short}</span>
                <span className={`text-sm font-extrabold font-mono ${stat.color} block mt-0.5 leading-none`}>
                  {getModValue(stat.score) >= 0 ? '+' : ''}{getModValue(stat.score)}
                </span>
              </div>
            ))}
          </div>

          {/* Row 4: Proficiency - AC - Init - PP - Speed */}
          <div className="grid grid-cols-5 gap-1" onClick={onOpenCombatEdit}>
            <div className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center`}>
              <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`}>MAÎT</span>
              <span className={`text-sm font-extrabold font-mono ${t.accent} block mt-0.5 leading-none`}>+{activeChar.proficiency_bonus || 2}</span>
            </div>
            <div className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer hover:${t.accentBorder} transition-all`}>
              <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`}>CA</span>
              <span className={`text-sm font-extrabold font-mono ${t.accent} block mt-0.5 leading-none`}>{activeChar.ac}</span>
            </div>
            <div className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer hover:${t.accentBorder} transition-all`}>
              <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`}>INIT</span>
              <span className="text-sm font-extrabold font-mono text-cyan-500 block mt-0.5 leading-none">+{activeChar.initiative}</span>
            </div>
            <div className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer hover:${t.accentBorder} transition-all`}>
              <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`}>PP</span>
              <span className="text-sm font-extrabold font-mono text-emerald-500 block mt-0.5 leading-none">{activeChar.passive_perception}</span>
            </div>
            <div className={`${t.inputBg} border ${t.cardBorder} rounded-lg py-1.5 text-center cursor-pointer hover:${t.accentBorder} transition-all`}>
              <span className={`text-[8px] ${t.textMuted} font-extrabold block uppercase leading-none`}>VIT</span>
              <span className={`text-sm font-extrabold font-mono ${t.textPrimary} block mt-0.5 leading-none`}>{activeChar.speed}m</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
