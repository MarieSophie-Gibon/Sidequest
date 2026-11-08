import { useState } from 'react';
import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { CirclePlus, Pencil } from 'lucide-react';
import type { Breakdown, Pf1Attack, Pf1Data, Pf1SaveKey, Pf1Sheet } from '../../systems/pf1e/types';
import { signed, STAT_SHORT } from '../../systems/pf1e/rules';
import { BreakdownText } from './ui';

interface Props {
  data: Pf1Data;
  sheet: Pf1Sheet;
  onChange: (next: Pf1Data) => void;
  onOpenDefense: () => void;
  onOpenAttack: (attack: Pf1Attack | null) => void;
}

const SAVE_LABELS: Record<Pf1SaveKey, string> = { fort: 'Vigueur', ref: 'Réflexes', will: 'Volonté' };

function Stat({ label, value, breakdown, open, onToggle }: { label: string; value: string; breakdown: Breakdown; open: boolean; onToggle: () => void }) {
  const t = useThemeClasses();
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left px-3 py-2 rounded-xl border transition-all ${open ? `${t.accentBg} ${t.accentBorder}` : `${t.inputBg} ${t.cardBorder}`}`}
    >
      <div className="flex justify-between items-center">
        <span className={`text-xs font-bold ${t.textPrimary}`}>{label}</span>
        <span className="text-xs font-bold font-mono text-emerald-500">{value}</span>
      </div>
      {open && <div className="mt-1"><BreakdownText breakdown={breakdown} /></div>}
    </button>
  );
}

/** Onglet « Attributs » Pathfinder : sauvegardes, défense, attaques et compétences avec rangs. */
export function Pf1SheetTab({ data, sheet, onChange, onOpenDefense, onOpenAttack }: Props) {
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
        <h4 className={`${title} mb-3`}>Jets de Sauvegarde</h4>
        <div className="grid grid-cols-1 gap-1.5">
          {(['fort', 'ref', 'will'] as Pf1SaveKey[]).map(key => (
            <Stat key={key} open={openDetail === `save-${key}`} onToggle={() => toggleDetail(`save-${key}`)} label={SAVE_LABELS[key]} value={signed(sheet.saves[key].total)} breakdown={sheet.saves[key]} />
          ))}
        </div>
      </div>

      <div className={card}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={title}>Défense</h4>
          <button onClick={onOpenDefense} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`} aria-label="Modifier la défense">
            <Pencil size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <Stat open={openDetail === "ac"} onToggle={() => toggleDetail("ac")} label="CA" value={String(sheet.ac.total)} breakdown={sheet.ac} />
          <div className="grid grid-cols-2 gap-1.5">
            <Stat open={openDetail === "touch"} onToggle={() => toggleDetail("touch")} label="Contact" value={String(sheet.touchAc.total)} breakdown={sheet.touchAc} />
            <Stat open={openDetail === "ff"} onToggle={() => toggleDetail("ff")} label="Dépourvu" value={String(sheet.flatFootedAc.total)} breakdown={sheet.flatFootedAc} />
            <Stat open={openDetail === "cmb"} onToggle={() => toggleDetail("cmb")} label="BMO" value={signed(sheet.cmb.total)} breakdown={sheet.cmb} />
            <Stat open={openDetail === "cmd"} onToggle={() => toggleDetail("cmd")} label="DMD" value={String(sheet.cmd.total)} breakdown={sheet.cmd} />
          </div>
        </div>
        <p className={`text-[10px] ${t.textMuted} mt-2`}>
          {data.armor ? data.armor.name || 'Armure' : 'Sans armure'}
          {data.shield ? ` + ${data.shield.name || 'bouclier'}` : ''}
          {sheet.armorCheckPenalty < 0 && <> · Malus d’armure <span className="font-mono">{sheet.armorCheckPenalty}</span></>}
          {sheet.spellFailure > 0 && <> · Échec profane <span className="font-mono">{sheet.spellFailure}%</span></>}
        </p>
      </div>

      <div className={card}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={title}>Attaques</h4>
          <button onClick={() => onOpenAttack(null)} className={`w-6 h-6 flex items-center justify-center rounded-xl ${t.cardBg} border ${t.cardBorder} ${t.accent} shadow-md hover:brightness-110 active:scale-90 transition-all`} aria-label="Ajouter une attaque">
            <CirclePlus size={16} />
          </button>
        </div>
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
      </div>

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
