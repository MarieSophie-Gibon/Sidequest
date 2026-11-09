import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Pencil, Shield, ShieldHalf } from 'lucide-react';
import type { Breakdown, Pf1Data, Pf1SaveKey, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import { BreakdownText } from './ui';

interface Props {
  data: Pf1Data;
  sheet: Pf1Sheet;
  onOpenDefense: () => void;
}

const SAVE_LABELS: Record<Pf1SaveKey, string> = { fort: 'Vigueur', ref: 'Réflexes', will: 'Volonté' };

/** Sections « Jets de sauvegarde » et « Défense » du tableau de bord Pathfinder. */
export function Pf1DefenseSection({ data, sheet, onOpenDefense }: Props) {
  const t = useThemeClasses();
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const toggle = (key: string) => setOpenDetail(prev => (prev === key ? null : key));

  const section = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`;
  const heading = `flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${t.textPrimary}`;

  const cell = (key: string, label: string, value: string) => (
    <button
      key={key}
      type="button"
      onClick={() => toggle(key)}
      className={`rounded-xl border py-1.5 text-center transition-all active:scale-95 ${openDetail === key ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}
    >
      <span className={`text-[9px] ${t.textMuted} font-extrabold block uppercase leading-none`}>{label}</span>
      <span className="text-sm font-extrabold font-mono text-emerald-500 block mt-1 leading-none">{value}</span>
    </button>
  );

  const detail = (entries: Record<string, Breakdown>) => {
    const breakdown = openDetail ? entries[openDetail] : undefined;
    return breakdown ? <div className="mt-2 px-1"><BreakdownText breakdown={breakdown} /></div> : null;
  };

  const saveEntries = Object.fromEntries((['fort', 'ref', 'will'] as Pf1SaveKey[]).map(k => [`save-${k}`, sheet.saves[k]]));
  const defenseEntries: Record<string, Breakdown> = {
    ac: sheet.ac, touch: sheet.touchAc, ff: sheet.flatFootedAc, cmb: sheet.cmb, cmd: sheet.cmd,
  };

  return (
    <>
      <section className={`${section} border-emerald-400/22 bg-emerald-500/4`}>
        <h4 className={`${heading} mb-2.5`}><ShieldHalf size={12} /> Jets de sauvegarde</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {(['fort', 'ref', 'will'] as Pf1SaveKey[]).map(k => cell(`save-${k}`, SAVE_LABELS[k], signed(sheet.saves[k].total)))}
        </div>
        {detail(saveEntries)}
      </section>

      <section className={`${section} border-sky-400/22 bg-sky-500/4`}>
        <div className="flex justify-between items-center mb-2.5">
          <h4 className={heading}><Shield size={12} /> Défense</h4>
          <button onClick={onOpenDefense} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`} aria-label="Modifier la défense">
            <Pencil size={13} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {cell('ac', 'CA', String(sheet.ac.total))}
          {cell('touch', 'Contact', String(sheet.touchAc.total))}
          {cell('ff', 'Dépourvu', String(sheet.flatFootedAc.total))}
          {cell('cmb', 'BMO', signed(sheet.cmb.total))}
          {cell('cmd', 'DMD', String(sheet.cmd.total))}
        </div>
        {detail(defenseEntries)}
        <p className={`text-[10px] ${t.textMuted} mt-2`}>
          {data.armor ? data.armor.name || 'Armure' : 'Sans armure'}
          {data.shield ? ` + ${data.shield.name || 'bouclier'}` : ''}
          {sheet.armorCheckPenalty < 0 && <> · Malus d’armure <span className="font-mono">{sheet.armorCheckPenalty}</span></>}
          {sheet.spellFailure > 0 && <> · Échec profane <span className="font-mono">{sheet.spellFailure}%</span></>}
        </p>
      </section>
    </>
  );
}
