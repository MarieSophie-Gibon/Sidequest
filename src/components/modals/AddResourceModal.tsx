import { X, Check, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewResourceState } from '../../hooks/useCharacterData';

interface Props {
  newResource: NewResourceState;
  setNewResource: React.Dispatch<React.SetStateAction<NewResourceState>>;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onClose: () => void;
}

export function AddResourceModal({ newResource, setNewResource, onSubmit, onDelete, onClose }: Props) {
  const t = useThemeClasses();
  const isEditing = !!newResource.id;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase font-mono`}>
          {isEditing ? 'Modifier la Ressource' : 'Nouvelle Ressource'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input type="text" placeholder="ex: Points de Ki" value={newResource.name} onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Actuel</label>
              <input type="number" min="0" max={newResource.max} value={newResource.current} onChange={(e) => setNewResource(prev => ({ ...prev, current: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Maximum</label>
              <input type="number" min="1" value={newResource.max} onChange={(e) => setNewResource(prev => ({ ...prev, max: Number(e.target.value), current: Math.min(prev.current, Number(e.target.value)) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Récupération</label>
            <div className={`flex rounded-xl overflow-hidden border ${t.inputBorder}`}>
              {(['SHORT_REST', 'LONG_REST'] as const).map((type) => (
                <button key={type} type="button"
                  onClick={() => setNewResource(prev => ({ ...prev, recharge: type }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all ${newResource.recharge === type ? `${t.accentBg} ${t.accent} border-r-0` : `${t.inputBg} ${t.textMuted}`}`}>
                  {type === 'SHORT_REST' ? 'Court Repos' : 'Long Repos'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`flex items-center justify-center gap-3 pt-2 border-t ${t.cardBorder}`}>
          <button type="button" onClick={onClose} className={`w-10 h-10 flex items-center justify-center rounded-xl ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textMuted} hover:brightness-90 active:scale-90 transition-all`}>
            <X size={18} />
          </button>
          {isEditing && onDelete && (
            <button type="button" onClick={() => { onDelete(newResource.id!); onClose(); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 border border-red-300 text-red-500 hover:bg-red-100 active:scale-90 transition-all">
              <Trash2 size={18} />
            </button>
          )}
          <button type="submit" className={`w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} shadow-md hover:brightness-110 active:scale-90 transition-all`}>
            <Check size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
