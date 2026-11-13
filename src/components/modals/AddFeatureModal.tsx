import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { useState } from 'react';
import type { NewFeatureState } from '../../hooks/useCharacterData';
import type { Resource } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  newFeature: NewFeatureState;
  setNewFeature: React.Dispatch<React.SetStateAction<NewFeatureState>>;
  resources: Resource[];
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string, name: string) => void;
  onClose: () => void;
  /** Pathfinder 1e : pas de repos court, tout se recharge à la nuit de repos. */
  perDayOnly?: boolean;
  /** Homebrew : types de capacités définis par le MJ. */
  typeOptions?: { id: string; name: string }[];
}

const DEFAULT_TYPES = [
  { id: 'classe', name: 'Classe' },
  { id: 'espece', name: 'Espèce' },
  { id: 'don', name: 'Don' },
];

type UsageMode = 'uses' | 'resource';

export function AddFeatureModal({ newFeature, setNewFeature, resources, onSubmit, onDelete, onClose, perDayOnly, typeOptions }: Props) {
  const t = useThemeClasses();
  const [maxInput, setMaxInput] = useState(String(Math.max(1, newFeature.max)));
  const [resourceCostInput, setResourceCostInput] = useState(String(Math.max(1, newFeature.resource_cost)));
  // Une capacité active se décompte soit en nombre d'utilisations (rechargées au repos),
  // soit en points d'une ressource. Jamais les deux.
  const [usageMode, setUsageMode] = useState<UsageMode>(newFeature.resource_id ? 'resource' : 'uses');

  function selectUsageMode(mode: UsageMode) {
    setUsageMode(mode);
    if (mode === 'uses') {
      const nextMax = Math.max(1, newFeature.max);
      setMaxInput(String(nextMax));
      setNewFeature(prev => ({ ...prev, max: nextMax, resource_id: '', resource_cost: 0 }));
    } else {
      const nextCost = Math.max(1, newFeature.resource_cost);
      setResourceCostInput(String(nextCost));
      setNewFeature(prev => ({ ...prev, max: 0, resource_cost: nextCost }));
    }
  }

  const toggleClass = (selected: boolean) =>
    selected ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title={newFeature.id ? 'Modifier' : 'Créer'} onClose={onClose} />

        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Catégorie</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(typeOptions ?? DEFAULT_TYPES).map(({ id, name }) => (
                <button key={id} type="button" onClick={() => setNewFeature(prev => ({ ...prev, type: id }))}
                  className={`py-1.5 px-1 rounded-xl border text-[9px] font-bold uppercase min-h-7 leading-tight transition-all ${toggleClass(newFeature.type === id)}`}
                >{name || 'Sans nom'}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input type="text" placeholder="Nom..." value={newFeature.name} onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setNewFeature(prev => ({ ...prev, category: 'active' }))}
                className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all ${toggleClass(newFeature.category === 'active')}`}
              >Active</button>
              <button type="button" onClick={() => setNewFeature(prev => ({ ...prev, category: 'passive' }))}
                className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all ${toggleClass(newFeature.category === 'passive')}`}
              >Passive</button>
            </div>
          </div>

          {newFeature.category === 'active' && (
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Utilisation</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => selectUsageMode('uses')}
                  className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all ${toggleClass(usageMode === 'uses')}`}
                >Nb d'utilisations</button>
                <button type="button" disabled={resources.length === 0} onClick={() => selectUsageMode('resource')}
                  title={resources.length === 0 ? 'Aucune ressource définie' : undefined}
                  className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${toggleClass(usageMode === 'resource')}`}
                >Ressource</button>
              </div>
            </div>
          )}

          {newFeature.category === 'active' && usageMode === 'uses' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Max</label>
                <input
                  type="number"
                  min={1}
                  value={maxInput}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setMaxInput(nextValue);
                    if (nextValue === '') return;
                    setNewFeature(prev => ({ ...prev, max: Math.max(1, Number(nextValue)) }));
                  }}
                  onBlur={() => {
                    if (maxInput === '') setMaxInput(String(newFeature.max));
                  }}
                  className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
                />
              </div>
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Récupération</label>
                {typeOptions ? (
                  // Homebrew : pas de repos court / long, les repos automatiques du MJ rechargent les capacités.
                  <p className={`border ${t.inputBorder} rounded-xl p-2.5 w-full text-xs ${t.inputBg} ${t.textSecondary} font-bold`}>Au repos</p>
                ) : perDayOnly ? (
                  <p className={`border ${t.inputBorder} rounded-xl p-2.5 w-full text-xs ${t.inputBg} ${t.textSecondary} font-bold`}>Par jour</p>
                ) : (
                <select value={newFeature.recharge} onChange={(e) => setNewFeature(prev => ({ ...prev, recharge: e.target.value }))} className={`border ${t.inputBorder} rounded-xl p-2.5 w-full text-xs ${t.inputBg} ${t.textSecondary} font-bold focus:outline-none`}>
                  <option value="LONG_REST">Repos Long</option>
                  <option value="SHORT_REST">Repos Court</option>
                </select>
                )}
              </div>
            </div>
          )}

          {newFeature.category === 'active' && usageMode === 'resource' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Ressource</label>
                <select required value={newFeature.resource_id} onChange={(e) => setNewFeature(prev => ({ ...prev, resource_id: e.target.value }))}
                  className={`border ${t.inputBorder} rounded-xl p-2.5 w-full text-xs ${t.inputBg} ${t.textSecondary} font-bold focus:outline-none`}>
                  <option value="">— Choisir —</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Coût</label>
                <input
                  type="number"
                  min={1}
                  value={resourceCostInput}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setResourceCostInput(nextValue);
                    if (nextValue === '') return;
                    setNewFeature(prev => ({ ...prev, resource_cost: Math.max(1, Number(nextValue)) }));
                  }}
                  onBlur={() => {
                    if (resourceCostInput === '') setResourceCostInput(String(newFeature.resource_cost));
                  }}
                  className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea placeholder="Description..." value={newFeature.description} onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 focus:outline-none`} />
          </div>
        </div>

        {newFeature.id && (
          <button type="button" onClick={() => { onDelete(newFeature.id!, newFeature.name); onClose(); }}
            className="w-full bg-rose-500/20 border border-rose-500/40 text-rose-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30 active:scale-95"
          >🗑 Supprimer</button>
        )}

        <ModalActions onCancel={onClose} saveType="submit" saveLabel="Sauvegarder" />
      </form>
    </div>
  );
}
