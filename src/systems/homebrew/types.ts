/**
 * Systèmes homebrew : structure d'une fiche définie par le MJ (voir docs/conception-homebrew.md).
 * Les identifiants (`id`) ne changent jamais, même si l'élément est renommé.
 */

export type HomebrewBase = 'dnd5e' | 'pf1e' | 'libre';

export interface HbStat { id: string; name: string; short: string; showMod: boolean }
/** Champ d'identité ajouté par le MJ (Divinité, Âge, Faction…), rempli en texte libre par le joueur. */
export interface HbIdentityField {
  id: string;
  name: string;
  /** Champ stocké dans la colonne du personnage (race, classe) plutôt qu'en texte libre. */
  column?: 'race' | 'class';
}
/** Calcul du modificateur : D&D (10 = 0, 12 = +1…) ou libre (saisi par le joueur). */
export type HbModifierRule = 'dnd' | 'libre';
export interface HbSkill { id: string; name: string; statId: string | null }
export interface HbSave { id: string; name: string; statId: string | null }
export interface HbGauge { id: string; name: string; defaultMax: number }
/** Valeur de défense ou de combat, éventuellement reliée à une caractéristique (base + modificateur). */
export interface HbCombatValue { id: string; name: string; statId: string | null }

export type HbSpecialKind = 'inspiration' | 'proficiency' | 'bab' | 'cmb' | 'cmd' | 'passive_perception' | 'custom';
/** Valeur spéciale cochée par le MJ (Inspiration, Bonus de maîtrise, BBA…). */
export interface HbSpecial { id: string; kind: HbSpecialKind; name: string; type: 'number' | 'checkbox' }

export type HbAttackType = 'contact' | 'distance' | 'sort';

/** Champs d'un sort que le MJ peut cocher (nom, niveau, portée et description sont toujours là). */
export type HbSpellField = 'damage' | 'save' | 'cost' | 'duration' | 'school' | 'upcast' | 'condition' | 'concentration' | 'components';
/** Champs d'un objet cochables par catégorie (nom, description, quantité et équipé toujours présents). */
export type HbItemField = 'bonus' | 'dm';
/** Catégorie d'inventaire définie par le MJ (Armes, Armures, Équipement…). */
export interface HbItemCategory { id: string; name: string; fields: HbItemField[] }

/** Gestion des sorts : emplacements (D&D), sorts préparés (Pathfinder) ou liste libre. */
export type HbSpellMode = 'slots' | 'prepared' | 'free';
export interface HbCurrency { id: string; name: string }

/** Type de capacité défini par le MJ (Capacités de classe, de race, Dons…) : un groupe dans l'onglet Capacités. */
export interface HbFeatureType { id: string; name: string }
/**
 * Ressource prévue par le MJ (Ki, Rage…), créée sur chaque nouvelle fiche issue du modèle.
 * display : puces simples (defaultMax puces) ou puces avec une valeur chacune (values).
 */
export interface HbResource {
  id: string;
  name: string;
  defaultMax: number;
  /** Ancien réglage (avant les repos du MJ) : ignoré. */
  recharge?: 'SHORT_REST' | 'LONG_REST';
  display?: 'bullets' | 'valued';
  /** Valeur de chaque puce (display = 'valued'), ex. ['d8', 'd8', 'd10']. */
  values?: string[];
  /** Repos qui recharge la ressource ; null = aucun. */
  restId?: string | null;
  /** Utilisations récupérées si le repos n'est pas automatique ; null = toutes. */
  restAmount?: number | null;
}

/** Quantité récupérée par un repos non automatique (ex. 1 PV × niveau). */
export interface HbRestGain { amount: number; perLevel: boolean }

/**
 * Repos défini par le MJ. auto = PV et jauges reviennent au maximum ;
 * sinon, gains indiqués pour les PV et chaque jauge (absent = rien).
 */
export interface HbRest {
  id: string;
  name: string;
  auto: boolean;
  hp?: HbRestGain;
  gauges?: Record<string, HbRestGain>;
}

export interface HbSections {
  features: boolean;
  /** Bloc Ressources (onglet Capacités) ; absent = suit `features` (anciens modèles). */
  resources?: boolean;
  /** Boutons de repos sur la fiche ; absent = oui (repos par défaut). */
  rests?: boolean;
  spells: boolean;
  inventory: boolean;
  familiars: boolean;
  biography: boolean;
  notes: boolean;
}

/** Catégories de données que le MJ coche ou décoche (le contenu est conservé si décoché). */
export type HbCategoryKey = 'stats' | 'skills' | 'saves' | 'gauges' | 'combat' | 'specials' | 'attacks' | 'currencies';

export interface HomebrewStructure {
  version: 1;
  /** Catégories présentes sur la fiche ; absente = toutes cochées (anciens modèles). */
  categories?: Record<HbCategoryKey, boolean>;
  /**
   * race / class : libellés (vide = champ supprimé) ; extra : champs ajoutés.
   * fields : liste ordonnée de tous les champs (source de vérité dans l'éditeur).
   */
  identity: { race: string; class: string; showLevel: boolean; extra?: HbIdentityField[]; fields?: HbIdentityField[] };
  /** Règle des modificateurs ; absente = D&D. */
  modifierRule?: HbModifierRule;
  stats: HbStat[];
  /** Case de maîtrise sur chaque compétence et sauvegarde. */
  proficiency: boolean;
  skills: HbSkill[];
  saves: HbSave[];
  gauges: HbGauge[];
  combat: HbCombatValue[];
  specials: HbSpecial[];
  /** baseBonusId : id d'une valeur spéciale, « libre » (saisi par le joueur) ou null (aucun). */
  attacks: { enabled: boolean; types: HbAttackType[]; baseBonusId: string | null };
  /** Ancien réglage « emplacements de sorts » ; remplacé par spellMode (absent = slots si true, sinon libre). */
  spellSlots: boolean;
  /** Gestion des sorts (si la section Sorts est cochée). */
  spellMode?: HbSpellMode;
  /** Champs du sort cochés par le MJ ; absent = champs D&D habituels. */
  spellFields?: HbSpellField[];
  currencies: HbCurrency[];
  sections: HbSections;
  /** Types de capacités ; absent = Classe / Race / Dons (ids 'classe', 'espece', 'don'). */
  featureTypes?: HbFeatureType[];
  /** Ressources pré-remplies sur les nouvelles fiches. */
  resources?: HbResource[];
  /** Repos du système ; absent = un seul « Repos » automatique. */
  rests?: HbRest[];
  /** Catégories d'inventaire ; absent = Armes / Armures / Équipement. */
  itemCategories?: HbItemCategory[];
  /** Familiers : champ « Capacités / attaque » en plus de nom, description, image et PV. */
  familiarAbilities?: boolean;
}

/** Système tel que stocké en base (table game_systems). */
export interface GameSystemRecord {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  base: HomebrewBase;
  structure: HomebrewStructure;
  share_token: string;
  created_at: string;
  updated_at: string;
}
