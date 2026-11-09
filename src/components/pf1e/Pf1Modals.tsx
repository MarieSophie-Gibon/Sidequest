import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Trash2 } from 'lucide-react';
import type { CharacterStatKey } from '../../types/rpg.types';
import type { BabProgression, Pf1Armor, Pf1Attack, Pf1Data, Pf1SaveKey, Pf1Size } from '../../systems/pf1e/types';
import { PF1_CLASSES, findPf1Class } from '../../systems/pf1e/data/classes';
import { applyPf1Class, HOUSE_RULE_ELEPHANT } from '../../systems/pf1e/defaults';
import { abilityMod, signed, STAT_KEYS, STAT_SHORT } from '../../systems/pf1e/rules';
import { PF1_HELP } from '../../systems/pf1e/help';
import { FieldLabel, NumField, Pf1Modal, TextField, Toggle } from './ui';
import { useInputClass } from './useInputClass';

const STAT_LABELS: Record<CharacterStatKey, string> = { str: 'Force', dex: 'Dextérité', con: 'Constitution', int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme' };
const SAVE_LABELS: Record<Pf1SaveKey, string> = { fort: 'Vigueur', ref: 'Réflexes', will: 'Volonté' };
const BAB_LABELS: Record<BabProgression, string> = { full: 'Fort', medium: 'Moyen', poor: 'Faible' };

function SectionTitle({ children }: { children: string }) {
  const t = useThemeClasses();
  return <p className={`text-[10px] font-semibold ${t.textSecondary} uppercase tracking-wider pt-1`}>{children}</p>;
}

function StatSelect({ label, value, onChange, allowNone }: { label: string; value: CharacterStatKey | null; onChange: (v: CharacterStatKey | null) => void; allowNone?: boolean }) {
  const cls = useInputClass();
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={value ?? ''} onChange={e => onChange((e.target.value || null) as CharacterStatKey | null)} className={cls}>
        {allowNone && <option value="">Aucune</option>}
        {STAT_KEYS.map(k => <option key={k} value={k}>{STAT_LABELS[k]}</option>)}
      </select>
    </div>
  );
}

/* ───────────────────────── Construction : classe, niveau, caractéristiques ───────────────────────── */

export function Pf1BuildModal({ data, level, className, houseRules, onSave, onClose }: {
  data: Pf1Data; level: number; className: string; houseRules: string[];
  onSave: (next: { data: Pf1Data; level: number; className: string; houseRules: string[] }) => void;
  onClose: () => void;
}) {
  const t = useThemeClasses();
  const cls = useInputClass();
  const [draft, setDraft] = useState(data);
  const [lvl, setLvl] = useState(level);
  const [name, setName] = useState(className);
  const [rules, setRules] = useState(houseRules);
  const custom = !findPf1Class(draft.classId);
  const elephant = rules.includes(HOUSE_RULE_ELEPHANT);

  const setScore = (field: 'baseScores' | 'racialMods', key: CharacterStatKey, v: number) =>
    setDraft(d => ({ ...d, [field]: { ...d[field], [key]: v } }));

  return (
    <Pf1Modal title="Construction" onClose={onClose} onSave={() => onSave({ data: draft, level: lvl, className: name.trim() || 'Aventurier', houseRules: rules })}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <FieldLabel>Classe</FieldLabel>
          <select
            value={custom ? 'custom' : draft.classId}
            onChange={e => {
              const id = e.target.value;
              const known = findPf1Class(id);
              setDraft(d => applyPf1Class(d, id));
              if (known) setName(known.name);
            }}
            className={cls}
          >
            {PF1_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="custom">Autre…</option>
          </select>
        </div>
        <NumField label="Niveau" value={lvl} min={1} max={20} onChange={setLvl} />
      </div>
      {custom && (
        <>
          <TextField label="Nom de la classe" value={name} onChange={setName} />
          <div>
            <FieldLabel>Progression du BBA</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {(['full', 'medium', 'poor'] as BabProgression[]).map(b => (
                <Toggle key={b} active={draft.bab === b} onClick={() => setDraft(d => ({ ...d, bab: b }))}>{BAB_LABELS[b]}</Toggle>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Bonnes sauvegardes</FieldLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {(['fort', 'ref', 'will'] as Pf1SaveKey[]).map(s => (
                <Toggle key={s} active={draft.goodSaves.includes(s)} onClick={() => setDraft(d => ({ ...d, goodSaves: d.goodSaves.includes(s) ? d.goodSaves.filter(x => x !== s) : [...d.goodSaves, s] }))}>
                  {SAVE_LABELS[s]}
                </Toggle>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Dé de vie (d…)" value={draft.hitDie} min={4} max={12} onChange={v => setDraft(d => ({ ...d, hitDie: v }))} />
            <NumField label="Rangs / niveau" value={draft.skillRanksPerLevel} min={0} max={10} onChange={v => setDraft(d => ({ ...d, skillRanksPerLevel: v }))} />
          </div>
        </>
      )}
      {!custom && (
        <p className={`text-[10px] ${t.textMuted}`}>
          d{draft.hitDie} · BBA {BAB_LABELS[draft.bab].toLowerCase()} · {draft.skillRanksPerLevel} rangs/niveau · Bons JS : {draft.goodSaves.map(s => SAVE_LABELS[s]).join(', ')}
        </p>
      )}

      <SectionTitle>Caractéristiques</SectionTitle>
      <div className={`grid grid-cols-[1fr_4rem_4rem_2.5rem] gap-x-2 gap-y-1.5 items-center text-[10px] ${t.textMuted} uppercase font-semibold`}>
        <span />
        <span className="text-center">Base</span>
        <span className="text-center">Race</span>
        <span className="text-right">Mod</span>
        {STAT_KEYS.map(k => {
          const total = (draft.baseScores[k] ?? 10) + (draft.racialMods[k] ?? 0);
          return (
            <StatRow key={k} label={STAT_LABELS[k]} base={draft.baseScores[k] ?? 10} racial={draft.racialMods[k] ?? 0} total={total}
              onBase={v => setScore('baseScores', k, v)} onRacial={v => setScore('racialMods', k, v)} />
          );
        })}
      </div>

      <div>
        <FieldLabel>Taille</FieldLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {([['P', 'Petite'], ['M', 'Moyenne'], ['G', 'Grande']] as [Pf1Size, string][]).map(([s, l]) => (
            <Toggle key={s} active={draft.size === s} onClick={() => setDraft(d => ({ ...d, size: s }))}>{l}</Toggle>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Bonus de classe de prédilection</FieldLabel>
        <div className="grid grid-cols-2 gap-1.5">
          <Toggle active={draft.favoredClassBonus === 'hp'} onClick={() => setDraft(d => ({ ...d, favoredClassBonus: 'hp' }))}>+1 PV / niv.</Toggle>
          <Toggle active={draft.favoredClassBonus === 'skill'} onClick={() => setDraft(d => ({ ...d, favoredClassBonus: 'skill' }))}>+1 rang / niv.</Toggle>
        </div>
      </div>
      <div>
        <FieldLabel>Règle maison</FieldLabel>
        <Toggle active={elephant} onClick={() => setRules(r => (elephant ? r.filter(x => x !== HOUSE_RULE_ELEPHANT) : [...r, HOUSE_RULE_ELEPHANT]))}>
          Elephant in the Room {elephant ? '✓' : ''}
        </Toggle>
      </div>
      <p className={`text-[10px] ${t.textMuted}`}>Les PV se règlent en touchant la barre de PV.</p>
    </Pf1Modal>
  );
}

function StatRow({ label, base, racial, total, onBase, onRacial }: { label: string; base: number; racial: number; total: number; onBase: (v: number) => void; onRacial: (v: number) => void }) {
  const t = useThemeClasses();
  return (
    <>
      <span className={`text-xs font-bold normal-case ${t.textPrimary}`}>{label}</span>
      <NumField value={base} min={1} max={40} onChange={onBase} />
      <NumField value={racial} min={-10} max={10} onChange={onRacial} />
      <span className={`text-xs font-mono font-bold text-right ${t.accent}`}>{signed(abilityMod(total))}</span>
    </>
  );
}

/* ───────────────────────── Défense : armure, bouclier, bonus divers ───────────────────────── */

function ArmorFields({ title, value, onChange, defaultName }: { title: string; value: Pf1Armor | null; onChange: (v: Pf1Armor | null) => void; defaultName: string }) {
  const cls = useInputClass();
  return (
    <>
      <div className="flex items-center justify-between">
        <SectionTitle>{title}</SectionTitle>
        <Toggle active={!!value} onClick={() => onChange(value ? null : { name: defaultName, bonus: 0, maxDex: null, checkPenalty: 0, spellFailure: 0 })}>
          {value ? 'Équipé' : 'Aucun'}
        </Toggle>
      </div>
      {value && (
        <>
          <TextField label="Nom" value={value.name} onChange={name => onChange({ ...value, name })} />
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Bonus CA" value={value.bonus} min={0} max={20} onChange={bonus => onChange({ ...value, bonus })} />
            <div>
              <FieldLabel>Dex max (vide = aucun)</FieldLabel>
              <input
                type="number"
                value={value.maxDex ?? ''}
                onChange={e => onChange({ ...value, maxDex: e.target.value === '' ? null : Math.trunc(Number(e.target.value)) })}
                className={`${cls} font-mono`}
              />
            </div>
            <NumField label="Malus d’armure" value={value.checkPenalty} min={-10} max={0} onChange={checkPenalty => onChange({ ...value, checkPenalty })} />
            <NumField label="Échec profane %" value={value.spellFailure} min={0} max={100} onChange={spellFailure => onChange({ ...value, spellFailure })} />
          </div>
        </>
      )}
    </>
  );
}

export function Pf1DefenseModal({ data, speed, onSave, onClose }: {
  data: Pf1Data; speed: number; onSave: (next: Pf1Data, speed: number) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState(data);
  const [spd, setSpd] = useState(speed);
  const setAc = (k: keyof Pf1Data['acMisc'], v: number) => setDraft(d => ({ ...d, acMisc: { ...d.acMisc, [k]: v } }));
  const setSave = (k: Pf1SaveKey, v: number) => setDraft(d => ({ ...d, saveMisc: { ...d.saveMisc, [k]: v } }));

  return (
    <Pf1Modal title="Défense" onClose={onClose} onSave={() => onSave(draft, spd)}>
      <ArmorFields title="Armure" value={draft.armor} defaultName="Armure" onChange={armor => setDraft(d => ({ ...d, armor }))} />
      <ArmorFields title="Bouclier" value={draft.shield} defaultName="Bouclier" onChange={shield => setDraft(d => ({ ...d, shield }))} />
      <SectionTitle>Bonus à la CA</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Armure naturelle" value={draft.acMisc.natural} onChange={v => setAc('natural', v)} />
        <NumField label="Parade" value={draft.acMisc.deflection} onChange={v => setAc('deflection', v)} />
        <NumField label="Esquive" value={draft.acMisc.dodge} onChange={v => setAc('dodge', v)} />
        <NumField label="Divers" value={draft.acMisc.other} onChange={v => setAc('other', v)} />
      </div>
      <SectionTitle>Sauvegardes, initiative, vitesse</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {(['fort', 'ref', 'will'] as Pf1SaveKey[]).map(k => <NumField key={k} label={SAVE_LABELS[k]} value={draft.saveMisc[k] ?? 0} onChange={v => setSave(k, v)} />)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumField label="Initiative (divers)" value={draft.initiativeMisc} onChange={v => setDraft(d => ({ ...d, initiativeMisc: v }))} />
        <NumField label="Vitesse (m)" value={spd} min={0} max={60} onChange={setSpd} />
      </div>
    </Pf1Modal>
  );
}

/* ───────────────────────── Attaque ───────────────────────── */

export function Pf1AttackModal({ attack, onSave, onDelete, onClose }: {
  attack: Pf1Attack | null; onSave: (a: Pf1Attack) => void; onDelete: (id: string) => void; onClose: () => void;
}) {
  const t = useThemeClasses();
  const cls = useInputClass();
  const [draft, setDraft] = useState<Pf1Attack>(attack ?? {
    id: crypto.randomUUID(), name: '', attackStat: 'str', damageStat: 'str', damageDice: '1d8',
    enhancement: 0, attackMisc: 0, damageMisc: 0, critRange: '20', critMultiplier: 2, notes: '',
  });
  const set = <K extends keyof Pf1Attack>(k: K, v: Pf1Attack[K]) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <Pf1Modal title={attack ? 'Modifier l’attaque' : 'Nouvelle attaque'} onClose={onClose} onSave={() => onSave({ ...draft, name: draft.name.trim() || 'Attaque' })}>
      <TextField label="Nom" value={draft.name} placeholder="Cimeterre" onChange={v => set('name', v)} />
      <div className="grid grid-cols-2 gap-2">
        <StatSelect label="Carac. au toucher" value={draft.attackStat} onChange={v => set('attackStat', v ?? 'str')} />
        <StatSelect label="Carac. aux dégâts" value={draft.damageStat} allowNone onChange={v => set('damageStat', v)} />
        <TextField label="Dés de dégâts" value={draft.damageDice} placeholder="1d6" onChange={v => set('damageDice', v)} />
        <NumField label="Altération (+X)" value={draft.enhancement} min={0} max={10} onChange={v => set('enhancement', v)} />
        <NumField label="Toucher (divers)" value={draft.attackMisc} onChange={v => set('attackMisc', v)} />
        <NumField label="Dégâts (divers)" value={draft.damageMisc} onChange={v => set('damageMisc', v)} />
        <TextField label="Zone de critique" value={draft.critRange} placeholder="19-20" onChange={v => set('critRange', v)} />
        <NumField label="Multiplicateur" value={draft.critMultiplier} min={2} max={5} onChange={v => set('critMultiplier', v)} />
      </div>
      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea value={draft.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={2} className={cls} placeholder="Ex. Danse du derviche : Dex au toucher et aux dégâts" />
      </div>
      <p className={`text-[10px] ${t.textMuted}`}>Attaque en finesse : choisis Dex au toucher. Danse du derviche : Dex aussi aux dégâts.</p>
      {attack && (
        <button
          type="button"
          onClick={() => onDelete(attack.id)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border bg-rose-500/15 text-rose-400 border-rose-500/35 active:scale-95 transition-all"
        >
          <Trash2 size={13} /> Supprimer
        </button>
      )}
    </Pf1Modal>
  );
}

/* ───────────────────────── Réglages de magie ───────────────────────── */

export function Pf1MagicModal({ data, onSave, onClose }: { data: Pf1Data; onSave: (next: Pf1Data) => void; onClose: () => void }) {
  const t = useThemeClasses();
  const cls = useInputClass();
  const [draft, setDraft] = useState(data);
  const hasTable = !!findPf1Class(draft.classId)?.spellsPerDay;
  const [perDayText, setPerDayText] = useState(draft.spellsPerDayBase.map(v => (v === null ? '-' : String(v))).join(', '));

  const save = () => {
    const spellsPerDayBase = hasTable ? draft.spellsPerDayBase : perDayText.split(',').map(s => s.trim()).filter(Boolean)
      .map(s => (/^\d+$/.test(s) ? Number(s) : null));
    onSave({ ...draft, spellsPerDayBase });
  };

  return (
    <Pf1Modal title="Magie" onClose={onClose} onSave={save}>
      <StatSelect label="Caractéristique d’incantation" value={draft.castingStat} allowNone onChange={v => setDraft(d => ({ ...d, castingStat: v }))} />
      {draft.castingStat && (
        <>
          {hasTable ? (
            <p className={`text-[10px] ${t.textMuted}`}>Sorts par jour calculés avec la table de classe et les sorts en bonus ({STAT_SHORT[draft.castingStat]}).</p>
          ) : (
            <div>
              <FieldLabel>Sorts / jour de la table (niv. 0, 1, 2…)</FieldLabel>
              <input value={perDayText} onChange={e => setPerDayText(e.target.value)} placeholder="3, 1, -" className={`${cls} font-mono`} />
              <p className={`text-[10px] ${t.textMuted} mt-1`}>Sans les sorts en bonus : ils sont ajoutés automatiquement. « - » = niveau pas encore accessible.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Concentration (divers)" value={draft.concentrationMisc} onChange={v => setDraft(d => ({ ...d, concentrationMisc: v }))} />
            <NumField label="Bonus sur la défensive" value={draft.defensiveCastingBonus} onChange={v => setDraft(d => ({ ...d, defensiveCastingBonus: v }))} />
          </div>
          <p className={`text-[10px] ${t.textMuted}`}>Ex. Magie de guerre : +4 pour lancer sur la défensive.</p>
        </>
      )}
    </Pf1Modal>
  );
}

/* ───────────────────────── Aide-mémoire ───────────────────────── */

export function Pf1HelpModal({ elephant, onClose }: { elephant: boolean; onClose: () => void }) {
  const t = useThemeClasses();
  const sections = PF1_HELP.filter(s => s.id !== 'elephant' || elephant);
  const [active, setActive] = useState(sections[0].id);
  const section = sections.find(s => s.id === active) ?? sections[0];

  return (
    <Pf1Modal title="Aide-mémoire" onClose={onClose}>
      <div className="flex flex-wrap gap-1.5">
        {sections.map(s => <Toggle key={s.id} active={s.id === active} onClick={() => setActive(s.id)}>{s.label}</Toggle>)}
      </div>
      <div className="space-y-2">
        {section.entries.map(entry => (
          <div key={entry.title} className={`${t.inputBg} border ${t.cardBorder} rounded-xl px-3 py-2`}>
            <p className={`text-xs font-bold ${t.accent}`}>{entry.title}</p>
            <p className={`text-[11px] ${t.textSecondary} mt-0.5 leading-snug`}>{entry.text}</p>
          </div>
        ))}
      </div>
    </Pf1Modal>
  );
}
