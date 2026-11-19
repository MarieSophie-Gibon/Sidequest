import { useState } from 'react';
import { Info } from 'lucide-react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Pf1ArmorStats, Pf1ItemStats, Pf1WeaponStats } from '../../systems/pf1e/types';
import { PF1_ARMOR_TYPES, PF1_WEAPON_CATEGORIES, PF1_WEAPON_TYPES, pf1StatsForCategory } from '../../systems/pf1e/equipment';
import { FieldLabel, NumField, TextField } from './ui';
import { useInputClass } from './useInputClass';

/** Choix parmi quelques options, en boutons. */
function Choice<K extends string>({ label, options, value, onChange, cols }: {
  label: string; options: { key: K; label: string }[]; value: K; onChange: (v: K) => void; cols: number;
}) {
  const t = useThemeClasses();
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map(o => (
          <button key={o.key} type="button" onClick={() => onChange(o.key)}
            className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all ${value === o.key ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.textMuted} ${t.cardBorder} hover:brightness-95`}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Poids en kg : accepte les décimales (« 7,5 »). */
function WeightField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const cls = useInputClass();
  const [draft, setDraft] = useState(value ? String(value).replace('.', ',') : '');
  return (
    <div>
      <FieldLabel>Poids (kg)</FieldLabel>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        placeholder="0"
        onChange={e => {
          setDraft(e.target.value);
          const n = Number(e.target.value.replace(',', '.'));
          if (!Number.isNaN(n)) onChange(Math.max(0, n));
        }}
        className={`${cls} font-mono`}
      />
    </div>
  );
}

function ArmorFields({ value, onChange }: { value: Pf1ArmorStats; onChange: (v: Pf1ArmorStats) => void }) {
  const cls = useInputClass();
  const set = <K extends keyof Pf1ArmorStats>(k: K, v: Pf1ArmorStats[K]) => onChange({ ...value, [k]: v });
  const shield = value.armorType === 'bouclier';
  return (
    <>
      <Choice label="Type" options={PF1_ARMOR_TYPES} value={value.armorType} onChange={v => set('armorType', v)} cols={2} />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Prix" value={value.price} placeholder="150 po" onChange={v => set('price', v)} />
        <NumField label={shield ? 'Bonus de bouclier' : 'Bonus d’armure'} value={value.bonus} min={0} max={20} onChange={v => set('bonus', v)} />
        <div>
          <FieldLabel>Bonus de Dex max</FieldLabel>
          <input
            type="number"
            value={value.maxDex ?? ''}
            placeholder="Aucun"
            onChange={e => set('maxDex', e.target.value === '' ? null : Math.trunc(Number(e.target.value)))}
            className={`${cls} font-mono`}
          />
        </div>
        <NumField label="Malus d’armure" value={value.checkPenalty} min={-10} max={0} onChange={v => set('checkPenalty', v)} />
        <NumField label="Échec sorts profanes %" value={value.spellFailure} min={0} max={100} onChange={v => set('spellFailure', v)} />
        <TextField label="Vitesse" value={value.speed} placeholder="6 m / 4,50 m" onChange={v => set('speed', v)} />
        <WeightField value={value.weight} onChange={v => set('weight', v)} />
      </div>
    </>
  );
}

function WeaponFields({ value, onChange }: { value: Pf1WeaponStats; onChange: (v: Pf1WeaponStats) => void }) {
  const t = useThemeClasses();
  const cls = useInputClass();
  const [showSpecialHelp, setShowSpecialHelp] = useState(false);
  const set = <K extends keyof Pf1WeaponStats>(k: K, v: Pf1WeaponStats[K]) => onChange({ ...value, [k]: v });
  return (
    <>
      <Choice label="Catégorie" options={PF1_WEAPON_CATEGORIES} value={value.category} onChange={v => set('category', v)} cols={3} />
      <Choice label="Type" options={PF1_WEAPON_TYPES} value={value.weaponType} onChange={v => set('weaponType', v)} cols={2} />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Prix" value={value.price} placeholder="15 po" onChange={v => set('price', v)} />
        <TextField label="Dégâts (taille M)" value={value.damage} placeholder="1d8" onChange={v => set('damage', v)} />
        <TextField label="Zone de critique" value={value.critRange} placeholder="19-20" onChange={v => set('critRange', v)} />
        <NumField label="Multiplicateur" value={value.critMultiplier} min={2} max={5} onChange={v => set('critMultiplier', v)} />
        <TextField label="Facteur de portée" value={value.rangeIncrement} placeholder={value.weaponType === 'distance' ? '24 m' : '—'} onChange={v => set('rangeIncrement', v)} />
        <WeightField value={value.weight} onChange={v => set('weight', v)} />
        <TextField label="Type de dégâts" value={value.damageType} placeholder="T, P, C, P ou T…" onChange={v => set('damageType', v)} />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <FieldLabel>Spécial</FieldLabel>
          <button type="button" onClick={() => setShowSpecialHelp(v => !v)} aria-label="Afficher l’aide sur les attributs spéciaux" className={`${showSpecialHelp ? t.accent : t.textMuted} -mt-1`}>
            <Info size={11} />
          </button>
        </div>
        {showSpecialHelp && (
          <p className={`text-[10px] ${t.textMuted} mb-1.5`}>
            Certaines armes ont des attributs spéciaux en plus de ceux indiqués dans leur description : allonge (attaque à 3 m mais pas au contact), croc-en-jambe ou désarmement (permet cette manœuvre avec l’arme), double, non létale…
          </p>
        )}
        <input type="text" value={value.special} placeholder="Allonge, croc-en-jambe…" onChange={e => set('special', e.target.value)} className={cls} />
      </div>
    </>
  );
}

/** Champs Pathfinder d'une arme ou d'une armure de l'inventaire. */
export function Pf1ItemFields({ category, value, onChange }: { category: string; value: Pf1ItemStats | null | undefined; onChange: (v: Pf1ItemStats) => void }) {
  const stats = pf1StatsForCategory(category, value);
  if (!stats) return null;
  return stats.kind === 'armor'
    ? <ArmorFields value={stats} onChange={onChange} />
    : <WeaponFields value={stats} onChange={onChange} />;
}
