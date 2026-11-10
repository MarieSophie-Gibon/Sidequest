import { PF1_SKILLS } from '../pf1e/data/skills';
import type { HbCategoryKey, HbFeatureType, HbItemCategory, HbRest, HbSpellField, HbSpellMode, HbIdentityField, HbSpecial, HbSpecialKind, HomebrewBase, HomebrewStructure } from './types';

/** Identifiant court et stable pour un nouvel élément de structure. */
export function newId(): string {
  return crypto.randomUUID().slice(0, 8);
}

const SIX_STATS = [
  { id: 'for', name: 'Force', short: 'FOR', showMod: true },
  { id: 'dex', name: 'Dextérité', short: 'DEX', showMod: true },
  { id: 'con', name: 'Constitution', short: 'CON', showMod: true },
  { id: 'int', name: 'Intelligence', short: 'INT', showMod: true },
  { id: 'sag', name: 'Sagesse', short: 'SAG', showMod: true },
  { id: 'cha', name: 'Charisme', short: 'CHA', showMod: true },
];

/** Stat PF1/D&D (clé anglaise) → identifiant de caractéristique homebrew. */
const STAT_ID = { str: 'for', dex: 'dex', con: 'con', int: 'int', wis: 'sag', cha: 'cha' } as const;

/** Catalogue des valeurs spéciales proposées au MJ (§3 du document de conception). */
export const SPECIAL_CATALOG: { kind: Exclude<HbSpecialKind, 'custom'>; name: string; type: HbSpecial['type'] }[] = [
  { kind: 'inspiration', name: 'Inspiration', type: 'checkbox' },
  { kind: 'proficiency', name: 'Bonus de maîtrise', type: 'number' },
  { kind: 'bab', name: 'Bonus de base à l’attaque (BBA)', type: 'number' },
  { kind: 'cmb', name: 'Bonus de manœuvre offensive (BMO)', type: 'number' },
  { kind: 'cmd', name: 'Degré de manœuvre défensive (DMD)', type: 'number' },
  { kind: 'passive_perception', name: 'Perception passive', type: 'number' },
];

function special(kind: Exclude<HbSpecialKind, 'custom'>): HbSpecial {
  const def = SPECIAL_CATALOG.find(s => s.kind === kind)!;
  return { id: kind, kind, name: def.name, type: def.type };
}

const ALL_SECTIONS = { features: true, resources: true, spells: true, inventory: true, familiars: true, biography: true, notes: true };

/** Types de capacités par défaut : mêmes ids que D&D, pour que les capacités existantes s'y rangent. */
export const DEFAULT_FEATURE_TYPES: HbFeatureType[] = [
  { id: 'classe', name: 'Capacités de classe' },
  { id: 'espece', name: 'Capacités de race' },
  { id: 'don', name: 'Dons' },
];

export function featureTypesOf(structure: HomebrewStructure): HbFeatureType[] {
  return structure.featureTypes ?? DEFAULT_FEATURE_TYPES;
}

export const SPELL_FIELD_LABELS: Record<HbSpellField, string> = {
  damage: 'DM (dégâts)',
  save: 'JS (jet de sauvegarde)',
  cost: 'Coût',
  duration: 'Durée',
  school: 'École',
  upcast: 'Amélioration (niveau sup.)',
  condition: 'Condition',
  concentration: 'Concentration',
  components: 'Composantes',
};
export const SPELL_FIELD_KEYS = Object.keys(SPELL_FIELD_LABELS) as HbSpellField[];
/** Anciens modèles : les champs D&D affichés jusqu'ici. */
const LEGACY_SPELL_FIELDS: HbSpellField[] = ['damage', 'save', 'duration', 'upcast', 'concentration', 'components'];

export function spellFieldsOf(structure: HomebrewStructure): HbSpellField[] {
  return structure.spellFields ?? LEGACY_SPELL_FIELDS;
}

export function spellModeOf(structure: HomebrewStructure): HbSpellMode {
  return structure.spellMode ?? (structure.spellSlots ? 'slots' : 'free');
}

/** Catégories d'inventaire par défaut (ids des catégories D&D pour garder les objets existants). */
export const DEFAULT_ITEM_CATEGORIES: HbItemCategory[] = [
  { id: 'arme', name: 'Armes', fields: ['dm'] },
  { id: 'armure', name: 'Armures', fields: ['bonus'] },
  { id: 'objet', name: 'Équipement', fields: [] },
];

export function itemCategoriesOf(structure: HomebrewStructure): HbItemCategory[] {
  return structure.itemCategories ?? DEFAULT_ITEM_CATEGORIES;
}

/** Repos par défaut : remet PV et jauges au maximum. */
export const DEFAULT_RESTS: HbRest[] = [{ id: 'repos', name: 'Repos', auto: true }];

export function restsOf(structure: HomebrewStructure): HbRest[] {
  return structure.rests ?? DEFAULT_RESTS;
}

/** Boutons de repos présents sur la fiche ? (absent = oui). */
export function restsEnabled(structure: HomebrewStructure): boolean {
  return structure.sections.rests ?? true;
}

/** Le bloc Ressources est-il présent ? (anciens modèles : suit la section Capacités). */
export function resourcesEnabled(structure: HomebrewStructure): boolean {
  return structure.sections.resources ?? structure.sections.features;
}
const PO_PA_PC = [{ id: 'po', name: 'po' }, { id: 'pa', name: 'pa' }, { id: 'pc', name: 'pc' }];

const DND_SKILLS: [string, keyof typeof STAT_ID][] = [
  ['Acrobaties', 'dex'], ['Arcanes', 'int'], ['Athlétisme', 'str'], ['Discrétion', 'dex'], ['Dressage', 'wis'],
  ['Escamotage', 'dex'], ['Histoire', 'int'], ['Intimidation', 'cha'], ['Intuition', 'wis'], ['Investigation', 'int'],
  ['Médecine', 'wis'], ['Nature', 'int'], ['Perception', 'wis'], ['Persuasion', 'cha'], ['Religion', 'int'],
  ['Représentation', 'cha'], ['Supercherie', 'cha'], ['Survie', 'wis'],
];

function slug(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Structure pré-remplie selon la base choisie par le MJ (simple point de départ, tout reste modifiable). */
export function presetStructure(base: HomebrewBase): HomebrewStructure {
  if (base === 'dnd5e') {
    return {
      version: 1,
      identity: { race: 'Espèce', class: 'Classe', showLevel: true },
      stats: SIX_STATS.map(s => ({ ...s })),
      proficiency: true,
      skills: DND_SKILLS.map(([name, stat]) => ({ id: slug(name), name, statId: STAT_ID[stat] })),
      saves: SIX_STATS.map(s => ({ id: `save-${s.id}`, name: s.name, statId: s.id })),
      gauges: [],
      combat: [
        { id: 'ca', name: 'CA', statId: 'dex' },
        { id: 'init', name: 'Initiative', statId: 'dex' },
        { id: 'vit', name: 'Vitesse', statId: null },
      ],
      specials: [special('inspiration'), special('proficiency'), special('passive_perception')],
      attacks: { enabled: true, types: ['contact', 'distance', 'sort'], baseBonusId: 'proficiency' },
      spellSlots: true,
      currencies: PO_PA_PC.map(c => ({ ...c })),
      sections: { ...ALL_SECTIONS },
    };
  }

  if (base === 'pf1e') {
    return {
      version: 1,
      identity: { race: 'Race', class: 'Classe', showLevel: true },
      stats: SIX_STATS.map(s => ({ ...s })),
      proficiency: false,
      skills: PF1_SKILLS.map(s => ({ id: s.id, name: s.name, statId: STAT_ID[s.stat] })),
      saves: [
        { id: 'vigueur', name: 'Vigueur', statId: 'con' },
        { id: 'reflexes', name: 'Réflexes', statId: 'dex' },
        { id: 'volonte', name: 'Volonté', statId: 'sag' },
      ],
      gauges: [],
      combat: [
        { id: 'ca', name: 'CA', statId: 'dex' },
        { id: 'contact', name: 'CA de contact', statId: 'dex' },
        { id: 'depourvu', name: 'CA pris au dépourvu', statId: null },
        { id: 'init', name: 'Initiative', statId: 'dex' },
        { id: 'vit', name: 'Vitesse', statId: null },
      ],
      specials: [special('bab'), special('cmb'), special('cmd')],
      attacks: { enabled: true, types: ['contact', 'distance', 'sort'], baseBonusId: 'bab' },
      spellSlots: true,
      currencies: PO_PA_PC.map(c => ({ ...c })),
      sections: { ...ALL_SECTIONS },
    };
  }

  return {
    version: 1,
    // Libre : caractéristiques D&D par défaut (modifiables), le reste décoché ;
    // cocher Compétences les pré-remplit.
    categories: { stats: true, skills: false, saves: false, gauges: false, combat: false, specials: false, attacks: false, currencies: false },
    identity: { race: 'Race', class: 'Classe', showLevel: true, extra: [], fields: [{ id: 'race', name: 'Race', column: 'race' }, { id: 'class', name: 'Classe', column: 'class' }] },
    stats: SIX_STATS.map(s => ({ ...s })),
    proficiency: false,
    skills: [],
    saves: [],
    gauges: [],
    combat: [],
    specials: [],
    attacks: { enabled: false, types: ['contact', 'distance'], baseBonusId: null },
    spellSlots: false,
    currencies: [],
    sections: { features: true, resources: true, spells: false, inventory: true, familiars: false, biography: true, notes: true },
  };
}

export const BASE_LABELS: Record<HomebrewBase, string> = {
  dnd5e: 'D&D 5e',
  pf1e: 'Pathfinder 1e',
  libre: 'Libre',
};

/**
 * Supprime une caractéristique de la structure en détachant tout ce qui y était relié
 * (compétences, sauvegardes, valeurs de combat), pour ne jamais laisser de lien cassé.
 */
export function removeStat(structure: HomebrewStructure, statId: string): HomebrewStructure {
  const detach = <T extends { statId: string | null }>(list: T[]) => list.map(x => (x.statId === statId ? { ...x, statId: null } : x));
  return {
    ...structure,
    stats: structure.stats.filter(s => s.id !== statId),
    skills: detach(structure.skills),
    saves: detach(structure.saves),
    combat: detach(structure.combat),
  };
}

/** Supprime une valeur spéciale ; si elle servait de bonus de base aux attaques, on l'en retire. */
export function removeSpecial(structure: HomebrewStructure, specialId: string): HomebrewStructure {
  return {
    ...structure,
    specials: structure.specials.filter(s => s.id !== specialId),
    attacks: structure.attacks.baseBonusId === specialId ? { ...structure.attacks, baseBonusId: null } : structure.attacks,
  };
}

export const CATEGORY_KEYS: HbCategoryKey[] = ['stats', 'skills', 'saves', 'gauges', 'combat', 'specials', 'attacks', 'currencies'];

/** Catégories cochées du modèle (toutes par défaut pour un modèle qui n'en a pas encore). */
export function categoriesOf(structure: HomebrewStructure): Record<HbCategoryKey, boolean> {
  const defaults = Object.fromEntries(CATEGORY_KEYS.map(k => [k, true])) as Record<HbCategoryKey, boolean>;
  return { ...defaults, ...(structure.categories ?? {}) };
}

/**
 * Structure telle qu'elle est copiée dans une fiche : les catégories décochées sont vidées
 * (le modèle, lui, garde leur contenu pour qu'on puisse les recocher).
 */
export function sheetStructure(structure: HomebrewStructure): HomebrewStructure {
  const on = categoriesOf(structure);
  const copy: HomebrewStructure = structuredClone(structure);
  if (!on.stats) {
    copy.stats = [];
    for (const list of [copy.skills, copy.saves, copy.combat]) for (const item of list) item.statId = null;
  }
  if (!on.skills) copy.skills = [];
  if (!on.saves) copy.saves = [];
  if (!on.skills && !on.saves) copy.proficiency = false;
  if (!on.gauges) copy.gauges = [];
  if (!on.combat) copy.combat = [];
  if (!on.specials) {
    copy.specials = [];
    // « Libre » ne dépend pas des valeurs spéciales : on le garde.
    if (copy.attacks.baseBonusId !== BASE_BONUS_FREE) copy.attacks = { ...copy.attacks, baseBonusId: null };
  }
  // La case « Attaques » des éléments de la fiche décide seule de l'activation.
  copy.attacks = { ...copy.attacks, enabled: on.attacks };
  if (!on.currencies) copy.currencies = [];
  return copy;
}

/**
 * Remplit Caractéristiques ou Compétences avec celles de D&D 5e (si la liste est vide).
 * Les compétences sont reliées aux caractéristiques présentes, et inversement.
 */
export function prefillDnd(structure: HomebrewStructure, key: 'stats' | 'skills' | 'saves'): HomebrewStructure {
  const next: HomebrewStructure = { ...structure };
  const dnd = presetStructure('dnd5e');
  if (key === 'stats' && next.stats.length === 0) {
    next.stats = dnd.stats;
    // Compétences D&D déjà présentes mais non reliées : on les relie à leur caractéristique.
    const dndLink = new Map(dnd.skills.map(s => [s.id, s.statId]));
    next.skills = next.skills.map(s => (s.statId === null && dndLink.has(s.id) ? { ...s, statId: dndLink.get(s.id) ?? null } : s));
    // Sauvegardes « une par caractéristique » ajoutées avant : on les relie aussi.
    next.saves = next.saves.map(sv => (sv.statId === null && sv.id.startsWith('save-') && next.stats.some(st => `save-${st.id}` === sv.id)
      ? { ...sv, statId: sv.id.slice(5) } : sv));
  }
  if (key === 'skills' && next.skills.length === 0) {
    const statIds = new Set(next.stats.map(s => s.id));
    next.skills = dnd.skills.map(s => ({ ...s, statId: s.statId && statIds.has(s.statId) ? s.statId : null }));
  }
  if (key === 'saves' && next.saves.length === 0) {
    // Comme en D&D : une sauvegarde par caractéristique, reliée à elle.
    next.saves = next.stats.length > 0
      ? next.stats.map(st => ({ id: `save-${st.id}`, name: st.name, statId: st.id }))
      : dnd.saves.map(sv => ({ ...sv, statId: null }));
  }
  return next;
}

/**
 * Coche ou décoche une catégorie. Cocher Caractéristiques ou Compétences alors que la liste
 * est vide la pré-remplit avec celles de D&D 5e (renommables et supprimables ensuite).
 */
export function toggleCategory(structure: HomebrewStructure, key: HbCategoryKey, on: boolean): HomebrewStructure {
  const next: HomebrewStructure = { ...structure, categories: { ...categoriesOf(structure), [key]: on } };
  if (on && (key === 'stats' || key === 'skills' || key === 'saves')) return prefillDnd(next, key);
  return next;
}

/** Champs d'identité par défaut (style D&D), renommables et supprimables. */
export const DEFAULT_IDENTITY_FIELDS: HbIdentityField[] = [
  { id: 'race', name: 'Race', column: 'race' },
  { id: 'class', name: 'Classe', column: 'class' },
];

/** Liste ordonnée des champs d'identité (modèles anciens : reconstruite depuis race/classe/extra). */
export function identityFieldsOf(structure: HomebrewStructure): HbIdentityField[] {
  const id = structure.identity;
  if (id.fields) return id.fields;
  return [
    ...(id.race ? [{ id: 'race', name: id.race, column: 'race' as const }] : []),
    ...(id.class ? [{ id: 'class', name: id.class, column: 'class' as const }] : []),
    ...(id.extra ?? []),
  ];
}

/** Met à jour les champs d'identité en gardant race / class / extra cohérents pour la fiche. */
export function setIdentityFields(structure: HomebrewStructure, fields: HbIdentityField[]): HomebrewStructure {
  return {
    ...structure,
    identity: {
      ...structure.identity,
      fields,
      race: fields.find(f => f.column === 'race')?.name ?? '',
      class: fields.find(f => f.column === 'class')?.name ?? '',
      extra: fields.filter(f => !f.column),
    },
  };
}

/** Bonus de base au toucher « libre » : saisi par le joueur sur chaque fiche. */
export const BASE_BONUS_FREE = 'libre';

/**
 * Choisit le bonus de base au toucher. Une valeur du catalogue absente du modèle
 * (Bonus de maîtrise, BBA) y est ajoutée, et la catégorie Valeurs spéciales est cochée.
 */
export function setBaseBonus(structure: HomebrewStructure, id: string | null): HomebrewStructure {
  let next = structure;
  const catalog = id === BASE_BONUS_FREE ? undefined : SPECIAL_CATALOG.find(c => c.kind === id);
  if (id && catalog && !structure.specials.some(sp => sp.id === id)) {
    next = {
      ...structure,
      specials: [...structure.specials, { id: catalog.kind, kind: catalog.kind, name: catalog.name, type: catalog.type }],
      categories: { ...categoriesOf(structure), specials: true },
    };
  }
  return { ...next, attacks: { ...next.attacks, baseBonusId: id } };
}
