import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { ArrowLeft, BatteryCharging, BookOpen, ChevronRight, CirclePlus, Minus, Plus, Undo2, X, Zap } from 'lucide-react';
import type { Spell, SpellSlot } from '../../types/rpg.types';
import type { Pf1Attack, Pf1Data, Pf1PreparedSpell, Pf1Sheet, Pf1SpellCharges } from '../../systems/pf1e/types';
import { signed, spellChargeCount } from '../../systems/pf1e/rules';
import { DnDSpellcasting } from '../DnDSpellcasting';
import { Pf1SpellHeader } from './Pf1SpellHeader';
import { Pf1ManeuversCard } from './Pf1ManeuversCard';
import { FieldLabel, NumField, Pf1Collapsible, Pf1Modal } from './ui';

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
  const [chargesFor, setChargesFor] = useState<Spell | null>(null);
  const card = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`;
  const iconBtn = `w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`;
  const smallBtn = `flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 leading-none`;

  const spellById = new Map(spells.map(s => [s.id, s]));
  // Un sort supprimé du grimoire disparaît aussi des sorts préparés.
  const prepared = data.prepared.filter(p => spellById.has(p.spellId));
  const perDay = sheet.spellcasting?.perDay ?? [];
  const casterLevel = sheet.spellcasting?.casterLevel ?? sheet.level;
  const chargesCfg = (spellId: string) => data.spellCharges?.[spellId];

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
      prepared: prepared.map(p => {
        if (p.id !== entry.id) return p;
        const cfg = chargesCfg(p.spellId);
        // Sort à charges : les charges du lancer restent disponibles jusqu'à épuisement.
        return { ...p, cast, chargesLeft: cast && cfg ? spellChargeCount(cfg, casterLevel) : undefined };
      }),
    });
  };
  const setCharges = (entry: Pf1PreparedSpell, chargesLeft: number) => {
    onChange({ ...data, prepared: prepared.map(p => (p.id === entry.id ? { ...p, chargesLeft: Math.max(0, chargesLeft) } : p)) });
  };
  const saveChargesCfg = (spellId: string, cfg: Pf1SpellCharges | null) => {
    const next = { ...(data.spellCharges ?? {}) };
    if (cfg) next[spellId] = cfg; else delete next[spellId];
    onChange({ ...data, spellCharges: next });
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
    <div className="space-y-2 tab-grid">
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
                        const cfg = chargesCfg(spell.id);
                        const charging = entry.cast && (entry.chargesLeft ?? 0) > 0;
                        const spent = entry.cast && !charging;
                        return (
                          <div key={entry.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${t.inputBg} ${charging ? t.accentBorder : t.cardBorder} ${spent ? 'opacity-50' : ''}`}>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-bold ${t.textPrimary} block truncate ${spent ? 'line-through' : ''}`}>{spell.name}</span>
                              {meta && <span className={`text-[9px] font-mono ${t.textMuted} block truncate`}>{meta}</span>}
                              {cfg && !entry.cast && <span className={`text-[9px] ${t.textMuted} block`}>{spellChargeCount(cfg, casterLevel)} charge(s) au lancer</span>}
                            </div>
                            {charging && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => setCharges(entry, (entry.chargesLeft ?? 0) - 1)} aria-label="Utiliser une charge" className={`${smallBtn} ${t.accentBg} ${t.accentBorder} ${t.accent}`}><Minus size={10} /></button>
                                <span className={`text-[10px] font-mono font-bold ${t.accent} min-w-9 text-center`}><BatteryCharging size={10} className="inline -mt-0.5 mr-0.5" />{entry.chargesLeft}</span>
                                <button type="button" onClick={() => setCharges(entry, (entry.chargesLeft ?? 0) + 1)} aria-label="Rendre une charge" className={`${smallBtn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}><Plus size={10} /></button>
                              </div>
                            )}
                            {!entry.cast && level > 0 && (
                              <button type="button" onClick={() => setChargesFor(spell)} aria-label="Charges du sort" title="Sort à charges" className={`${cfg ? t.accent : t.textMuted} hover:brightness-125 transition-colors`}>
                                <BatteryCharging size={14} />
                              </button>
                            )}
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
      {chargesFor && (
        <SpellChargesModal
          spell={chargesFor}
          value={chargesCfg(chargesFor.id) ?? null}
          casterLevel={casterLevel}
          onSave={(cfg) => { saveChargesCfg(chargesFor.id, cfg); setChargesFor(null); }}
          onClose={() => setChargesFor(null)}
        />
      )}
    </div>
  );
}

/** Réglage d'un sort à charges : « 1 charge tous les N niveaux de lanceur », plafond facultatif. */
function SpellChargesModal({ spell, value, casterLevel, onSave, onClose }: {
  spell: Spell; value: Pf1SpellCharges | null; casterLevel: number;
  onSave: (cfg: Pf1SpellCharges | null) => void; onClose: () => void;
}) {
  const t = useThemeClasses();
  const [enabled, setEnabled] = useState(!!value);
  const [everyLevels, setEveryLevels] = useState(value?.everyLevels ?? 1);
  const [max, setMax] = useState(value?.max ?? 0);
  const cfg: Pf1SpellCharges = { everyLevels, max: max > 0 ? max : null };
  return (
    <Pf1Modal title={`Charges · ${spell.name}`} onClose={onClose} onSave={() => onSave(enabled ? cfg : null)}>
      <label className={`flex items-center gap-2 text-xs ${t.textSecondary} cursor-pointer`}>
        <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
        Sort à charges (ex. Contact glacial : 1 contact par niveau)
      </label>
      {enabled && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="1 charge tous les … niv." value={everyLevels} min={1} max={20} onChange={setEveryLevels} />
            <NumField label="Maximum (0 = aucun)" value={max} min={0} max={50} onChange={setMax} />
          </div>
          <div>
            <FieldLabel>Au niveau de lanceur {casterLevel}</FieldLabel>
            <p className={`text-xs font-bold ${t.accent}`}>{spellChargeCount(cfg, casterLevel)} charge(s) par lancer</p>
          </div>
          <p className={`text-[10px] ${t.textMuted}`}>Une fois lancé, le sort reste actif tant qu’il lui reste des charges : − en utilise une, + en rend une.</p>
        </>
      )}
    </Pf1Modal>
  );
}
