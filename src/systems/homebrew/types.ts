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
export interface HbCurrency { id: string; name: string }

/** Type de capacité défini par le MJ (Capacités de classe, de race, Dons…) : un groupe dans l'onglet Capacités. */
export interface HbFeatureType { id: string; name: string }
/** Ressource prévue par le MJ (Ki, Rage…), créée sur chaque nouvelle fiche issue du modèle. */
export interface HbResource { id: string; name: string; defaultMax: number; recharge: 'SHORT_REST' | 'LONG_REST' }

export interface HbSections {
  features: boolean;
  /** Bloc Ressources (onglet Capacités) ; absent = suit `features` (anciens modèles). */
  resources?: boolean;
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
  /** Emplacements de sorts dans l'onglet Sorts (si la section Sorts est cochée). */
  spellSlots: boolean;
  currencies: HbCurrency[];
  sections: HbSections;
  /** Types de capacités ; absent = Classe / Race / Dons (ids 'classe', 'espece', 'don'). */
  featureTypes?: HbFeatureType[];
  /** Ressources pré-remplies sur les nouvelles fiches. */
  resources?: HbResource[];
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
