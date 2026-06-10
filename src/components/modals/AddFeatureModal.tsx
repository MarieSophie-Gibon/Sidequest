import { useThemeClasses } from '../../contexts/AppSettingsContext';
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
}

export function AddFeatureModal({ newFeature, setNewFeature, resources, onSubmit, onDelete, onClose }: Props) {
  const t = useThemeClasses();

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title={newFeature.id ? 'Modifier' : 'Créer'} onClose={onClose} />

        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Catégorie</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['classe', 'espece', 'don'] as const).map(cat => (
                <button key={cat} type="button" onClick={() => setNewFeature(prev => ({ ...prev, type: cat }))}
                  className={`py-1.5 rounded-xl border text-[9px] font-bold uppercase h-7 transition-all ${newFeature.type === cat ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
                >{cat === 'espece' ? 'Espèce' : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
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
                className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all ${newFeature.category === 'active' ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
              >Active</button>
              <button type="button" onClick={() => setNewFeature(prev => ({ ...prev, category: 'passive' }))}
                className={`py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase h-7 transition-all ${newFeature.category === 'passive' ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
              >Passive</button>
            </div>
          </div>

          {newFeature.category === 'active' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Max</label>
                <input type="number" min="1" value={newFeature.max} onChange={(e) => setNewFeature(prev => ({ ...prev, max: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
              </div>
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Récupération</label>
                <select value={newFeature.recharge} onChange={(e) => setNewFeature(prev => ({ ...prev, recharge: e.target.value }))} className={`border ${t.inputBorder} rounded-xl p-2.5 w-full text-xs ${t.inputBg} ${t.textSecondary} font-bold focus:outline-none`}>
                  <option value="LONG_REST">Repos Long</option>
                  <option value="SHORT_REST">Repos Court</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea placeholder="Description..." value={newFeature.description} onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 focus:outline-none`} />
          </div>

          {resources.length > 0 && newFeature.category === 'active' && (
            <div className={`${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5 space-y-2`}>
              <label className={`text-[10px] ${t.textMuted} uppercase block`}>Coût en ressource</label>
              <div className="grid grid-cols-2 gap-2">
                <select value={newFeature.resource_id} onChange={(e) => setNewFeature(prev => ({ ...prev, resource_id: e.target.value }))} className={`border ${t.inputBorder} rounded-xl p-2 w-full text-xs ${t.inputBg} ${t.textSecondary} focus:outline-none`}>
                  <option value="">— Aucune —</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {newFeature.resource_id && (
                  <input type="number" min="0" value={newFeature.resource_cost} onChange={(e) => setNewFeature(prev => ({ ...prev, resource_cost: Number(e.target.value) }))} placeholder="Coût" className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2 w-full text-xs focus:outline-none font-mono`} />
                )}
              </div>
            </div>
          )}
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
