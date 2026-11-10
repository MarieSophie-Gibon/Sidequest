import { Plus, Trash2 } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Character, CharacterClassEntry } from '../../types/rpg.types';
import { NumField } from '../pf1e/ui';

interface Props {
  activeChar: Character;
  syncCharacterField: <T extends keyof Character>(field: T, value: Character[T]) => void;
}

/**
 * Classe du personnage (D&D 5e, Pathfinder 1e), avec multiclassage.
 * En multiclasse, `classes` porte le détail ; `class` (noms joints) et `level` (somme)
 * restent tenus à jour pour l'en-tête, le tableau de bord et les fiches partagées.
 */
export function ClassesEditor({ activeChar, syncCharacterField }: Props) {
  const t = useThemeClasses();
  const inputCls = `${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`;
  const classes = activeChar.classes && activeChar.classes.length > 0 ? activeChar.classes : null;

  const setClasses = (next: CharacterClassEntry[]) => {
    syncCharacterField('classes', next);
    syncCharacterField('class', next.map(c => c.name.trim()).filter(Boolean).join(' / '));
    const total = next.reduce((s, c) => s + (c.level || 0), 0);
    syncCharacterField('level', Math.max(1, Math.min(20, total)));
  };

  const toggleMulticlass = (on: boolean) => {
    if (on) {
      setClasses([{ name: activeChar.class ?? '', level: activeChar.level || 1 }, { name: '', level: 1 }]);
    } else {
      // Retour à une seule classe : on garde la première et le niveau total.
      syncCharacterField('classes', null);
      syncCharacterField('class', classes?.[0]?.name ?? activeChar.class);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`text-[10px] ${t.textMuted} uppercase font-semibold`}>{classes ? 'Classes' : 'Classe'}</label>
        <label className={`flex items-center gap-1.5 text-[10px] ${t.textMuted} uppercase font-semibold cursor-pointer`}>
          <input type="checkbox" checked={!!classes} onChange={e => toggleMulticlass(e.target.checked)} className="accent-current" />
          Multiclasse
        </label>
      </div>
      {!classes ? (
        <input type="text" value={activeChar.class} onChange={e => syncCharacterField('class', e.target.value)} className={inputCls} />
      ) : (
        <div className="space-y-1.5">
          <div className={`grid grid-cols-[1fr_4rem_2.25rem] gap-1.5 text-[9px] ${t.textMuted} uppercase font-semibold`}>
            <span>Nom</span><span className="text-center">Niveau</span><span />
          </div>
          {classes.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_4rem_2.25rem] gap-1.5 items-center">
              <input
                type="text"
                value={c.name}
                placeholder={`Classe ${i + 1}`}
                onChange={e => setClasses(classes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                className={inputCls}
              />
              <NumField value={c.level} min={1} max={20} onChange={v => setClasses(classes.map((x, j) => (j === i ? { ...x, level: v } : x)))} />
              <button
                type="button"
                disabled={classes.length <= 1}
                onClick={() => setClasses(classes.filter((_, j) => j !== i))}
                className={`h-full flex items-center justify-center rounded-xl border ${t.inputBg} ${t.inputBorder} ${t.textMuted} disabled:opacity-30`}
                aria-label="Retirer la classe"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setClasses([...classes, { name: '', level: 1 }])}
            className={`w-full py-2 rounded-xl border border-dashed text-[10px] font-bold uppercase tracking-wider ${t.inputBorder} ${t.textMuted}`}
          >
            <Plus size={12} className="inline -mt-0.5 mr-1" />Ajouter une classe
          </button>
        </div>
      )}
    </div>
  );
}
