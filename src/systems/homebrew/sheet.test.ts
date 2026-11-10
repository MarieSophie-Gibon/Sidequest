import { describe, expect, it } from 'vitest';
import { presetStructure } from './presets';
import { combatTotal, createHomebrewData, normalizeHomebrewData, proficiencyBonus, rollTotal, setValue, statMod } from './sheet';

describe('fiche homebrew', () => {
  it('modificateur de caractéristique', () => {
    expect(statMod(10)).toBe(0);
    expect(statMod(15)).toBe(2);
    expect(statMod(8)).toBe(-1);
  });

  it('fiche vide : caractéristiques à 10, structure copiée (pas partagée)', () => {
    const structure = presetStructure('dnd5e');
    const data = createHomebrewData(structure);
    expect(data.values.stats.dex).toBe(10);
    expect(data.values.specials.inspiration).toBe(false);
    structure.stats[0].name = 'Modifiée';
    expect(data.structure.stats[0].name).toBe('Force');
  });

  it('compétence : mod. + maîtrise cochée + divers', () => {
    let data = createHomebrewData(presetStructure('dnd5e'));
    data = setValue(data, 'stats', 'dex', 16);
    data = setValue(data, 'specials', 'proficiency', 2);
    const acro = data.structure.skills.find(s => s.id === 'acrobaties')!;
    expect(rollTotal(data, acro, 'skills').total).toBe(3);
    data = setValue(data, 'skills', 'acrobaties', { bonus: 1, prof: true });
    expect(rollTotal(data, acro, 'skills')).toEqual({ total: 6, parts: [['DEX', 3], ['Maîtrise', 2], ['Divers', 1]] });
  });

  it('pas de maîtrise si le système ne l’a pas activée', () => {
    let data = createHomebrewData(presetStructure('pf1e'));
    const save = data.structure.saves[0];
    data = setValue(data, 'saves', save.id, { bonus: 0, prof: true });
    expect(proficiencyBonus(data)).toBe(0);
    expect(rollTotal(data, save, 'saves').parts.some(([l]) => l === 'Maîtrise')).toBe(false);
  });

  it('CA reliée à la DEX : base + modificateur', () => {
    let data = createHomebrewData(presetStructure('dnd5e'));
    data = setValue(data, 'stats', 'dex', 14);
    data = setValue(data, 'combat', 'ca', 10);
    expect(combatTotal(data, data.structure.combat.find(c => c.id === 'ca')!).total).toBe(12);
    expect(combatTotal(data, data.structure.combat.find(c => c.id === 'vit')!).total).toBe(0);
  });

  it('relit une fiche incomplète', () => {
    expect(normalizeHomebrewData(null)).toBeNull();
    const data = normalizeHomebrewData({ structure: presetStructure('libre') });
    expect(data?.values.skills).toEqual({});
  });
});

describe('règle des modificateurs', () => {
  it('D&D par défaut : 10 = 0, 12 = +1', async () => {
    const { statModifier } = await import('./sheet');
    let data = createHomebrewData(presetStructure('dnd5e'));
    data = setValue(data, 'stats', 'for', 12);
    expect(statModifier(data, 'for')).toBe(1);
  });

  it('Libre : modificateur saisi par le joueur, utilisé dans les totaux', async () => {
    const { statModifier } = await import('./sheet');
    const structure = { ...presetStructure('dnd5e'), modifierRule: 'libre' as const };
    let data = createHomebrewData(structure);
    data = setValue(data, 'stats', 'dex', 18);
    expect(statModifier(data, 'dex')).toBe(0);
    data = setValue(data, 'statMods', 'dex', 2);
    expect(statModifier(data, 'dex')).toBe(2);
    data = setValue(data, 'combat', 'ca', 10);
    expect(combatTotal(data, data.structure.combat.find(c => c.id === 'ca')!).total).toBe(12);
  });
});
