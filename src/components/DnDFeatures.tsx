import type { Feature, Resource } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { Sword, Dna, Zap, CirclePlus, Star } from 'lucide-react';

interface DnDFeaturesProps {
  features: Feature[];
  resources: Resource[];
  onShortRest: () => void;
  onLongRest: () => void;
  onOpenEditFeature: (feature: Feature) => void;
  onOpenCreateFeature: (type: Feature['type']) => void;
  onOpenAddResource: () => void;
  onOpenEditResource: (resource: Resource) => void;
  onUpdateResourceCurrent: (id: string, delta: number) => void;
}

export function DnDFeatures({
  features,
  resources,
  onOpenEditFeature,
  onOpenCreateFeature,
  onOpenAddResource,
  onOpenEditResource,
  onUpdateResourceCurrent,
}: DnDFeaturesProps) {
  const t = useThemeClasses();

  return (
    <div className="space-y-2">

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Zap size={14} /> Ressources</h4>
            <button onClick={onOpenAddResource} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
          </div>
          {resources.length > 0 && <div className="space-y-2">
            {resources.map(res => (
              <div key={res.id} className={`${t.inputBg} rounded-xl px-3 py-2 border ${t.cardBorder} flex items-center justify-between`}>
                <span onClick={() => onOpenEditResource(res)} className={`text-xs font-bold ${t.textPrimary} cursor-pointer`}>{res.name}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onUpdateResourceCurrent(res.id, -1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>−</button>
                  <span className={`text-xs font-mono font-bold ${t.textPrimary} min-w-8 text-center`}>{res.current}<span className={`${t.textMuted} font-normal`}>/{res.max}</span></span>
                  <button type="button" onClick={() => onUpdateResourceCurrent(res.id, +1)} className={`w-6 h-6 flex items-center justify-center rounded-lg ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-sm font-bold hover:brightness-90 active:scale-90 transition-all`}>+</button>
                </div>
              </div>
            ))}
          </div>}
        </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Sword size={14} /> Aptitudes de Classe</h4>
          <button onClick={() => onOpenCreateFeature('classe')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        <div className="space-y-3">
          {features
            .filter((f) => f.type === 'classe')
            .map((feat) => {
              const linkedResource = feat.resource_id ? resources.find(r => r.id === feat.resource_id) : null;
              return (
                <div
                  key={feat.id}
                  onClick={() => onOpenEditFeature(feat)}
                  className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${t.textPrimary}`}>{feat.name}</span>
                    {linkedResource && feat.resource_cost ? (
                      <span className="text-[11px] font-mono font-bold text-violet-100 bg-violet-500/45 border border-violet-200/70 rounded-md px-2 py-0.5 shadow-[0_0_12px_rgba(167,139,250,0.35)]">
                        <Zap size={10} className="inline mr-0.5" />{feat.resource_cost}
                      </span>
                    ) : null}
                  </div>
                  <p className={`text-[11px] ${t.textSecondary} leading-normal`}>{feat.description}</p>
                </div>
              );
            })}
        </div>
      </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Dna size={14} /> Traits d'Espèce</h4>
          <button onClick={() => onOpenCreateFeature('espece')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        <div className="space-y-3">
          {features
            .filter((f) => f.type === 'espece')
            .map((feat) => (
              <div
                key={feat.id}
                onClick={() => onOpenEditFeature(feat)}
                className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}
              >
                <span className={`text-xs font-bold ${t.textPrimary} block mb-1`}>{feat.name}</span>
                <p className={`text-[11px] ${t.textSecondary} leading-normal`}>{feat.description}</p>
              </div>
            ))}
        </div>
      </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Star size={14} /> Dons & Talents</h4>
          <button onClick={() => onOpenCreateFeature('don')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        <div className="space-y-3">
          {features
            .filter((f) => f.type === 'don')
            .map((feat) => (
              <div
                key={feat.id}
                onClick={() => onOpenEditFeature(feat)}
                className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}
              >
                <span className={`text-xs font-bold ${t.textPrimary} block mb-1`}>{feat.name}</span>
                <p className={`text-[11px] ${t.textSecondary} leading-normal`}>{feat.description}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
