/**
 * Artisanat Pathfinder 1e (Manuel des joueurs, compétence Artisanat et création d'objets magiques).
 *
 * Objets ordinaires : matières premières = 1/3 du prix ; un test par semaine (ou par jour),
 * progression = résultat × DD en pa (divisée par 7 pour un jour). Échec de 4 ou moins : rien ;
 * échec de 5 ou plus : la moitié des matières est perdue et doit être rachetée.
 *
 * Objets magiques : coût = moitié du prix de base ; 1 jour (8 h) par 1 000 po, 2 h pour une potion
 * ou un parchemin ≤ 250 po ; un test d'Art de la magie DD 5 + NLS (+5 par prérequis manquant).
 */

export interface MundanePreset {
  id: string;
  label: string;
  dc: number;
  /** Prix fixe en po (composants de chef-d'œuvre). */
  priceGp?: number;
  /** Armure ou bouclier : DD = 10 + bonus d'armure. */
  armorBased?: boolean;
  category: 'objet' | 'arme' | 'armure' | 'composant';
}

export const MUNDANE_PRESETS: MundanePreset[] = [
  { id: 'very-simple', label: 'Objet très simple (cuillère en bois)', dc: 5, category: 'objet' },
  { id: 'typical', label: 'Objet courant (marmite en fer)', dc: 10, category: 'objet' },
  { id: 'high-quality', label: 'Objet de qualité (cloche)', dc: 15, category: 'objet' },
  { id: 'complex', label: 'Objet complexe (serrure)', dc: 20, category: 'objet' },
  { id: 'simple-weapon', label: 'Arme courante', dc: 12, category: 'arme' },
  { id: 'martial-weapon', label: 'Arme de guerre', dc: 15, category: 'arme' },
  { id: 'exotic-weapon', label: 'Arme exotique', dc: 18, category: 'arme' },
  { id: 'bow', label: 'Arc court ou long', dc: 12, category: 'arme' },
  { id: 'composite-bow', label: 'Arc composite', dc: 15, category: 'arme' },
  { id: 'crossbow', label: 'Arbalète', dc: 15, category: 'arme' },
  { id: 'armor', label: 'Armure ou bouclier (10 + bonus)', dc: 10, armorBased: true, category: 'armure' },
  { id: 'acid', label: 'Acide', dc: 15, category: 'objet' },
  { id: 'alchemist-fire', label: 'Feu grégeois, bâton fumigène, allume-feu', dc: 20, category: 'objet' },
  { id: 'antitoxin', label: 'Antitoxine, sacoche immobilisante, pierre à tonnerre', dc: 25, category: 'objet' },
  { id: 'trap', label: 'Piège mécanique (simple)', dc: 20, category: 'objet' },
  { id: 'mw-weapon', label: 'Composant de chef-d’œuvre (arme)', dc: 20, priceGp: 300, category: 'composant' },
  { id: 'mw-armor', label: 'Composant de chef-d’œuvre (armure)', dc: 20, priceGp: 150, category: 'composant' },
];

/** Matières premières d'un objet ordinaire, en pc (1/3 du prix). */
export function mundaneMaterialsCp(priceGp: number): number {
  return Math.round((priceGp * 100) / 3);
}

export type CraftCheckOutcome = 'progress' | 'no-progress' | 'ruined';

export interface MundaneCheckResult {
  outcome: CraftCheckOutcome;
  /** Progression gagnée, en pa (peut être fractionnaire pour un jour). */
  progressSp: number;
}

/** Résultat d'un test d'Artisanat pour une semaine ou une journée de travail. */
export function mundaneCheck(total: number, dc: number, period: 'week' | 'day'): MundaneCheckResult {
  if (total < dc) return { outcome: dc - total >= 5 ? 'ruined' : 'no-progress', progressSp: 0 };
  const weekly = total * dc;
  return { outcome: 'progress', progressSp: period === 'week' ? weekly : weekly / 7 };
}

export type MagicItemType = 'potion' | 'scroll' | 'wand' | 'wondrous' | 'arms' | 'ring' | 'staff' | 'rod';

export const MAGIC_ITEM_TYPES: { id: MagicItemType; label: string; feat: string; category: 'potion' | 'parchemin' | 'objet_magique' }[] = [
  { id: 'potion', label: 'Potion', feat: 'Préparation de potions', category: 'potion' },
  { id: 'scroll', label: 'Parchemin', feat: 'Écriture de parchemins', category: 'parchemin' },
  { id: 'wand', label: 'Baguette', feat: 'Création de baguettes magiques', category: 'objet_magique' },
  { id: 'wondrous', label: 'Objet merveilleux', feat: 'Création d’objets merveilleux', category: 'objet_magique' },
  { id: 'arms', label: 'Arme ou armure magique', feat: 'Création d’armes et armures magiques', category: 'objet_magique' },
  { id: 'ring', label: 'Anneau', feat: 'Création d’anneaux magiques', category: 'objet_magique' },
  { id: 'staff', label: 'Bâton', feat: 'Création de bâtons magiques', category: 'objet_magique' },
  { id: 'rod', label: 'Sceptre', feat: 'Création de sceptres magiques', category: 'objet_magique' },
];

/** Prix de base standard des objets à sort unique : niveau de sort (0 compte pour ½) × NLS × facteur. */
const SPELL_ITEM_FACTOR: Partial<Record<MagicItemType, number>> = { potion: 50, scroll: 25, wand: 750 };

export function spellItemBasePrice(type: MagicItemType, spellLevel: number, casterLevel: number): number | null {
  const factor = SPELL_ITEM_FACTOR[type];
  if (!factor) return null;
  return (spellLevel === 0 ? 0.5 : spellLevel) * Math.max(1, casterLevel) * factor;
}

/** Coût de création d'un objet magique, en pc (moitié du prix de base). */
export function magicCostCp(basePriceGp: number): number {
  return Math.round((basePriceGp * 100) / 2);
}

/** Temps de création en heures ; « accélérer » (+5 au DD) divise le temps par deux. */
export function magicCraftHours(type: MagicItemType, basePriceGp: number, accelerated: boolean): number {
  if ((type === 'potion' || type === 'scroll') && basePriceGp <= 250) return 2;
  const days = Math.max(1, Math.ceil(basePriceGp / (accelerated ? 2000 : 1000)));
  return days * 8;
}

export function magicDc(casterLevel: number, missingPrereqs: number, accelerated: boolean): number {
  return 5 + casterLevel + 5 * Math.max(0, missingPrereqs) + (accelerated ? 5 : 0);
}

export type MagicCheckOutcome = 'success' | 'failure' | 'cursed';

export function magicCheck(total: number, dc: number): MagicCheckOutcome {
  if (total >= dc) return 'success';
  return dc - total >= 5 ? 'cursed' : 'failure';
}

export interface Purse { gold: number; silver: number; copper: number }

/**
 * Paie un montant en pc avec les pièces de la bourse, en rendant la monnaie en pa/pc.
 * Retourne null si la bourse est insuffisante.
 */
export function payFromPurse(purse: Purse, costCp: number): Purse | null {
  const cost = Math.max(0, Math.round(costCp));
  const total = purse.gold * 100 + purse.silver * 10 + purse.copper;
  if (total < cost) return null;
  let { gold, silver, copper } = purse;
  let rest = cost;
  const fromCopper = Math.min(copper, rest);
  copper -= fromCopper; rest -= fromCopper;
  const fromSilver = Math.min(silver, Math.ceil(rest / 10));
  silver -= fromSilver; rest -= fromSilver * 10;
  if (rest > 0) {
    const fromGold = Math.ceil(rest / 100);
    gold -= fromGold; rest -= fromGold * 100;
  }
  const change = -rest;
  silver += Math.floor(change / 10);
  copper += change % 10;
  return { gold, silver, copper };
}

/** « 12 po 3 pa 4 pc » à partir d'un montant en pc. */
export function formatCp(cp: number): string {
  const v = Math.round(cp);
  const parts = [[Math.floor(v / 100), 'po'], [Math.floor((v % 100) / 10), 'pa'], [v % 10, 'pc']] as const;
  const shown = parts.filter(([n]) => n > 0).map(([n, u]) => `${n} ${u}`);
  return shown.length ? shown.join(' ') : '0 pc';
}
