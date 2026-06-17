import type { Character, Skill, CharacterStatKey } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';

interface DnDSkillsAndSavesProps {
  activeChar: Character;
  skills: Skill[];
  getModValue: (score: number) => number;
  onToggleSkill: (skillName: string) => void;
  saveThrows: { attr: CharacterStatKey; proficient: boolean }[];
  onToggleSave: (attr: CharacterStatKey) => void;
}

const ATTR_LABELS: Record<CharacterStatKey, string> = {
  str: 'Force',
  dex: 'Dextérité',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Sagesse',
  cha: 'Charisme',
};

const ATTR_SHORT: Record<CharacterStatKey, string> = {
  str: 'FOR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'SAG',
  cha: 'CHA',
};

const ATTR_ORDER: CharacterStatKey[] = ['str', 'dex', 'int', 'wis', 'cha'];

export function DnDSkillsAndSaves({
  activeChar,
  skills,
  getModValue,
  onToggleSkill,
  saveThrows,
  onToggleSave,
}: DnDSkillsAndSavesProps) {
  const t = useThemeClasses();

  const skillsByAttr = ATTR_ORDER.reduce((acc, attr) => {
    const group = skills.filter((s) => s.attr === attr);
    if (group.length > 0) acc.push({ attr, skills: group });
    return acc;
  }, [] as { attr: CharacterStatKey; skills: Skill[] }[]);

  const SAVE_ORDER: CharacterStatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  return (
    <div className="space-y-2">
      {/* Saving Throws */}
      {saveThrows.length > 0 && (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
          <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3`}>Jets de Sauvegarde</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {SAVE_ORDER.map(attr => {
              const save = saveThrows.find(s => s.attr === attr);
              const score = activeChar[attr] || 10;
              const mod = getModValue(score);
              const profBonus = activeChar.proficiency_bonus || 2;
              const finalBonus = mod + (save?.proficient ? profBonus : 0);
              const finalBonusSign = finalBonus >= 0 ? `+${finalBonus}` : `${finalBonus}`;
              return (
                <div key={attr} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all ${
                  save?.proficient
                    ? `${t.accentBg} ${t.accentBorder}`
                    : `${t.inputBg} ${t.cardBorder}`
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSave(attr)}
                      className={`w-3.5 h-3.5 rounded-sm rotate-45 border transition-colors ${
                        save?.proficient
                          ? `${t.accentBg} ${t.accentBorder} shadow-sm`
                          : `${t.cardBg} ${t.inputBorder}`
                      }`}
                    />
                    <span className={`text-xs font-bold ml-1.5 ${save?.proficient ? t.accent : t.textPrimary}`}>
                      {ATTR_LABELS[attr]}
                    </span>
                    <span className={`text-[9px] font-mono ${t.textMuted}`}>{ATTR_SHORT[attr]}</span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${save?.proficient ? t.accent : 'text-emerald-500'}`}>{finalBonusSign}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wider mb-3`}>Compétences & Maîtrises</h4>
        <div className="space-y-3">
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
                    <div key={skill.name} className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all ${
                      skill.proficient
                        ? `${t.accentBg} ${t.accentBorder}`
                        : `${t.inputBg} ${t.cardBorder}`
                    }`}>
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
                        <span className={`text-xs font-bold ml-1.5 ${skill.proficient ? t.accent : t.textPrimary}`}>{skill.name}</span>
                      </div>
                      <span className={`text-xs font-bold font-mono ${skill.proficient ? t.accent : 'text-emerald-500'}`}>{finalBonusSign}</span>
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
