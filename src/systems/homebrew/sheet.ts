import type { HbCombatValue, HbSave, HbSkill, HomebrewStructure } from './types';

/**
 * Fiche homebrew (characters.system_data) : copie figée de la structure du modèle
 * + valeurs saisies par le joueur. Seuls calculs : modificateur de caractéristique,
 * valeur reliée à une caractéristique, bonus de maîtrise sur un élément coché.
 */

export interface HbRollValue { bonus: number; prof: boolean }
export interface HbGaugeValue { current: number; max: number }

export interface HomebrewValues {
  stats: Record<string, number>;
  skills: Record<string, HbRollValue>;
  saves: Record<string, HbRollValue>;
  /** Base saisie par le joueur ; le modificateur de la caractéristique reliée s'y ajoute. */
  combat: Record<string, number>;
  specials: Record<string, number | boolean>;
  gauges: Record<string, HbGaugeValue>;
  currencies: Record<string, number>;
  /** Champs d'identité ajoutés par le MJ (texte libre). */
  identity: Record<string, string>;
  /** Modificateurs saisis par le joueur (règle « libre »). */
  statMods: Record<string, number>;
  /** Sorts préparés (gestion « sorts préparés ») : un même sort peut être préparé plusieurs fois. */
  prepared?: HbPreparedSpell[];
}

export interface HbPreparedSpell { id: string; spellId: string; cast: boolean }

export interface HomebrewData {
  version: 1;
  structure: HomebrewStructure;
  values: HomebrewValues;
}

export type HbBreakdown = { total: number; parts: [label: string, value: number][] };

export function statMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** Nouvelle fiche vide à partir du modèle (caractéristiques à 10, jauges pleines). */
export function createHomebrewData(structure: HomebrewStructure): HomebrewData {
  return {
    version: 1,
    structure: structuredClone(structure),
    values: {
      stats: Object.fromEntries(structure.stats.map(s => [s.id, 10])),
      skills: {},
      saves: {},
      combat: {},
      specials: Object.fromEntries(structure.specials.map(sp => [sp.id, sp.type === 'checkbox' ? false : 0])),
      gauges: Object.fromEntries(structure.gauges.map(g => [g.id, { current: g.defaultMax, max: g.defaultMax }])),
      currencies: {},
      identity: {},
      statMods: {},
    },
  };
}

/** Relit system_data et complète les valeurs manquantes (fiche ancienne ou partielle). */
export function normalizeHomebrewData(raw: unknown): HomebrewData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<HomebrewData>;
  if (!r.structure) return null;
  const v = (r.values ?? {}) as Partial<HomebrewValues>;
  return {
    version: 1,
    structure: r.structure,
    values: {
      stats: { ...(v.stats ?? {}) },
      skills: { ...(v.skills ?? {}) },
      saves: { ...(v.saves ?? {}) },
      combat: { ...(v.combat ?? {}) },
      specials: { ...(v.specials ?? {}) },
      gauges: { ...(v.gauges ?? {}) },
      currencies: { ...(v.currencies ?? {}) },
      identity: { ...(v.identity ?? {}) },
      statMods: { ...(v.statMods ?? {}) },
    },
  };
}

/** Modificateur d'une caractéristique selon la règle du modèle (D&D par défaut, ou saisi par le joueur). */
export function statModifier(data: HomebrewData, statId: string): number {
  if (data.structure.modifierRule === 'libre') return data.values.statMods[statId] ?? 0;
  return statMod(statValue(data, statId));
}

export function statValue(data: HomebrewData, statId: string): number {
  return data.values.stats[statId] ?? 10;
}

function statPart(data: HomebrewData, statId: string | null): [string, number] | null {
  if (!statId) return null;
  const stat = data.structure.stats.find(s => s.id === statId);
  if (!stat) return null;
  return [stat.short || stat.name, statModifier(data, statId)];
}

/** Valeur du « Bonus de maîtrise » du système (0 s'il n'existe pas). */
export function proficiencyBonus(data: HomebrewData): number {
  const special = data.structure.specials.find(sp => sp.kind === 'proficiency');
  const value = special ? data.values.specials[special.id] : 0;
  return typeof value === 'number' ? value : 0;
}

/** Total d'une compétence ou d'une sauvegarde : mod. de caractéristique + maîtrise cochée + divers. */
export function rollTotal(data: HomebrewData, item: HbSkill | HbSave, kind: 'skills' | 'saves'): HbBreakdown {
  const value = data.values[kind][item.id] ?? { bonus: 0, prof: false };
  const parts: [string, number][] = [];
  const stat = statPart(data, item.statId);
  if (stat) parts.push(stat);
  if (data.structure.proficiency && value.prof) parts.push(['Maîtrise', proficiencyBonus(data)]);
  if (value.bonus) parts.push(['Divers', value.bonus]);
  return { total: parts.reduce((s, [, n]) => s + n, 0), parts };
}

/** Valeur de défense ou de combat : base saisie + mod. de la caractéristique reliée. */
export function combatTotal(data: HomebrewData, item: HbCombatValue): HbBreakdown {
  const base = data.values.combat[item.id] ?? 0;
  const parts: [string, number][] = [['Base', base]];
  const stat = statPart(data, item.statId);
  if (stat) parts.push(stat);
  return { total: parts.reduce((s, [, n]) => s + n, 0), parts };
}

/** Met à jour une valeur sans muter l'objet d'origine. */
export function setValue<K extends Exclude<keyof HomebrewValues, 'prepared'>>(
  data: HomebrewData, kind: K, id: string, value: HomebrewValues[K][string],
): HomebrewData {
  return { ...data, values: { ...data.values, [kind]: { ...data.values[kind], [id]: value } } };
}

export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
