import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { X, Check, Trash2 } from 'lucide-react';
import type { NewSpellState } from '../../hooks/useCharacterData';

interface Props {
  newSpell: NewSpellState;
  setNewSpell: React.Dispatch<React.SetStateAction<NewSpellState>>;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (id: string, name: string) => void;
  onClose: () => void;
}

export function AddSpellModal({ newSpell, setNewSpell, onSubmit, onDelete, onClose }: Props) {
  const t = useThemeClasses();
  const isEditing = !!newSpell.id;

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase font-mono`}>{isEditing ? 'Modifier le Sort' : 'Inscrire un Sort'}</h3>
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input type="text" placeholder="ex: Éclair de feu" value={newSpell.name} onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Niveau</label>
              <input type="number" min="0" max="9" value={newSpell.level} onChange={(e) => setNewSpell(prev => ({ ...prev, level: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Portée</label>
              <input type="text" placeholder="18m / Contact" value={newSpell.range} onChange={(e) => setNewSpell(prev => ({ ...prev, range: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Dégâts</label>
              <input type="text" placeholder="1d10 Feu" value={newSpell.damage} onChange={(e) => setNewSpell(prev => ({ ...prev, damage: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Type</label>
              <div className={`flex ${t.inputBg} border ${t.inputBorder} rounded-xl overflow-hidden`}>
                {([['action', 'Action'], ['bonus', 'Bonus'], ['reaction', 'Réaction']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNewSpell(prev => ({ ...prev, casting_type: value }))}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      newSpell.casting_type === value
                        ? `${t.accentBg} ${t.accentBorder} ${t.btnPrimaryText} shadow-sm`
                        : `${t.textMuted} hover:brightness-95`
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-4 ${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSpell.concentration} onChange={(e) => setNewSpell(prev => ({ ...prev, concentration: e.target.checked }))} className="w-3.5 h-3.5 rounded accent-violet-500" />
              <span className={`text-xs font-bold ${t.textPrimary}`}>Concentration</span>
            </label>
          </div>
          <div className={`flex flex-col gap-2 ${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newSpell.is_aoe} onChange={(e) => setNewSpell(prev => ({ ...prev, is_aoe: e.target.checked, save_type: e.target.checked ? prev.save_type : '', save_effect: e.target.checked ? prev.save_effect : '' }))} className="w-3.5 h-3.5 rounded accent-violet-500" />
              <span className={`text-xs font-bold ${t.textPrimary}`}>Jet de sauvegarde</span>
            </label>
            {newSpell.is_aoe && (
              <div className="flex flex-col gap-2 pl-5">
                <input type="text" placeholder="JS: DEX, CON..." value={newSpell.save_type} onChange={(e) => setNewSpell(prev => ({ ...prev, save_type: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2 py-1.5 text-xs focus:outline-none font-mono`} />
                <input type="text" placeholder="Réussite : dégâts ÷2, aucun effet..." value={newSpell.save_effect} onChange={(e) => setNewSpell(prev => ({ ...prev, save_effect: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2 py-1.5 text-xs focus:outline-none`} />
              </div>
            )}
          </div>
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea placeholder="Effets..." value={newSpell.desc} onChange={(e) => setNewSpell(prev => ({ ...prev, desc: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 focus:outline-none`} />
          </div>
        </div>
        <div className={`flex items-center justify-center gap-3 pt-2 border-t ${t.cardBorder}`}>
          <button type="button" onClick={onClose} className={`w-10 h-10 flex items-center justify-center rounded-xl ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textMuted} hover:brightness-90 active:scale-90 transition-all`}>
            <X size={18} />
          </button>
          {isEditing && onDelete && (
            <button type="button" onClick={() => { onDelete(newSpell.id!, newSpell.name); onClose(); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 border border-red-300 text-red-500 hover:bg-red-100 active:scale-90 transition-all">
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
