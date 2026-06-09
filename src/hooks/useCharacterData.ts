import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { DEFAULT_SKILLS_TEMPLATES } from '../constants';
import type { Character, Feature, Spell, Item, Skill, SpellSlot, Resource } from '../types/rpg.types';
import type { User } from './useAuth';

export interface NewFeatureState {
  id?: string;
  name: string;
  max: number;
  recharge: string;
  description: string;
  category: string;
  type: string;
  current?: number;
  resource_id: string;
  resource_cost: number;
}

export interface NewResourceState {
  id?: string;
  name: string;
  max: number;
  current: number;
  recharge: 'SHORT_REST' | 'LONG_REST';
}

export interface NewSpellState {
  id?: string;
  name: string;
  level: number;
  range: string;
  casting_type: 'action' | 'bonus' | 'reaction';
  is_aoe: boolean;
  save_type: string;
  save_effect: string;
  concentration: boolean;
  damage: string;
  desc: string;
}

export interface NewItemState {
  name: string;
  quantity: number;
  equipped: boolean;
  category: 'objet' | 'arme' | 'armure';
  damage: string;
  range: string;
  defense_bonus: number;
}

export interface NewSpellSlotState {
  level: number;
  max: number;
  current: number;
}

export function useCharacterData(user: User | null, showAlert: (title: string, text: string) => void) {
  const [view, setView] = useState<'dashboard' | 'sheet'>('dashboard');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeChar, setActiveChar] = useState<Character | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlot[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal form states
  const [newFeature, setNewFeature] = useState<NewFeatureState>({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type: 'classe', resource_id: '', resource_cost: 0 });
  const [newResource, setNewResource] = useState<NewResourceState>({ name: '', max: 10, current: 10, recharge: 'LONG_REST' });
  const [newSpell, setNewSpell] = useState<NewSpellState>({ name: '', level: 0, range: '', casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', desc: '' });
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
  const [newSpellSlot, setNewSpellSlot] = useState<NewSpellSlotState>({ level: 1, max: 4, current: 4 });

  async function fetchCharactersList() {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur récupération liste :", error.message);
    } else {
      setCharacters(data || []);
    }
  }

  // Init: check session
  useEffect(() => {
    async function checkUserSession() {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchCharactersList();
        }
      } catch (err) {
        console.error("Erreur d'initialisation de session :", err);
      } finally {
        setLoading(false);
      }
    }

    checkUserSession();
  }, [user]);

  // Spell slots sync
  useEffect(() => {
    if (!activeChar) return;

    const activeSpellLevels = [...new Set(spells.map(s => Number(s.level)).filter(lvl => lvl > 0))];

    const updateSlots = async () => {
      const nextSlots = activeSpellLevels.map(lvl => {
        let defaultMaxSlots = 3;
        if (lvl === 1) defaultMaxSlots = 4;
        else if (lvl >= 2 && lvl <= 5) defaultMaxSlots = 3;
        else if (lvl >= 6 && lvl <= 7) defaultMaxSlots = 2;
        else if (lvl >= 8 && lvl <= 9) defaultMaxSlots = 1;

        const existing = spellSlots.find(s => s.level === lvl);
        const effectiveMax = existing ? existing.max : defaultMaxSlots;
        return {
          level: lvl,
          max: effectiveMax,
          current: existing ? Math.min(existing.current, effectiveMax) : effectiveMax
        };
      }).sort((a, b) => a.level - b.level);

      setSpellSlots(nextSlots);

      for (const slot of nextSlots) {
        await supabase.from('spell_slots').upsert({
          character_id: activeChar.id,
          level: slot.level,
          max: slot.max,
          current: slot.current
        }, { onConflict: 'character_id,level' });
      }
    };

    updateSlots();
  }, [spells, activeChar]);

  async function loadCharacterData(charId: string) {
    setLoading(true);
    try {
      const { data: char, error: charErr } = await supabase.from('characters').select('*').eq('id', charId).single();
      if (charErr) throw charErr;

      const { data: feats } = await supabase.from('features').select('*').eq('character_id', charId);
      const { data: spls } = await supabase.from('spells').select('*').eq('character_id', charId);
      const { data: itms } = await supabase.from('items').select('*').eq('character_id', charId);
      const { data: skls } = await supabase.from('character_skills').select('*').eq('character_id', charId);
      const { data: slts } = await supabase.from('spell_slots').select('*').eq('character_id', charId);
      const { data: rcs } = await supabase.from('resources').select('*').eq('character_id', charId);

      setActiveChar(char as Character);
      setFeatures(feats || []);
      setSpells(spls || []);
      setItems(itms || []);

      const mappedSkills = DEFAULT_SKILLS_TEMPLATES.map(tmpl => {
        const matchingSkl = skls?.find(s => s.skill_name === tmpl.name);
        return { ...tmpl, proficient: matchingSkl ? matchingSkl.proficient : false };
      });
      setSkills(mappedSkills);

      if (slts) {
        setSpellSlots((slts as SpellSlot[]).map(s => ({ level: s.level, max: s.max, current: s.current })));
      }
      setResources((rcs || []) as Resource[]);

      setView('sheet');
    } catch (e: unknown) {
      console.error("Erreur de chargement :", (e as Error).message);
      showAlert("Erreur", "Impossible de charger la fiche.");
    } finally {
      setLoading(false);
    }
  }

  async function syncCharacterField<T extends keyof Character>(field: T, value: Character[T]) {
    if (!activeChar) return;
    const updatedChar = { ...activeChar, [field]: value };
    setActiveChar(updatedChar);

    const { error } = await supabase
      .from('characters')
      .update({ [field]: value })
      .eq('id', activeChar.id);

    if (error) console.error("Erreur de sauvegarde persistante :", error.message);
  }

  // Features CRUD
  async function handleSaveFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newFeature.name.trim()) return;

    const isPassive = newFeature.category === 'passive';
    const payload = {
      character_id: activeChar.id,
      name: newFeature.name.trim(),
      type: newFeature.type,
      category: newFeature.category,
      current: isPassive ? 0 : Number(newFeature.max),
      max: isPassive ? 0 : Number(newFeature.max),
      recharge: isPassive ? 'PERMANENT' : newFeature.recharge,
      description: newFeature.description || '',
      resource_id: newFeature.resource_id || null,
      resource_cost: newFeature.resource_cost || 0,
    };

    if (newFeature.id) {
      const { data, error } = await supabase.from('features').update(payload).eq('id', newFeature.id).select().single();
      if (!error && data) {
        setFeatures(prev => prev.map(f => f.id === newFeature.id ? (data as Feature) : f));
        showAlert("Modifié", `${payload.name} a été enregistré.`);
      }
    } else {
      const { data, error } = await supabase.from('features').insert([payload]).select().single();
      if (!error && data) {
        setFeatures(prev => [...prev, data as Feature]);
        showAlert("Créé", `${payload.name} a été ajouté.`);
      }
    }

    setNewFeature({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type: 'classe', resource_id: '', resource_cost: 0 });
    return true; // signal to close modal
  }

  // Resources CRUD
  async function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newResource.name.trim()) return;
    const payload = { character_id: activeChar.id, name: newResource.name.trim(), max: Number(newResource.max), current: Number(newResource.current), recharge: newResource.recharge };
    if (newResource.id) {
      const { data, error } = await supabase.from('resources').update(payload).eq('id', newResource.id).select().single();
      if (!error && data) setResources(prev => prev.map(r => r.id === newResource.id ? (data as Resource) : r));
    } else {
      const { data, error } = await supabase.from('resources').insert([payload]).select().single();
      if (!error && data) setResources(prev => [...prev, data as Resource]);
    }
    setNewResource({ name: '', max: 10, current: 10, recharge: 'LONG_REST' });
    return true;
  }

  async function handleDeleteResource(id: string) {
    await supabase.from('resources').delete().eq('id', id);
    setResources(prev => prev.filter(r => r.id !== id));
  }

  async function handleUpdateResourceCurrent(id: string, delta: number) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    const next = Math.max(0, Math.min(res.max, res.current + delta));
    setResources(prev => prev.map(r => r.id === id ? { ...r, current: next } : r));
    await supabase.from('resources').update({ current: next }).eq('id', id);
  }

  async function handleDeleteFeature(id: string, name: string) {
    const { error } = await supabase.from('features').delete().eq('id', id);
    if (!error) {
      setFeatures(prev => prev.filter(f => f.id !== id));
      showAlert("Retiré", `${name} a été supprimé de la fiche.`);
    }
  }

  async function toggleFeatureUse(featId: string, index: number) {
    const targetFeat = features.find(f => f.id === featId);
    if (!targetFeat) return;
    const nextCurrent = targetFeat.current === index + 1 ? index : index + 1;
    setFeatures(prev => prev.map(f => f.id === featId ? { ...f, current: nextCurrent } : f));
    await supabase.from('features').update({ current: nextCurrent }).eq('id', featId);
  }

  // Spell slots
  async function handleToggleSpellSlot(level: number, slotIndex: number) {
    const targetSlot = spellSlots.find(s => s.level === level);
    if (!targetSlot || !activeChar) return;
    const nextCurrent = targetSlot.current === slotIndex + 1 ? slotIndex : slotIndex + 1;
    setSpellSlots(prev => prev.map(s => s.level === level ? { ...s, current: nextCurrent } : s));
    await supabase.from('spell_slots').update({ current: nextCurrent }).eq('character_id', activeChar.id).eq('level', level);
  }

  // Spells
  async function handleAddSpell(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newSpell.name.trim()) return;

    const payload = {
      character_id: activeChar.id,
      name: newSpell.name.trim(),
      level: Number(newSpell.level),
      range: newSpell.range || null,
      casting_type: newSpell.casting_type,
      is_aoe: newSpell.is_aoe,
      save_type: newSpell.is_aoe ? newSpell.save_type : null,
      save_effect: newSpell.is_aoe ? newSpell.save_effect : null,
      concentration: newSpell.concentration,
      damage: newSpell.damage,
      desc: newSpell.desc || ''
    };

    if (newSpell.id) {
      const { character_id: _, ...updatePayload } = payload;
      const { data, error } = await supabase.from('spells').update(updatePayload).eq('id', newSpell.id).select().single();
      if (error) {
        console.error("Erreur mise à jour sort :", error.message, error.details);
        showAlert("Erreur", `Impossible de sauvegarder : ${error.message}`);
      } else if (data) {
        setSpells(prev => prev.map(s => s.id === newSpell.id ? (data as Spell) : s));
        showAlert("Sort Modifié", `${payload.name} a été mis à jour.`);
      }
    } else {
      const { data, error } = await supabase.from('spells').insert([payload]).select().single();
      if (error) {
        console.error("Erreur ajout sort :", error.message, error.details);
        showAlert("Erreur", `Impossible d'ajouter : ${error.message}`);
      } else if (data) {
        setSpells(prev => [...prev, data as Spell]);
        showAlert("Sort Enregistré", `${payload.name} a été écrit dans le grimoire.`);
      }
    }

    setNewSpell({ name: '', level: 0, range: '', casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', desc: '' });
    return true;
  }

  async function handleDeleteSpell(id: string, name: string) {
    const { error } = await supabase.from('spells').delete().eq('id', id);
    if (!error) {
      setSpells(prev => prev.filter(s => s.id !== id));
      showAlert("Sort Retiré", `${name} a été effacé du grimoire.`);
    }
  }

  // Skills
  async function handleToggleSkill(skillName: string) {
    if (!activeChar) return;
    const targetSkill = skills.find(s => s.name === skillName);
    if (!targetSkill) return;
    const nextProf = !targetSkill.proficient;
    setSkills(prev => prev.map(s => s.name === skillName ? { ...s, proficient: nextProf } : s));
    await supabase.from('character_skills').upsert({
      character_id: activeChar.id,
      skill_name: skillName,
      proficient: nextProf
    }, { onConflict: 'character_id,skill_name' });
  }

  // Items
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newItem.name.trim()) return;

    const payload = {
      character_id: activeChar.id,
      name: newItem.name.trim(),
      quantity: Number(newItem.quantity),
      weight: 1,
      equipped: newItem.equipped,
      category: newItem.category,
      ...(newItem.category === 'arme' && { damage: newItem.damage, range: newItem.range }),
      ...(newItem.category === 'armure' && { defense_bonus: Number(newItem.defense_bonus) }),
    };

    const { data, error } = await supabase.from('items').insert([payload]).select().single();
    if (!error && data) {
      setItems(prev => [...prev, data as Item]);
      showAlert("Objet Ajouté", `${payload.name} est dans le sac.`);
    }

    setNewItem({ name: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
    return true;
  }

  async function handleToggleItemEquip(itemId: string) {
    const targetItem = items.find(it => it.id === itemId);
    if (!targetItem) return;
    const nextEquipped = !targetItem.equipped;
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, equipped: nextEquipped } : it));
    await supabase.from('items').update({ equipped: nextEquipped }).eq('id', itemId);
  }

  // Character creation
  async function handleCreateCharacter(heroName: string) {
    if (!user) return;
    if (!heroName.trim()) {
      showAlert("Nom requis", "Veuillez saisir un nom valide.");
      return;
    }

    setLoading(true);
    const sanitizedHeroName = heroName.trim();

    const newHeroTemplate = {
      user_id: user.id,
      name: sanitizedHeroName,
      race: 'Humain',
      class: 'Guerrier',
      subclass: 'Aucune',
      level: 1,
      alignment: 'Neutre',
      hp_max: 12,
      hp_current: 12,
      hp_temp: 0,
      ac: 10,
      initiative: 0,
      passive_perception: 10,
      speed: 9,
      spell_dc: 10,
      spell_attack: 2,
      heroic_inspiration: false,
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      gold: 0,
      silver: 0,
      copper: 0,
      proficiency_bonus: 2,
      avatar_key: 'horns'
    };

    const clonePayloadFromExisting = (): Record<string, unknown> | null => {
      if (characters.length === 0) return null;
      const seed = characters[0] as unknown as Record<string, unknown>;
      const cloned: Record<string, unknown> = { ...seed, user_id: user.id, name: sanitizedHeroName };
      delete cloned.id;
      delete cloned.created_at;
      delete cloned.updated_at;
      return cloned;
    };

    const candidatePayloads: Array<Record<string, unknown>> = [];
    const clonePayload = clonePayloadFromExisting();
    if (clonePayload) candidatePayloads.push(clonePayload);
    candidatePayloads.push(newHeroTemplate as unknown as Record<string, unknown>);

    let createdCharacter: Character | null = null;
    let lastError: { message?: string } | null = null;

    for (const payload of candidatePayloads) {
      const { data, error } = await supabase.from('characters').insert([payload]).select().single();
      if (!error && data) {
        createdCharacter = data as Character;
        break;
      }
      lastError = error;
    }

    if (!createdCharacter) {
      alert("Erreur lors de la création : " + (lastError?.message || 'échec inconnu'));
      setLoading(false);
      return null;
    }

    await fetchCharactersList();
    await loadCharacterData(createdCharacter.id);
    return createdCharacter;
  }

  // Rest actions
  async function handleShortRest() {
    if (!activeChar) return;
    const restoredFeatures = features.map(f => f.recharge === 'SHORT_REST' ? { ...f, current: f.max } : f);
    setFeatures(restoredFeatures);
    for (const f of restoredFeatures) {
      if (f.recharge === 'SHORT_REST') {
        await supabase.from('features').update({ current: f.max }).eq('id', f.id);
      }
    }
    const restoredResources = resources.map(r => r.recharge === 'SHORT_REST' ? { ...r, current: r.max } : r);
    setResources(restoredResources);
    for (const r of restoredResources) {
      if (r.recharge === 'SHORT_REST') {
        await supabase.from('resources').update({ current: r.max }).eq('id', r.id);
      }
    }
    showAlert("Repos Court", "Capacités rechargées.");
  }

  async function handleLongRest() {
    if (!activeChar) return;
    const updatedChar = { ...activeChar, hp_current: activeChar.hp_max, hp_temp: 0 };
    setActiveChar(updatedChar);
    await supabase.from('characters').update({ hp_current: activeChar.hp_max, hp_temp: 0 }).eq('id', activeChar.id);

    const restoredFeatures = features.map(f => (f.recharge === 'LONG_REST' || f.recharge === 'SHORT_REST') ? { ...f, current: f.max } : f);
    setFeatures(restoredFeatures);
    for (const f of restoredFeatures) {
      if (f.recharge === 'LONG_REST' || f.recharge === 'SHORT_REST') {
        await supabase.from('features').update({ current: f.max }).eq('id', f.id);
      }
    }

    const restoredSlots = spellSlots.map(s => ({ ...s, current: s.max }));
    setSpellSlots(restoredSlots);
    for (const slot of restoredSlots) {
      await supabase.from('spell_slots').update({ current: slot.max }).eq('character_id', activeChar.id).eq('level', slot.level);
    }

    const restoredResources = resources.map(r => ({ ...r, current: r.max }));
    setResources(restoredResources);
    for (const r of restoredResources) {
      await supabase.from('resources').update({ current: r.max }).eq('id', r.id);
    }

    setActiveConditions([]);
    showAlert("Repos Long", "Tout est réinitialisé et prêt.");
  }

  // HP management
  function applyDamage(amount: number) {
    if (!activeChar || isNaN(amount) || amount <= 0) return;
    let remainingDmg = amount;
    let nextTemp = activeChar.hp_temp;

    if (nextTemp > 0) {
      if (remainingDmg >= nextTemp) {
        remainingDmg -= nextTemp;
        nextTemp = 0;
      } else {
        nextTemp -= remainingDmg;
        remainingDmg = 0;
      }
    }

    const nextCurrent = Math.max(0, activeChar.hp_current - remainingDmg);
    syncCharacterField('hp_current', nextCurrent);
    syncCharacterField('hp_temp', nextTemp);
    showAlert("Dégâts", `Vous perdez ${amount} PV.`);
  }

  function applyHealing(amount: number) {
    if (!activeChar || isNaN(amount) || amount <= 0) return;
    const nextCurrent = Math.min(activeChar.hp_max, activeChar.hp_current + amount);
    syncCharacterField('hp_current', nextCurrent);
    showAlert("Soins", `Vous récupérez ${amount} PV.`);
  }

  function getModValue(score: number) {
    return Math.floor((score - 10) / 2);
  }

  // Avatar upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeChar) return;

    if (file.size > 3 * 1024 * 1024) {
      showAlert("Fichier trop volumineux", "Veuillez choisir une image de moins de 3 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (!reader.result || !activeChar) return;
      const dataUrl = reader.result as string;
      setActiveChar({ ...activeChar, avatar_url: dataUrl, avatar_key: '' });

      const { error } = await supabase
        .from('characters')
        .update({ avatar_url: dataUrl, avatar_key: '' })
        .eq('id', activeChar.id);

      if (error) {
        console.error("Erreur upload avatar :", error.message);
        showAlert("Erreur", "L'image n'a pas pu être sauvegardée.");
      } else {
        showAlert("Succès !", "Votre portrait personnalisé a été importé.");
      }
    };
    reader.readAsDataURL(file);
  }

  return {
    // State
    view, setView,
    characters,
    activeChar, setActiveChar,
    features, setFeatures,
    spells,
    items,
    skills,
    spellSlots, setSpellSlots,
    activeConditions, setActiveConditions,
    loading, setLoading,
    resources, setResources,
    newResource, setNewResource,
    // Form states
    newFeature, setNewFeature,
    newSpell, setNewSpell,
    newItem, setNewItem,
    newSpellSlot, setNewSpellSlot,
    // Actions
    fetchCharactersList,
    loadCharacterData,
    syncCharacterField,
    handleSaveFeature,
    handleDeleteFeature,
    handleSaveResource,
    handleDeleteResource,
    handleUpdateResourceCurrent,
    toggleFeatureUse,
    handleToggleSpellSlot,
    handleAddSpell,
    handleDeleteSpell,
    handleToggleSkill,
    handleAddItem,
    handleToggleItemEquip,
    handleCreateCharacter,
    handleShortRest,
    handleLongRest,
    applyDamage,
    applyHealing,
    getModValue,
    handleAvatarUpload
  };
}
