import { describe, expect, it } from 'vitest';
import { applyPf1Class, createPf1Data } from './defaults';
import { abilityMod, baseAttackBonus, baseSave, bonusSpells, computePf1Sheet, iterativeAttacks } from './rules';
import type { Pf1Data } from './types';

/** Vesper : Sylphe Magus niveau 3, valeurs vérifiées à la main (fiche PDF). */
function vesper(): Pf1Data {
  const data = applyPf1Class(createPf1Data(), 'magus');
  return {
    ...data,
    baseScores: { str: 12, dex: 14, con: 13, int: 15, wis: 12, cha: 13 },
    racialMods: { dex: 2, int: 2, con: -2 },
    armor: { name: 'Armure de cuir cloutée', bonus: 3, maxDex: 5, checkPenalty: -1, spellFailure: 15 },
    initiativeMisc: 2, // trait Réactif
    defensiveCastingBonus: 4, // Magie de guerre
    skillRanks: { spellcraft: 3, 'k-arcana': 3, 'use-magic-device': 2, perception: 3, acrobatics: 2, perform: 2 },
    attacks: [{
      id: 'cimeterre', name: 'Cimeterre', attackStat: 'dex', damageStat: 'dex', damageDice: '1d6',
      enhancement: 0, attackMisc: 0, damageMisc: 0, critRange: '18-20', critMultiplier: 2,
    }],
  };
}

describe('formules de base', () => {
  it('modificateurs', () => {
    expect(abilityMod(10)).toBe(0);
    expect(abilityMod(11)).toBe(0);
    expect(abilityMod(17)).toBe(3);
    expect(abilityMod(7)).toBe(-2);
  });
  it('BBA et attaques multiples', () => {
    expect(baseAttackBonus('full', 6)).toBe(6);
    expect(baseAttackBonus('medium', 3)).toBe(2);
    expect(baseAttackBonus('medium', 8)).toBe(6);
    expect(baseAttackBonus('poor', 5)).toBe(2);
    expect(iterativeAttacks(6)).toEqual([6, 1]);
    expect(iterativeAttacks(11)).toEqual([11, 6, 1]);
  });
  it('sauvegardes de base', () => {
    expect(baseSave(true, 3)).toBe(3);
    expect(baseSave(false, 3)).toBe(1);
  });
  it('sorts en bonus', () => {
    expect(bonusSpells(3, 1)).toBe(1);
    expect(bonusSpells(3, 4)).toBe(0);
    expect(bonusSpells(5, 1)).toBe(2);
  });
});

describe('Vesper, Magus 3', () => {
  const sheet = computePf1Sheet(vesper(), 3);

  it('caractéristiques avec la race', () => {
    expect(sheet.scores).toEqual({ str: 12, dex: 16, con: 11, int: 17, wis: 12, cha: 13 });
  });
  it('défense', () => {
    expect(sheet.ac.total).toBe(16);
    expect(sheet.touchAc.total).toBe(13);
    expect(sheet.flatFootedAc.total).toBe(13);
    expect(sheet.cmb.total).toBe(3);
    expect(sheet.cmd.total).toBe(16);
  });
  it('initiative et sauvegardes', () => {
    expect(sheet.initiative.total).toBe(5);
    expect(sheet.saves.fort.total).toBe(3);
    expect(sheet.saves.ref.total).toBe(4);
    expect(sheet.saves.will.total).toBe(4);
  });
  it('cimeterre avec Dervish Dance', () => {
    expect(sheet.bab).toBe(2);
    expect(sheet.attacks[0].bonuses).toEqual([5]);
    expect(sheet.attacks[0].damage).toBe('1d6+3');
  });
  it('magie', () => {
    const sc = sheet.spellcasting!;
    expect(sc.perDay).toEqual([4, 4]);
    expect(sc.dcByLevel[1]).toBe(14);
    expect(sc.concentration.total).toBe(6);
    expect(sc.defensiveConcentration.total).toBe(10);
  });
  it('compétences', () => {
    const get = (id: string) => sheet.skills.find(s => s.id === id)!.value.total;
    expect(get('spellcraft')).toBe(9);
    expect(get('k-arcana')).toBe(9);
    expect(get('use-magic-device')).toBe(6);
    expect(get('perception')).toBe(4);
    expect(get('acrobatics')).toBe(4);
    expect(get('perform')).toBe(3);
    expect(get('sense-motive')).toBe(1);
    expect(sheet.skillRanksBudget).toBe(15);
    expect(sheet.skillRanksSpent).toBe(15);
  });
  it('une armure limite la Dex à la CA', () => {
    const data = { ...vesper(), armor: { name: 'Lamellaire en cuir', bonus: 4, maxDex: 3, checkPenalty: -2, spellFailure: 20 } };
    const s = computePf1Sheet(data, 3);
    expect(s.ac.total).toBe(17);
    expect(s.flatFootedAc.total).toBe(14);
    expect(s.skills.find(k => k.id === 'acrobatics')!.value.total).toBe(3);
  });
  it('au niveau 4, les sorts de niveau 2 arrivent', () => {
    const s = computePf1Sheet(vesper(), 4);
    expect(s.spellcasting!.perDay).toEqual([4, 4, 2]);
  });
});
