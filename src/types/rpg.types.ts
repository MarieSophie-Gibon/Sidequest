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
  silver: number;
  copper: number;
  proficiency_bonus: number;
  avatar_key: string;
  avatar_url?: string;
  hit_die_type?: 'd6' | 'd8' | 'd10' | 'd12';
  hit_dice_current?: number;
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
  duration?: string;
  components?: string[];
  material_components?: string;
  casting_type?: 'action' | 'bonus' | 'reaction';
  is_aoe?: boolean;
  save_type?: string;
  save_effect?: string;
  concentration?: boolean;
  damage?: string;
  upcast_damage?: string;
  desc?: string;
}

export interface Item {
  id: string;
  character_id: string;
  name: string;
  description?: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  category?: 'objet' | 'arme' | 'armure' | 'potion' | 'parchemin' | 'objet_magique' | 'composant';
  crafting_duration_hours?: number | null;
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

export interface Biography {
  character_id: string;
  ideaux?: string;
  alignement?: string;
  liens?: string;
  description_physique?: string;
  traits_principaux?: string;
  defauts?: string;
  backstory?: string;
  updated_at?: string;
}

export type CharacterStatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface Familiar {
  id: string;
  character_id: string;
  name: string;
  species?: string;
  description?: string;
  hp_current: number;
  hp_max: number;
  ac?: number;
  speed?: string;
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
  passive_perception?: number;
  senses?: string;
  abilities?: string;
  resistances?: string;
  darkvision?: string;
  actions?: string;
  avatar_url?: string;
  status: 'present' | 'distant' | 'unconscious' | 'dead';
}

export interface CoreAttribute {
  label: string;
  score: number;
  short: string;
  color: string;
  key: CharacterStatKey;
}

export interface Note {
  id: string;
  character_id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
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