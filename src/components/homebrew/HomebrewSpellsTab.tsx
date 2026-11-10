import { Plus, Undo2, X, Zap } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Spell } from '../../types/rpg.types';
import type { HbPreparedSpell, HomebrewData } from '../../systems/homebrew/sheet';
import { spellModeOf } from '../../systems/homebrew/presets';
import { DnDSpellcasting } from '../DnDSpellcasting';

type SpellcastingProps = ComponentProps<typeof DnDSpellcasting>;

interface Props extends Omit<SpellcastingProps, 'header' | 'renderSpellAction'> {
  data: HomebrewData;
  onChange: (next: HomebrewData) => void;
}

/**
 * Onglet Sorts homebrew selon la gestion choisie par le MJ :
 * emplacements (style D&D), sorts préparés (style Pathfinder) ou liste libre.
 */
export function HomebrewSpellsTab({ data, onChange, spellSlots, spells, ...rest }: Props) {
  const t = useThemeClasses();
  const mode = spellModeOf(data.structure);
  const smallBtn = 'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none';

  if (mode !== 'prepared') {
    return <DnDSpellcasting {...rest} spells={spells} spellSlots={mode === 'slots' ? spellSlots : []} />;
  }

  const spellById = new Map(spells.map(s => [s.id, s]));
  // Un sort supprimé du grimoire disparaît aussi des sorts préparés.
  const prepared = (data.values.prepared ?? []).filter(p => spellById.has(p.spellId));
  const save = (next: HbPreparedSpell[]) => onChange({ ...data, values: { ...data.values, prepared: next } });
  const count = (spellId: string) => prepared.filter(p => p.spellId === spellId).length;

  const sorted = [...prepared].sort((a, b) => {
    const sa = spellById.get(a.spellId)!, sb = spellById.get(b.spellId)!;
    return sa.level - sb.level || sa.name.localeCompare(sb.name, 'fr');
  });

  const header = (
    <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
      <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-2`}>
        Sorts préparés{prepared.length > 0 && <span className={`ml-1.5 font-mono ${t.textMuted}`}>{prepared.filter(p => !p.cast).length}/{prepared.length}</span>}
      </h4>
      {prepared.length === 0 ? (
        <p className={`text-[11px] ${t.textMuted} italic`}>Aucun sort préparé : touche « Préparer » sur un sort du grimoire ci-dessous.</p>
      ) : (
        <div className="space-y-1">
          {sorted.map(entry => {
            const spell = spellById.get(entry.spellId)!;
            return (
              <div key={entry.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${t.inputBg} ${t.cardBorder} ${entry.cast ? 'opacity-50' : ''}`}>
                <span className={`text-[9px] font-mono ${t.textMuted} w-8 shrink-0`}>Niv.{spell.level}</span>
                <span className={`text-xs font-bold ${t.textPrimary} flex-1 min-w-0 truncate ${entry.cast ? 'line-through' : ''}`}>{spell.name}</span>
                {entry.cast ? (
                  <button type="button" onClick={() => save(prepared.map(p => (p.id === entry.id ? { ...p, cast: false } : p)))} className={`${smallBtn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}>
                    <Undo2 size={10} /> Annuler
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => save(prepared.map(p => (p.id === entry.id ? { ...p, cast: true } : p)))} className={`${smallBtn} ${t.accentBg} ${t.accentBorder} ${t.accent}`}>
                      <Zap size={10} /> Lancer
                    </button>
                    <button type="button" onClick={() => save(prepared.filter(p => p.id !== entry.id))} aria-label="Retirer" className={`${t.textMuted} hover:text-rose-400 transition-colors`}>
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <DnDSpellcasting
      {...rest}
      spells={spells}
      spellSlots={spellSlots}
      header={header}
      renderSpellAction={(spell: Spell) => {
        const n = count(spell.id);
        return (
          <button
            type="button"
            onClick={() => save([...prepared, { id: crypto.randomUUID(), spellId: spell.id, cast: false }])}
            aria-label={`Préparer ${spell.name}`}
            className={`${smallBtn} ${n > 0 ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}`}
          >
            <Plus size={10} />{n > 0 ? `×${n}` : 'Préparer'}
          </button>
        );
      }}
    />
  );
}
