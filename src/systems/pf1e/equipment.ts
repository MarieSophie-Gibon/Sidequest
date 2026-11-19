import type { Item } from '../../types/rpg.types';
import type { Pf1Armor, Pf1ArmorStats, Pf1ArmorType, Pf1Data, Pf1ItemStats, Pf1WeaponCategory, Pf1WeaponStats, Pf1WeaponType } from './types';

export const PF1_ARMOR_TYPES: { key: Pf1ArmorType; label: string }[] = [
  { key: 'legere', label: 'Légère' },
  { key: 'intermediaire', label: 'Intermédiaire' },
  { key: 'lourde', label: 'Lourde' },
  { key: 'bouclier', label: 'Bouclier' },
];

export const PF1_WEAPON_CATEGORIES: { key: Pf1WeaponCategory; label: string }[] = [
  { key: 'courante', label: 'Courante' },
  { key: 'guerre', label: 'De guerre' },
  { key: 'exotique', label: 'Exotique' },
];

export const PF1_WEAPON_TYPES: { key: Pf1WeaponType; label: string }[] = [
  { key: 'legere', label: 'CàC légère' },
  { key: 'une-main', label: 'CàC à une main' },
  { key: 'deux-mains', label: 'CàC à deux mains' },
  { key: 'distance', label: 'À distance' },
];

export function defaultPf1Armor(): Pf1ArmorStats {
  return { kind: 'armor', armorType: 'legere', price: '', bonus: 0, maxDex: null, checkPenalty: 0, spellFailure: 0, speed: '', weight: 0 };
}

export function defaultPf1Weapon(): Pf1WeaponStats {
  return {
    kind: 'weapon', category: 'courante', weaponType: 'une-main', price: '', damage: '1d6', critRange: '20', critMultiplier: 2,
    rangeIncrement: '', weight: 0, damageType: '', special: '',
  };
}

/** Fiche PF1 attendue pour une catégorie d'objet : celle saisie si elle correspond, sinon une fiche vide. */
export function pf1StatsForCategory(category: string, stats: Pf1ItemStats | null | undefined): Pf1ItemStats | null {
  if (category === 'armure') return stats?.kind === 'armor' ? stats : defaultPf1Armor();
  if (category === 'arme') return stats?.kind === 'weapon' ? stats : defaultPf1Weapon();
  return null;
}

/** « 19-20/×2 », ou « ×3 » pour une zone de critique de 20. */
export function formatPf1Crit(range: string, multiplier: number): string {
  const r = range.trim();
  return r && r !== '20' ? `${r}/×${multiplier}` : `×${multiplier}`;
}

function toPf1Armor(item: Item, stats: Pf1ArmorStats): Pf1Armor {
  return { name: item.name, bonus: stats.bonus, maxDex: stats.maxDex, checkPenalty: stats.checkPenalty, spellFailure: stats.spellFailure };
}

/** Armure et bouclier équipés dans l'inventaire (le premier de chaque sorte). */
export function equippedPf1Armor(items: Item[]) {
  const equipped = items.filter(it => it.equipped && it.pf1?.kind === 'armor');
  const armor = equipped.find(it => (it.pf1 as Pf1ArmorStats).armorType !== 'bouclier');
  const shield = equipped.find(it => (it.pf1 as Pf1ArmorStats).armorType === 'bouclier');
  return {
    armor: armor ? toPf1Armor(armor, armor.pf1 as Pf1ArmorStats) : null,
    shield: shield ? toPf1Armor(shield, shield.pf1 as Pf1ArmorStats) : null,
  };
}

/**
 * Applique l'inventaire aux réglages du personnage avant le calcul de la fiche :
 * - une armure ou un bouclier équipé remplace celui saisi dans « Défense » ;
 * - une attaque reliée à une arme reprend ses dégâts et son critique.
 */
export function applyPf1Equipment(data: Pf1Data, items: Item[]): Pf1Data {
  const { armor, shield } = equippedPf1Armor(items);
  const byId = new Map(items.map(it => [it.id, it]));
  return {
    ...data,
    armor: armor ?? data.armor,
    shield: shield ?? data.shield,
    attacks: data.attacks.map(attack => {
      const weapon = attack.itemId ? byId.get(attack.itemId)?.pf1 : undefined;
      if (weapon?.kind !== 'weapon') return attack;
      return {
        ...attack,
        damageDice: weapon.damage || attack.damageDice,
        critRange: weapon.critRange || '20',
        critMultiplier: weapon.critMultiplier,
        weaponInfo: [weapon.damageType, weapon.rangeIncrement && `portée ${weapon.rangeIncrement}`, weapon.special].filter(Boolean).join(' · '),
      };
    }),
  };
}
