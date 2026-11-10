import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { NewResourceState } from '../../hooks/useCharacterData';
import { ModalActions, ModalHeader } from './ModalControls';
import type { HbRest } from '../../systems/homebrew/types';

interface Props {
  newResource: NewResourceState;
  setNewResource: React.Dispatch<React.SetStateAction<NewResourceState>>;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: (id: string) => void | Promise<void>;
  onClose: () => void;
  /** Pathfinder 1e : pas de repos court, tout se recharge à la nuit de repos. */
  perDayOnly?: boolean;
  /** Homebrew : repos du système (remplace Court / Long) et affichage en puces. */
  hbRests?: HbRest[];
}

export function AddResourceModal({ newResource, setNewResource, onSubmit, onDelete, onClose, perDayOnly, hbRests }: Props) {
  const t = useThemeClasses();
  const isEditing = !!newResource.id;
  const [currentInput, setCurrentInput] = useState(String(newResource.current));
  const [maxInput, setMaxInput] = useState(String(newResource.max));
  const homebrew = !!hbRests;
  const valued = homebrew && newResource.display === 'valued';
  const [valuesInput, setValuesInput] = useState((newResource.bullets ?? []).map(b => b.value).join(', '));
  const linkedRest = hbRests?.find(r => r.id === newResource.rest_id);
  const toggleCls = (active: boolean) => `flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all ${active ? `${t.accentBg} ${t.accent}` : `${t.inputBg} ${t.textMuted}`}`;

  useEffect(() => {
    setCurrentInput(String(newResource.current));
  }, [newResource.current]);

  useEffect(() => {
    setMaxInput(String(newResource.max));
  }, [newResource.max]);

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <form onSubmit={onSubmit} className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp`}>
        <ModalHeader title={isEditing ? 'Modifier la Ressource' : 'Nouvelle Ressource'} onClose={onClose} />
        <div className="space-y-3">
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Nom</label>
            <input type="text" placeholder="ex: Points de Ki" value={newResource.name} onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none`} required />
          </div>
          {homebrew && (
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Affichage</label>
              <div className={`flex rounded-xl overflow-hidden border ${t.inputBorder}`}>
                <button type="button" className={toggleCls(!valued)} onClick={() => setNewResource(prev => ({ ...prev, display: 'bullets' }))}>Puces</button>
                <button type="button" className={toggleCls(valued)} onClick={() => setNewResource(prev => ({ ...prev, display: 'valued' }))}>Puces avec valeur</button>
              </div>
            </div>
          )}
          {valued ? (
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Valeur de chaque puce</label>
              <input
                type="text"
                placeholder="d8, d8, d10"
                value={valuesInput}
                onChange={(e) => {
                  setValuesInput(e.target.value);
                  const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
                  // On garde l'état « utilisée » des puces déjà présentes, par position.
                  setNewResource(prev => ({ ...prev, bullets: values.map((value, i) => ({ value, used: prev.bullets?.[i]?.used ?? false })) }));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
              />
              <p className={`text-[10px] ${t.textMuted} mt-1`}>Séparées par des virgules : une puce par valeur.</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>{homebrew ? 'Restantes' : 'Actuel'}</label>
              <input
                type="number"
                min="0"
                max={newResource.max}
                value={currentInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setCurrentInput(nextValue);
                  if (nextValue === '') return;
                  setNewResource(prev => ({ ...prev, current: Math.max(0, Math.min(prev.max, Number(nextValue))) }));
                }}
                onBlur={() => {
                  if (currentInput === '') setCurrentInput(String(newResource.current));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
              />
            </div>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Maximum</label>
              <input
                type="number"
                min="1"
                value={maxInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setMaxInput(nextValue);
                  if (nextValue === '') return;
                  const nextMax = Math.max(1, Number(nextValue));
                  setNewResource(prev => ({ ...prev, max: nextMax, current: Math.min(prev.current, nextMax) }));
                }}
                onBlur={() => {
                  if (maxInput === '') setMaxInput(String(newResource.max));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-xs focus:outline-none font-mono`}
              />
            </div>
          </div>
          )}
          <div>
            <label className={`text-[10px] ${t.textMuted} uppercase block mb-1`}>Récupération</label>
            {homebrew ? (
              <div className="flex gap-2 items-center">
                <select
                  value={newResource.rest_id ?? ''}
                  onChange={(e) => setNewResource(prev => ({ ...prev, rest_id: e.target.value || null }))}
                  className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 flex-1 min-w-0 text-xs focus:outline-none`}
                >
                  <option value="">Aucun repos</option>
                  {hbRests!.map(r => <option key={r.id} value={r.id}>{r.name || 'Repos'}</option>)}
                </select>
                {linkedRest && !linkedRest.auto && (
                  <input
                    type="number"
                    min={0}
                    placeholder="tout"
                    aria-label="Utilisations récupérées"
                    title="Utilisations récupérées (vide = toutes)"
                    value={newResource.rest_amount ?? ''}
                    onChange={(e) => setNewResource(prev => ({ ...prev, rest_amount: e.target.value === '' ? null : Math.max(0, Math.trunc(Number(e.target.value))) }))}
                    className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-16 text-xs focus:outline-none font-mono`}
                  />
                )}
              </div>
            ) : perDayOnly ? (
              <p className={`text-[11px] ${t.textSecondary}`}>Par jour : rechargée à chaque nuit de repos.</p>
            ) : (
            <div className={`flex rounded-xl overflow-hidden border ${t.inputBorder}`}>
              {(['SHORT_REST', 'LONG_REST'] as const).map((type) => (
                <button key={type} type="button"
                  onClick={() => setNewResource(prev => ({ ...prev, recharge: type }))}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-all ${newResource.recharge === type ? `${t.accentBg} ${t.accent} border-r-0` : `${t.inputBg} ${t.textMuted}`}`}>
                  {type === 'SHORT_REST' ? 'Court Repos' : 'Long Repos'}
                </button>
              ))}
            </div>
            )}
          </div>
        </div>
        {isEditing && onDelete && (
          <button type="button" onClick={() => { onDelete(newResource.id!); onClose(); }} className="w-full bg-rose-500/20 border border-rose-500/40 text-rose-400 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30 active:scale-95 flex items-center justify-center gap-1.5">
            <Trash2 size={14} />
            Supprimer
          </button>
        )}
        <ModalActions onCancel={onClose} saveType="submit" saveLabel="Sauvegarder" />
      </form>
    </div>
  );
}
