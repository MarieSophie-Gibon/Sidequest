import { useEffect, useState } from 'react';
import { Camera, User } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';
import { normalizeHomebrewData, setValue } from '../../systems/homebrew/sheet';
import type { Pf1Data } from '../../systems/pf1e/types';
import { Pf1ClassAndSizeFields } from '../pf1e/Pf1Modals';
import { ClassesEditor } from './ClassesEditor';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
  onClose: () => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  /** Pathfinder 1e : la classe (et ses réglages) et la taille se règlent ici. */
  pf1?: { data: Pf1Data; onChange: (next: Pf1Data) => void };
}

export function EditProfileModal({ activeChar, syncCharacterField, onClose, onAvatarUpload, onRemoveAvatar, pf1 }: Props) {
  const t = useThemeClasses();
  // Seul D&D 5e a un bonus de maîtrise ici (PF1 : BBA ; homebrew : valeur spéciale du système).
  const isPf1 = activeChar.system === 'pf1e' || activeChar.system === 'homebrew';
  const hb = activeChar.system === 'homebrew' ? normalizeHomebrewData(activeChar.system_data) : null;
  // Homebrew : un libellé vide = champ supprimé par le MJ (ex. jeu sans races).
  const raceLabel = hb ? hb.structure.identity.race : 'Race';
  // D&D et PF1 : la classe passe par ClassesEditor (multiclassage) ; homebrew : simple champ libellé par le MJ.
  const classLabel = hb ? hb.structure.identity.class : '';
  const isMulticlass = !hb && !!activeChar.classes && activeChar.classes.length > 0;
  const showLevel = hb ? hb.structure.identity.showLevel : true;
  const [levelInput, setLevelInput] = useState(String(activeChar.level));
  const [profInput, setProfInput] = useState(String(activeChar.proficiency_bonus ?? 2));

  useEffect(() => {
    setLevelInput(String(activeChar.level));
  }, [activeChar.level]);

  useEffect(() => {
    setProfInput(String(activeChar.proficiency_bonus ?? 2));
  }, [activeChar.proficiency_bonus]);

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title={pf1 ? "Identité de l'aventurier" : 'Identité du Héros'} onClose={onClose} />
        <div className="space-y-3">
          {/* Portrait + nom */}
          <div className="flex gap-3 items-center">
            <div className={`relative w-20 h-20 shrink-0 rounded-2xl border ${t.cardBorder} ${t.inputBg} overflow-hidden flex items-center justify-center cursor-pointer`}>
              {activeChar.avatar_url ? (
                <img src={activeChar.avatar_url} alt="Portrait" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className={t.textMuted} />
              )}
              <span className="absolute bottom-1 right-1 bg-black/55 text-white rounded-lg p-1"><Camera size={12} /></span>
              <input type="file" accept="image/*" onChange={onAvatarUpload} aria-label="Changer le portrait" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div>
                <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Nom</label>
                <input type="text" value={activeChar.name} onChange={(e) => syncCharacterField('name', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
              </div>
              {activeChar.avatar_url && (
                <button type="button" onClick={onRemoveAvatar} className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300">
                  Retirer le portrait
                </button>
              )}
            </div>
          </div>
          {(raceLabel || classLabel) && <div className={`grid ${raceLabel && classLabel ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {raceLabel && <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>{raceLabel}</label>
              <input type="text" value={activeChar.race} onChange={(e) => syncCharacterField('race', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>}
            {classLabel && <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>{classLabel}</label>
              <input type="text" value={activeChar.class} onChange={(e) => syncCharacterField('class', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
            </div>}
          </div>}
          {!hb && <ClassesEditor activeChar={activeChar} syncCharacterField={syncCharacterField} />}
          {/* Champs d'identité ajoutés par le MJ du modèle homebrew */}
          {hb && (hb.structure.identity.extra ?? []).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {(hb.structure.identity.extra ?? []).map(field => (
                <div key={field.id}>
                  <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1 truncate`}>{field.name}</label>
                  <input
                    type="text"
                    value={hb.values.identity[field.id] ?? ''}
                    onChange={(e) => syncCharacterField('system_data', setValue(hb, 'identity', field.id, e.target.value))}
                    className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`}
                  />
                </div>
              ))}
            </div>
          )}
          {pf1 && (
            <Pf1ClassAndSizeFields data={pf1.data} onChange={pf1.onChange} />
          )}
          {/* PF1 : les archétypes (plusieurs possibles) remplacent la sous-classe. */}
          {!hb && !pf1 && <div>
            <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Sous-classe</label>
            <input type="text" value={activeChar.subclass} onChange={(e) => syncCharacterField('subclass', e.target.value)} className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`} />
          </div>}
          {/* Pathfinder 1e n'a pas de bonus de maîtrise (BBA et rangs de compétence à la place). */}
          {showLevel && <div className={`grid ${isPf1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>{isMulticlass ? 'Niveau total' : 'Niveau'}</label>
              <input
                type="number"
                min="1"
                max="20"
                disabled={isMulticlass}
                title={isMulticlass ? 'Somme des niveaux de classe' : undefined}
                value={isMulticlass ? activeChar.level : levelInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setLevelInput(nextValue);
                  if (nextValue === '') return;
                  syncCharacterField('level', Math.max(1, Math.min(20, Number(nextValue))));
                }}
                onBlur={() => {
                  if (levelInput === '') setLevelInput(String(activeChar.level));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>
            {!isPf1 && <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Maîtrise</label>
              <input
                type="number"
                min="1"
                max="10"
                value={profInput}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setProfInput(nextValue);
                  if (nextValue === '') return;
                  syncCharacterField('proficiency_bonus', Math.max(1, Math.min(10, Number(nextValue))));
                }}
                onBlur={() => {
                  if (profInput === '') setProfInput(String(activeChar.proficiency_bonus ?? 2));
                }}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full font-mono text-sm focus:outline-none`}
              />
            </div>}
          </div>}
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
