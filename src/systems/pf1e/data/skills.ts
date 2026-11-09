import type { CharacterStatKey } from '../../../types/rpg.types';

export interface Pf1SkillDef {
  id: string;
  name: string;
  stat: CharacterStatKey;
  /** Soumise au malus d'armure. */
  armorPenalty: boolean;
  /** Utilisable seulement avec au moins 1 rang. */
  trainedOnly: boolean;
}

/** Les 35 compétences du Manuel des joueurs (Pathfinder 1e), noms de la VF. */
export const PF1_SKILLS: Pf1SkillDef[] = [
  { id: 'acrobatics', name: 'Acrobaties', stat: 'dex', armorPenalty: true, trainedOnly: false },
  { id: 'spellcraft', name: 'Art de la magie', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'craft', name: 'Artisanat', stat: 'int', armorPenalty: false, trainedOnly: false },
  { id: 'bluff', name: 'Bluff', stat: 'cha', armorPenalty: false, trainedOnly: false },
  { id: 'k-dungeoneering', name: 'Connaissances (exploration souterraine)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-local', name: 'Connaissances (folklore local)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-geography', name: 'Connaissances (géographie)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-history', name: 'Connaissances (histoire)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-engineering', name: 'Connaissances (ingénierie)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-arcana', name: 'Connaissances (mystères)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-nature', name: 'Connaissances (nature)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-nobility', name: 'Connaissances (noblesse)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-planes', name: 'Connaissances (plans)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'k-religion', name: 'Connaissances (religion)', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'disguise', name: 'Déguisement', stat: 'cha', armorPenalty: false, trainedOnly: false },
  { id: 'diplomacy', name: 'Diplomatie', stat: 'cha', armorPenalty: false, trainedOnly: false },
  { id: 'stealth', name: 'Discrétion', stat: 'dex', armorPenalty: true, trainedOnly: false },
  { id: 'handle-animal', name: 'Dressage', stat: 'cha', armorPenalty: false, trainedOnly: true },
  { id: 'ride', name: 'Équitation', stat: 'dex', armorPenalty: true, trainedOnly: false },
  { id: 'climb', name: 'Escalade', stat: 'str', armorPenalty: true, trainedOnly: false },
  { id: 'sleight-of-hand', name: 'Escamotage', stat: 'dex', armorPenalty: true, trainedOnly: true },
  { id: 'appraise', name: 'Estimation', stat: 'int', armorPenalty: false, trainedOnly: false },
  { id: 'escape-artist', name: 'Évasion', stat: 'dex', armorPenalty: true, trainedOnly: false },
  { id: 'intimidate', name: 'Intimidation', stat: 'cha', armorPenalty: false, trainedOnly: false },
  { id: 'linguistics', name: 'Linguistique', stat: 'int', armorPenalty: false, trainedOnly: true },
  { id: 'swim', name: 'Natation', stat: 'str', armorPenalty: true, trainedOnly: false },
  { id: 'perception', name: 'Perception', stat: 'wis', armorPenalty: false, trainedOnly: false },
  { id: 'heal', name: 'Premiers secours', stat: 'wis', armorPenalty: false, trainedOnly: false },
  { id: 'profession', name: 'Profession', stat: 'wis', armorPenalty: false, trainedOnly: true },
  { id: 'sense-motive', name: 'Psychologie', stat: 'wis', armorPenalty: false, trainedOnly: false },
  { id: 'perform', name: 'Représentation', stat: 'cha', armorPenalty: false, trainedOnly: false },
  { id: 'disable-device', name: 'Sabotage', stat: 'dex', armorPenalty: true, trainedOnly: true },
  { id: 'survival', name: 'Survie', stat: 'wis', armorPenalty: false, trainedOnly: false },
  { id: 'use-magic-device', name: "Utilisation d'objets magiques", stat: 'cha', armorPenalty: false, trainedOnly: true },
  { id: 'fly', name: 'Vol', stat: 'dex', armorPenalty: true, trainedOnly: false },
];

export const ALL_KNOWLEDGE = PF1_SKILLS.filter(s => s.id.startsWith('k-')).map(s => s.id);
