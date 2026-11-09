import { describe, expect, it } from 'vitest';
import {
  formatCp, magicCheck, magicCostCp, magicCraftHours, magicDc, mundaneCheck, mundaneMaterialsCp, payFromPurse, spellItemBasePrice,
} from './crafting';

describe('artisanat ordinaire', () => {
  it('matières premières = 1/3 du prix', () => {
    expect(mundaneMaterialsCp(15)).toBe(500); // épée longue 15 po → 5 po
    expect(mundaneMaterialsCp(300)).toBe(10000);
  });

  it('progression = résultat × DD en pa par semaine, /7 par jour', () => {
    expect(mundaneCheck(20, 15, 'week')).toEqual({ outcome: 'progress', progressSp: 300 });
    expect(mundaneCheck(21, 15, 'day').progressSp).toBeCloseTo(45);
  });

  it('échec de 4 ou moins : pas de progrès ; de 5 ou plus : matières gâchées', () => {
    expect(mundaneCheck(11, 15, 'week').outcome).toBe('no-progress');
    expect(mundaneCheck(10, 15, 'week').outcome).toBe('ruined');
  });
});

describe('objets magiques', () => {
  it('prix de base des objets à sort', () => {
    expect(spellItemBasePrice('potion', 1, 1)).toBe(50); // soins légers
    expect(spellItemBasePrice('scroll', 0, 1)).toBe(12.5);
    expect(spellItemBasePrice('wand', 1, 1)).toBe(750);
    expect(spellItemBasePrice('wondrous', 1, 1)).toBeNull();
  });

  it('coût = moitié du prix de base', () => {
    expect(magicCostCp(750)).toBe(37500);
  });

  it('temps : 2 h pour potion/parchemin ≤ 250 po, sinon 1 jour par 1 000 po', () => {
    expect(magicCraftHours('potion', 50, false)).toBe(2);
    expect(magicCraftHours('potion', 300, false)).toBe(8);
    expect(magicCraftHours('wondrous', 2500, false)).toBe(24);
    expect(magicCraftHours('wondrous', 2500, true)).toBe(16);
    expect(magicCraftHours('wondrous', 200, false)).toBe(8);
  });

  it('DD 5 + NLS, +5 par prérequis manquant, +5 pour accélérer', () => {
    expect(magicDc(3, 0, false)).toBe(8);
    expect(magicDc(3, 1, true)).toBe(18);
  });

  it('échec de 5 ou plus : objet maudit', () => {
    expect(magicCheck(10, 10)).toBe('success');
    expect(magicCheck(7, 10)).toBe('failure');
    expect(magicCheck(5, 10)).toBe('cursed');
  });
});

describe('bourse', () => {
  it('paie avec les pièces disponibles et rend la monnaie', () => {
    expect(payFromPurse({ gold: 10, silver: 0, copper: 0 }, 500)).toEqual({ gold: 5, silver: 0, copper: 0 });
    expect(payFromPurse({ gold: 20, silver: 0, copper: 0 }, 1250)).toEqual({ gold: 7, silver: 5, copper: 0 });
    // 1 po 3 pa 5 pc = 135 pc ; reste 98 pc, la po est cassée pour faire l'appoint.
    expect(payFromPurse({ gold: 1, silver: 3, copper: 5 }, 37)).toEqual({ gold: 0, silver: 9, copper: 8 });
  });

  it('refuse si la bourse est insuffisante', () => {
    expect(payFromPurse({ gold: 1, silver: 0, copper: 0 }, 101)).toBeNull();
  });

  it('formate un montant', () => {
    expect(formatCp(1234)).toBe('12 po 3 pa 4 pc');
    expect(formatCp(0)).toBe('0 pc');
  });
});
