import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { PawPrint, Trash2 } from 'lucide-react';
import type { NewFamiliarState } from '../../hooks/useCharacterData';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  newFamiliar: NewFamiliarState;
  setNewFamiliar: React.Dispatch<React.SetStateAction<NewFamiliarState>>;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (id: string, name: string) => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

const statusOptions: { key: NewFamiliarState['status']; label: string }[] = [
  { key: 'present', label: 'Présent' },
  { key: 'distant', label: 'Éloigné' },
  { key: 'unconscious', label: 'Inconscient' },
  { key: 'dead', label: 'Mort' },
];

export function AddFamiliarModal({ newFamiliar, setNewFamiliar, onSubmit, onDelete, onAvatarUpload, onClose }: Props) {
  const t = useThemeClasses();
  const isEditing = !!newFamiliar.id;
  const stats: { key: keyof NewFamiliarState; label: string }[] = [
    { key: 'str', label: 'FOR' }, { key: 'dex', label: 'DEX' }, { key: 'con', label: 'CON' },
    { key: 'int', label: 'INT' }, { key: 'wis', label: 'SAG' }, { key: 'cha', label: 'CHA' },
  ];

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title={isEditing ? 'Modifier le Familier' : 'Ajouter un Familier'} onClose={onClose} />
        <div className="space-y-3">

          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className={`relative w-16 h-16 rounded-xl border ${t.cardBorder} ${t.inputBg} overflow-hidden shrink-0 flex items-center justify-center`}>
              {newFamiliar.avatar_url
                ? <img src={newFamiliar.avatar_url} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                : <PawPrint size={22} className={t.textMuted} />}
              <input
                type="file" accept="image/*"
                onChange={onAvatarUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            </div>
            <div className="flex-1">
              <p className={`text-[10px] ${t.textMuted} uppercase font-bold mb-1`}>Portrait</p>
              <p className={`text-[10px] ${t.textMuted}`}>Cliquez sur l'image pour importer (max 3 Mo)</p>
              {newFamiliar.avatar_url && (
                <button
                  type="button"
                  onClick={() => setNewFamiliar(prev => ({ ...prev, avatar_url: '' }))}
                  className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Supprimer l'image
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
              <input type="text" placeholder="ex: Ombre" value={newFamiliar.name} onChange={e => setNewFamiliar(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Espèce</label>
              <input type="text" placeholder="ex: Chouette" value={newFamiliar.species} onChange={e => setNewFamiliar(prev => ({ ...prev, species: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
            </div>
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Description</label>
            <textarea placeholder="Apparence, histoire..." value={newFamiliar.description} onChange={e => setNewFamiliar(prev => ({ ...prev, description: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-14 focus:outline-none`} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>PV max</label>
              <input type="number" min="1" value={newFamiliar.hp_max} onChange={e => setNewFamiliar(prev => ({ ...prev, hp_max: Number(e.target.value), hp_current: Math.min(prev.hp_current, Number(e.target.value)) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>PV act.</label>
              <input type="number" min="0" max={newFamiliar.hp_max} value={newFamiliar.hp_current} onChange={e => setNewFamiliar(prev => ({ ...prev, hp_current: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>CA</label>
              <input type="number" min="0" value={newFamiliar.ac} onChange={e => setNewFamiliar(prev => ({ ...prev, ac: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
          </div>

          {/* Caractéristiques */}
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1.5`}>Caractéristiques</label>
            <div className="grid grid-cols-6 gap-1">
              {stats.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className={`text-[9px] font-bold ${t.textMuted} uppercase`}>{label}</span>
                  <input
                    type="number" min="1" max="30"
                    value={newFamiliar[key] as number}
                    onChange={e => setNewFamiliar(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                    className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg p-1.5 w-full text-xs text-center focus:outline-none font-mono`}
                  />
                  <span className={`text-[9px] font-mono ${t.textSecondary}`}>
                    {(() => { const mod = Math.floor(((newFamiliar[key] as number) - 10) / 2); return mod >= 0 ? `+${mod}` : `${mod}`; })()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>VIT</label>
              <input type="text" placeholder="9m, vol 18m" value={newFamiliar.speed} onChange={e => setNewFamiliar(prev => ({ ...prev, speed: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>PP</label>
              <input type="number" min="0" value={newFamiliar.passive_perception} onChange={e => setNewFamiliar(prev => ({ ...prev, passive_perception: Number(e.target.value) }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`} />
            </div>
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Compétences</label>
            <input type="text" placeholder="Discrétion +5, Perception +3..." value={newFamiliar.senses} onChange={e => setNewFamiliar(prev => ({ ...prev, senses: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Vision dans le noir</label>
            <input type="text" placeholder="18m, 36m..." value={newFamiliar.darkvision} onChange={e => setNewFamiliar(prev => ({ ...prev, darkvision: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Immunités / Résistances</label>
            <textarea placeholder="Immunisé au feu, résistance aux dégâts perforants..." value={newFamiliar.resistances} onChange={e => setNewFamiliar(prev => ({ ...prev, resistances: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-14 focus:outline-none`} />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Capacités</label>
            <textarea placeholder="Capacités passives, traits spéciaux..." value={newFamiliar.abilities} onChange={e => setNewFamiliar(prev => ({ ...prev, abilities: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 focus:outline-none`} />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Actions</label>
            <textarea placeholder="Morsure, Griffe, Attaque multijet..." value={newFamiliar.actions} onChange={e => setNewFamiliar(prev => ({ ...prev, actions: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs h-16 focus:outline-none`} />
          </div>

          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Statut</label>
            <div className={`flex ${t.inputBg} border ${t.inputBorder} rounded-xl overflow-hidden`}>
              {statusOptions.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setNewFamiliar(prev => ({ ...prev, status: opt.key }))}
                  className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-wider transition-all ${
                    newFamiliar.status === opt.key
                      ? `${t.accentBg} ${t.accentBorder} ${t.btnPrimaryText} shadow-sm`
                      : `${t.textMuted} hover:brightness-95`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {isEditing && onDelete && (
          <button type="button" onClick={() => { onDelete(newFamiliar.id!, newFamiliar.name); onClose(); }} className="w-full bg-rose-500/20 border border-rose-500/40 text-rose-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30 active:scale-95 flex items-center justify-center gap-1.5">
            <Trash2 size={14} />
            Retirer le familier
          </button>
        )}

        <ModalActions onCancel={onClose} saveType="submit" saveLabel="Sauvegarder" />
      </form>
    </div>
  );
}
