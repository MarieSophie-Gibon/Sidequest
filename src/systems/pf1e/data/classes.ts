import type { CharacterStatKey } from '../../../types/rpg.types';
import type { BabProgression, Pf1SaveKey } from '../types';
import { ALL_KNOWLEDGE } from './skills';

export interface Pf1ClassDef {
  id: string;
  name: string;
  hitDie: number;
  bab: BabProgression;
  goodSaves: Pf1SaveKey[];
  skillRanksPerLevel: number;
  classSkills: string[];
  castingStat: CharacterStatKey | null;
  /** Sorts par jour de la table de classe, par niveau de personnage (index 0 = niveau 1). */
  spellsPerDay?: (number | null)[][];
}

/** Table du Magus (pathfinder-fr.org), niveaux 1 à 20, sorts de niveau 0 à 6. */
const MAGUS_SPELLS: (number | null)[][] = [
  [3, 1], [4, 2], [4, 3], [4, 3, 1], [4, 4, 2], [4, 4, 3], [5, 4, 3, 1], [5, 4, 4, 2],
  [5, 5, 4, 3], [5, 5, 4, 3, 1], [5, 5, 4, 4, 2], [5, 5, 5, 4, 3], [5, 5, 5, 4, 3, 1],
  [5, 5, 5, 4, 4, 2], [5, 5, 5, 5, 4, 3], [5, 5, 5, 5, 4, 3, 1], [5, 5, 5, 5, 4, 4, 2],
  [5, 5, 5, 5, 5, 4, 3], [5, 5, 5, 5, 5, 5, 4], [5, 5, 5, 5, 5, 5, 5],
];

/**
 * Classes de base + Magus. Les tables de sorts autres que celle du Magus se saisissent
 * à la main dans l'onglet Sorts (MVP).
 */
export const PF1_CLASSES: Pf1ClassDef[] = [
  { id: 'barbare', name: 'Barbare', hitDie: 12, bab: 'full', goodSaves: ['fort'], skillRanksPerLevel: 4, castingStat: null,
    classSkills: ['acrobatics', 'craft', 'handle-animal', 'ride', 'climb', 'intimidate', 'k-nature', 'swim', 'perception', 'survival'] },
  { id: 'barde', name: 'Barde', hitDie: 8, bab: 'medium', goodSaves: ['ref', 'will'], skillRanksPerLevel: 6, castingStat: 'cha',
    classSkills: ['acrobatics', 'spellcraft', 'craft', 'bluff', ...ALL_KNOWLEDGE, 'disguise', 'diplomacy', 'stealth', 'climb', 'sleight-of-hand', 'appraise', 'escape-artist', 'intimidate', 'linguistics', 'perception', 'profession', 'sense-motive', 'perform', 'use-magic-device'] },
  { id: 'druide', name: 'Druide', hitDie: 8, bab: 'medium', goodSaves: ['fort', 'will'], skillRanksPerLevel: 4, castingStat: 'wis',
    classSkills: ['spellcraft', 'craft', 'k-geography', 'k-nature', 'handle-animal', 'ride', 'climb', 'swim', 'perception', 'heal', 'profession', 'survival', 'fly'] },
  { id: 'ensorceleur', name: 'Ensorceleur', hitDie: 6, bab: 'poor', goodSaves: ['will'], skillRanksPerLevel: 2, castingStat: 'cha',
    classSkills: ['spellcraft', 'craft', 'bluff', 'k-arcana', 'appraise', 'intimidate', 'profession', 'use-magic-device', 'fly'] },
  { id: 'guerrier', name: 'Guerrier', hitDie: 10, bab: 'full', goodSaves: ['fort'], skillRanksPerLevel: 2, castingStat: null,
    classSkills: ['craft', 'k-dungeoneering', 'k-engineering', 'handle-animal', 'ride', 'climb', 'intimidate', 'swim', 'profession', 'survival'] },
  { id: 'magicien', name: 'Magicien', hitDie: 6, bab: 'poor', goodSaves: ['will'], skillRanksPerLevel: 2, castingStat: 'int',
    classSkills: ['spellcraft', 'craft', ...ALL_KNOWLEDGE, 'appraise', 'linguistics', 'profession', 'fly'] },
  { id: 'magus', name: 'Magus', hitDie: 8, bab: 'medium', goodSaves: ['fort', 'will'], skillRanksPerLevel: 2, castingStat: 'int',
    classSkills: ['spellcraft', 'craft', 'k-dungeoneering', 'k-arcana', 'k-planes', 'ride', 'climb', 'intimidate', 'swim', 'profession', 'use-magic-device', 'fly'],
    spellsPerDay: MAGUS_SPELLS },
  { id: 'moine', name: 'Moine', hitDie: 8, bab: 'medium', goodSaves: ['fort', 'ref', 'will'], skillRanksPerLevel: 4, castingStat: null,
    classSkills: ['acrobatics', 'craft', 'k-history', 'k-religion', 'stealth', 'ride', 'climb', 'escape-artist', 'intimidate', 'swim', 'perception', 'profession', 'sense-motive', 'perform'] },
  { id: 'paladin', name: 'Paladin', hitDie: 10, bab: 'full', goodSaves: ['fort', 'will'], skillRanksPerLevel: 2, castingStat: 'cha',
    classSkills: ['spellcraft', 'craft', 'k-nobility', 'k-religion', 'diplomacy', 'handle-animal', 'ride', 'heal', 'profession', 'sense-motive'] },
  { id: 'pretre', name: 'Prêtre', hitDie: 8, bab: 'medium', goodSaves: ['fort', 'will'], skillRanksPerLevel: 2, castingStat: 'wis',
    classSkills: ['spellcraft', 'craft', 'k-history', 'k-arcana', 'k-nobility', 'k-planes', 'k-religion', 'diplomacy', 'appraise', 'linguistics', 'heal', 'profession', 'sense-motive'] },
  { id: 'rodeur', name: 'Rôdeur', hitDie: 10, bab: 'full', goodSaves: ['fort', 'ref'], skillRanksPerLevel: 6, castingStat: 'wis',
    classSkills: ['spellcraft', 'craft', 'k-dungeoneering', 'k-geography', 'k-nature', 'stealth', 'handle-animal', 'ride', 'climb', 'intimidate', 'swim', 'perception', 'heal', 'profession', 'survival'] },
  { id: 'roublard', name: 'Roublard', hitDie: 8, bab: 'medium', goodSaves: ['ref'], skillRanksPerLevel: 8, castingStat: null,
    classSkills: ['acrobatics', 'craft', 'bluff', 'k-dungeoneering', 'k-local', 'disguise', 'diplomacy', 'stealth', 'climb', 'sleight-of-hand', 'appraise', 'escape-artist', 'intimidate', 'linguistics', 'swim', 'perception', 'profession', 'sense-motive', 'perform', 'disable-device', 'use-magic-device'] },
];

export function findPf1Class(id: string): Pf1ClassDef | undefined {
  return PF1_CLASSES.find(c => c.id === id);
}

/** Sorts par jour de la table pour une classe connue et un niveau, ou null. */
export function classSpellsPerDay(classId: string, level: number): (number | null)[] | null {
  const table = findPf1Class(classId)?.spellsPerDay;
  if (!table) return null;
  return table[Math.min(Math.max(level, 1), table.length) - 1] ?? null;
}
