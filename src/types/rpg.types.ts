export interface Character {
  id: string;
  user_id: string;
  name: string;
  race: string;
  class: string;
  subclass?: string;
  level: number;
  alignment?: string;
  hp_max: number;
  hp_current: number;
  hp_temp: number;
  ac: number;
  initiative: number;
  passive_perception: number;
  speed: number;
  spell_dc: number;
  spell_attack: number;
  heroic_inspiration: boolean;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  gold: number;
  proficiency_bonus: number;
  avatar_key: string;
  avatar_url?: string;
}

export interface Feature {
  id: string;
  character_id: string;
  name: string;
  type: 'classe' | 'espece' | 'don';
  category: 'active' | 'passive';
  current: number;
  max: number;
  recharge: 'LONG_REST' | 'SHORT_REST' | 'PERMANENT';
  description?: string;
  resource_id?: string;
  resource_cost?: number;
}

export interface Resource {
  id: string;
  character_id: string;
  name: string;
  current: number;
  max: number;
  recharge?: 'SHORT_REST' | 'LONG_REST';
}

export interface Spell {
  id: string;
  character_id: string;
  name: string;
  level: number;
  range?: string;
  casting_type?: 'action' | 'bonus' | 'reaction';
  is_aoe?: boolean;
  save_type?: string;
  save_effect?: string;
  concentration?: boolean;
  damage?: string;
  desc?: string;
}

export interface Item {
  id: string;
  character_id: string;
  name: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  category?: 'objet' | 'arme' | 'armure';
  damage?: string;
  range?: string;
  defense_bonus?: number;
}

export interface Skill {
  name: string;
  attr: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  proficient: boolean;
}

export interface SpellSlot {
  level: number;
  max: number;
  current: number;
}

export type CharacterStatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface CoreAttribute {
  label: string;
  score: number;
  short: string;
  color: string;
  key: CharacterStatKey;
}

export interface ThemeOption {
  name: string;
  primary: string;
  bg: string;
  border: string;
  badge: string;
  iconColor: string;
  elementIcon: string;
  glow: string;
}