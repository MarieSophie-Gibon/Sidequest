import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { Plus, Trash2 } from 'lucide-react';
import type { CharacterStatKey } from '../../types/rpg.types';
import type { Pf1Data, Pf1Sheet } from '../../systems/pf1e/types';
import { signed, STAT_KEYS, STAT_SHORT } from '../../systems/pf1e/rules';
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
  const [customName, setCustomName] = useState('');
  const [customStat, setCustomStat] = useState<CharacterStatKey>('int');

  const addCustomSkill = () => {
    const name = customName.trim();
    if (!name) return;
    onChange({ ...data, customSkills: [...(data.customSkills ?? []), { id: `custom-${crypto.randomUUID().slice(0, 8)}`, name, stat: customStat }] });
    setCustomName('');
  };
  const removeCustomSkill = (id: string) => {
    const skillRanks = { ...data.skillRanks }; delete skillRanks[id];
    const skillMisc = { ...data.skillMisc }; delete skillMisc[id];
    onChange({
      ...data,
      customSkills: (data.customSkills ?? []).filter(c => c.id !== id),
      classSkills: data.classSkills.filter(s => s !== id),
      skillRanks,
      skillMisc,
    });
  };

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
        <div className="space-y-1.5 tablet:space-y-0 tablet:grid tablet:grid-cols-2 tablet:gap-1.5 tablet:items-start">
          {sheet.skills.map(skill => {
            const highlighted = skill.ranks > 0;
            return (
              <div key={skill.id} className={`px-3 py-2 rounded-xl border transition-all ${highlighted ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}>
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
                      <span className={`text-[9px] font-mono ${t.textMuted} shrink-0`}>{STAT_SHORT[skill.stat].toUpperCase()}</span>
                    </button>
                    {skill.custom && (
                      <button type="button" onClick={() => removeCustomSkill(skill.id)} aria-label={`Supprimer ${skill.name}`} className={`${t.textMuted} hover:text-rose-400 transition-colors shrink-0`}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-[8px] uppercase font-bold tracking-wide ${t.textMuted}`}>{skill.ranks > 1 ? 'Rangs' : 'Rang'}</span>
                      <button type="button" className={stepBtn} disabled={skill.ranks <= 0} onClick={() => setRanks(skill.id, skill.ranks - 1)} aria-label="Retirer un rang">−</button>
                      <span className={`text-[10px] font-mono font-bold ${t.textSecondary} w-4 text-center`}>{skill.ranks}</span>
                      <button type="button" className={stepBtn} disabled={skill.ranks >= sheet.level} onClick={() => setRanks(skill.id, skill.ranks + 1)} aria-label="Ajouter un rang">+</button>
                    </div>
                    <span className={`text-xs font-bold font-mono w-7 text-right ${highlighted ? t.accent : 'text-emerald-500'}`}>{signed(skill.value.total)}</span>
                  </div>
                </div>
                {openDetail === `skill-${skill.id}` && (
                  <div className="mt-1">
                    <BreakdownText breakdown={skill.value} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Compétence personnalisée : Artisanat (forge), Profession (marin)… */}
        <div className={`mt-3 pt-3 border-t ${t.cardBorder}`}>
          <p className={`text-[10px] ${t.textMuted} uppercase font-semibold mb-1.5`}>Ajouter une compétence</p>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={customName}
              placeholder="Ex. Artisanat (forge)"
              maxLength={60}
              onChange={e => setCustomName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomSkill(); }}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl px-2.5 py-2 text-xs flex-1 min-w-0 focus:outline-none`}
            />
            <select
              value={customStat}
              onChange={e => setCustomStat(e.target.value as CharacterStatKey)}
              aria-label="Caractéristique"
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl px-2 py-2 text-xs focus:outline-none`}
            >
              {STAT_KEYS.map(k => <option key={k} value={k}>{STAT_SHORT[k].toUpperCase()}</option>)}
            </select>
            <button
              type="button"
              onClick={addCustomSkill}
              disabled={!customName.trim()}
              aria-label="Ajouter la compétence"
              className={`px-3 rounded-xl border ${t.accentBg} ${t.accentBorder} ${t.accent} disabled:opacity-40 active:scale-95 transition-all`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
