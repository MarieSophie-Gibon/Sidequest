import type { Character, Skill, CharacterStatKey } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';

interface DnDSkillsAndSavesProps {
  activeChar: Character;
  skills: Skill[];
  getModValue: (score: number) => number;
  onToggleSkill: (skillName: string) => void;
}

const ATTR_LABELS: Record<CharacterStatKey, string> = {
  str: 'Force',
  dex: 'Dextérité',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Sagesse',
  cha: 'Charisme',
};

const ATTR_ORDER: CharacterStatKey[] = ['str', 'dex', 'int', 'wis', 'cha'];

export function DnDSkillsAndSaves({
  activeChar,
  skills,
  getModValue,
  onToggleSkill,
}: DnDSkillsAndSavesProps) {
  const t = useThemeClasses();

  const skillsByAttr = ATTR_ORDER.reduce((acc, attr) => {
    const group = skills.filter((s) => s.attr === attr);
    if (group.length > 0) acc.push({ attr, skills: group });
    return acc;
  }, [] as { attr: CharacterStatKey; skills: Skill[] }[]);

  return (
    <div className="space-y-2">
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3`}>Compétences & Maîtrises</h4>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {skillsByAttr.map(({ attr, skills: groupSkills }) => (
            <div key={attr}>
              <p className={`text-[10px] font-semibold ${t.textSecondary} uppercase tracking-wider mb-1.5 pl-1`}>
                {ATTR_LABELS[attr]}
              </p>
              <div className="space-y-1.5">
                {groupSkills.map((skill) => {
                  const scoreAttr = activeChar[skill.attr] || 10;
                  const finalBonus = getModValue(scoreAttr) + (skill.proficient ? (activeChar.proficiency_bonus || 2) : 0);
                  const finalBonusSign = finalBonus >= 0 ? `+${finalBonus}` : `${finalBonus}`;

                  return (
                    <div key={skill.name} className={`flex justify-between items-center ${t.inputBg} px-3 py-2 rounded-xl border ${t.cardBorder}`}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleSkill(skill.name)}
                          className={`w-3.5 h-3.5 rounded-sm rotate-45 border transition-colors ${
                            skill.proficient
                              ? `${t.accentBg} ${t.accentBorder} shadow-sm`
                              : `${t.cardBg} ${t.inputBorder}`
                          }`}
                        />
                        <span className={`text-xs font-bold ${t.textPrimary} ml-1.5`}>{skill.name}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-500">{finalBonusSign}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
