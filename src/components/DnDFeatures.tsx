import { useState } from 'react';
import type { Feature, Resource, Familiar } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { Sword, Dna, Zap, CirclePlus, Star, PawPrint, Heart, ChevronDown } from 'lucide-react';

interface DnDFeaturesProps {
  features: Feature[];
  resources: Resource[];
  familiars: Familiar[];
  onShortRest: () => void;
  onLongRest: () => void;
  onOpenEditFeature: (feature: Feature) => void;
  onOpenCreateFeature: (type: Feature['type']) => void;
  onOpenAddResource: () => void;
  onOpenEditResource: (resource: Resource) => void;
  onUpdateResourceCurrent: (id: string, delta: number) => void;
  onOpenAddFamiliar: () => void;
  onOpenEditFamiliar: (familiar: Familiar) => void;
  onUpdateFamiliarHp: (id: string, delta: number) => void;
}

export function DnDFeatures({
  features,
  resources,
  familiars,
  onOpenEditFeature,
  onOpenCreateFeature,
  onOpenAddResource,
  onOpenEditResource,
  onUpdateResourceCurrent,
  onOpenAddFamiliar,
  onOpenEditFamiliar,
  onUpdateFamiliarHp,
}: DnDFeaturesProps) {
  const t = useThemeClasses();
  const [expandedFamiliar, setExpandedFamiliar] = useState<string | null>(null);
  const [editingFamiliarHp, setEditingFamiliarHp] = useState<{ id: string; value: string } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const familiarSection = (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
      <div className={`flex justify-between items-center ${!collapsed['familiers'] ? 'mb-3' : ''}`}>
        <button type="button" onClick={() => toggle('familiers')} className="flex items-center gap-1.5 flex-1 min-w-0">
          <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${collapsed['familiers'] ? '-rotate-90' : 'rotate-0'}`} />
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><PawPrint size={14} /> Familiers & Compagnons</h4>
        </button>
        <button onClick={onOpenAddFamiliar} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
      </div>
      {!collapsed['familiers'] && (familiars.length === 0 ? (
        <p className={`text-[10px] ${t.textMuted} italic text-center py-2`}>Aucun compagnon pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {familiars.map(fam => {
            const hpPct = fam.hp_max > 0 ? Math.round((fam.hp_current / fam.hp_max) * 100) : 0;
            const hpColor = hpPct > 60 ? 'bg-emerald-500' : hpPct > 30 ? 'bg-amber-500' : 'bg-rose-500';
            const statusColor: Record<Familiar['status'], string> = {
              present: 'text-emerald-400',
              distant: 'text-amber-400',
              unconscious: 'text-slate-400',
              dead: 'text-rose-500',
            };
            const statusLabel: Record<Familiar['status'], string> = {
              present: 'Présent',
              distant: 'Éloigné',
              unconscious: 'Inconscient',
              dead: 'Mort',
            };
            const isExpanded = expandedFamiliar === fam.id;
            const statKeys: { key: keyof Familiar; label: string }[] = [
              { key: 'str', label: 'FOR' }, { key: 'dex', label: 'DEX' }, { key: 'con', label: 'CON' },
              { key: 'int', label: 'INT' }, { key: 'wis', label: 'SAG' }, { key: 'cha', label: 'CHA' },
            ];
            return (
              <div
                key={fam.id}
                onClick={() => onOpenEditFamiliar(fam)}
                className={`${t.inputBg} rounded-xl border ${t.cardBorder} overflow-hidden cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all`}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setExpandedFamiliar(isExpanded ? null : fam.id); }}
                        className="focus:outline-none"
                      >
                        <ChevronDown size={12} className={`${t.textMuted} transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-xl overflow-hidden border ${t.cardBorder} bg-emerald-500/15 flex items-center justify-center shrink-0`}>
                        {fam.avatar_url
                          ? <img src={fam.avatar_url} alt={fam.name} className="w-full h-full object-cover" />
                          : <PawPrint size={18} className="text-emerald-400" />}
                      </div>
                      <span className={`text-xs font-bold ${t.textPrimary}`}>{fam.name}</span>
                      {fam.species && <span className={`text-[9px] ${t.textMuted} font-mono`}>{fam.species}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {fam.ac != null && fam.ac > 0 && (
                        <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 rounded-md">CA {fam.ac}</span>
                      )}
                      <span className={`text-[9px] font-bold uppercase ${statusColor[fam.status]}`}>{statusLabel[fam.status]}</span>
                    </div>
                  </div>
                  {editingFamiliarHp?.id === fam.id ? (
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <Heart size={10} className="text-rose-400 shrink-0" />
                      <input
                        type="number"
                        min={0}
                        max={fam.hp_max}
                        autoFocus
                        value={editingFamiliarHp.value}
                        onChange={e => setEditingFamiliarHp({ id: fam.id, value: e.target.value })}
                        onBlur={() => {
                          const next = Math.max(0, Math.min(fam.hp_max, Number(editingFamiliarHp.value) || 0));
                          onUpdateFamiliarHp(fam.id, next - fam.hp_current);
                          setEditingFamiliarHp(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          if (e.key === 'Escape') setEditingFamiliarHp(null);
                        }}
                        className={`w-full ${t.inputBg} border ${t.accentBorder} ${t.inputText} rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none text-center`}
                      />
                      <span className={`text-[9px] ${t.textMuted} shrink-0`}>/{fam.hp_max}</span>
                    </div>
                  ) : (
                    <button type="button" onClick={e => { e.stopPropagation(); setEditingFamiliarHp({ id: fam.id, value: String(fam.hp_current) }); }} className="w-full group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1">
                          <Heart size={10} className="text-rose-400" />
                          <span className={`text-[10px] font-mono font-bold ${t.textPrimary}`}>{fam.hp_current}<span className={`${t.textMuted} font-normal`}>/{fam.hp_max}</span></span>
                        </span>
                        <span className={`text-[8px] ${t.textMuted} opacity-0 group-hover:opacity-100 transition-opacity`}>modifier</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700/40 overflow-hidden border border-slate-600/20">
                        <div className={`h-full rounded-full transition-all ${hpColor}`} style={{ width: `${hpPct}%` }} />
                      </div>
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className={`px-3 pb-3 space-y-2 border-t ${t.cardBorder} pt-2`}>
                    {statKeys.some(s => fam[s.key] != null) && (
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {statKeys.map(({ key, label }) => {
                          const val = (fam[key] as number | undefined) ?? 10;
                          const mod = Math.floor((val - 10) / 2);
                          return (
                            <div key={key} className={`${t.cardBg} rounded-lg py-1 border ${t.cardBorder}`}>
                              <div className={`text-[8px] font-bold ${t.textMuted} uppercase`}>{label}</div>
                              <div className={`text-[10px] font-mono font-bold ${t.textPrimary}`}>{val}</div>
                              <div className={`text-[9px] font-mono ${t.textSecondary}`}>{mod >= 0 ? `+${mod}` : mod}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Badges VIT / PP / vision */}
                    {(fam.speed || (fam.passive_perception != null && fam.passive_perception > 0) || fam.darkvision) && (
                      <div className="flex flex-wrap gap-1.5">
                        {fam.speed && <span className={`text-[9px] font-mono ${t.textMuted} ${t.cardBg} px-1.5 py-0.5 rounded-md border ${t.cardBorder}`}>VIT {fam.speed}</span>}
                        {fam.passive_perception != null && fam.passive_perception > 0 && <span className={`text-[9px] font-mono ${t.textMuted} ${t.cardBg} px-1.5 py-0.5 rounded-md border ${t.cardBorder}`}>PP {fam.passive_perception}</span>}
                        {fam.darkvision && <span className={`text-[9px] font-mono ${t.textMuted} ${t.cardBg} px-1.5 py-0.5 rounded-md border ${t.cardBorder}`}>🌑 {fam.darkvision}</span>}
                      </div>
                    )}
                    {fam.senses && (
                      <div>
                        <p className={`text-[9px] font-bold uppercase ${t.textMuted} mb-0.5`}>Compétences</p>
                        <p className={`text-[10px] ${t.textSecondary} ${t.cardBg} p-2 rounded-lg border ${t.cardBorder}`}>{fam.senses}</p>
                      </div>
                    )}
                    {fam.resistances && (
                      <div>
                        <p className={`text-[9px] font-bold uppercase ${t.textMuted} mb-0.5`}>Immunités / Résistances</p>
                        <p className={`text-[10px] ${t.textSecondary} ${t.cardBg} p-2 rounded-lg border ${t.cardBorder}`}>{fam.resistances}</p>
                      </div>
                    )}
                    {fam.description && (
                      <p className={`text-[10px] ${t.textSecondary} leading-relaxed ${t.cardBg} p-2 rounded-lg border ${t.cardBorder} italic`}>{fam.description}</p>
                    )}
                    {fam.abilities && (
                      <div>
                        <p className={`text-[9px] font-bold uppercase ${t.textMuted} mb-0.5`}>Capacités</p>
                        <p className={`text-[10px] ${t.textSecondary} leading-relaxed ${t.cardBg} p-2 rounded-lg border ${t.cardBorder}`}>{fam.abilities}</p>
                      </div>
                    )}
                    {fam.actions && (
                      <div>
                        <p className={`text-[9px] font-bold uppercase ${t.textMuted} mb-0.5`}>Actions</p>
                        <p className={`text-[10px] ${t.textSecondary} leading-relaxed ${t.cardBg} p-2 rounded-lg border ${t.cardBorder}`}>{fam.actions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">

      {familiars.length > 0 && familiarSection}

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className={`flex justify-between items-center ${!collapsed['ressources'] ? 'mb-3' : ''}`}>
          <button type="button" onClick={() => toggle('ressources')} className="flex items-center gap-1.5 flex-1 min-w-0">
            <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${collapsed['ressources'] ? '-rotate-90' : 'rotate-0'}`} />
            <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Zap size={14} /> Ressources</h4>
          </button>
          <button onClick={onOpenAddResource} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        {!collapsed['ressources'] && resources.length > 0 && (
          <div className="space-y-2">
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
          </div>
        )}
      </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className={`flex justify-between items-center ${!collapsed['classe'] ? 'mb-3' : ''}`}>
          <button type="button" onClick={() => toggle('classe')} className="flex items-center gap-1.5 flex-1 min-w-0">
            <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${collapsed['classe'] ? '-rotate-90' : 'rotate-0'}`} />
            <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Sword size={14} /> Aptitudes de Classe</h4>
          </button>
          <button onClick={() => onOpenCreateFeature('classe')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        {!collapsed['classe'] && <div className="space-y-3">
          {features.filter((f) => f.type === 'classe').map((feat) => {
            const linkedResource = feat.resource_id ? resources.find(r => r.id === feat.resource_id) : null;
            return (
              <div key={feat.id} onClick={() => onOpenEditFeature(feat)} className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}>
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
        </div>}
      </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className={`flex justify-between items-center ${!collapsed['espece'] ? 'mb-3' : ''}`}>
          <button type="button" onClick={() => toggle('espece')} className="flex items-center gap-1.5 flex-1 min-w-0">
            <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${collapsed['espece'] ? '-rotate-90' : 'rotate-0'}`} />
            <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Dna size={14} /> Traits d'Espèce</h4>
          </button>
          <button onClick={() => onOpenCreateFeature('espece')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        {!collapsed['espece'] && <div className="space-y-3">
          {features.filter((f) => f.type === 'espece').map((feat) => (
            <div key={feat.id} onClick={() => onOpenEditFeature(feat)} className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}>
              <span className={`text-xs font-bold ${t.textPrimary} block mb-1`}>{feat.name}</span>
              <p className={`text-[11px] ${t.textSecondary} leading-normal`}>{feat.description}</p>
            </div>
          ))}
        </div>}
      </div>

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <div className={`flex justify-between items-center ${!collapsed['don'] ? 'mb-3' : ''}`}>
          <button type="button" onClick={() => toggle('don')} className="flex items-center gap-1.5 flex-1 min-w-0">
            <ChevronDown size={12} className={`${t.textMuted} transition-transform shrink-0 ${collapsed['don'] ? '-rotate-90' : 'rotate-0'}`} />
            <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider flex items-center gap-1.5`}><Star size={14} /> Dons & Talents</h4>
          </button>
          <button onClick={() => onOpenCreateFeature('don')} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md backdrop-blur-xl hover:brightness-110 active:scale-90 transition-all`}><CirclePlus size={16} /></button>
        </div>
        {!collapsed['don'] && <div className="space-y-3">
          {features.filter((f) => f.type === 'don').map((feat) => (
            <div key={feat.id} onClick={() => onOpenEditFeature(feat)} className={`${t.inputBg} rounded-xl p-3.5 border ${t.cardBorder} hover:${t.accentBorder} cursor-pointer transition-all`}>
              <span className={`text-xs font-bold ${t.textPrimary} block mb-1`}>{feat.name}</span>
              <p className={`text-[11px] ${t.textSecondary} leading-normal`}>{feat.description}</p>
            </div>
          ))}
        </div>}
      </div>

      {familiars.length === 0 && familiarSection}

    </div>
  );
}
