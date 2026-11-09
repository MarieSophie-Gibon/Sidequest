import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Hammer, Sparkles } from 'lucide-react';
import type { Item } from '../../types/rpg.types';
import type { Pf1CraftProject, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import {
  formatCp, MAGIC_ITEM_TYPES, magicCheck, magicCostCp, magicCraftHours, magicDc, MUNDANE_PRESETS, mundaneMaterialsCp,
  spellItemBasePrice, type MagicItemType,
} from '../../systems/pf1e/crafting';
import { FieldLabel, NumField, Pf1Modal, TextField, Toggle } from './ui';
import { useInputClass } from './useInputClass';

interface Props {
  sheet: Pf1Sheet;
  purseCp: number;
  onStartProject: (project: Omit<Pf1CraftProject, 'id' | 'progressSp' | 'log' | 'materialsCp'>) => Promise<boolean>;
  onCraftMagic: (input: { name: string; description: string; category: Item['category']; basePriceGp: number; dc: number; total: number; hours: number }) => Promise<boolean>;
  onClose: () => void;
}

/** Champ numérique acceptant les décimales (prix en po : 0,1 po = 1 pa). */
function DecimalField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const cls = useInputClass();
  const [draft, setDraft] = useState(String(value));
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number" inputMode="decimal" min={0} step="0.1" value={draft}
        onChange={e => { setDraft(e.target.value); const n = Number(e.target.value.replace(',', '.')); if (!Number.isNaN(n)) onChange(Math.max(0, n)); }}
        onBlur={() => setDraft(String(value))}
        className={`${cls} font-mono`}
      />
    </div>
  );
}

function formatHours(h: number) {
  return h < 8 ? `${h} h` : `${h / 8} jour${h > 8 ? 's' : ''} de 8 h`;
}

/** Artisanat Pathfinder 1e : projet d'objet ordinaire ou création d'objet magique. */
export function Pf1CraftingModal({ sheet, purseCp, onStartProject, onCraftMagic, onClose }: Props) {
  const t = useThemeClasses();
  const cls = useInputClass();
  const [mode, setMode] = useState<'mundane' | 'magic'>('mundane');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  // Objet ordinaire
  const [presetId, setPresetId] = useState('martial-weapon');
  const [priceGp, setPriceGp] = useState(15);
  const [armorBonus, setArmorBonus] = useState(2);
  const [rushMundane, setRushMundane] = useState(false);
  const preset = MUNDANE_PRESETS.find(p => p.id === presetId)!;
  const effectivePrice = preset.priceGp ?? priceGp;
  const mundaneDc = (preset.armorBased ? 10 + armorBonus : preset.dc) + (rushMundane ? 10 : 0);
  const materialsCp = mundaneMaterialsCp(effectivePrice);
  const craftBonus = sheet.skills.find(s => s.id === 'craft')?.value.total ?? 0;
  const take10 = 10 + craftBonus;
  const weeklySp = take10 >= mundaneDc ? take10 * mundaneDc : 0;
  const weeksEstimate = weeklySp > 0 ? Math.ceil((effectivePrice * 10) / weeklySp) : null;

  // Objet magique
  const [magicType, setMagicType] = useState<MagicItemType>('potion');
  const [spellLevel, setSpellLevel] = useState(1);
  const [casterLevel, setCasterLevel] = useState(Math.max(1, sheet.spellcasting?.casterLevel ?? 1));
  const [manualBasePrice, setManualBasePrice] = useState(1000);
  const [missingPrereqs, setMissingPrereqs] = useState(0);
  const [rushMagic, setRushMagic] = useState(false);
  const [d20, setD20] = useState(10);
  const typeDef = MAGIC_ITEM_TYPES.find(m => m.id === magicType)!;
  const spellPrice = spellItemBasePrice(magicType, spellLevel, casterLevel);
  const basePrice = spellPrice ?? manualBasePrice;
  const dc = magicDc(casterLevel, missingPrereqs, rushMagic);
  const hours = magicCraftHours(magicType, basePrice, rushMagic);
  const costCp = magicCostCp(basePrice);
  const spellcraft = sheet.skills.find(s => s.id === 'spellcraft');
  const magicTotal = d20 + (spellcraft?.value.total ?? 0);
  const outcome = magicCheck(magicTotal, dc);
  const maxSpellLevel = magicType === 'potion' ? 3 : magicType === 'wand' ? 4 : 9;

  const cost = mode === 'mundane' ? materialsCp : costCp;
  const affordable = purseCp >= cost;
  const box = `${t.inputBg} border ${t.inputBorder} rounded-xl p-2.5 space-y-1`;
  const row = `flex justify-between text-[11px] ${t.textSecondary}`;

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    const ok = mode === 'mundane'
      ? await onStartProject({ name: name.trim(), description: description.trim() || undefined, category: preset.category, priceGp: effectivePrice, dc: mundaneDc })
      : await onCraftMagic({ name: name.trim(), description: description.trim(), category: typeDef.category, basePriceGp: basePrice, dc, total: magicTotal, hours });
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Pf1Modal title="Artisanat" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <Toggle active={mode === 'mundane'} onClick={() => setMode('mundane')}><span className="flex items-center justify-center gap-1"><Hammer size={11} /> Objet ordinaire</span></Toggle>
        <Toggle active={mode === 'magic'} onClick={() => setMode('magic')}><span className="flex items-center justify-center gap-1"><Sparkles size={11} /> Objet magique</span></Toggle>
      </div>

      <TextField label="Nom" value={name} placeholder={mode === 'mundane' ? 'Épée longue' : 'Potion de soins légers'} onChange={setName} />
      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${cls} h-14 resize-none text-xs`} />
      </div>

      {mode === 'mundane' ? (
        <>
          <div>
            <FieldLabel>Type d’objet (fixe le DD)</FieldLabel>
            <select value={presetId} onChange={e => setPresetId(e.target.value)} className={`${cls} text-xs`}>
              {MUNDANE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}{p.armorBased ? '' : ` — DD ${p.dc}`}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {preset.priceGp === undefined
              ? <DecimalField label="Prix (po)" value={priceGp} onChange={setPriceGp} />
              : <div><FieldLabel>Prix (po)</FieldLabel><p className={`${cls} font-mono opacity-70`}>{preset.priceGp}</p></div>}
            {preset.armorBased && <NumField label="Bonus d’armure" value={armorBonus} min={0} max={20} onChange={setArmorBonus} />}
          </div>
          <label className={`flex items-center gap-2 text-[11px] ${t.textSecondary}`}>
            <input type="checkbox" checked={rushMundane} onChange={e => setRushMundane(e.target.checked)} />
            Accélérer : +10 au DD (progression plus rapide, plus risqué)
          </label>
          <div className={box}>
            <div className={row}><span>DD d’Artisanat</span><span className="font-mono font-bold">{mundaneDc}</span></div>
            <div className={row}><span>Votre bonus d’Artisanat</span><span className="font-mono font-bold text-emerald-500">{signed(craftBonus)}</span></div>
            <div className={row}><span>Matières premières (⅓ du prix)</span><span className="font-mono font-bold">{formatCp(materialsCp)}</span></div>
            <div className={row}>
              <span>Durée estimée en faisant 10</span>
              <span className="font-mono font-bold">{weeksEstimate ? `${weeksEstimate} semaine${weeksEstimate > 1 ? 's' : ''}` : 'DD trop élevé'}</span>
            </div>
          </div>
          <p className={`text-[10px] ${t.textMuted}`}>Le projet apparaît dans l’inventaire. Chaque semaine (ou jour) de travail, notez votre test d’Artisanat : progression = résultat × DD en pa.</p>
        </>
      ) : (
        <>
          <div>
            <FieldLabel>Type d’objet</FieldLabel>
            <select value={magicType} onChange={e => setMagicType(e.target.value as MagicItemType)} className={`${cls} text-xs`}>
              {MAGIC_ITEM_TYPES.map(m => <option key={m.id} value={m.id}>{m.label} — {m.feat}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {spellPrice !== null
              ? <NumField label="Niveau du sort" value={spellLevel} min={0} max={maxSpellLevel} onChange={setSpellLevel} />
              : <DecimalField label="Prix de base (po)" value={manualBasePrice} onChange={setManualBasePrice} />}
            <NumField label="NLS de l’objet" value={casterLevel} min={1} max={20} onChange={setCasterLevel} />
            <NumField label="Prérequis manquants" value={missingPrereqs} min={0} max={10} onChange={setMissingPrereqs} />
            <NumField label="d20" value={d20} min={1} max={20} onChange={setD20} />
          </div>
          <label className={`flex items-center gap-2 text-[11px] ${t.textSecondary}`}>
            <input type="checkbox" checked={rushMagic} onChange={e => setRushMagic(e.target.checked)} />
            Accélérer : +5 au DD, temps divisé par deux
          </label>
          <div className={box}>
            {spellPrice !== null && <div className={row}><span>Prix de base</span><span className="font-mono font-bold">{basePrice} po</span></div>}
            <div className={row}><span>Coût (½ du prix de base)</span><span className="font-mono font-bold">{formatCp(costCp)}</span></div>
            <div className={row}><span>Temps de création</span><span className="font-mono font-bold">{formatHours(hours)}</span></div>
            <div className={row}><span>DD d’Art de la magie</span><span className="font-mono font-bold">{dc}</span></div>
            <div className={row}>
              <span>Votre test : {d20} {signed(spellcraft?.value.total ?? 0)}</span>
              <span className={`font-mono font-bold ${outcome === 'success' ? 'text-emerald-500' : outcome === 'cursed' ? 'text-rose-400' : 'text-amber-400'}`}>
                {magicTotal} → {outcome === 'success' ? 'réussite' : outcome === 'cursed' ? 'objet maudit' : 'échec'}
              </span>
            </div>
          </div>
          <p className={`text-[10px] ${t.textMuted}`}>
            Il faut le don « {typeDef.feat} ». Faire 10 est autorisé hors stress. Pour une arme ou une armure magique, l’objet de maître de base se paie en plus, au prix plein.
            {spellcraft && !spellcraft.usable && ' ⚠ Art de la magie nécessite au moins 1 rang.'}
          </p>
        </>
      )}

      {!affordable && <p className="text-[11px] text-rose-400">Bourse insuffisante : il faut {formatCp(cost)} (vous avez {formatCp(purseCp)}).</p>}
      <button
        type="button"
        disabled={!name.trim() || !affordable || busy}
        onClick={submit}
        className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 disabled:opacity-40 bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder}`}
      >
        {mode === 'mundane' ? `Lancer le projet (${formatCp(cost)})` : `Créer l’objet (${formatCp(cost)})`}
      </button>
    </Pf1Modal>
  );
}
