import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { ArrowLeft, BookOpen, ChevronRight, CirclePlus, Plus, Undo2, X, Zap } from 'lucide-react';
import type { Spell, SpellSlot } from '../../types/rpg.types';
import type { Pf1Attack, Pf1Data, Pf1PreparedSpell, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import { DnDSpellcasting } from '../DnDSpellcasting';
import { Pf1SpellHeader } from './Pf1SpellHeader';
import { Pf1ManeuversCard } from './Pf1ManeuversCard';
import { Pf1Collapsible } from './ui';

interface Props {
  data: Pf1Data;
  sheet: Pf1Sheet;
  spells: Spell[];
  slots: SpellSlot[];
  onChange: (next: Pf1Data) => void;
  onToggleSlot: (level: number, slotIndex: number) => void;
  onOpenAttack: (attack: Pf1Attack | null) => void;
  onOpenMagic: () => void;
  onOpenAddSpell: () => void;
  onEditSpell: (spell: Spell) => void;
}

/**
 * Onglet « Actions » Pathfinder : attaques, sorts préparés du jour et accès au grimoire.
 * Lancer un sort préparé consomme un emplacement ; le repos long remet tout à zéro.
 */
export function Pf1ActionsTab({ data, sheet, spells, slots, onChange, onToggleSlot, onOpenAttack, onOpenMagic, onOpenAddSpell, onEditSpell }: Props) {
  const t = useThemeClasses();
  const [view, setView] = useState<'actions' | 'grimoire'>('actions');
  const card = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`;
  const iconBtn = `w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`;
  const smallBtn = `flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none`;

  const spellById = new Map(spells.map(s => [s.id, s]));
  // Un sort supprimé du grimoire disparaît aussi des sorts préparés.
  const prepared = data.prepared.filter(p => spellById.has(p.spellId));
  const perDay = sheet.spellcasting?.perDay ?? [];

  const preparedCount = (spellId: string) => prepared.filter(p => p.spellId === spellId).length;

  const prepare = (spell: Spell) => {
    onChange({ ...data, prepared: [...prepared, { id: crypto.randomUUID(), spellId: spell.id, cast: false }] });
  };
  const unprepare = (entry: Pf1PreparedSpell) => {
    onChange({ ...data, prepared: prepared.filter(p => p.id !== entry.id) });
  };
  const setCast = (entry: Pf1PreparedSpell, cast: boolean) => {
    const level = spellById.get(entry.spellId)!.level;
    const max = perDay[level] ?? 0;
    const spellsUsed = [...data.spellsUsed];
    for (let i = 0; i <= level; i++) spellsUsed[i] = spellsUsed[i] ?? 0;
    spellsUsed[level] = Math.max(0, Math.min(max, spellsUsed[level] + (cast ? 1 : -1)));
    onChange({
      ...data,
      spellsUsed,
      prepared: prepared.map(p => (p.id === entry.id ? { ...p, cast } : p)),
    });
  };

  if (view === 'grimoire') {
    return (
      <DnDSpellcasting
        header={
          <button type="button" onClick={() => setView('actions')} className={`w-full ${card} py-2 flex items-center gap-2 ${t.textPrimary} hover:brightness-95 active:scale-[0.98] transition-all`}>
            <ArrowLeft size={14} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Retour aux actions</span>
          </button>
        }
        spellSlots={[]}
        spells={spells}
        spellDc={0}
        spellAttack={0}
        onOpenEditSpellSlot={() => {}}
        onToggleSpellSlot={() => {}}
        onOpenAddSpell={onOpenAddSpell}
        onEditSpell={onEditSpell}
        onEditSpellcasting={onOpenMagic}
        renderSpellAction={(spell) => {
          const count = preparedCount(spell.id);
          return (
            <button
              type="button"
              onClick={() => prepare(spell)}
              aria-label={`Préparer ${spell.name}`}
              className={`${smallBtn} ${count > 0 ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}`}
            >
              <Plus size={10} />{count > 0 ? `×${count}` : 'Préparer'}
            </button>
          );
        }}
      />
    );
  }

  // Niveaux affichés : ceux où le personnage a des sorts par jour, plus ceux où des sorts sont préparés.
  const levels = Array.from(new Set([
    ...perDay.flatMap((v, lvl) => (v !== null ? [lvl] : [])),
    ...prepared.map(p => spellById.get(p.spellId)!.level),
  ])).sort((a, b) => a - b);

  return (
    <div className="space-y-2">
      <Pf1Collapsible
        title={`Attaques${sheet.attacks.length ? ` (${sheet.attacks.length})` : ''}`}
        aside={
          <button onClick={() => onOpenAttack(null)} className={iconBtn} aria-label="Ajouter une attaque">
            <CirclePlus size={16} />
          </button>
        }
      >
        {sheet.attacks.length === 0 ? (
          <p className={`text-[11px] ${t.textMuted} italic`}>Ajoute ton arme : le bonus d’attaque et les dégâts sont calculés.</p>
        ) : (
          <div className="space-y-1.5">
            {sheet.attacks.map(line => (
              <div key={line.attack.id} onClick={() => onOpenAttack(line.attack)} className={`px-3 py-2 rounded-xl border ${t.inputBg} ${t.cardBorder} cursor-pointer hover:${t.accentBorder} transition-all`}>
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{line.attack.name}</span>
                  <span className={`text-xs font-bold font-mono ${t.accent} shrink-0`}>{line.bonuses.map(signed).join(' / ')}</span>
                </div>
                <div className={`flex justify-between items-center text-[10px] ${t.textMuted} mt-0.5`}>
                  <span>Dégâts <span className={`font-mono ${t.textSecondary}`}>{line.damage}</span></span>
                  <span>Crit <span className="font-mono">{line.attack.critRange || '20'} ×{line.attack.critMultiplier}</span></span>
                </div>
                {line.attack.notes && <p className={`text-[10px] ${t.textMuted} mt-0.5 italic`}>{line.attack.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Pf1Collapsible>

      <Pf1ManeuversCard data={data} sheet={sheet} onChange={onChange} />

      {/* Toujours visible : même un guerrier peut avoir un grimoire (parchemins, objets…). */}
      <Pf1SpellHeader sheet={sheet} onEdit={onOpenMagic} />

      <Pf1Collapsible
        title={`Sorts préparés${prepared.length ? ` (${prepared.filter(p => !p.cast).length}/${prepared.length})` : ''}`}
        aside={
          <button type="button" onClick={() => setView('grimoire')} className={`${smallBtn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}>
            <BookOpen size={11} /> Grimoire <span className={`font-mono ${t.textMuted}`}>{spells.length}</span> <ChevronRight size={11} />
          </button>
        }
      >

            {prepared.length === 0 && (
              <p className={`text-[11px] ${t.textMuted} italic mb-2`}>
                {sheet.spellcasting
                  ? 'Aucun sort préparé. Ouvre le grimoire et touche « Préparer » sur les sorts du jour.'
                  : 'Cette classe ne lance pas de sorts. Choisis une caractéristique d’incantation (carte ci-dessus) pour avoir des sorts par jour.'}
              </p>
            )}

            <div className="space-y-3">
              {levels.map(level => {
                const entries = prepared
                  .filter(p => spellById.get(p.spellId)!.level === level)
                  .sort((a, b) => spellById.get(a.spellId)!.name.localeCompare(spellById.get(b.spellId)!.name, 'fr'));
                const max = perDay[level];
                const slot = slots.find(s => s.level === level);
                if (entries.length === 0 && !slot) return null;
                const over = max !== null && max !== undefined && entries.length > max;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textSecondary}`}>
                        {level === 0 ? 'Niv. 0 · à volonté' : `Niv. ${level}`}
                        {max !== null && max !== undefined && (
                          <span className={`ml-1.5 font-mono ${over ? 'text-rose-400' : t.textMuted}`}>{entries.length}/{max} préparés</span>
                        )}
                      </span>
                      {slot && (
                        <div className="flex gap-1 flex-wrap justify-end">
                          {Array.from({ length: slot.max }).map((_, i) => (
                            <button key={i} type="button" onClick={() => onToggleSlot(level, i)} aria-label={`Emplacement ${i + 1}`}
                              className={`w-3 h-3 rotate-45 border transition-colors ${i < slot.current ? `${t.accent} bg-current border-current` : 'bg-transparent border-slate-500'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {entries.map(entry => {
                        const spell = spellById.get(entry.spellId)!;
                        const meta = [spell.damage && `⚔ ${spell.damage}`, spell.save_type && `JS ${spell.save_type}`, spell.range].filter(Boolean).join(' · ');
                        return (
                          <div key={entry.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${t.inputBg} ${t.cardBorder} ${entry.cast ? 'opacity-50' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold ${t.textPrimary} block truncate ${entry.cast ? 'line-through' : ''}`}>{spell.name}</span>
                              {meta && <span className={`text-[9px] font-mono ${t.textMuted} block truncate`}>{meta}</span>}
                            </div>
                            {level > 0 && (entry.cast ? (
                              <button type="button" onClick={() => setCast(entry, false)} className={`${smallBtn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}>
                                <Undo2 size={10} /> Annuler
                              </button>
                            ) : (
                              <button type="button" onClick={() => setCast(entry, true)} className={`${smallBtn} ${t.accentBg} ${t.accentBorder} ${t.accent}`}>
                                <Zap size={10} /> Lancer
                              </button>
                            ))}
                            {!entry.cast && (
                              <button type="button" onClick={() => unprepare(entry)} aria-label="Retirer" className={`${t.textMuted} hover:text-rose-400 transition-colors`}>
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
      </Pf1Collapsible>
    </div>
  );
}
