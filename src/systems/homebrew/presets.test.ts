import { describe, expect, it } from 'vitest';
import { presetStructure, removeSpecial, removeStat } from './presets';

describe('pré-remplissage des systèmes homebrew', () => {
  it('D&D 5e : 6 caractéristiques, 18 compétences, 6 sauvegardes, maîtrise et inspiration', () => {
    const s = presetStructure('dnd5e');
    expect(s.stats).toHaveLength(6);
    expect(s.skills).toHaveLength(18);
    expect(s.saves).toHaveLength(6);
    expect(s.proficiency).toBe(true);
    expect(s.specials.map(x => x.kind)).toEqual(['inspiration', 'proficiency', 'passive_perception']);
    expect(s.attacks.baseBonusId).toBe('proficiency');
  });

  it('Pathfinder 1e : 35 compétences, 3 sauvegardes, BBA/BMO/DMD', () => {
    const s = presetStructure('pf1e');
    expect(s.skills).toHaveLength(35);
    expect(s.saves.map(x => x.name)).toEqual(['Vigueur', 'Réflexes', 'Volonté']);
    expect(s.specials.map(x => x.kind)).toEqual(['bab', 'cmb', 'cmd']);
    expect(s.attacks.baseBonusId).toBe('bab');
  });

  it('les compétences et défenses pointent vers des caractéristiques existantes', () => {
    for (const base of ['dnd5e', 'pf1e'] as const) {
      const s = presetStructure(base);
      const statIds = new Set(s.stats.map(x => x.id));
      for (const linked of [...s.skills, ...s.saves, ...s.combat]) {
        if (linked.statId) expect(statIds.has(linked.statId)).toBe(true);
      }
      expect(new Set(s.skills.map(x => x.id)).size).toBe(s.skills.length);
    }
  });

  it('Libre : caractéristiques D&D par défaut, le reste vide', () => {
    const s = presetStructure('libre');
    expect(s.stats).toHaveLength(6);
    expect(s.skills).toHaveLength(0);
    expect(s.attacks.enabled).toBe(false);
  });

  it('supprimer une caractéristique détache ce qui y était relié', () => {
    const s = removeStat(presetStructure('dnd5e'), 'dex');
    expect(s.stats.some(x => x.id === 'dex')).toBe(false);
    expect(s.combat.find(x => x.id === 'ca')?.statId).toBeNull();
    expect(s.skills.find(x => x.id === 'acrobaties')?.statId).toBeNull();
  });

  it('supprimer la valeur spéciale servant de bonus de base la retire des attaques', () => {
    const s = removeSpecial(presetStructure('dnd5e'), 'proficiency');
    expect(s.attacks.baseBonusId).toBeNull();
  });
});

describe('catégories cochées / décochées', () => {
  it('par défaut, toutes les catégories sont cochées', async () => {
    const { categoriesOf } = await import('./presets');
    expect(Object.values(categoriesOf(presetStructure('dnd5e'))).every(Boolean)).toBe(true);
  });

  it('une catégorie décochée est vidée dans la fiche mais conservée dans le modèle', async () => {
    const { sheetStructure } = await import('./presets');
    const model = presetStructure('dnd5e');
    model.categories = { stats: false, skills: true, saves: false, gauges: true, combat: true, specials: true, attacks: false, currencies: true };
    const sheet = sheetStructure(model);
    expect(sheet.stats).toHaveLength(0);
    expect(sheet.saves).toHaveLength(0);
    expect(sheet.skills.every(s => s.statId === null)).toBe(true);
    expect(sheet.attacks.enabled).toBe(false);
    expect(model.stats).toHaveLength(6);
    expect(model.skills[0].statId).not.toBeNull();
  });
});

describe('cocher une catégorie vide', () => {
  it('Libre : seules les caractéristiques sont cochées au départ', async () => {
    const { categoriesOf } = await import('./presets');
    const on = categoriesOf(presetStructure('libre'));
    expect(Object.entries(on).filter(([, v]) => v).map(([k]) => k)).toEqual(['stats']);
  });

  it('cocher Caractéristiques puis Compétences pré-remplit D&D, reliées', async () => {
    const { toggleCategory } = await import('./presets');
    const empty = { ...presetStructure('libre'), stats: [] };
    let s = toggleCategory(toggleCategory(empty, 'stats', false), 'stats', true);
    expect(s.stats.map(x => x.short)).toEqual(['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA']);
    s = toggleCategory(s, 'skills', true);
    expect(s.skills).toHaveLength(18);
    expect(s.skills.find(x => x.id === 'acrobaties')?.statId).toBe('dex');
  });

  it('Compétences cochées avant Caractéristiques : reliées dès que les caractéristiques arrivent', async () => {
    const { toggleCategory } = await import('./presets');
    let s = toggleCategory({ ...presetStructure('libre'), stats: [] }, 'skills', true);
    expect(s.skills.every(x => x.statId === null)).toBe(true);
    s = toggleCategory(s, 'stats', true);
    expect(s.skills.find(x => x.id === 'athletisme')?.statId).toBe('for');
  });

  it('cocher une catégorie déjà remplie garde son contenu', async () => {
    const { toggleCategory } = await import('./presets');
    const base = presetStructure('dnd5e');
    base.stats = [{ id: 'x', name: 'Volonté', short: 'VOL', showMod: true }];
    const s = toggleCategory(toggleCategory(base, 'stats', false), 'stats', true);
    expect(s.stats.map(x => x.name)).toEqual(['Volonté']);
  });
});

describe('identité', () => {
  it('par défaut : Race et Classe (style D&D)', async () => {
    const { identityFieldsOf } = await import('./presets');
    expect(identityFieldsOf(presetStructure('libre')).map(f => f.name)).toEqual(['Race', 'Classe']);
  });

  it('supprimer la race (jeu « tous humains ») vide son libellé', async () => {
    const { identityFieldsOf, setIdentityFields } = await import('./presets');
    const s = presetStructure('libre');
    const next = setIdentityFields(s, identityFieldsOf(s).filter(f => f.column !== 'race'));
    expect(next.identity.race).toBe('');
    expect(next.identity.class).toBe('Classe');
  });

  it('modèle ancien : champs reconstruits depuis race, classe et champs ajoutés', async () => {
    const { identityFieldsOf } = await import('./presets');
    const s = presetStructure('dnd5e');
    s.identity = { race: 'Peuple', class: 'Vocation', showLevel: true, extra: [{ id: 'x', name: 'Divinité' }] };
    expect(identityFieldsOf(s).map(f => f.name)).toEqual(['Peuple', 'Vocation', 'Divinité']);
  });
});

describe('sauvegardes', () => {
  it('cocher Sauvegardes : une par caractéristique, reliée', async () => {
    const { toggleCategory } = await import('./presets');
    const s = toggleCategory(presetStructure('libre'), 'saves', true);
    expect(s.saves.map(x => [x.name, x.statId])).toEqual([
      ['Force', 'for'], ['Dextérité', 'dex'], ['Constitution', 'con'], ['Intelligence', 'int'], ['Sagesse', 'sag'], ['Charisme', 'cha'],
    ]);
  });

  it('suit les caractéristiques renommées ou ajoutées', async () => {
    const { toggleCategory } = await import('./presets');
    const base = { ...presetStructure('libre'), stats: [{ id: 'esp', name: 'Esprit', short: 'ESP', showMod: true }] };
    expect(toggleCategory(base, 'saves', true).saves).toEqual([{ id: 'save-esp', name: 'Esprit', statId: 'esp' }]);
  });

  it('sans caractéristiques : 6 sauvegardes D&D, reliées dès que les caractéristiques arrivent', async () => {
    const { toggleCategory } = await import('./presets');
    let s = toggleCategory({ ...presetStructure('libre'), stats: [] }, 'saves', true);
    expect(s.saves.every(x => x.statId === null)).toBe(true);
    s = toggleCategory(toggleCategory(s, 'stats', false), 'stats', true);
    expect(s.saves.find(x => x.id === 'save-dex')?.statId).toBe('dex');
  });
});

describe('bonus de base au toucher', () => {
  it('choisir BBA absent l’ajoute aux valeurs spéciales et coche la catégorie', async () => {
    const { setBaseBonus, categoriesOf } = await import('./presets');
    const s = setBaseBonus(presetStructure('libre'), 'bab');
    expect(s.attacks.baseBonusId).toBe('bab');
    expect(s.specials.map(x => x.name)).toEqual(['Bonus de base à l’attaque (BBA)']);
    expect(categoriesOf(s).specials).toBe(true);
  });

  it('choisir une valeur déjà présente ne la duplique pas ; « Aucun » vide le choix', async () => {
    const { setBaseBonus } = await import('./presets');
    const s = setBaseBonus(presetStructure('dnd5e'), 'proficiency');
    expect(s.specials.filter(x => x.kind === 'proficiency')).toHaveLength(1);
    expect(setBaseBonus(s, null).attacks.baseBonusId).toBeNull();
  });

  it('« Libre » : saisi par le joueur, aucune valeur spéciale ajoutée', async () => {
    const { setBaseBonus } = await import('./presets');
    const s = setBaseBonus(presetStructure('libre'), 'libre');
    expect(s.attacks.baseBonusId).toBe('libre');
    expect(s.specials).toHaveLength(0);
  });
});

it('fiche : sans valeurs spéciales, le bonus « Libre » est conservé', async () => {
  const { sheetStructure, setBaseBonus } = await import('./presets');
  const s = setBaseBonus(presetStructure('libre'), 'libre');
  expect(sheetStructure({ ...s, categories: { ...s.categories!, specials: false, attacks: true } }).attacks.baseBonusId).toBe('libre');
});

describe('lot 5 : valeurs par défaut des anciens modèles', () => {
  it('un seul repos automatique, présent sur la fiche', async () => {
    const { restsOf, restsEnabled } = await import('./presets');
    const s = presetStructure('libre');
    expect(restsOf(s)).toEqual([{ id: 'repos', name: 'Repos', auto: true }]);
    expect(restsEnabled(s)).toBe(true);
  });

  it('gestion des sorts déduite de l’ancienne case « emplacements »', async () => {
    const { spellModeOf } = await import('./presets');
    expect(spellModeOf({ ...presetStructure('dnd5e'), spellSlots: true })).toBe('slots');
    expect(spellModeOf({ ...presetStructure('dnd5e'), spellSlots: false })).toBe('free');
    expect(spellModeOf({ ...presetStructure('dnd5e'), spellMode: 'prepared' })).toBe('prepared');
  });

  it('inventaire : Armes (DM), Armures (Bonus), Équipement', async () => {
    const { itemCategoriesOf } = await import('./presets');
    expect(itemCategoriesOf(presetStructure('libre')).map(c => [c.id, c.fields])).toEqual([
      ['arme', ['dm']], ['armure', ['bonus']], ['objet', []],
    ]);
  });
});
