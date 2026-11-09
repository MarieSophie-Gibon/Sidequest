import type { CharacterStatKey } from '../../types/rpg.types';
import { classSpellsPerDay, findPf1Class } from './data/classes';
import type { Pf1Data } from './types';

export const HOUSE_RULE_ELEPHANT = 'elephant-in-the-room';

export function createPf1Data(classId = 'guerrier'): Pf1Data {
  const cls = findPf1Class(classId) ?? findPf1Class('guerrier')!;
  return {
    version: 1,
    baseScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racialMods: {},
    size: 'M',
    classId: cls.id,
    bab: cls.bab,
    goodSaves: [...cls.goodSaves],
    hitDie: cls.hitDie,
    skillRanksPerLevel: cls.skillRanksPerLevel,
    classSkills: [...cls.classSkills],
    castingStat: cls.castingStat,
    spellsPerDayBase: classSpellsPerDay(cls.id, 1) ?? [],
    spellsUsed: [],
    prepared: [],
    maneuvers: {},
    craftProjects: [],
    favoredClassBonus: 'hp',
    armor: null,
    shield: null,
    acMisc: { natural: 0, deflection: 0, dodge: 0, other: 0 },
    saveMisc: { fort: 0, ref: 0, will: 0 },
    initiativeMisc: 0,
    skillRanks: {},
    skillMisc: {},
    attacks: [],
    concentrationMisc: 0,
    defensiveCastingBonus: 0,
  };
}

/** Relit un system_data venu de la base et complète les champs manquants. */
export function normalizePf1Data(raw: unknown): Pf1Data {
  const base = createPf1Data();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Pf1Data>;
  return {
    ...base,
    ...r,
    version: 1,
    baseScores: { ...base.baseScores, ...(r.baseScores ?? {}) } as Record<CharacterStatKey, number>,
    racialMods: { ...(r.racialMods ?? {}) },
    acMisc: { ...base.acMisc, ...(r.acMisc ?? {}) },
    saveMisc: { ...base.saveMisc, ...(r.saveMisc ?? {}) },
    skillRanks: { ...(r.skillRanks ?? {}) },
    skillMisc: { ...(r.skillMisc ?? {}) },
    attacks: Array.isArray(r.attacks) ? r.attacks : [],
    goodSaves: Array.isArray(r.goodSaves) ? r.goodSaves : base.goodSaves,
    classSkills: Array.isArray(r.classSkills) ? r.classSkills : base.classSkills,
    spellsPerDayBase: Array.isArray(r.spellsPerDayBase) ? r.spellsPerDayBase : base.spellsPerDayBase,
    spellsUsed: Array.isArray(r.spellsUsed) ? r.spellsUsed : [],
    prepared: Array.isArray(r.prepared) ? r.prepared : [],
    maneuvers: { ...(r.maneuvers ?? {}) },
    craftProjects: Array.isArray(r.craftProjects) ? r.craftProjects : [],
  };
}

/** Applique les réglages d'une classe connue (BBA, sauvegardes, compétences de classe…). */
export function applyPf1Class(data: Pf1Data, classId: string): Pf1Data {
  const cls = findPf1Class(classId);
  if (!cls) return { ...data, classId: 'custom' };
  return {
    ...data,
    classId: cls.id,
    bab: cls.bab,
    goodSaves: [...cls.goodSaves],
    hitDie: cls.hitDie,
    skillRanksPerLevel: cls.skillRanksPerLevel,
    classSkills: [...cls.classSkills],
    castingStat: cls.castingStat,
  };
}
