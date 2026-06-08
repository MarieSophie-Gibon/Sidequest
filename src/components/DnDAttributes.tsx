import type { Feature, Item, Resource } from '../types/rpg.types';
import { useAppSettings, useThemeClasses } from '../contexts/AppSettingsContext';
import { Moon, Sun, Sword, Shield, Zap } from 'lucide-react';

interface DnDAttributesProps {
  features: Feature[];
  items: Item[];
  resources: Resource[];
  onToggleFeatureUse: (featureId: string, index: number) => void;
  onShortRest: () => void;
  onLongRest: () => void;
  onUpdateResourceCurrent: (id: string, delta: number) => void;
}

export function DnDAttributes({
  features,
  items,
  resources,
  onToggleFeatureUse,
  onShortRest,
  onLongRest,
  onUpdateResourceCurrent,
}: DnDAttributesProps) {
  const t = useThemeClasses();
  const { dashboardVisibility } = useAppSettings();

  const equippedWeapons = items.filter(i => i.category === 'arme' && i.equipped);
  const equippedArmors = items.filter(i => i.category === 'armure' && i.equipped);

  const displayedClassFeatures = features.filter(
    (f) => f.type === 'classe' && (f.category !== 'passive' || (!!f.resource_id && !!f.resource_cost))
  );
  const linkedResourceIds = new Set(displayedClassFeatures.map(f => f.resource_id).filter(Boolean));

  return (
    <div className="space-y-2">
      <div className={`sticky top-0 z-10 ${t.cardBg} border ${t.cardBorder} rounded-2xl px-3 py-2 shadow-sm ${t.cardShadow} flex items-center justify-between backdrop-blur-xl`}>
        <span className={`text-[10px] font-semibold ${t.textMuted} uppercase tracking-wider`}>Repos</span>
        <div className="flex items-center gap-2">
          <button onClick={onShortRest} className={`flex items-center gap-1.5 ${t.inputBg} border ${t.cardBorder} ${t.textSecondary} hover:brightness-90 active:scale-90 transition-all rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`}>
            <Moon size={11} /> Court
          </button>
          <button onClick={onLongRest} className={`flex items-center gap-1.5 ${t.inputBg} border ${t.cardBorder} ${t.textSecondary} hover:brightness-90 active:scale-90 transition-all rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider`}>
            <Sun size={11} /> Long
          </button>
        </div>
      </div>

      {resources.filter(r => !linkedResourceIds.has(r.id)).map(res => (
        <div key={res.id} className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center justify-between`}>
          <div className="flex items-center gap-1.5">
            <Zap size={11} className={t.accent} />
            <span className={`text-xs font-bold ${t.textPrimary}`}>{res.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onUpdateResourceCurrent(res.id, -1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>−</button>
            <span className={`text-xs font-mono font-bold ${t.textPrimary} min-w-[32px] text-center`}>{res.current}<span className={`${t.textMuted} font-normal`}>/{res.max}</span></span>
            <button type="button" onClick={() => onUpdateResourceCurrent(res.id, +1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>+</button>
          </div>
        </div>
      ))}

      {dashboardVisibility.showEquipment && [...equippedWeapons.map(item => (
        <div key={item.id} className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center gap-3`}>
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}>
            <Sword size={12} className={t.accent} />
          </div>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold ${t.textPrimary} block truncate`}>{item.name}</span>
            {item.range && <span className={`text-[9px] ${t.textMuted}`}>{item.range}</span>}
          </div>
          {item.damage && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-mono font-bold shrink-0">
              ⚔ {item.damage}
            </span>
          )}
        </div>
      )), ...equippedArmors.map(item => (
        <div key={item.id} className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center gap-3`}>
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg ${t.accentBg} border ${t.accentBorder} shrink-0`}>
            <Shield size={12} className={t.accent} />
          </div>
          <span className={`text-xs font-bold ${t.textPrimary} flex-1 truncate`}>{item.name}</span>
          {item.defense_bonus !== undefined && item.defense_bonus > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-[11px] font-mono font-bold shrink-0">
              🛡 +{item.defense_bonus} CA
            </span>
          )}
        </div>
      ))]}  

      {dashboardVisibility.showClassFeatures && displayedClassFeatures
        .map((feat) => {
          const linkedResource = feat.resource_id ? resources.find(r => r.id === feat.resource_id) : null;
          const canUse = linkedResource && feat.resource_cost ? linkedResource.current >= feat.resource_cost : true;

          if (linkedResource && feat.resource_cost) return (
            <div key={feat.id} className="space-y-1">
              <div className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center justify-between`}>
                <div className="flex items-center gap-1.5">
                  <Zap size={11} className={t.accent} />
                  <span className={`text-xs font-bold ${t.textPrimary}`}>{linkedResource.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onUpdateResourceCurrent(linkedResource.id, -1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>−</button>
                  <span className={`text-xs font-mono font-bold ${t.textPrimary} min-w-8 text-center`}>{linkedResource.current}<span className={`${t.textMuted} font-normal`}>/{linkedResource.max}</span></span>
                  <button type="button" onClick={() => onUpdateResourceCurrent(linkedResource.id, +1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>+</button>
                </div>
              </div>
              <button
                type="button"
                disabled={!canUse}
                onClick={() => onUpdateResourceCurrent(feat.resource_id!, -(feat.resource_cost!))}
                className={`w-full ${t.inputBg} rounded-xl p-3 border ${canUse ? t.cardBorder : 'border-transparent opacity-50'} text-left active:scale-[0.97] hover:brightness-95 transition-all disabled:cursor-not-allowed`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${t.textPrimary}`}>{feat.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-md border border-violet-500/20 flex items-center gap-0.5">
                      <Zap size={8} className="inline" />{feat.resource_cost} {linkedResource.name}
                    </span>
                    <span className={`text-[8px] ${t.textMuted} ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder} uppercase`}>Classe</span>
                  </div>
                </div>
              </button>
            </div>
          );

          return (
          <div key={feat.id} className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${t.textPrimary}`}>{feat.name}</span>
              <span className={`text-[8px] ${t.textMuted} ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder} uppercase`}>Classe</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: feat.max }).map((_, i) => (
                <button key={i} type="button" onClick={(e) => { e.stopPropagation(); onToggleFeatureUse(feat.id, i); }}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder}` : `${t.cardBg} ${t.cardBorder}`}`}>
                  <div className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : 'bg-transparent'}`} />
                </button>
              ))}
            </div>
          </div>
        );
        })}

      {dashboardVisibility.showTraits && <>
        {features
          .filter((f) => f.type === 'espece' && f.category !== 'passive')
          .map((feat) => (
            <div key={feat.id} className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold ${t.textPrimary} block`}>{feat.name}</span>
                <span className={`text-[8px] ${t.textMuted} ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder} uppercase`}>Espèce</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: feat.max }).map((_, i) => (
                  <button key={i} type="button" onClick={(e) => { e.stopPropagation(); onToggleFeatureUse(feat.id, i); }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder} shadow-sm` : `${t.cardBg} ${t.cardBorder}`}`}>
                    <div className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        {features
          .filter((f) => f.type === 'don' && f.category !== 'passive')
          .map((feat) => (
            <div key={feat.id} className={`${t.inputBg} rounded-xl p-3 border ${t.cardBorder}`}>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-xs font-bold ${t.textPrimary}`}>{feat.name}</span>
                <span className={`text-[8px] ${t.textMuted} ${t.btnSecondaryBg} px-1.5 py-0.5 rounded-lg border ${t.btnSecondaryBorder} uppercase`}>Don</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: feat.max }).map((_, i) => (
                  <button key={i} type="button" onClick={(e) => { e.stopPropagation(); onToggleFeatureUse(feat.id, i); }}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${i < feat.current ? `${t.accentBg} ${t.accentBorder} shadow-sm` : `${t.cardBg} ${t.cardBorder}`}`}>
                    <div className={`w-2 h-2 rounded-full ${i < feat.current ? `bg-current ${t.accent}` : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
      </>}
    </div>
  );
}
