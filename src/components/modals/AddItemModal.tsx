import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewItemState } from '../../hooks/useCharacterData';
import { Package, Sword, Shield } from 'lucide-react';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  newItem: NewItemState;
  setNewItem: React.Dispatch<React.SetStateAction<NewItemState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AddItemModal({ newItem, setNewItem, onSubmit, onClose }: Props) {
  const t = useThemeClasses();

  const categories = [
    { key: 'objet' as const, label: 'Objet', icon: Package },
    { key: 'arme' as const, label: 'Arme', icon: Sword },
    { key: 'armure' as const, label: 'Armure', icon: Shield },
  ];

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title="Ajouter un Objet" onClose={onClose} />

        {/* Category selector */}
        <div>
          <label className={`text-[10px] ${t.textMuted} uppercase block mb-1.5`}>Catégorie</label>
          <div className="grid grid-cols-3 gap-1.5">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = newItem.category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setNewItem(prev => ({ ...prev, category: cat.key }))}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                    isActive
                      ? `bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} shadow-md`
                      : `${t.btnSecondaryBg} ${t.btnSecondaryText} ${t.btnSecondaryBorder}`
                  }`}
                >
                  <Icon size={16} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input type="text" placeholder="ex: Épée longue" value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Quantité</label>
              <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Statut</label>
              <select value={newItem.equipped ? 'true' : 'false'} onChange={(e) => setNewItem(prev => ({ ...prev, equipped: e.target.value === 'true' }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`}>
                <option value="false">Dans le Sac</option>
                <option value="true">Équipé</option>
              </select>
            </div>
          </div>

          {/* Weapon fields */}
          {newItem.category === 'arme' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Dégâts</label>
                <input type="text" placeholder="1d8+3" value={newItem.damage} onChange={(e) => setNewItem(prev => ({ ...prev, damage: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
              </div>
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Portée</label>
                <input type="text" placeholder="1.5m / 9m" value={newItem.range} onChange={(e) => setNewItem(prev => ({ ...prev, range: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
              </div>
            </div>
          )}

          {/* Armor fields */}
          {newItem.category === 'armure' && (
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Bonus Défense (CA)</label>
              <input type="number" min="0" value={newItem.defense_bonus} onChange={(e) => setNewItem(prev => ({ ...prev, defense_bonus: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
          )}
        </div>

        <ModalActions onCancel={onClose} saveType="submit" saveLabel="Sauvegarder" />
      </form>
    </div>
  );
}
