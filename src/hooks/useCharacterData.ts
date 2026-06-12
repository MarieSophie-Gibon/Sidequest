import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { DEFAULT_SKILLS_TEMPLATES } from '../constants';
import type { Character, Feature, Spell, Item, Skill, SpellSlot, Resource, Biography, Familiar } from '../types/rpg.types';
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
  duration: string;
  components: string[];
  casting_type: 'action' | 'bonus' | 'reaction';
  is_aoe: boolean;
  save_type: string;
  save_effect: string;
  concentration: boolean;
  damage: string;
  desc: string;
}

export interface NewItemState {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  equipped: boolean;
  category: 'objet' | 'arme' | 'armure' | 'potion' | 'parchemin' | 'objet_magique' | 'composant';
  damage: string;
  range: string;
  defense_bonus: number;
}

export interface NewFamiliarState {
  id?: string;
  name: string;
  species: string;
  description: string;
  hp_current: number;
  hp_max: number;
  ac: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  passive_perception: number;
  senses: string;
  abilities: string;
  resistances: string;
  darkvision: string;
  actions: string;
  avatar_url: string;
  status: 'present' | 'distant' | 'unconscious' | 'dead';
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
  const [familiars, setFamiliars] = useState<Familiar[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlot[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal form states
  const [newFeature, setNewFeature] = useState<NewFeatureState>({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type: 'classe', resource_id: '', resource_cost: 0 });
  const [newResource, setNewResource] = useState<NewResourceState>({ name: '', max: 10, current: 10, recharge: 'LONG_REST' });
  const [newSpell, setNewSpell] = useState<NewSpellState>({ name: '', level: 0, range: '', duration: '', components: [], casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', desc: '' });
  const [newFamiliar, setNewFamiliar] = useState<NewFamiliarState>({ name: '', species: '', description: '', hp_current: 1, hp_max: 1, ac: 10, speed: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, passive_perception: 10, senses: '', abilities: '', resistances: '', darkvision: '', actions: '', avatar_url: '', status: 'present' });
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', description: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
  const [newSpellSlot, setNewSpellSlot] = useState<NewSpellSlotState>({ level: 1, max: 4, current: 4 });

  function getNetworkAwareMessage(rawMessage?: string, fallback = 'Une erreur est survenue.') {
    const message = (rawMessage || '').toLowerCase();
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const looksLikeNetwork =
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('fetch') ||
      message.includes('offline') ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('connection');

    if (offline || looksLikeNetwork) {
      return 'Erreur reseau : connexion impossible. Verifiez votre internet puis reessayez.';
    }

    return rawMessage || fallback;
  }

  async function fetchCharactersList() {
    if (!user?.id) {
      setCharacters([]);
      return;
    }

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur récupération liste :", error.message);
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de recuperer vos personnages.'));
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
        } else {
          setCharacters([]);
          setActiveChar(null);
          setFeatures([]);
          setSpells([]);
          setFamiliars([]);
          setItems([]);
          setSkills([]);
          setSpellSlots([]);
          setResources([]);
          setActiveConditions([]);
          setBiography(null);
        }
      } catch (err) {
        console.error("Erreur d'initialisation de session :", err);
        showAlert('Erreur', getNetworkAwareMessage((err as Error)?.message, 'Impossible de recuperer la session.'));
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
      const { data: fams } = await supabase.from('familiars').select('*').eq('character_id', charId);
      const { data: itms } = await supabase.from('items').select('*').eq('character_id', charId);
      const { data: skls } = await supabase.from('character_skills').select('*').eq('character_id', charId);
      const { data: slts } = await supabase.from('spell_slots').select('*').eq('character_id', charId);
      const { data: rcs } = await supabase.from('resources').select('*').eq('character_id', charId);
      const { data: bio } = await supabase.from('character_biography').select('*').eq('character_id', charId).maybeSingle();

      setActiveChar(char as Character);
      setBiography(bio as Biography | null);
      setFeatures(feats || []);
      setSpells(spls || []);
      setFamiliars((fams || []) as Familiar[]);
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
      showAlert('Erreur', getNetworkAwareMessage((e as Error)?.message, 'Impossible de charger la fiche.'));
    } finally {
      setLoading(false);
    }
  }

  async function syncCharacterField<T extends keyof Character>(field: T, value: Character[T]) {
    if (!activeChar) return;
    const charId = activeChar.id;
    setActiveChar(prev => (prev ? { ...prev, [field]: value } : prev));

    const { error } = await supabase
      .from('characters')
      .update({ [field]: value })
      .eq('id', charId);

    if (error) {
      console.error("Erreur de sauvegarde persistante :", error.message);
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'La sauvegarde n\'a pas pu etre effectuee.'));
    }
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
    if (!activeChar || !newResource.name.trim()) return false;
    const fields = { name: newResource.name.trim(), max: Number(newResource.max), current: Number(newResource.current), recharge: newResource.recharge };
    if (newResource.id) {
      const { data, error } = await supabase.from('resources').update(fields).eq('id', newResource.id).select().single();
      if (error) {
        showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de modifier la ressource.'));
        return false;
      }
      if (data) setResources(prev => prev.map(r => r.id === newResource.id ? (data as Resource) : r));
    } else {
      const { data, error } = await supabase.from('resources').insert([{ character_id: activeChar.id, ...fields }]).select().single();
      if (error) {
        showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de créer la ressource.'));
        return false;
      }
      if (data) setResources(prev => [...prev, data as Resource]);
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
      duration: newSpell.duration || null,
      components: newSpell.components.length > 0 ? newSpell.components : null,
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

    setNewSpell({ name: '', level: 0, range: '', duration: '', components: [], casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', desc: '' });
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
  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newItem.name.trim()) return;

    const payload = {
      character_id: activeChar.id,
      name: newItem.name.trim(),
      description: newItem.description.trim() || null,
      quantity: Number(newItem.quantity),
      weight: 1,
      equipped: newItem.equipped,
      category: newItem.category,
      ...(newItem.category === 'arme' && { damage: newItem.damage, range: newItem.range }),
      ...(newItem.category === 'armure' && { defense_bonus: Number(newItem.defense_bonus) }),
    };

    if (newItem.id) {
      const { character_id: _, ...updatePayload } = payload;
      const { data, error } = await supabase.from('items').update(updatePayload).eq('id', newItem.id).select().single();
      if (!error && data) {
        setItems(prev => prev.map(it => it.id === newItem.id ? (data as Item) : it));
        showAlert("Objet Modifié", `${payload.name} a été mis à jour.`);
      }
    } else {
      const { data, error } = await supabase.from('items').insert([payload]).select().single();
      if (!error && data) {
        setItems(prev => [...prev, data as Item]);
        showAlert("Objet Ajouté", `${payload.name} est dans le sac.`);
      }
    }

    setNewItem({ name: '', description: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
    return true;
  }

  async function handleDeleteItem(id: string, name: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      setItems(prev => prev.filter(it => it.id !== id));
      showAlert("Objet Retiré", `${name} a été supprimé de l'inventaire.`);
    }
  }

  async function handleToggleItemEquip(itemId: string) {
    const targetItem = items.find(it => it.id === itemId);
    if (!targetItem) return;
    const nextEquipped = !targetItem.equipped;
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, equipped: nextEquipped } : it));
    await supabase.from('items').update({ equipped: nextEquipped }).eq('id', itemId);
  }

  // Character creation
  async function handleCreateCharacter(heroName: string, heroRace: string) {
    if (!user) return;
    if (!heroName.trim()) {
      showAlert("Nom requis", "Veuillez saisir un nom valide.");
      return;
    }

    setLoading(true);
    const sanitizedHeroName = heroName.trim();
    const sanitizedHeroRace = heroRace.trim() || 'Humain';

    const newHeroTemplate = {
      user_id: user.id,
      name: sanitizedHeroName,
      race: sanitizedHeroRace,
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

    const { data: createdCharacter, error } = await supabase
      .from('characters')
      .insert([newHeroTemplate])
      .select()
      .single();

    if (error || !createdCharacter) {
      console.error('Erreur creation personnage :', error?.message);
      const baseMessage = getNetworkAwareMessage(error?.message, 'Erreur lors de la creation du personnage.');
      showAlert('Erreur', baseMessage === error?.message ? 'Impossible de creer le personnage pour le moment. Reessayez dans quelques instants.' : baseMessage);
      setLoading(false);
      return null;
    }

    await fetchCharactersList();
    await loadCharacterData((createdCharacter as Character).id);
    return createdCharacter;
  }

  async function handleDeleteCharacter() {
    if (!activeChar) return false;

    const charId = activeChar.id;
    const charName = activeChar.name;
    const { error } = await supabase.from('characters').delete().eq('id', charId);

    if (error) {
      console.error('Erreur suppression personnage :', error.message);
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de supprimer le personnage.'));
      return false;
    }

    setCharacters(prev => prev.filter(c => c.id !== charId));
    setActiveChar(null);
    setFeatures([]);
    setSpells([]);
    setFamiliars([]);
    setItems([]);
    setSkills([]);
    setSpellSlots([]);
    setResources([]);
    setActiveConditions([]);
    setBiography(null);
    setView('dashboard');
    showAlert('Personnage supprimé', `${charName} a été effacé.`);
    return true;
  }

  // Rest actions
  async function handleShortRest() {
    if (!activeChar) return;
    const { data: currentFeats } = await supabase.from('features').select('*').eq('character_id', activeChar.id);
    if (currentFeats && currentFeats.length > 0) {
      const toRestore = (currentFeats as Feature[]).filter(f =>
        f.category === 'active' && (f.recharge === 'SHORT_REST' || !f.recharge)
      );
      await Promise.all(toRestore.map(f =>
        supabase.from('features').update({ current: f.max }).eq('id', f.id)
      ));
      const { data: freshFeats } = await supabase.from('features').select('*').eq('character_id', activeChar.id);
      setFeatures((freshFeats || currentFeats) as Feature[]);
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
    // Recover half total hit dice (min 1)
    const hitDiceMax = activeChar.level;
    const hitDiceCurrent = activeChar.hit_dice_current ?? hitDiceMax;
    const recovered = Math.max(1, Math.floor(hitDiceMax / 2));
    const nextHitDice = Math.min(hitDiceMax, hitDiceCurrent + recovered);

    const updatedChar = { ...activeChar, hp_current: activeChar.hp_max, hp_temp: 0, hit_dice_current: nextHitDice };
    setActiveChar(updatedChar);
    await supabase.from('characters').update({ hp_current: activeChar.hp_max, hp_temp: 0, hit_dice_current: nextHitDice }).eq('id', activeChar.id);

    // Restore active features: query DB directly, restore ALL active features (long rest = full restore)
    const { data: currentFeats } = await supabase.from('features').select('*').eq('character_id', activeChar.id);
    if (currentFeats && currentFeats.length > 0) {
      const toRestore = (currentFeats as Feature[]).filter(f => f.category === 'active');
      await Promise.all(toRestore.map(f =>
        supabase.from('features').update({ current: f.max }).eq('id', f.id)
      ));
      const { data: freshFeats } = await supabase.from('features').select('*').eq('character_id', activeChar.id);
      setFeatures((freshFeats || currentFeats) as Feature[]);
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

  // Familiars
  async function handleSaveFamiliar(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newFamiliar.name.trim()) return;

    const payload = {
      character_id: activeChar.id,
      name: newFamiliar.name.trim(),
      species: newFamiliar.species || null,
      description: newFamiliar.description || null,
      hp_current: Number(newFamiliar.hp_current),
      hp_max: Number(newFamiliar.hp_max),
      ac: Number(newFamiliar.ac) || null,
      speed: newFamiliar.speed || null,
      str: Number(newFamiliar.str) || null,
      dex: Number(newFamiliar.dex) || null,
      con: Number(newFamiliar.con) || null,
      int: Number(newFamiliar.int) || null,
      wis: Number(newFamiliar.wis) || null,
      cha: Number(newFamiliar.cha) || null,
      passive_perception: Number(newFamiliar.passive_perception) || null,
      senses: newFamiliar.senses || null,
      abilities: newFamiliar.abilities || null,
      resistances: newFamiliar.resistances || null,
      darkvision: newFamiliar.darkvision || null,
      actions: newFamiliar.actions || null,
      avatar_url: newFamiliar.avatar_url || null,
      status: newFamiliar.status,
    };

    if (newFamiliar.id) {
      const { character_id: _, ...updatePayload } = payload;
      const { data, error } = await supabase.from('familiars').update(updatePayload).eq('id', newFamiliar.id).select().single();
      if (error) {
        showAlert('Erreur', `Impossible de sauvegarder : ${error.message}`);
      } else if (data) {
        setFamiliars(prev => prev.map(f => f.id === newFamiliar.id ? (data as Familiar) : f));
        showAlert('Familier modifié', `${payload.name} a été mis à jour.`);
      }
    } else {
      const { data, error } = await supabase.from('familiars').insert([payload]).select().single();
      if (error) {
        showAlert('Erreur', `Impossible d'ajouter : ${error.message}`);
      } else if (data) {
        setFamiliars(prev => [...prev, data as Familiar]);
        showAlert('Familier ajouté', `${payload.name} est désormais votre compagnon.`);
      }
    }

    setNewFamiliar({ name: '', species: '', description: '', hp_current: 1, hp_max: 1, ac: 10, speed: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, passive_perception: 10, senses: '', abilities: '', resistances: '', darkvision: '', actions: '', avatar_url: '', status: 'present' });
    return true;
  }

  async function handleDeleteFamiliar(id: string, name: string) {
    const { error } = await supabase.from('familiars').delete().eq('id', id);
    if (!error) {
      setFamiliars(prev => prev.filter(f => f.id !== id));
      showAlert('Familier retiré', `${name} a quitté votre troupe.`);
    }
  }

  async function handleFamiliarAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showAlert('Fichier trop volumineux', 'Veuillez choisir une image de moins de 3 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (!reader.result) return;
      const dataUrl = reader.result as string;
      setNewFamiliar(prev => ({ ...prev, avatar_url: dataUrl }));
      // If editing an existing familiar, persist immediately
      if (newFamiliar.id) {
        const { error } = await supabase.from('familiars').update({ avatar_url: dataUrl }).eq('id', newFamiliar.id);
        if (error) showAlert('Erreur', "L'image n'a pas pu être sauvegardée.");
        else setFamiliars(prev => prev.map(f => f.id === newFamiliar.id ? { ...f, avatar_url: dataUrl } : f));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdateFamiliarHp(id: string, delta: number) {
    const target = familiars.find(f => f.id === id);
    if (!target) return;
    const next = Math.max(0, Math.min(target.hp_max, target.hp_current + delta));
    setFamiliars(prev => prev.map(f => f.id === id ? { ...f, hp_current: next } : f));
    await supabase.from('familiars').update({ hp_current: next }).eq('id', id);
  }

  // Hit dice
  async function handleSpendHitDie() {
    if (!activeChar) return;
    const current = activeChar.hit_dice_current ?? activeChar.level;
    if (current <= 0) return;
    const next = current - 1;
    syncCharacterField('hit_dice_current', next);
  }

  async function handleRecoverHitDie() {
    if (!activeChar) return;
    const current = activeChar.hit_dice_current ?? activeChar.level;
    if (current >= activeChar.level) return;
    syncCharacterField('hit_dice_current', current + 1);
  }

  // Biography
  async function saveBiography(fields: Partial<Omit<Biography, 'character_id' | 'updated_at'>>) {
    if (!activeChar) return;
    const payload = { character_id: activeChar.id, ...fields };
    const { data, error } = await supabase
      .from('character_biography')
      .upsert(payload, { onConflict: 'character_id' })
      .select()
      .single();
    if (error) {
      console.error('Erreur sauvegarde biographie :', error.message);
      showAlert('Erreur', 'Impossible de sauvegarder la biographie.');
    } else {
      setBiography(data as Biography);
      showAlert('Biographie', 'Modifications sauvegardées.');
    }
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
    familiars,
    activeConditions, setActiveConditions,
    loading, setLoading,
    resources, setResources,
    newResource, setNewResource,
    // Form states
    newFeature, setNewFeature,
    newSpell, setNewSpell,
    newFamiliar, setNewFamiliar,
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
    handleSaveFamiliar,
    handleDeleteFamiliar,
    handleFamiliarAvatarUpload,
    handleUpdateFamiliarHp,
    handleToggleSkill,
    biography, setBiography,
    saveBiography,
    handleSaveItem,
    handleDeleteItem,
    handleToggleItemEquip,
    handleCreateCharacter,
    handleDeleteCharacter,
    handleShortRest,
    handleLongRest,
    applyDamage,
    applyHealing,
    getModValue,
    handleSpendHitDie,
    handleRecoverHitDie,
    handleAvatarUpload
  };
}
