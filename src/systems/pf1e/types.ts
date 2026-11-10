import type { CharacterStatKey } from '../../types/rpg.types';

export type Pf1SaveKey = 'fort' | 'ref' | 'will';
export type BabProgression = 'full' | 'medium' | 'poor';
export type Pf1Size = 'P' | 'M' | 'G';

/** Un bonus et son détail, pour les infobulles « pourquoi 16 ? ». */
export interface Breakdown {
  total: number;
  parts: [label: string, value: number][];
}

export interface Pf1Armor {
  name: string;
  bonus: number;
  /** Bonus de Dex maximal ; null = aucune limite. */
  maxDex: number | null;
  /** Malus d'armure aux tests (valeur négative ou 0). */
  checkPenalty: number;
  /** Risque d'échec des sorts profanes, en %. */
  spellFailure: number;
}

export interface Pf1Attack {
  id: string;
  name: string;
  /** Caractéristique au toucher (Dex avec finesse ou Dervish Dance). */
  attackStat: CharacterStatKey;
  /** Caractéristique aux dégâts ; null = aucune. */
  damageStat: CharacterStatKey | null;
  damageDice: string;
  enhancement: number;
  attackMisc: number;
  damageMisc: number;
  critRange: string;
  critMultiplier: number;
  notes?: string;
}

export interface Pf1CraftProject {
  id: string;
  name: string;
  description?: string;
  category: 'objet' | 'arme' | 'armure' | 'composant';
  /** Prix de l'objet en po. */
  priceGp: number;
  /** DD du test d'Artisanat (déjà augmenté de 10 si le joueur accélère). */
  dc: number;
  /** Coût des matières premières payé, en pc. */
  materialsCp: number;
  /** Progression accumulée, en pa. */
  progressSp: number;
  /** Historique des tests (le plus récent en dernier). */
  log: { date: string; period: 'week' | 'day'; total: number; progressSp: number; outcome: 'progress' | 'no-progress' | 'ruined' }[];
}

export interface Pf1ManeuverSettings {
  /** Don « Science de… » : +2 BMO, +2 DMD contre cette manœuvre, pas d’attaque d’opportunité. */
  improved: boolean;
  /** Autres bonus au BMO (don supérieur, objet…). */
  misc: number;
}

export interface Pf1PreparedSpell {
  id: string;
  /** Id du sort dans le grimoire (table spells). */
  spellId: string;
  /** Lancé depuis le dernier repos long. */
  cast: boolean;
  /** Sort à charges lancé : charges restantes (absent = pas de charges en cours). */
  chargesLeft?: number;
}

/**
 * Sort à charges (ex. Contact glacial : 1 contact par niveau de lanceur).
 * Charges = 1 tous les `everyLevels` niveaux de lanceur (au moins 1), plafonnées à `max`.
 */
export interface Pf1SpellCharges {
  everyLevels: number;
  max: number | null;
}

/** Choix du joueur pour un perso Pathfinder 1e, stockés dans characters.system_data. */
export interface Pf1Data {
  version: 1;
  baseScores: Record<CharacterStatKey, number>;
  racialMods: Partial<Record<CharacterStatKey, number>>;
  size: Pf1Size;
  /** Id d'une classe connue (PF1_CLASSES) ou 'custom'. */
  classId: string;
  /** Archétypes de classe, saisis à la main (un personnage peut en cumuler plusieurs). */
  archetypes: string[];
  /** BBA saisi à la main (toutes classes confondues). Absent = ancien calcul via `bab`. */
  babBase?: number;
  /** Sauvegardes de base saisies à la main. Absent = ancien calcul via `goodSaves`. */
  saveBase?: Record<Pf1SaveKey, number>;
  /** Réglages de classe, pré-remplis depuis PF1_CLASSES, modifiables pour une classe 'custom'. */
  bab: BabProgression;
  goodSaves: Pf1SaveKey[];
  hitDie: number;
  skillRanksPerLevel: number;
  classSkills: string[];
  castingStat: CharacterStatKey | null;
  /** Sorts par jour de la table de classe, index = niveau de sort (null = pas encore accessible). */
  spellsPerDayBase: (number | null)[];
  spellsUsed: number[];
  /** Sorts préparés du jour : un même sort peut occuper plusieurs emplacements. */
  prepared: Pf1PreparedSpell[];
  /** Réglage des sorts à charges, par id de sort du grimoire. */
  spellCharges?: Record<string, Pf1SpellCharges>;
  /** Réglages par manœuvre de combat (don « Science de… », bonus divers). */
  maneuvers: Record<string, Pf1ManeuverSettings>;
  /** Objets ordinaires en cours de fabrication (compétence Artisanat). */
  craftProjects: Pf1CraftProject[];
  /** Obsolète : le joueur ajoute lui-même son bonus de classe de prédilection. */
  favoredClassBonus?: 'hp' | 'skill';
  armor: Pf1Armor | null;
  shield: Pf1Armor | null;
  acMisc: { natural: number; deflection: number; dodge: number; other: number };
  saveMisc: Record<Pf1SaveKey, number>;
  initiativeMisc: number;
  skillRanks: Record<string, number>;
  skillMisc: Record<string, number>;
  /** Compétences personnalisées, affichées en fin de liste. */
  customSkills?: Pf1CustomSkill[];
  attacks: Pf1Attack[];
  concentrationMisc: number;
  /** Bonus pour lancer sur la défensive (Magie de guerre : +4). */
  defensiveCastingBonus: number;
}

/** Compétence ajoutée par le joueur (ex. Artisanat (forge), Profession (marin)). */
export interface Pf1CustomSkill {
  id: string;
  name: string;
  stat: CharacterStatKey;
}

export interface Pf1SkillLine {
  id: string;
  /** Compétence personnalisée (supprimable). */
  custom?: boolean;
  name: string;
  stat: CharacterStatKey;
  ranks: number;
  isClassSkill: boolean;
  trainedOnly: boolean;
  usable: boolean;
  value: Breakdown;
}

export interface Pf1AttackLine {
  attack: Pf1Attack;
  /** Bonus de chaque attaque d'une attaque à outrance (+7/+2…). */
  bonuses: number[];
  toHit: Breakdown;
  damage: string;
}

export interface Pf1Sheet {
  level: number;
  scores: Record<CharacterStatKey, number>;
  mods: Record<CharacterStatKey, number>;
  bab: number;
  iteratives: number[];
  saves: Record<Pf1SaveKey, Breakdown>;
  ac: Breakdown;
  touchAc: Breakdown;
  flatFootedAc: Breakdown;
  cmb: Breakdown;
  cmd: Breakdown;
  initiative: Breakdown;
  armorCheckPenalty: number;
  spellFailure: number;
  skills: Pf1SkillLine[];
  skillRanksBudget: number;
  skillRanksSpent: number;
  attacks: Pf1AttackLine[];
  spellcasting: {
    stat: CharacterStatKey;
    mod: number;
    casterLevel: number;
    /** Par niveau de sort : table + sorts en bonus ; null si pas accessible. */
    perDay: (number | null)[];
    bonusSpells: number[];
    dcByLevel: number[];
    concentration: Breakdown;
    defensiveConcentration: Breakdown;
  } | null;
}
