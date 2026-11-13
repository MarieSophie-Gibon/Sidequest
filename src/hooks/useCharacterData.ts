import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { DEFAULT_SKILLS_TEMPLATES } from '../constants';
import type { Character, Feature, Spell, Item, Skill, SpellSlot, Resource, ResourceBullet, ResourceDisplay, Biography, Familiar, CharacterStatKey, Note, GameSystem } from '../types/rpg.types';
import { createPf1Data, normalizePf1Data } from '../systems/pf1e/defaults';
import { createHomebrewData, normalizeHomebrewData } from '../systems/homebrew/sheet';
import { resourcesEnabled, restsOf, sheetStructure } from '../systems/homebrew/presets';
import type { HomebrewStructure } from '../systems/homebrew/types';
import { computePf1Sheet } from '../systems/pf1e/rules';
import type { Pf1CraftProject, Pf1Data } from '../systems/pf1e/types';
import { formatCp, magicCheck, magicCostCp, mundaneCheck, mundaneMaterialsCp, payFromPurse } from '../systems/pf1e/crafting';
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
  /** Homebrew : affichage en puces ; null/absent = compteur. */
  display?: ResourceDisplay | null;
  /** Puces avec valeur. */
  bullets?: ResourceBullet[] | null;
  rest_id?: string | null;
  rest_amount?: number | null;
}

export interface NewSpellState {
  id?: string;
  name: string;
  level: number;
  range: string;
  duration: string;
  components: string[];
  material_components: string;
  casting_type: 'action' | 'bonus' | 'reaction';
  is_aoe: boolean;
  save_type: string;
  save_effect: string;
  concentration: boolean;
  damage: string;
  upcast_damage: string;
  desc: string;
  /** Homebrew. */
  school?: string;
  cost?: string;
  condition?: string;
}

export interface NewItemState {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  equipped: boolean;
  /** Homebrew : id d'une catégorie du MJ. */
  category: 'objet' | 'arme' | 'armure' | 'potion' | 'parchemin' | 'objet_magique' | 'composant' | (string & {});
  crafting_duration_hours?: number | null;
  damage: string;
  range: string;
  defense_bonus: number;
}

export interface CraftingComponentSelection {
  itemId: string;
  quantity: number;
}

/** Fiche partagée avec l'utilisateur par un autre joueur (lecture seule). */
export interface SharedCharacter {
  character: Character;
  ownerName: string;
  /** Campagne du MJ où la fiche est rangée (null = sans campagne). */
  campaignId: string | null;
}

/** Campagne du MJ : dossier privé pour ranger les fiches partagées. */
export interface Campaign {
  id: string;
  name: string;
}

/** MJ ayant accès à une fiche. */
export interface CharacterViewer {
  viewer_id: string;
  viewer_name: string | null;
  created_at: string;
}

export interface CraftingRecipeInput {
  name: string;
  description: string;
  goldValue: number;
  category: NewItemState['category'];
  components: CraftingComponentSelection[];
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

export interface NewNoteState {
  id?: string;
  title: string;
  content: string;
}

export function useCharacterData(user: User | null, showAlert: (title: string, text: string) => void) {
  const [view, setView] = useState<'dashboard' | 'sheet'>('dashboard');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sharedCharacters, setSharedCharacters] = useState<SharedCharacter[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeChar, setActiveChar] = useState<Character | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [spells, setSpells] = useState<Spell[]>([]);
  const [familiars, setFamiliars] = useState<Familiar[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [saveThrows, setSaveThrows] = useState<{ attr: CharacterStatKey; proficient: boolean }[]>([]);
  const [spellSlots, setSpellSlots] = useState<SpellSlot[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeConditions, setActiveConditions] = useState<string[]>([]);
  const [biography, setBiography] = useState<Biography | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal form states
  const [newFeature, setNewFeature] = useState<NewFeatureState>({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type: 'classe', resource_id: '', resource_cost: 0 });
  const [newResource, setNewResource] = useState<NewResourceState>({ name: '', max: 10, current: 10, recharge: 'LONG_REST' });
  const [newSpell, setNewSpell] = useState<NewSpellState>({ name: '', level: 0, range: '', duration: '', components: [], material_components: '', casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', upcast_damage: '', desc: '' });
  const [newFamiliar, setNewFamiliar] = useState<NewFamiliarState>({ name: '', species: '', description: '', hp_current: 1, hp_max: 1, ac: 10, speed: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, passive_perception: 10, senses: '', abilities: '', resistances: '', darkvision: '', actions: '', avatar_url: '', status: 'present' });
  const [newItem, setNewItem] = useState<NewItemState>({ name: '', description: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
  const [newSpellSlot, setNewSpellSlot] = useState<NewSpellSlotState>({ level: 1, max: 4, current: 4 });
  const [newNote, setNewNote] = useState<NewNoteState>({ title: '', content: '' });

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
    await fetchSharedCharacters();
  }

  // ── Partage avec un MJ (lecture seule) ────────────────────────────────────

  /** Fiches que d'autres joueurs ont partagées avec l'utilisateur (il en est le MJ). */
  async function fetchSharedCharacters() {
    if (!user?.id) { setSharedCharacters([]); return; }
    const [{ data, error }, { data: camps }] = await Promise.all([
      supabase
        .from('character_viewers')
        .select('owner_name, campaign_id, characters(*)')
        .eq('viewer_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('campaigns').select('id, name').order('created_at'),
    ]);
    setCampaigns((camps || []) as Campaign[]);
    // Table absente (migration non appliquée) : on ignore, la liste reste vide.
    if (error) { setSharedCharacters([]); return; }
    setSharedCharacters(
      (data as unknown as { owner_name: string | null; campaign_id: string | null; characters: Character | null }[])
        .filter(row => row.characters)
        .map(row => ({ character: row.characters as Character, ownerName: row.owner_name ?? 'un joueur', campaignId: row.campaign_id })),
    );
  }

  // ── Campagnes du MJ ───────────────────────────────────────────────────────

  async function createCampaign(name: string): Promise<Campaign | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const { data, error } = await supabase.from('campaigns').insert([{ name: trimmed }]).select('id, name').single();
    if (error || !data) {
      showAlert('Erreur', getNetworkAwareMessage(error?.message, 'Impossible de créer la campagne.'));
      return null;
    }
    setCampaigns(prev => [...prev, data as Campaign]);
    return data as Campaign;
  }

  async function renameCampaign(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, name: trimmed } : c)));
    const { error } = await supabase.from('campaigns').update({ name: trimmed }).eq('id', id);
    if (error) showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de renommer la campagne.'));
  }

  /** Supprime la campagne ; ses fiches repassent « sans campagne » (elles restent partagées). */
  async function deleteCampaign(id: string) {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setSharedCharacters(prev => prev.map(s => (s.campaignId === id ? { ...s, campaignId: null } : s)));
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de supprimer la campagne.'));
  }

  /** Range une fiche partagée dans une campagne (null = sans campagne). */
  async function assignCampaign(characterId: string, campaignId: string | null) {
    if (!user?.id) return;
    setSharedCharacters(prev => prev.map(s => (s.character.id === characterId ? { ...s, campaignId } : s)));
    const { error } = await supabase
      .from('character_viewers')
      .update({ campaign_id: campaignId })
      .eq('character_id', characterId)
      .eq('viewer_id', user.id);
    if (error) {
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de ranger cette fiche.'));
      await fetchSharedCharacters();
    }
  }

  /** Crée un lien d'invitation (7 jours) pour la fiche ; renvoie l'URL à envoyer au MJ. */
  async function createShareLink(characterId: string): Promise<string | null> {
    const { data, error } = await supabase.from('share_invites').insert([{ character_id: characterId }]).select('token').single();
    if (error || !data) {
      showAlert('Erreur', getNetworkAwareMessage(error?.message, 'Impossible de créer le lien de partage.'));
      return null;
    }
    return `${window.location.origin}/?share=${data.token}`;
  }

  async function fetchCharacterViewers(characterId: string): Promise<CharacterViewer[]> {
    const { data } = await supabase
      .from('character_viewers')
      .select('viewer_id, viewer_name, created_at')
      .eq('character_id', characterId)
      .order('created_at');
    return (data || []) as CharacterViewer[];
  }

  /** Retire l'accès d'un MJ (par le propriétaire) ou quitte un partage (par le MJ). */
  async function removeCharacterViewer(characterId: string, viewerId: string) {
    const { error } = await supabase.from('character_viewers').delete().eq('character_id', characterId).eq('viewer_id', viewerId);
    if (error) {
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de retirer cet accès.'));
      return false;
    }
    await fetchSharedCharacters();
    return true;
  }

  /** Le MJ ouvre un lien de partage : accès rattaché à son compte, puis ouverture de la fiche. */
  async function acceptShare(token: string) {
    const { data: characterId, error } = await supabase.rpc('accept_share', { p_token: token });
    if (error || !characterId) {
      showAlert('Partage', error?.message || 'Ce lien de partage est invalide ou a expiré.');
      return;
    }
    await fetchSharedCharacters();
    await loadCharacterData(characterId as string);
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
            setSaveThrows([]);
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
    // Pathfinder 1e calcule ses sorts par jour à partir de la table de classe (system_data).
    if (!activeChar || activeChar.system === 'pf1e') return;

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

  /** `silent` : rechargement en arrière-plan (temps réel), sans écran de chargement. */
  async function loadCharacterData(charId: string, opts: { silent?: boolean } = {}) {
    if (!opts.silent) setLoading(true);
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
      const { data: nts } = await supabase.from('character_notes').select('*').eq('character_id', charId).order('created_at', { ascending: false });

      setActiveChar(char as Character);
      setBiography(bio as Biography | null);
      setNotes((nts || []) as Note[]);
      setFeatures(feats || []);
      setSpells(spls || []);
      setFamiliars((fams || []) as Familiar[]);
      setItems(itms || []);

      const mappedSkills = DEFAULT_SKILLS_TEMPLATES.map(tmpl => {
        const matchingSkl = skls?.find(s => s.skill_name === tmpl.name);
        return { ...tmpl, proficient: matchingSkl ? matchingSkl.proficient : false };
      });
      setSkills(mappedSkills);

        const SAVE_ATTRS: CharacterStatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        const mappedSaves = SAVE_ATTRS.map(attr => {
          const matching = skls?.find(s => s.skill_name === `save_${attr}`);
          return { attr, proficient: matching ? matching.proficient : false };
        });
        setSaveThrows(mappedSaves);

      if (slts) {
        setSpellSlots((slts as SpellSlot[]).map(s => ({ level: s.level, max: s.max, current: s.current })));
      }
      setResources((rcs || []) as Resource[]);

      if (!opts.silent) setView('sheet');
    } catch (e: unknown) {
      console.error("Erreur de chargement :", (e as Error).message);
      if (!opts.silent) showAlert('Erreur', getNetworkAwareMessage((e as Error)?.message, 'Impossible de charger la fiche.'));
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }

  async function syncCharacterField<T extends keyof Character>(field: T, value: Character[T]) {
    if (!activeChar) return;
    // En Pathfinder 1e, la CA est calculée par le moteur de règles (voir syncPf1Data).
    if (activeChar.system === 'pf1e' && field === 'ac') return;
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

  // Pathfinder 1e : enregistre les choix du joueur et met à jour les colonnes affichées
  // dans la liste des personnages (CA, initiative).
  async function syncPf1Data(next: Pf1Data, levelOverride?: number) {
    if (!activeChar) return;
    const charId = activeChar.id;
    const level = levelOverride ?? activeChar.level;
    const sheet = computePf1Sheet(next, level);
    const patch = { system_data: next, ac: sheet.ac.total, initiative: sheet.initiative.total };
    setActiveChar(prev => (prev ? { ...prev, ...patch } : prev));
    setCharacters(prev => prev.map(c => (c.id === charId ? { ...c, ...patch } : c)));

    const { error } = await supabase.from('characters').update(patch).eq('id', charId);
    if (error) {
      console.error('Erreur de sauvegarde Pathfinder :', error.message);
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'La sauvegarde n\'a pas pu etre effectuee.'));
    }
  }

  // Features CRUD
  async function handleSaveFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChar || !newFeature.name.trim()) return;

    const isPassive = newFeature.category === 'passive';
    // Capacité active : soit un nombre d'utilisations, soit un coût en ressource — jamais les deux.
    const usesResource = !isPassive && !!newFeature.resource_id;
    const usesCount = !isPassive && !usesResource;
    const payload = {
      character_id: activeChar.id,
      name: newFeature.name.trim(),
      type: newFeature.type,
      category: newFeature.category,
      current: usesCount ? Number(newFeature.max) : 0,
      max: usesCount ? Number(newFeature.max) : 0,
      recharge: usesCount ? newFeature.recharge : 'PERMANENT',
      description: newFeature.description || '',
      resource_id: usesResource ? newFeature.resource_id : null,
      resource_cost: usesResource ? (newFeature.resource_cost || 1) : 0,
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
    const bullets = newResource.display === 'valued' ? (newResource.bullets ?? []).filter(b => b.value.trim()) : null;
    const max = bullets ? bullets.length : Number(newResource.max);
    const fields = {
      name: newResource.name.trim(),
      max,
      current: bullets ? bullets.filter(b => !b.used).length : Math.min(Number(newResource.current), max),
      recharge: newResource.recharge,
      // Colonnes homebrew : envoyées seulement si utilisées (les fiches D&D/PF1 restent identiques).
      ...(newResource.display !== undefined && {
        display: newResource.display ?? null,
        bullets,
        rest_id: newResource.rest_id ?? null,
        rest_amount: newResource.rest_amount ?? null,
      }),
    };
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

  /** Puces simples : nombre d'utilisations restantes. */
  async function handleSetResourceCurrent(id: string, current: number) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    const next = Math.max(0, Math.min(res.max, current));
    setResources(prev => prev.map(r => r.id === id ? { ...r, current: next } : r));
    await supabase.from('resources').update({ current: next }).eq('id', id);
  }

  /** Puces avec valeur : bascule une puce utilisée / disponible. */
  async function handleToggleResourceBullet(id: string, index: number) {
    const res = resources.find(r => r.id === id);
    if (!res?.bullets?.[index]) return;
    const bullets = res.bullets.map((b, i) => (i === index ? { ...b, used: !b.used } : b));
    const current = bullets.filter(b => !b.used).length;
    setResources(prev => prev.map(r => r.id === id ? { ...r, bullets, current } : r));
    await supabase.from('resources').update({ bullets, current }).eq('id', id);
  }

  /**
   * Homebrew : repos défini par le MJ. Automatique = PV, jauges, capacités et ressources rattachées au max ;
   * sinon, gains indiqués par le MJ (× niveau éventuel) et ressources selon leur « récupère ».
   */
  async function handleHomebrewRest(restId: string) {
    if (!activeChar || activeChar.system !== 'homebrew') return;
    const hb = normalizeHomebrewData(activeChar.system_data);
    if (!hb) return;
    const rest = restsOf(hb.structure).find(r => r.id === restId);
    if (!rest) return;
    const level = Math.max(1, activeChar.level || 1);
    const gain = (g?: { amount: number; perLevel: boolean }) => (g ? g.amount * (g.perLevel ? level : 1) : 0);

    // PV et jauges
    const hpNext = rest.auto ? activeChar.hp_max : Math.min(activeChar.hp_max, activeChar.hp_current + gain(rest.hp));
    const gauges = Object.fromEntries(Object.entries(hb.values.gauges).map(([gid, v]) => [
      gid,
      { ...v, current: rest.auto ? v.max : Math.min(v.max, v.current + gain(rest.gauges?.[gid])) },
    ]));
    const prepared = rest.auto ? hb.values.prepared?.map(p => ({ ...p, cast: false })) : hb.values.prepared;
    const systemData = { ...hb, values: { ...hb.values, gauges, ...(prepared && { prepared }) } };
    setActiveChar(prev => (prev ? { ...prev, hp_current: hpNext, system_data: systemData } : prev));
    await supabase.from('characters').update({ hp_current: hpNext, system_data: systemData }).eq('id', activeChar.id);

    // Ressources rattachées à ce repos
    const restored = resources.map(r => {
      if (r.rest_id !== restId) return r;
      const amount = rest.auto || r.rest_amount == null ? Infinity : r.rest_amount;
      if (r.display === 'valued' && r.bullets) {
        let left = amount;
        const bullets = r.bullets.map(b => (b.used && left > 0 ? (left--, { ...b, used: false }) : b));
        return { ...r, bullets, current: bullets.filter(b => !b.used).length };
      }
      return { ...r, current: Math.min(r.max, r.current + (amount === Infinity ? r.max : amount)) };
    });
    setResources(restored);
    await Promise.all(restored
      .filter(r => r.rest_id === restId)
      .map(r => supabase.from('resources').update({ current: r.current, ...(r.bullets && { bullets: r.bullets }) }).eq('id', r.id)));

    // Capacités à usage limité et emplacements de sorts : rechargés par un repos automatique.
    if (rest.auto) {
      const restoredSlots = spellSlots.map(sl => ({ ...sl, current: sl.max }));
      setSpellSlots(restoredSlots);
      await Promise.all(restoredSlots.map(sl => supabase.from('spell_slots').update({ current: sl.max }).eq('character_id', activeChar.id).eq('level', sl.level)));
      const toRestore = features.filter(f => f.category === 'active');
      setFeatures(prev => prev.map(f => (f.category === 'active' ? { ...f, current: f.max } : f)));
      await Promise.all(toRestore.map(f => supabase.from('features').update({ current: f.max }).eq('id', f.id)));
    }

    showAlert(rest.name || 'Repos', rest.auto ? 'PV, jauges et ressources rechargés.' : 'Récupération appliquée.');
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
      material_components: newSpell.components.includes('M') ? (newSpell.material_components.trim() || null) : null,
      casting_type: newSpell.casting_type,
      is_aoe: newSpell.is_aoe,
      save_type: newSpell.is_aoe ? newSpell.save_type : null,
      save_effect: newSpell.is_aoe ? newSpell.save_effect : null,
      concentration: newSpell.concentration,
      damage: newSpell.damage,
      upcast_damage: newSpell.upcast_damage || null,
      desc: newSpell.desc || '',
      // Homebrew : école, coût, condition (colonnes absentes des fiches D&D / PF1).
      ...(activeChar.system === 'homebrew' && {
        school: newSpell.school?.trim() || null,
        cost: newSpell.cost?.trim() || null,
        condition: newSpell.condition?.trim() || null,
      }),
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

    setNewSpell({ name: '', level: 0, range: '', duration: '', components: [], material_components: '', casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', upcast_damage: '', desc: '' });
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
    async function handleToggleSave(attr: CharacterStatKey) {
      if (!activeChar) return;
      const target = saveThrows.find(s => s.attr === attr);
      if (!target) return;
      const nextProf = !target.proficient;
      setSaveThrows(prev => prev.map(s => s.attr === attr ? { ...s, proficient: nextProf } : s));
      await supabase.from('character_skills').upsert({
        character_id: activeChar.id,
        skill_name: `save_${attr}`,
        proficient: nextProf,
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
      ...(activeChar.system === 'homebrew'
        // Homebrew : la catégorie du MJ décide des champs affichés ; on garde ce qui a été saisi.
        ? { damage: newItem.damage.trim() || null, defense_bonus: Number(newItem.defense_bonus) || 0 }
        : {
          ...(newItem.category === 'arme' && { damage: newItem.damage, range: newItem.range }),
          ...(newItem.category === 'armure' && { defense_bonus: Number(newItem.defense_bonus) }),
        }),
    };

    if (newItem.id) {
      const { character_id: _, ...updatePayload } = payload;
      const { data, error } = await supabase.from('items').update(updatePayload).eq('id', newItem.id).select().single();
      if (!error && data) {
        const savedItem = data as Item;
        const nextItems = items.map(it => it.id === newItem.id ? savedItem : it);
        setItems(nextItems);
        showAlert("Objet Modifié", `${payload.name} a été mis à jour.`);
        if (savedItem.category === 'armure' && activeChar) {
          const dexMod = Math.floor((activeChar.dex - 10) / 2);
          const armorBonus = nextItems.filter(it => it.category === 'armure' && it.equipped).reduce((s, it) => s + (it.defense_bonus ?? 0), 0);
          await syncCharacterField('ac', 10 + dexMod + armorBonus);
        }
      }
    } else {
      const { data, error } = await supabase.from('items').insert([payload]).select().single();
      if (!error && data) {
        const savedItem = data as Item;
        const nextItems = [...items, savedItem];
        setItems(nextItems);
        showAlert("Objet Ajouté", `${payload.name} est dans le sac.`);
        if (savedItem.category === 'armure' && activeChar) {
          const dexMod = Math.floor((activeChar.dex - 10) / 2);
          const armorBonus = nextItems.filter(it => it.category === 'armure' && it.equipped).reduce((s, it) => s + (it.defense_bonus ?? 0), 0);
          await syncCharacterField('ac', 10 + dexMod + armorBonus);
        }
      }
    }

    setNewItem({ name: '', description: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
    return true;
  }

  async function handleDeleteItem(id: string, name: string) {
    const targetItem = items.find(it => it.id === id);
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (!error) {
      const nextItems = items.filter(it => it.id !== id);
      setItems(nextItems);
      showAlert("Objet Retiré", `${name} a été supprimé de l'inventaire.`);
      if (targetItem?.category === 'armure' && targetItem.equipped && activeChar) {
        const dexMod = Math.floor((activeChar.dex - 10) / 2);
        const armorBonus = nextItems.filter(it => it.category === 'armure' && it.equipped).reduce((s, it) => s + (it.defense_bonus ?? 0), 0);
        await syncCharacterField('ac', 10 + dexMod + armorBonus);
      }
    }
  }

  async function handleToggleItemEquip(itemId: string) {
    const targetItem = items.find(it => it.id === itemId);
    if (!targetItem) return;
    const nextEquipped = !targetItem.equipped;
    const nextItems = items.map(it => it.id === itemId ? { ...it, equipped: nextEquipped } : it);
    setItems(nextItems);
    await supabase.from('items').update({ equipped: nextEquipped }).eq('id', itemId);
    if (targetItem.category === 'armure' && activeChar) {
      const dexMod = Math.floor((activeChar.dex - 10) / 2);
      const armorBonus = nextItems.filter(it => it.category === 'armure' && it.equipped).reduce((s, it) => s + (it.defense_bonus ?? 0), 0);
      await syncCharacterField('ac', 10 + dexMod + armorBonus);
    }
  }

  async function consumeSingleItem(itemId: string) {
    const targetItem = items.find(it => it.id === itemId);
    if (!targetItem) {
      showAlert('Objet introuvable', 'Impossible de trouver cet objet.');
      return { ok: false as const, targetItem: null as Item | null };
    }

    const remainingQty = Math.max(0, targetItem.quantity - 1);
    if (remainingQty <= 0) {
      const { error } = await supabase.from('items').delete().eq('id', targetItem.id);
      if (error) {
        showAlert('Erreur', `Impossible de retirer ${targetItem.name} : ${error.message}`);
        return { ok: false as const, targetItem };
      }
    } else {
      const { error } = await supabase.from('items').update({ quantity: remainingQty }).eq('id', targetItem.id);
      if (error) {
        showAlert('Erreur', `Impossible de mettre a jour ${targetItem.name} : ${error.message}`);
        return { ok: false as const, targetItem };
      }
    }

    const nextItems = remainingQty <= 0
      ? items.filter(it => it.id !== targetItem.id)
      : items.map(it => it.id === targetItem.id ? { ...it, quantity: remainingQty } : it);
    setItems(nextItems);

    if (targetItem.category === 'armure' && targetItem.equipped && activeChar) {
      const dexMod = Math.floor((activeChar.dex - 10) / 2);
      const armorBonus = nextItems
        .filter(it => it.category === 'armure' && it.equipped)
        .reduce((s, it) => s + (it.defense_bonus ?? 0), 0);
      await syncCharacterField('ac', 10 + dexMod + armorBonus);
    }

    return { ok: true as const, targetItem };
  }

  async function handleUseItem(itemId: string) {
    const result = await consumeSingleItem(itemId);
    if (!result.ok || !result.targetItem) return false;

    showAlert('Objet utilise', `${result.targetItem.name} a ete utilise.`);
    return true;
  }

  async function handleSellItem(itemId: string, saleValue: number, currency: 'gold' | 'silver' | 'copper') {
    if (!activeChar) return false;

    const normalizedSaleValue = Math.max(1, Math.floor(Number(saleValue) || 0));
    if (!normalizedSaleValue) {
      showAlert('Vente impossible', 'Le montant recupere doit etre superieur a 0.');
      return false;
    }

    const result = await consumeSingleItem(itemId);
    if (!result.ok || !result.targetItem) return false;

    const nextCurrencyValue = Math.max(0, (activeChar[currency] || 0) + normalizedSaleValue);
    setActiveChar(prev => (prev ? { ...prev, [currency]: nextCurrencyValue } : prev));

    const { error } = await supabase
      .from('characters')
      .update({ [currency]: nextCurrencyValue })
      .eq('id', activeChar.id);

    if (error) {
      showAlert('Erreur', `Objet retire mais impossible de crediter la bourse : ${error.message}`);
      return false;
    }

    const currencyLabel = currency === 'gold' ? 'PO' : currency === 'silver' ? 'PA' : 'PC';
    showAlert('Objet vendu', `${result.targetItem.name} vendu pour ${normalizedSaleValue} ${currencyLabel}.`);
    return true;
  }

  async function handleCraftItem(recipe: CraftingRecipeInput) {
    if (!activeChar) return false;

    const name = recipe.name.trim();
    if (!name) {
      showAlert('Craft impossible', 'Le nom de l\'objet est requis.');
      return false;
    }

    const normalizedValue = Number(recipe.goldValue);
    if (Number.isNaN(normalizedValue) || normalizedValue <= 0) {
      showAlert('Craft impossible', 'La valeur en po doit etre superieure a 0.');
      return false;
    }

    const normalizedComponents = recipe.components
      .map(comp => ({ itemId: comp.itemId, quantity: Math.max(1, Math.floor(Number(comp.quantity) || 0)) }))
      .filter(comp => !!comp.itemId);

    if (normalizedComponents.length === 0) {
      showAlert('Craft impossible', 'Ajoutez au moins un composant.');
      return false;
    }

    const requiredByItem = new Map<string, number>();
    for (const component of normalizedComponents) {
      requiredByItem.set(component.itemId, (requiredByItem.get(component.itemId) || 0) + component.quantity);
    }

    const missingStock: string[] = [];
    requiredByItem.forEach((required, itemId) => {
      const source = items.find(it => it.id === itemId);
      if (!source || source.quantity < required) {
        missingStock.push(source ? `${source.name} (${source.quantity}/${required})` : `Composant introuvable (${itemId})`);
      }
    });

    if (missingStock.length > 0) {
      showAlert('Stocks insuffisants', `Composants manquants : ${missingStock.join(', ')}`);
      return false;
    }

    for (const [itemId, requiredQty] of requiredByItem.entries()) {
      const source = items.find(it => it.id === itemId);
      if (!source) continue;
      const remainingQty = source.quantity - requiredQty;

      if (remainingQty <= 0) {
        const { error: deleteErr } = await supabase.from('items').delete().eq('id', itemId);
        if (deleteErr) {
          showAlert('Erreur', `Impossible de consommer ${source.name} : ${deleteErr.message}`);
          return false;
        }
      } else {
        const { error: updateErr } = await supabase.from('items').update({ quantity: remainingQty }).eq('id', itemId);
        if (updateErr) {
          showAlert('Erreur', `Impossible de mettre a jour ${source.name} : ${updateErr.message}`);
          return false;
        }
      }
    }

    const computedCraftDurationHours = Math.max(8, (normalizedValue / 10) * 4);

    const craftedPayload = {
      character_id: activeChar.id,
      name,
      description: recipe.description.trim() || null,
      quantity: 1,
      weight: 1,
      equipped: false,
      category: recipe.category,
      crafting_duration_hours: Number(computedCraftDurationHours.toFixed(2)),
    };

    let { data: createdCraftedItem, error: craftedErr } = await supabase
      .from('items')
      .insert([craftedPayload])
      .select()
      .single();

    if (craftedErr?.message?.includes("Could not find the 'crafting_duration_hours' column of 'items' in the schema cache")) {
      const fallbackPayload = {
        character_id: activeChar.id,
        name,
        description: recipe.description.trim() || null,
        quantity: 1,
        weight: 1,
        equipped: false,
        category: recipe.category,
      };

      const fallbackInsert = await supabase
        .from('items')
        .insert([fallbackPayload])
        .select()
        .single();

      createdCraftedItem = fallbackInsert.data;
      craftedErr = fallbackInsert.error;

      if (!craftedErr) {
        showAlert('Migration requise', 'Objet cree, mais la duree n\'a pas pu etre enregistree. Appliquez la migration SQL de crafting_duration_hours puis rechargez l\'application.');
      }
    }

    if (craftedErr || !createdCraftedItem) {
      showAlert('Erreur', craftedErr?.message || 'Impossible d\'ajouter l\'objet cree.');
      return false;
    }

    const nextItems = items
      .map(it => {
        const consumed = requiredByItem.get(it.id) || 0;
        if (!consumed) return it;
        return { ...it, quantity: it.quantity - consumed };
      })
      .filter(it => it.quantity > 0);

    setItems([...nextItems, createdCraftedItem as Item]);

    const consumedEquippedArmor = items.some(it => {
      const consumed = requiredByItem.get(it.id) || 0;
      return consumed > 0 && it.category === 'armure' && it.equipped;
    });

    if (consumedEquippedArmor) {
      const dexMod = Math.floor((activeChar.dex - 10) / 2);
      const armorBonus = nextItems
        .filter(it => it.category === 'armure' && it.equipped)
        .reduce((sum, it) => sum + (it.defense_bonus ?? 0), 0);
      await syncCharacterField('ac', 10 + dexMod + armorBonus);
    }

    showAlert('Artisanat termine', `${name} a ete cree et ajoute a l'inventaire.`);
    return true;
  }

  // Character creation
  async function handleCreateCharacter(
    heroName: string,
    heroRace: string,
    system: GameSystem = 'dnd5e',
    /** Fiche homebrew : modèle choisi (sa structure est copiée dans la fiche). */
    homebrew?: { systemId: string; structure: HomebrewStructure },
  ) {
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
      avatar_key: 'horns',
      // Les colonnes de système ne sont envoyées que pour Pathfinder : la création D&D reste identique.
      ...(system === 'pf1e' && {
        system,
        system_data: createPf1Data('guerrier'),
        house_rules: [],
        hp_max: 10,
        hp_current: 10,
      }),
      // Homebrew : copie de la structure du modèle + valeurs vides, rattachée au modèle.
      ...(system === 'homebrew' && homebrew && {
        system,
        game_system_id: homebrew.systemId,
        system_data: createHomebrewData(sheetStructure(homebrew.structure)),
        class: '',
        subclass: '',
        hp_max: 10,
        hp_current: 10,
      }),
    };

    const { data: createdCharacter, error } = await supabase
      .from('characters')
      .insert([newHeroTemplate])
      .select()
      .single();

    if (error || !createdCharacter) {
      console.error('Erreur creation personnage :', error?.message);
      const rawMessage = (error?.message || '').toLowerCase();
      const missingColumn = error?.code === '42703' || error?.code === 'PGRST204'
        || (rawMessage.includes('column') && (rawMessage.includes('does not exist') || rawMessage.includes('schema cache')));
      if (missingColumn) {
        showAlert('Migration requise', 'La base de donnees n\'est pas a jour pour ce systeme de jeu. Appliquez la migration SQL add_game_system puis reessayez.');
        setLoading(false);
        return null;
      }
      const baseMessage = getNetworkAwareMessage(error?.message, 'Erreur lors de la creation du personnage.');
      showAlert('Erreur', baseMessage === error?.message ? 'Impossible de creer le personnage pour le moment. Reessayez dans quelques instants.' : baseMessage);
      setLoading(false);
      return null;
    }

    // Homebrew : ressources prévues par le MJ dans le modèle.
    const modelResources = system === 'homebrew' && homebrew && resourcesEnabled(homebrew.structure) ? (homebrew.structure.resources ?? []).filter(r => r.name.trim()) : [];
    if (modelResources.length > 0) {
      const { error: resError } = await supabase.from('resources').insert(modelResources.map(r => ({
        character_id: (createdCharacter as Character).id,
        name: r.name.trim(),
        max: r.display === 'valued' ? (r.values ?? []).filter(v => v.trim()).length : r.defaultMax,
        current: r.display === 'valued' ? (r.values ?? []).filter(v => v.trim()).length : r.defaultMax,
        recharge: 'LONG_REST',
        display: r.display ?? 'bullets',
        bullets: r.display === 'valued' ? (r.values ?? []).filter(v => v.trim()).map(value => ({ value, used: false })) : null,
        rest_id: r.restId ?? null,
        rest_amount: r.restAmount ?? null,
      })));
      if (resError) console.error('Erreur creation ressources du modele :', resError.message);
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
      setSaveThrows([]);
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

    if (activeChar.system === 'pf1e') {
      const pf1 = normalizePf1Data(activeChar.system_data);
      await syncPf1Data({ ...pf1, spellsUsed: [], prepared: pf1.prepared.map(p => ({ ...p, cast: false, chargesLeft: undefined })) });
    }

    setActiveConditions([]);
    showAlert("Repos Long", "Tout est réinitialisé et prêt.");
  }

  /**
   * Pathfinder 1e : nuit de repos (8 h). Pas de repos court ni de dés de vie.
   * Rend niveau PV (2 × niveau pour une journée entière d'alitement), recharge les capacités
   * quotidiennes et les sorts. Les états ne sont pas effacés : chacun a sa propre durée.
   */
  async function handlePf1NightRest(bedRest = false) {
    if (!activeChar || activeChar.system !== 'pf1e') return;
    const healed = activeChar.level * (bedRest ? 2 : 1);
    const nextHp = Math.min(activeChar.hp_max, activeChar.hp_current + healed);
    setActiveChar(prev => (prev ? { ...prev, hp_current: nextHp } : prev));
    await supabase.from('characters').update({ hp_current: nextHp }).eq('id', activeChar.id);

    // Toutes les capacités actives sont quotidiennes en PF1 (quel que soit le réglage de recharge).
    const { data: currentFeats } = await supabase.from('features').select('*').eq('character_id', activeChar.id);
    if (currentFeats && currentFeats.length > 0) {
      const toRestore = (currentFeats as Feature[]).filter(f => f.category === 'active');
      await Promise.all(toRestore.map(f => supabase.from('features').update({ current: f.max }).eq('id', f.id)));
      setFeatures((currentFeats as Feature[]).map(f => (f.category === 'active' ? { ...f, current: f.max } : f)));
    }

    setResources(prev => prev.map(r => ({ ...r, current: r.max })));
    await Promise.all(resources.map(r => supabase.from('resources').update({ current: r.max }).eq('id', r.id)));

    const pf1 = normalizePf1Data(activeChar.system_data);
    await syncPf1Data({ ...pf1, spellsUsed: [], prepared: pf1.prepared.map(p => ({ ...p, cast: false, chargesLeft: undefined })) });

    showAlert(
      bedRest ? 'Journée d’alitement' : 'Nuit de repos',
      `+${nextHp - activeChar.hp_current} PV, capacités quotidiennes et sorts rechargés. Pense à préparer tes sorts.`,
    );
  }

  // ── Artisanat Pathfinder 1e ────────────────────────────────────────────────

  /** Retire un montant (en pc) de la bourse en rendant la monnaie. false si la bourse ne suffit pas. */
  async function spendFromPurse(costCp: number): Promise<boolean> {
    if (!activeChar) return false;
    const next = payFromPurse({ gold: activeChar.gold, silver: activeChar.silver, copper: activeChar.copper }, costCp);
    if (!next) return false;
    setActiveChar(prev => (prev ? { ...prev, ...next } : prev));
    const { error } = await supabase.from('characters').update(next).eq('id', activeChar.id);
    if (error) {
      showAlert('Erreur', getNetworkAwareMessage(error.message, 'La bourse n\'a pas pu etre mise a jour.'));
      return false;
    }
    return true;
  }

  async function addCraftedItem(fields: { name: string; description?: string; category: Item['category']; crafting_duration_hours?: number }) {
    if (!activeChar) return false;
    const { data: created, error } = await supabase
      .from('items')
      .insert([{ character_id: activeChar.id, quantity: 1, weight: 1, equipped: false, ...fields, description: fields.description || null }])
      .select()
      .single();
    if (error || !created) {
      showAlert('Erreur', error?.message || 'Impossible d\'ajouter l\'objet a l\'inventaire.');
      return false;
    }
    setItems(prev => [...prev, created as Item]);
    return true;
  }

  /** Lance un projet d'artisanat ordinaire : paie les matières premières (1/3 du prix). */
  async function handlePf1StartCraftProject(project: Omit<Pf1CraftProject, 'id' | 'progressSp' | 'log' | 'materialsCp'>) {
    if (!activeChar || activeChar.system !== 'pf1e') return false;
    const materialsCp = mundaneMaterialsCp(project.priceGp);
    if (!(await spendFromPurse(materialsCp))) {
      showAlert('Bourse insuffisante', `Les matières premières coûtent ${formatCp(materialsCp)}.`);
      return false;
    }
    const pf1 = normalizePf1Data(activeChar.system_data);
    await syncPf1Data({ ...pf1, craftProjects: [...pf1.craftProjects, { ...project, id: crypto.randomUUID(), materialsCp, progressSp: 0, log: [] }] });
    showAlert('Projet lancé', `${project.name} : ${formatCp(materialsCp)} de matières premières payés.`);
    return true;
  }

  /** Enregistre un test d'Artisanat (semaine ou jour) sur un projet ; crée l'objet une fois terminé. */
  async function handlePf1CraftCheck(projectId: string, total: number, period: 'week' | 'day') {
    if (!activeChar || activeChar.system !== 'pf1e') return;
    const pf1 = normalizePf1Data(activeChar.system_data);
    const project = pf1.craftProjects.find(p => p.id === projectId);
    if (!project) return;

    const result = mundaneCheck(total, project.dc, period);
    const progressSp = project.progressSp + result.progressSp;
    const entry = { date: new Date().toISOString(), period, total, progressSp: result.progressSp, outcome: result.outcome };
    const others = pf1.craftProjects.filter(p => p.id !== projectId);

    if (result.outcome === 'ruined') {
      const halfCp = Math.round(project.materialsCp / 2);
      const repaid = await spendFromPurse(halfCp);
      showAlert('Matières gâchées', repaid
        ? `Échec de 5 ou plus : la moitié des matières est perdue, ${formatCp(halfCp)} rachetés.`
        : `Échec de 5 ou plus : il faut racheter ${formatCp(halfCp)} de matières, mais la bourse ne suffit pas.`);
    } else if (result.outcome === 'no-progress') {
      showAlert('Pas de progrès', `${total} contre DD ${project.dc} : échec de 4 ou moins, aucune progression.`);
    }

    if (progressSp >= project.priceGp * 10) {
      const ok = await addCraftedItem({ name: project.name, description: project.description, category: project.category });
      if (ok) {
        await syncPf1Data({ ...pf1, craftProjects: others });
        showAlert('Objet terminé', `${project.name} rejoint l'inventaire.`);
      }
      return;
    }

    await syncPf1Data({ ...pf1, craftProjects: [...others, { ...project, progressSp, log: [...project.log, entry].slice(-20) }] });
  }

  async function handlePf1AbandonCraftProject(projectId: string) {
    if (!activeChar || activeChar.system !== 'pf1e') return;
    const pf1 = normalizePf1Data(activeChar.system_data);
    await syncPf1Data({ ...pf1, craftProjects: pf1.craftProjects.filter(p => p.id !== projectId) });
  }

  /** Crée un objet magique : paie la moitié du prix de base, puis applique le test d'Art de la magie. */
  async function handlePf1CraftMagicItem(input: {
    name: string; description: string; category: Item['category']; basePriceGp: number; dc: number; total: number; hours: number;
  }) {
    if (!activeChar || activeChar.system !== 'pf1e') return false;
    const costCp = magicCostCp(input.basePriceGp);
    if (!(await spendFromPurse(costCp))) {
      showAlert('Bourse insuffisante', `La création coûte ${formatCp(costCp)}.`);
      return false;
    }
    const outcome = magicCheck(input.total, input.dc);
    if (outcome === 'failure') {
      showAlert('Création ratée', `${input.total} contre DD ${input.dc} : les matériaux (${formatCp(costCp)}) sont perdus.`);
      return true;
    }
    const description = outcome === 'cursed'
      ? `${input.description ? `${input.description}\n` : ''}⚠ Échec de 5 ou plus au test de création : objet maudit (voir avec le MJ).`
      : input.description;
    const ok = await addCraftedItem({ name: input.name, description, category: input.category, crafting_duration_hours: input.hours });
    if (ok) {
      showAlert(outcome === 'cursed' ? 'Objet maudit' : 'Objet créé', outcome === 'cursed'
        ? `${input.name} est créé, mais maudit (échec de 5 ou plus). Voir avec le MJ.`
        : `${input.name} rejoint l'inventaire (${formatCp(costCp)} dépensés).`);
    }
    return ok;
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

  // Notes CRUD
  async function handleSaveNote(e: React.FormEvent): Promise<boolean> {
    e.preventDefault();
    if (!activeChar || !newNote.title.trim()) return false;
    const payload = {
      character_id: activeChar.id,
      title: newNote.title.trim(),
      content: newNote.content,
      updated_at: new Date().toISOString(),
    };
    if (newNote.id) {
      const { data, error } = await supabase
        .from('character_notes')
        .update({ title: payload.title, content: payload.content, updated_at: payload.updated_at })
        .eq('id', newNote.id)
        .select()
        .single();
      if (error) {
        showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de modifier la note.'));
        return false;
      }
      if (data) setNotes(prev => prev.map(n => n.id === newNote.id ? (data as Note) : n));
    } else {
      const { data, error } = await supabase
        .from('character_notes')
        .insert([payload])
        .select()
        .single();
      if (error) {
        showAlert('Erreur', getNetworkAwareMessage(error.message, 'Impossible de créer la note.'));
        return false;
      }
      if (data) setNotes(prev => [data as Note, ...prev]);
    }
    setNewNote({ title: '', content: '' });
    return true;
  }

  async function handleDeleteNote(id: string) {
    const { error } = await supabase.from('character_notes').delete().eq('id', id);
    if (!error) {
      setNotes(prev => prev.filter(n => n.id !== id));
      showAlert('Note supprimée', 'La note a été retirée.');
    }
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

  // ── Lecture seule et temps réel ───────────────────────────────────────────

  /** Fiche d'un autre joueur, consultée par son MJ : aucune modification possible. */
  const readOnly = !!activeChar && !!user && activeChar.user_id !== user.id;

  // Le MJ voit les changements du joueur en direct : à chaque modification d'une table
  // de la fiche, rechargement silencieux (regroupé sur 300 ms).
  const reloadRef = useRef(loadCharacterData);
  reloadRef.current = loadCharacterData;
  const liveCharId = view === 'sheet' && readOnly ? activeChar?.id : undefined;
  useEffect(() => {
    if (!liveCharId) return;
    let timer: number | undefined;
    const reload = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => reloadRef.current(liveCharId, { silent: true }), 300);
    };
    const channel = supabase
      .channel(`fiche-${liveCharId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters', filter: `id=eq.${liveCharId}` }, reload);
    for (const table of ['resources', 'features', 'spells', 'items', 'familiars', 'character_skills', 'spell_slots', 'character_biography']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table, filter: `character_id=eq.${liveCharId}` }, reload);
    }
    channel.subscribe();
    return () => {
      window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [liveCharId]);

  /** En lecture seule, toute action d'écriture est bloquée (la base le refuse aussi, via la RLS). */
  function guard<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
    return (...args: A): R => {
      if (readOnly) {
        showAlert('Lecture seule', 'Cette fiche appartient à un autre joueur : tu peux la consulter, pas la modifier.');
        // Promesse résolue « vide » : compatible avec les appels attendus (await, .then, if (ok)).
        return Promise.resolve(undefined) as unknown as R;
      }
      return fn(...args);
    };
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
    // Partage MJ
    readOnly,
    sharedCharacters,
    createShareLink,
    fetchCharacterViewers,
    removeCharacterViewer,
    acceptShare,
    campaigns,
    createCampaign,
    renameCampaign,
    deleteCampaign,
    assignCampaign,
    loadCharacterData,
    syncCharacterField: guard(syncCharacterField),
    syncPf1Data: guard(syncPf1Data),
    handleSaveFeature: guard(handleSaveFeature),
    handleDeleteFeature: guard(handleDeleteFeature),
    handleSaveResource: guard(handleSaveResource),
    handleDeleteResource: guard(handleDeleteResource),
    handleUpdateResourceCurrent: guard(handleUpdateResourceCurrent),
    handleSetResourceCurrent: guard(handleSetResourceCurrent),
    handleToggleResourceBullet: guard(handleToggleResourceBullet),
    handleHomebrewRest: guard(handleHomebrewRest),
    toggleFeatureUse: guard(toggleFeatureUse),
    handleToggleSpellSlot: guard(handleToggleSpellSlot),
    handleAddSpell: guard(handleAddSpell),
    handleDeleteSpell: guard(handleDeleteSpell),
    handleSaveFamiliar: guard(handleSaveFamiliar),
    handleDeleteFamiliar: guard(handleDeleteFamiliar),
    handleFamiliarAvatarUpload: guard(handleFamiliarAvatarUpload),
    handleUpdateFamiliarHp: guard(handleUpdateFamiliarHp),
    handleToggleSkill: guard(handleToggleSkill),
      saveThrows,
      handleToggleSave: guard(handleToggleSave),
    biography, setBiography,
    saveBiography: guard(saveBiography),
    notes,
    newNote, setNewNote,
    handleSaveNote: guard(handleSaveNote),
    handleDeleteNote: guard(handleDeleteNote),
    handleSaveItem: guard(handleSaveItem),
    handleDeleteItem: guard(handleDeleteItem),
    handleToggleItemEquip: guard(handleToggleItemEquip),
    handleUseItem: guard(handleUseItem),
    handleSellItem: guard(handleSellItem),
    handleCraftItem: guard(handleCraftItem),
    handleCreateCharacter,
    handleDeleteCharacter: guard(handleDeleteCharacter),
    handleShortRest: guard(handleShortRest),
    handleLongRest: guard(handleLongRest),
    handlePf1NightRest: guard(handlePf1NightRest),
    handlePf1StartCraftProject: guard(handlePf1StartCraftProject),
    handlePf1CraftCheck: guard(handlePf1CraftCheck),
    handlePf1AbandonCraftProject: guard(handlePf1AbandonCraftProject),
    handlePf1CraftMagicItem: guard(handlePf1CraftMagicItem),
    applyDamage: guard(applyDamage),
    applyHealing: guard(applyHealing),
    getModValue,
    handleSpendHitDie: guard(handleSpendHitDie),
    handleRecoverHitDie: guard(handleRecoverHitDie),
    handleAvatarUpload: guard(handleAvatarUpload)
  };
}
