import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Hammer, X } from 'lucide-react';
import type { Pf1CraftProject, Pf1Sheet } from '../../systems/pf1e/types';
import { signed } from '../../systems/pf1e/rules';
import { formatCp, mundaneCheck } from '../../systems/pf1e/crafting';
import { NumField, Pf1Collapsible } from './ui';

interface Props {
  projects: Pf1CraftProject[];
  sheet: Pf1Sheet;
  onCheck: (projectId: string, total: number, period: 'week' | 'day') => void;
  onAbandon: (projectId: string) => void;
}

const OUTCOME_LABEL = { progress: 'progrès', 'no-progress': 'pas de progrès', ruined: 'matières gâchées' } as const;

/** Projets d'artisanat ordinaire en cours : un test d'Artisanat par semaine ou par jour. */
export function Pf1CraftProjectsCard({ projects, sheet, onCheck, onAbandon }: Props) {
  const t = useThemeClasses();
  const [rolls, setRolls] = useState<Record<string, number>>({});
  const [confirmAbandon, setConfirmAbandon] = useState<string | null>(null);
  const craftBonus = sheet.skills.find(s => s.id === 'craft')?.value.total ?? 0;
  const btn = `flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all active:scale-95`;

  if (projects.length === 0) return null;

  return (
    <Pf1Collapsible
      defaultOpen
      title={<span className="flex items-center gap-1.5"><Hammer size={13} /> Artisanat en cours ({projects.length})</span>}
      aside={<span className={`text-[11px] ${t.textMuted} font-semibold`}>Artisanat <span className="font-mono font-bold text-emerald-500">{signed(craftBonus)}</span></span>}
    >
      <div className="space-y-2">
        {projects.map(p => {
          const priceSp = p.priceGp * 10;
          const pct = Math.min(100, (p.progressSp / priceSp) * 100);
          const d20 = rolls[p.id] ?? 10;
          const total = d20 + craftBonus;
          const preview = mundaneCheck(total, p.dc, 'week');
          const last = p.log[p.log.length - 1];
          return (
            <div key={p.id} className={`${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 space-y-2`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{p.name}</span>
                {confirmAbandon === p.id ? (
                  <span className="flex items-center gap-2 text-[10px] shrink-0">
                    <button type="button" onClick={() => setConfirmAbandon(null)} className={t.textMuted}>Garder</button>
                    <button type="button" onClick={() => onAbandon(p.id)} className="text-rose-400 font-bold">Abandonner</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmAbandon(p.id)} aria-label="Abandonner le projet" className={`${t.textMuted} hover:text-rose-400`}><X size={13} /></button>
                )}
              </div>
              <div>
                <div className="w-full bg-slate-900/50 h-2 rounded-full overflow-hidden border border-slate-600/30">
                  <div className={`h-full bg-linear-to-r ${t.hpBar} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className={`flex justify-between text-[10px] ${t.textMuted} mt-1 font-mono`}>
                  <span>{formatCp(p.progressSp * 10)} / {p.priceGp} po</span>
                  <span>DD {p.dc} · matières {formatCp(p.materialsCp)}</span>
                </div>
              </div>
              {last && (
                <p className={`text-[10px] ${t.textMuted}`}>
                  Dernier test ({last.period === 'week' ? 'semaine' : 'jour'}) : {last.total} → {OUTCOME_LABEL[last.outcome]}
                  {last.progressSp > 0 && ` (+${formatCp(last.progressSp * 10)})`}
                </p>
              )}
              <div className="grid grid-cols-[64px_1fr] gap-2 items-end">
                <NumField label="d20" value={d20} min={1} max={20} onChange={v => setRolls(r => ({ ...r, [p.id]: v }))} />
                <div className={`text-[10px] ${t.textSecondary} pb-2.5`}>
                  Test : <span className="font-mono font-bold">{total}</span> contre DD {p.dc} →{' '}
                  {preview.outcome === 'progress'
                    ? <span className="text-emerald-500">+{formatCp(preview.progressSp * 10)} / semaine</span>
                    : <span className={preview.outcome === 'ruined' ? 'text-rose-400' : 'text-amber-400'}>{OUTCOME_LABEL[preview.outcome]}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onCheck(p.id, total, 'week')} className={`${btn} ${t.accentBg} ${t.accentBorder} ${t.accent}`}>Semaine de travail</button>
                <button type="button" onClick={() => onCheck(p.id, total, 'day')} className={`${btn} ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.btnSecondaryText}`}>Journée</button>
              </div>
            </div>
          );
        })}
      </div>
    </Pf1Collapsible>
  );
}
