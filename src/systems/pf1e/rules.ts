import type { CharacterStatKey } from '../../types/rpg.types';
import { classSpellsPerDay } from './data/classes';
import { PF1_SKILLS } from './data/skills';
import type {
  BabProgression, Breakdown, Pf1Attack, Pf1AttackLine, Pf1Data, Pf1SaveKey, Pf1Sheet, Pf1SkillLine, Pf1SpellCharges,
} from './types';

export const STAT_KEYS: CharacterStatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const SAVE_STAT: Record<Pf1SaveKey, CharacterStatKey> = { fort: 'con', ref: 'dex', will: 'wis' };

/** Taille : bonus à l'attaque et à la CA, et modificateur spécial de BMO/DMD. */
const SIZE_MODS = { P: { attack: 1, ac: 1, special: -1 }, M: { attack: 0, ac: 0, special: 0 }, G: { attack: -1, ac: -1, special: 1 } };

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function baseAttackBonus(progression: BabProgression, level: number): number {
  if (progression === 'full') return level;
  if (progression === 'medium') return Math.floor((level * 3) / 4);
  return Math.floor(level / 2);
}

/** Bonus des attaques d'une attaque à outrance : +6 → [6, 1], +11 → [11, 6, 1]. */
export function iterativeAttacks(bab: number): number[] {
  const out = [bab];
  for (let b = bab - 5; b > 0 && out.length < 4; b -= 5) out.push(b);
  return out;
}

export function baseSave(good: boolean, level: number): number {
  return good ? 2 + Math.floor(level / 2) : Math.floor(level / 3);
}

/** Sorts en bonus dus à la caractéristique d'incantation, pour un niveau de sort ≥ 1. */
export function bonusSpells(castingMod: number, spellLevel: number): number {
  if (spellLevel <= 0 || castingMod < spellLevel) return 0;
  return Math.floor((castingMod - spellLevel) / 4) + 1;
}

function bd(parts: [string, number][]): Breakdown {
  const kept = parts.filter(([, v]) => v !== 0);
  return { total: kept.reduce((s, [, v]) => s + v, 0), parts: kept };
}

/** Nombre de charges d'un sort à charges pour un niveau de lanceur donné. */
export function spellChargeCount(cfg: Pf1SpellCharges, casterLevel: number): number {
  const n = Math.max(1, Math.floor(Math.max(1, casterLevel) / Math.max(1, cfg.everyLevels)));
  return cfg.max !== null && cfg.max > 0 ? Math.min(cfg.max, n) : n;
}

export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export const STAT_SHORT: Record<CharacterStatKey, string> = { str: 'For', dex: 'Dex', con: 'Con', int: 'Int', wis: 'Sag', cha: 'Cha' };

export function computePf1Sheet(data: Pf1Data, levelInput: number): Pf1Sheet {
  const level = Math.max(1, Math.min(20, Math.floor(levelInput || 1)));
  const size = SIZE_MODS[data.size] ?? SIZE_MODS.M;

  const scores = Object.fromEntries(
    STAT_KEYS.map(k => [k, (data.baseScores[k] ?? 10) + (data.racialMods[k] ?? 0)]),
  ) as Record<CharacterStatKey, number>;
  const mods = Object.fromEntries(STAT_KEYS.map(k => [k, abilityMod(scores[k])])) as Record<CharacterStatKey, number>;

  const bab = data.babBase ?? baseAttackBonus(data.bab, level);

  // Armure et bouclier
  const armorBonus = data.armor?.bonus ?? 0;
  const shieldBonus = data.shield?.bonus ?? 0;
  const maxDexCaps = [data.armor?.maxDex, data.shield?.maxDex].filter((v): v is number => typeof v === 'number');
  const dexToAc = maxDexCaps.length ? Math.min(mods.dex, ...maxDexCaps) : mods.dex;
  const armorCheckPenalty = Math.min(0, data.armor?.checkPenalty ?? 0) + Math.min(0, data.shield?.checkPenalty ?? 0);
  const spellFailure = (data.armor?.spellFailure ?? 0) + (data.shield?.spellFailure ?? 0);
  const { natural, deflection, dodge, other } = data.acMisc;

  const ac = bd([['Base', 10], ['Armure', armorBonus], ['Bouclier', shieldBonus], ['Dex', dexToAc], ['Taille', size.ac],
    ['Armure naturelle', natural], ['Parade', deflection], ['Esquive', dodge], ['Divers', other]]);
  const touchAc = bd([['Base', 10], ['Dex', dexToAc], ['Taille', size.ac], ['Parade', deflection], ['Esquive', dodge], ['Divers', other]]);
  const flatFootedAc = bd([['Base', 10], ['Armure', armorBonus], ['Bouclier', shieldBonus], ['Dex (malus seul)', Math.min(0, dexToAc)],
    ['Taille', size.ac], ['Armure naturelle', natural], ['Parade', deflection], ['Divers', other]]);

  const saves = Object.fromEntries((['fort', 'ref', 'will'] as Pf1SaveKey[]).map(key => {
    const stat = SAVE_STAT[key];
    return [key, bd([['Base', data.saveBase?.[key] ?? baseSave(data.goodSaves.includes(key), level)], [STAT_SHORT[stat], mods[stat]], ['Divers', data.saveMisc[key] ?? 0]])];
  })) as Record<Pf1SaveKey, Breakdown>;

  const cmb = bd([['BBA', bab], ['For', mods.str], ['Taille', size.special]]);
  const cmd = bd([['Base', 10], ['BBA', bab], ['For', mods.str], ['Dex', mods.dex], ['Taille', size.special], ['Parade', deflection], ['Esquive', dodge]]);
  const initiative = bd([['Dex', mods.dex], ['Divers', data.initiativeMisc]]);

  // Compétences
  const classSkills = new Set(data.classSkills);
  const customDefs = (data.customSkills ?? []).map(c => ({ ...c, armorPenalty: false, trainedOnly: false, custom: true }));
  const skills: Pf1SkillLine[] = [...PF1_SKILLS.map(def => ({ ...def, custom: false })), ...customDefs].map(def => {
    const ranks = Math.max(0, Math.floor(data.skillRanks[def.id] ?? 0));
    const isClassSkill = classSkills.has(def.id);
    const value = bd([['Rangs', ranks], [STAT_SHORT[def.stat], mods[def.stat]], ['Compétence de classe', isClassSkill && ranks > 0 ? 3 : 0],
      ["Malus d'armure", def.armorPenalty ? armorCheckPenalty : 0], ['Divers', data.skillMisc[def.id] ?? 0]]);
    return { id: def.id, custom: def.custom, name: def.name, stat: def.stat, ranks, isClassSkill, trainedOnly: def.trainedOnly, usable: !def.trainedOnly || ranks > 0, value };
  });
  // Bonus de classe de prédilection : ajouté par le joueur lui-même (rangs de compétence ou PV).
  const perLevel = Math.max(1, data.skillRanksPerLevel + mods.int);
  const skillRanksBudget = perLevel * level;
  const skillRanksSpent = skills.reduce((s, sk) => s + sk.ranks, 0);

  // Attaques
  const attacks: Pf1AttackLine[] = data.attacks.map((attack: Pf1Attack) => {
    const toHit = bd([['BBA', bab], [STAT_SHORT[attack.attackStat], mods[attack.attackStat]], ['Altération', attack.enhancement],
      ['Taille', size.attack], ['Divers', attack.attackMisc]]);
    const dmgMod = (attack.damageStat ? mods[attack.damageStat] : 0) + attack.enhancement + attack.damageMisc;
    const damage = dmgMod === 0 ? attack.damageDice : `${attack.damageDice}${signed(dmgMod)}`;
    const bonuses = iterativeAttacks(bab).map(b => toHit.total - bab + b);
    return { attack, bonuses, toHit, damage };
  });

  // Incantation
  let spellcasting: Pf1Sheet['spellcasting'] = null;
  if (data.castingStat) {
    const stat = data.castingStat;
    const mod = mods[stat];
    const base = classSpellsPerDay(data.classId, level) ?? data.spellsPerDayBase;
    const perDay: (number | null)[] = [];
    const bonus: number[] = [];
    for (let lvl = 0; lvl <= 9; lvl++) {
      const b = base[lvl];
      if (b === null || b === undefined) { perDay.push(null); bonus.push(0); continue; }
      const extra = bonusSpells(mod, lvl);
      perDay.push(b + extra);
      bonus.push(extra);
    }
    while (perDay.length > 1 && perDay[perDay.length - 1] === null) { perDay.pop(); bonus.pop(); }
    const concentration = bd([['Niveau de lanceur', level], [STAT_SHORT[stat], mod], ['Divers', data.concentrationMisc]]);
    spellcasting = {
      stat, mod, casterLevel: level, perDay, bonusSpells: bonus,
      dcByLevel: perDay.map((_, lvl) => 10 + lvl + mod),
      concentration,
      defensiveConcentration: bd([...concentration.parts, ['Lancer sur la défensive', data.defensiveCastingBonus]]),
    };
  }

  return {
    level, scores, mods, bab, iteratives: iterativeAttacks(bab), saves, ac, touchAc, flatFootedAc, cmb, cmd, initiative,
    armorCheckPenalty, spellFailure, skills, skillRanksBudget, skillRanksSpent, attacks, spellcasting,
  };
}

/** DD de concentration pour lancer un sort sur la défensive. */
export function defensiveCastingDc(spellLevel: number): number {
  return 15 + 2 * spellLevel;
}
