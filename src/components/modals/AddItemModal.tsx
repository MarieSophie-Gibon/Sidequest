import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewItemState } from '../../hooks/useCharacterData';
import { useState } from 'react';
import { Package, Sword, Shield, Trash2, FlaskConical, ScrollText, WandSparkles, Leaf, Sparkles, X } from 'lucide-react';
import { ModalActions, ModalHeader } from './ModalControls';
import type { HbItemCategory } from '../../systems/homebrew/types';
import { Pf1ItemFields } from '../pf1e/Pf1ItemFields';

interface Props {
  newItem: NewItemState;
  setNewItem: React.Dispatch<React.SetStateAction<NewItemState>>;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (id: string, name: string) => void;
  onClose: () => void;
  /** Homebrew : catégories du MJ et leurs champs (Bonus, DM). */
  hbCategories?: HbItemCategory[];
  /** Pathfinder 1e : fiche complète pour les armes et les armures. */
  pf1?: boolean;
}

export function AddItemModal({ newItem, setNewItem, onSubmit, onDelete, onClose, hbCategories, pf1 }: Props) {
  const t = useThemeClasses();
  const isEditing = !!newItem.id;
  const [quantityInput, setQuantityInput] = useState(String(newItem.quantity));
  const [defenseInput, setDefenseInput] = useState(String(newItem.defense_bonus));
  // Bonus / effet : affiché d'office pour un objet magique ou s'il est déjà renseigné.
  const [showEffect, setShowEffect] = useState(!!newItem.effect);
  const effectOpen = showEffect || newItem.category === 'objet_magique';

  const hbCategory = hbCategories?.find(c => c.id === newItem.category);
  // Champs affichés : ceux de la catégorie homebrew, sinon les champs D&D de l'arme / de l'armure.
  const pf1Fields = !!pf1 && (newItem.category === 'arme' || newItem.category === 'armure');
  const showDamage = !pf1Fields && (hbCategories ? !!hbCategory?.fields.includes('dm') : newItem.category === 'arme');
  const showBonus = !pf1Fields && (hbCategories ? !!hbCategory?.fields.includes('bonus') : newItem.category === 'armure');

  const categories = hbCategories ? hbCategories.map(c => ({ key: c.id, label: c.name || 'Sans nom', icon: Package })) : [
    { key: 'objet' as const, label: 'Objet', icon: Package },
    { key: 'potion' as const, label: 'Potion', icon: FlaskConical },
    { key: 'parchemin' as const, label: 'Parchemin', icon: ScrollText },
    { key: 'objet_magique' as const, label: 'Magique', icon: WandSparkles },
    { key: 'composant' as const, label: 'Composant', icon: Leaf },
    { key: 'arme' as const, label: 'Arme', icon: Sword },
    { key: 'armure' as const, label: 'Armure', icon: Shield },
  ];

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title={isEditing ? 'Modifier un Objet' : 'Ajouter un Objet'} onClose={onClose} />

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

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea
              placeholder="Optionnel..."
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 resize-none focus:outline-none`}
            />
          </div>

          {effectOpen ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[10px] ${t.textMuted} uppercase flex items-center gap-1`}><Sparkles size={10} /> Bonus / effet</label>
                {newItem.category !== 'objet_magique' && (
                  <button type="button" aria-label="Retirer le bonus / effet" onClick={() => { setShowEffect(false); setNewItem(prev => ({ ...prev, effect: '' })); }} className={t.textMuted}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <textarea
                placeholder="ex: +2 de résistance aux jets de sauvegarde, vision dans le noir 18 m…"
                value={newItem.effect ?? ''}
                onChange={(e) => setNewItem(prev => ({ ...prev, effect: e.target.value }))}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-14 resize-none focus:outline-none`}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowEffect(true)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed ${t.inputBorder} ${t.textMuted} text-[10px] font-bold uppercase tracking-wide hover:brightness-110`}
            >
              <Sparkles size={12} /> Ajouter un bonus / effet
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Quantité</label>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setQuantityInput(nextValue);
                  if (nextValue === '') return;
                  setNewItem(prev => ({ ...prev, quantity: Math.max(1, Number(nextValue)) }));
                }}
                onBlur={() => {
                  if (quantityInput === '') setQuantityInput(String(newItem.quantity));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Statut</label>
              <div className={`flex rounded-xl overflow-hidden border ${t.inputBorder}`}>
                <button
                  type="button"
                  onClick={() => setNewItem(prev => ({ ...prev, equipped: false }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all ${!newItem.equipped ? `${t.accentBg} ${t.accent}` : `${t.inputBg} ${t.textMuted}`}`}
                >
                  Dans le Sac
                </button>
                <button
                  type="button"
                  onClick={() => setNewItem(prev => ({ ...prev, equipped: true }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all ${newItem.equipped ? `${t.accentBg} ${t.accent}` : `${t.inputBg} ${t.textMuted}`}`}
                >
                  Équipé
                </button>
              </div>
            </div>
          </div>

          {/* Pathfinder : fiche d'arme ou d'armure */}
          {pf1Fields && <Pf1ItemFields category={newItem.category} value={newItem.pf1} onChange={stats => setNewItem(prev => ({ ...prev, pf1: stats }))} />}

          {/* Weapon fields */}
          {showDamage && (
            <div className={`grid ${hbCategories ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Dégâts</label>
                <input type="text" placeholder="1d8+3" value={newItem.damage} onChange={(e) => setNewItem(prev => ({ ...prev, damage: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
              </div>
              {!hbCategories && <div>
                <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Portée</label>
                <input type="text" placeholder="1.5m / 9m" value={newItem.range} onChange={(e) => setNewItem(prev => ({ ...prev, range: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
              </div>}
            </div>
          )}

          {/* Armor fields */}
          {showBonus && (
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>{hbCategories ? 'Bonus' : 'Bonus Défense (CA)'}</label>
              <input
                type="number"
                min="0"
                value={defenseInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDefenseInput(nextValue);
                  if (nextValue === '') return;
                  setNewItem(prev => ({ ...prev, defense_bonus: Math.max(0, Number(nextValue)) }));
                }}
                onBlur={() => {
                  if (defenseInput === '') setDefenseInput(String(newItem.defense_bonus));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
              />
            </div>
          )}
        </div>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={() => { onDelete(newItem.id!, newItem.name); onClose(); }}
            className="w-full bg-rose-500/20 border border-rose-500/40 text-rose-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        )}

        <ModalActions onCancel={onClose} saveType="submit" saveLabel="Sauvegarder" />
      </form>
    </div>
  );
}
