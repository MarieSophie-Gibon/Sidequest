import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import type { Pf1Data, Pf1Sheet } from '../../systems/pf1e/types';
import { signed, STAT_SHORT } from '../../systems/pf1e/rules';
import { BreakdownText } from './ui';

interface Props {
  data: Pf1Data;
  sheet: Pf1Sheet;
  onChange: (next: Pf1Data) => void;
}

/** Onglet « Attributs » Pathfinder : compétences avec rangs (sauvegardes et défense sur l'accueil, attaques dans Actions). */
export function Pf1SheetTab({ data, sheet, onChange }: Props) {
  const t = useThemeClasses();
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const card = `${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`;
  const title = `text-xs font-semibold ${t.textPrimary} uppercase tracking-wider`;
  const stepBtn = `w-5 h-5 flex items-center justify-center rounded-md ${t.btnSecondaryBg} border ${t.btnSecondaryBorder} ${t.textSecondary} text-xs font-bold hover:brightness-90 active:scale-90 transition-all disabled:opacity-40`;

  const toggleDetail = (key: string) => setOpenDetail(prev => (prev === key ? null : key));

  const setRanks = (id: string, ranks: number) => {
    const next = { ...data.skillRanks };
    if (ranks <= 0) delete next[id]; else next[id] = ranks;
    onChange({ ...data, skillRanks: next });
  };
  const toggleClassSkill = (id: string) => {
    const has = data.classSkills.includes(id);
    onChange({ ...data, classSkills: has ? data.classSkills.filter(s => s !== id) : [...data.classSkills, id] });
  };

  const remaining = sheet.skillRanksBudget - sheet.skillRanksSpent;

  return (
    <div className="space-y-2">
      <div className={card}>
        <div className="flex justify-between items-center mb-1">
          <h4 className={title}>Compétences</h4>
          <span className={`text-[10px] font-mono font-bold ${remaining < 0 ? 'text-rose-400' : remaining === 0 ? 'text-emerald-500' : t.accent}`}>
            {sheet.skillRanksSpent}/{sheet.skillRanksBudget} rangs
          </span>
        </div>
        <p className={`text-[10px] ${t.textMuted} mb-3`}>◆ = compétence de classe (+3 dès 1 rang). Max {sheet.level} rang{sheet.level > 1 ? 's' : ''} par compétence.</p>
        <div className="space-y-1.5">
          {sheet.skills.map(skill => {
            const highlighted = skill.ranks > 0;
            return (
              <div key={skill.id} className={`px-3 py-2 rounded-xl border transition-all ${highlighted ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`} ${skill.usable ? '' : 'opacity-50'}`}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleClassSkill(skill.id)}
                      aria-label="Compétence de classe"
                      className={`w-3.5 h-3.5 shrink-0 rounded-sm rotate-45 border transition-colors ${skill.isClassSkill ? `${t.accent} bg-current border-current shadow-sm` : `bg-transparent ${t.inputBorder}`}`}
                    />
                    <button type="button" onClick={() => toggleDetail(`skill-${skill.id}`)} className="flex items-baseline gap-1.5 min-w-0 text-left">
                      <span className={`text-xs font-bold ml-1.5 truncate ${highlighted ? t.accent : t.textPrimary}`}>{skill.name}</span>
                      <span className={`text-[9px] font-mono ${t.textMuted} shrink-0`}>{STAT_SHORT[skill.stat].toUpperCase()}{skill.trainedOnly ? '*' : ''}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <button type="button" className={stepBtn} disabled={skill.ranks <= 0} onClick={() => setRanks(skill.id, skill.ranks - 1)}>−</button>
                      <span className={`text-[10px] font-mono font-bold ${t.textSecondary} w-4 text-center`}>{skill.ranks}</span>
                      <button type="button" className={stepBtn} disabled={skill.ranks >= sheet.level} onClick={() => setRanks(skill.id, skill.ranks + 1)}>+</button>
                    </div>
                    <span className={`text-xs font-bold font-mono w-7 text-right ${highlighted ? t.accent : 'text-emerald-500'}`}>{skill.usable ? signed(skill.value.total) : '—'}</span>
                  </div>
                </div>
                {openDetail === `skill-${skill.id}` && (
                  <div className="mt-1">
                    <BreakdownText breakdown={skill.value} />
                    {!skill.usable && <span className={`text-[10px] ${t.textMuted}`}> · * Formation nécessaire : 1 rang minimum.</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
