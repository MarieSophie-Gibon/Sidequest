import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { useCharacterData } from './hooks/useCharacterData';
import { useSwipeNav } from './hooks/useSwipeNav';
import { useThemeClasses, useAppSettings } from './contexts/AppSettingsContext';
import type { CharacterTheme } from './contexts/AppSettingsContext';
import type { Character, CoreAttribute, Feature, Item, Familiar, Spell } from './types/rpg.types';
import { Eye, Swords, User } from 'lucide-react';

// Components
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { DnDCombatHUD } from './components/DnDCombatHUD';
import { DnDAttributes } from './components/DnDAttributes';
import { DnDSpellcasting } from './components/DnDSpellcasting';
import { DnDFeatures } from './components/DnDFeatures';
import { DnDSkillsAndSaves } from './components/DnDSkillsAndSaves';
import { DnDInventory } from './components/DnDInventory';
import { DnDBiography } from './components/DnDBiography';
import { SettingsTab } from './components/SettingsTab';
import { CharacterShareCard } from './components/CharacterShareCard';
import { GameSystemEditor } from './components/homebrew/GameSystemEditor';
import { useGameSystems } from './hooks/useGameSystems';
import { HomebrewCombatHUD } from './components/homebrew/HomebrewCombatHUD';
import { HomebrewHomeSections } from './components/homebrew/HomebrewHomeSections';
import { HomebrewSkillsTab } from './components/homebrew/HomebrewSkillsTab';
import { normalizeHomebrewData, type HomebrewData } from './systems/homebrew/sheet';
import { featureTypesOf, resourcesEnabled } from './systems/homebrew/presets';
import { DnDNotes } from './components/DnDNotes';
import { BottomNav } from './components/BottomNav';
import { AppHeader } from './components/AppHeader';

// Modals
import { EditProfileModal } from './components/modals/EditProfileModal';
import { EditCombatModal } from './components/modals/EditCombatModal';
import { EditAttributesModal } from './components/modals/EditAttributesModal';
import { EditHpModal } from './components/modals/EditHpModal';
import { AddFeatureModal } from './components/modals/AddFeatureModal';
import { AddResourceModal } from './components/modals/AddResourceModal';
import { EditSpellSlotModal } from './components/modals/EditSpellSlotModal';
import { AddSpellModal } from './components/modals/AddSpellModal';
import { AddItemModal } from './components/modals/AddItemModal';
import { EditConditionsModal } from './components/modals/EditConditionsModal';
import { EditSpellcastingModal } from './components/modals/EditSpellcastingModal';
import { EditBiographyModal } from './components/modals/EditBiographyModal';
import { EditBackstoryModal } from './components/modals/EditBackstoryModal';
import { EditPersonalityModal } from './components/modals/EditPersonalityModal';
import { AddFamiliarModal } from './components/modals/AddFamiliarModal';
import { DeathSavingThrowsModal } from './components/modals/DeathSavingThrowsModal';
import { CraftingModal } from './components/modals/CraftingModal';
import { ItemActionModal } from './components/modals/ItemActionModal';
import { AddNoteModal } from './components/modals/AddNoteModal';

// Pathfinder 1e
import { Pf1CombatHUD } from './components/pf1e/Pf1CombatHUD';
import { Pf1SheetTab } from './components/pf1e/Pf1SheetTab';
import { Pf1DefenseSection } from './components/pf1e/Pf1DefenseSection';
import { Pf1ActionsTab } from './components/pf1e/Pf1ActionsTab';
import { Pf1CraftingModal } from './components/pf1e/Pf1CraftingModal';
import { Pf1CraftProjectsCard } from './components/pf1e/Pf1CraftProjectsCard';
import { Pf1AttackModal, Pf1DefenseModal, Pf1HelpModal, Pf1MagicModal, Pf1StatsModal } from './components/pf1e/Pf1Modals';
import { normalizePf1Data } from './systems/pf1e/defaults';
import { computePf1Sheet } from './systems/pf1e/rules';
import type { Pf1Attack } from './systems/pf1e/types';

/** Thème fixe de l'accueil : violet, fond clair flouté (le voile d'étoiles est toujours affiché). */
const HOME_THEME: CharacterTheme = { themeName: 'violet', bgChoice: 'light', bgOverlay: true };

/** Fenêtres de pure consultation, autorisées sur une fiche en lecture seule. */
const READ_ONLY_MODALS = new Set(['pf1_help']);
const PENDING_SHARE_KEY = 'sidequest_pending_share';

export default function App() {
  const t = useThemeClasses();
  const settings = useAppSettings();

  const [alertMsg, setAlertMsg] = useState<{ title: string; text: string } | null>(null);
  const showAlert = (title: string, text: string) => {
    setAlertMsg({ title, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Auth hook
  const auth = useAuth();

  // Character data hook
  const data = useCharacterData(auth.user, showAlert);

  // Tabs & modal state
  const [activeTab, setActiveTab] = useState<'home' | 'spells' | 'features' | 'attributes' | 'inventory' | 'biography' | 'notes' | 'settings'>('home');
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('left');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Homebrew : structure copiée du modèle + valeurs du joueur.
  const hbData = data.activeChar?.system === 'homebrew' ? normalizeHomebrewData(data.activeChar.system_data) : null;
  const saveHb = (next: HomebrewData) => data.syncCharacterField('system_data', next);
  // Onglets masqués selon les sections choisies par le MJ.
  const hiddenTabs = new Set<string>(hbData ? [
    ...(hbData.structure.sections.spells ? [] : ['spells']),
    ...(hbData.structure.sections.features || resourcesEnabled(hbData.structure) ? [] : ['features']),
    ...(hbData.structure.sections.inventory ? [] : ['inventory']),
    ...(hbData.structure.sections.biography ? [] : ['biography']),
    ...(hbData.structure.sections.notes ? [] : ['notes']),
    ...(hbData.structure.stats.length || hbData.structure.skills.length ? [] : ['attributes']),
  ] : []);

  const requestTabChange = (tab: 'home' | 'spells' | 'features' | 'attributes' | 'inventory' | 'biography' | 'notes' | 'settings') => {
    if (tab === activeTab || hiddenTabs.has(tab)) return;
    const tabs = ['home', 'spells', 'features', 'attributes', 'inventory', 'biography', 'notes', 'settings'] as const;
    const nextIndex = tabs.indexOf(tab);
    const currentIndex = tabs.indexOf(activeTab);
    setTransitionDirection(nextIndex > currentIndex ? 'left' : 'right');
    setActiveTab(tab);
    setIsTransitioning(true);
  };

  const swipe = useSwipeNav(activeTab, requestTabChange, hiddenTabs);

  const [modalType, setModalTypeState] = useState<string | null>(null);
  // Fiche en lecture seule (MJ) : seules les fenêtres de consultation s'ouvrent.
  const setModalType = (next: string | null) => {
    if (data.readOnly && next !== null && !READ_ONLY_MODALS.has(next)) {
      showAlert('Lecture seule', 'Cette fiche appartient à un autre joueur : tu peux la consulter, pas la modifier.');
      return;
    }
    setModalTypeState(next);
  };
  const [itemActionTarget, setItemActionTarget] = useState<Item | null>(null);

  // Accueil : modèle de fiche (système homebrew) ouvert dans l'éditeur.
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null);
  // Héros en attente : créé une fois son nouveau modèle configuré dans l'éditeur.
  const [pendingHero, setPendingHero] = useState<{ name: string; race: string } | null>(null);
  const gameSystems = useGameSystems(auth.user?.id, showAlert);
  const editingSystem = gameSystems.systems.find(s => s.id === editingSystemId) ?? null;
  const [pf1AttackTarget, setPf1AttackTarget] = useState<Pf1Attack | null>(null);

  // Lien de partage MJ (?share=<jeton>) : mis de côté jusqu'à la connexion, puis accepté.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('share');
    if (!token) return;
    try { sessionStorage.setItem(PENDING_SHARE_KEY, token); } catch { /* stockage indisponible */ }
    params.delete('share');
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, []);
  const userId = auth.user?.id;
  const { acceptShare } = data;
  useEffect(() => {
    if (!userId) return;
    let token: string | null = null;
    try { token = sessionStorage.getItem(PENDING_SHARE_KEY); sessionStorage.removeItem(PENDING_SHARE_KEY); } catch { /* stockage indisponible */ }
    if (token) acceptShare(token);
    // acceptShare change d'identité à chaque rendu : on ne réagit qu'à la connexion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Thème : sur une fiche, celui du personnage (ou le thème de l'app s'il n'en a pas) ;
  // hors fiche (accueil, sélection du PJ, connexion), toujours le thème d'accueil fixe.
  const { setCharacterTheme } = settings;
  const sheetTheme = data.view === 'sheet' ? (data.activeChar?.theme ?? null) : HOME_THEME;
  useEffect(() => {
    setCharacterTheme(sheetTheme);
  }, [sheetTheme, setCharacterTheme]);

  useEffect(() => {
    if (!isTransitioning) return;
    const timeout = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [isTransitioning]);

  const slideClass = isTransitioning
    ? transitionDirection === 'left'
      ? 'animate-slideInFromRight'
      : 'animate-slideInFromLeft'
    : '';

  // Death saves auto-trigger
  const deathSaveShownRef = useRef(false);
  useEffect(() => {
    // Les jets contre la mort sont une règle D&D : en Pathfinder, on descend en PV négatifs.
    if (data.activeChar?.system === 'pf1e') return;
    if (data.activeChar?.hp_current === 0 && !deathSaveShownRef.current) {
      deathSaveShownRef.current = true;
      setModalType('death_saves');
    } else if ((data.activeChar?.hp_current ?? 0) > 0) {
      deathSaveShownRef.current = false;
    }
  }, [data.activeChar?.hp_current, data.activeChar?.system]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        auth.enterPasswordRecovery(session?.user?.email);
        data.setLoading(false);
        return;
      }

      if (session?.user) {
        auth.setUser(session.user);
        data.fetchCharactersList().finally(() => data.setLoading(false));
      } else {
        auth.setUser(null);
        data.setView('dashboard');
        data.setLoading(false);
      }
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    // Supabase recovery links may arrive via hash/query before PASSWORD_RECOVERY fires.
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const recoveryType = searchParams.get('type') || hashParams.get('type');

    if (recoveryType === 'recovery') {
      supabase.auth.getSession().then(({ data: sessionData }) => {
        auth.enterPasswordRecovery(sessionData.session?.user?.email);
      });
    }
  }, []);

  useEffect(() => {
    const showNetworkAlert = (title: string, text: string) => {
      setAlertMsg({ title, text });
      setTimeout(() => setAlertMsg(null), 4000);
    };

    const handleOffline = () => {
      showNetworkAlert('Hors ligne', 'Connexion internet perdue. Certaines actions peuvent echouer.');
    };

    const handleOnline = () => {
      showNetworkAlert('Reseau retabli', 'Connexion internet detectee.');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Derived state
  const hpPercent = data.activeChar ? Math.round((data.activeChar.hp_current / data.activeChar.hp_max) * 100) : 100;

  const coreAttributes: CoreAttribute[] = data.activeChar ? [
    { label: 'Force', score: data.activeChar.str, short: 'FOR', color: 'text-rose-400', key: 'str' },
    { label: 'Dextérité', score: data.activeChar.dex, short: 'DEX', color: 'text-cyan-400', key: 'dex' },
    { label: 'Constitution', score: data.activeChar.con, short: 'CON', color: 'text-emerald-400', key: 'con' },
    { label: 'Intelligence', score: data.activeChar.int, short: 'INT', color: 'text-indigo-400', key: 'int' },
    { label: 'Sagesse', score: data.activeChar.wis, short: 'SAG', color: 'text-teal-400', key: 'wis' },
    { label: 'Charisme', score: data.activeChar.cha, short: 'CHA', color: 'text-amber-400', key: 'cha' }
  ] : [];

  // Pathfinder 1e : choix du joueur (system_data) → valeurs calculées.
  const pf1Data = data.activeChar?.system === 'pf1e' ? normalizePf1Data(data.activeChar.system_data) : null;
  const pf1Sheet = pf1Data && data.activeChar ? computePf1Sheet(pf1Data, data.activeChar.level) : null;
  const pf1Slots = pf1Sheet?.spellcasting && pf1Data
    ? pf1Sheet.spellcasting.perDay.flatMap((max, level) => (level === 0 || max === null || max <= 0 ? [] : [{
        level, max, current: Math.max(0, max - (pf1Data.spellsUsed[level] ?? 0)),
      }]))
    : [];
  const togglePf1Slot = (level: number, slotIndex: number) => {
    const slot = pf1Slots.find(s => s.level === level);
    if (!slot || !pf1Data) return;
    const nextCurrent = slot.current === slotIndex + 1 ? slotIndex : slotIndex + 1;
    const spellsUsed = [...pf1Data.spellsUsed];
    for (let i = 0; i <= level; i++) spellsUsed[i] = spellsUsed[i] ?? 0;
    spellsUsed[level] = slot.max - nextCurrent;
    data.syncPf1Data({ ...pf1Data, spellsUsed });
  };

  const openEditSpell = (spell: Spell) => {
    data.setNewSpell({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      range: spell.range || '',
      duration: spell.duration || '',
      components: spell.components || [],
      material_components: spell.material_components || '',
      casting_type: spell.casting_type || 'action',
      is_aoe: spell.is_aoe || false,
      save_type: spell.save_type || '',
      save_effect: spell.save_effect || '',
      concentration: spell.concentration || false,
      damage: spell.damage || '',
      upcast_damage: spell.upcast_damage || '',
      desc: spell.desc || '',
    });
    setModalType('add_spell');
  };

  const renderActiveAvatar = (character: Character) => {
    if (character.avatar_url) {
      return <img src={character.avatar_url} alt="Portrait" className="absolute inset-0 w-full h-full object-cover" />;
    }
    return (
      <div className="absolute inset-0 w-full h-full p-2.5 flex items-center justify-center">
        <User size={42} className={t.textMuted} />
      </div>
    );
  };

  const openEditFeature = (feat: Feature) => {
    data.setNewFeature({
      id: feat.id,
      name: feat.name,
      type: feat.type,
      category: feat.category,
      current: feat.current,
      max: feat.max,
      recharge: feat.recharge,
      description: feat.description || '',
      resource_id: feat.resource_id || '',
      resource_cost: feat.resource_cost || 0,
    });
    setModalType('add_feature');
  };

  const openCreateFeature = (type: Feature['type']) => {
    if (type === 'classe') {
      data.setNewFeature({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type: 'classe', resource_id: '', resource_cost: 0 });
    } else if (type === 'espece') {
      data.setNewFeature({ name: '', max: 2, recharge: 'PERMANENT', description: '', category: 'passive', type: 'espece', resource_id: '', resource_cost: 0 });
    } else if (type === 'don') {
      data.setNewFeature({ name: '', max: 3, recharge: 'LONG_REST', description: '', category: 'passive', type: 'don', resource_id: '', resource_cost: 0 });
    } else {
      // Homebrew : type de capacité défini par le MJ.
      data.setNewFeature({ name: '', max: 2, recharge: 'LONG_REST', description: '', category: 'active', type, resource_id: '', resource_cost: 0 });
    }
    setModalType('add_feature');
  };

  // Loading state
  if (data.loading && data.view === 'dashboard' && auth.user) {
    return (
      <div className={`${t.pageBg} min-h-screen ${t.textSecondary} flex flex-col items-center justify-center font-mono relative overflow-hidden`}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none"
          style={{ background: t.glow }}
        />
        <div className="relative z-10 w-52 h-52 sm:w-60 sm:h-60">
          <img src="/sidequest.svg" alt="SideQuest" className="w-full h-full object-contain animate-loaderBlink" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh max-h-dvh flex justify-center bg-black overflow-hidden">
      <div className={`${t.pageBg} w-full max-w-md tablet:max-w-3xl h-full max-h-dvh ${t.textPrimary} font-sans overflow-hidden relative ${t.selectionBg}`}>

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${t.bgImage})`, zIndex: 0 }}
      />

      {/* Blurred glass overlay */}
      {settings.bgOverlay && <div className="absolute inset-0 backdrop-blur-xs bg-black/40 pointer-events-none" style={{ zIndex: 1 }} />}

      {/* Star overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'url(/star-overlay.svg)', backgroundSize: 'fill', backgroundPosition: 'center', zIndex: 2 }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full blur-[150px] pointer-events-none transition-all duration-700"
        style={{ background: t.glow, zIndex: 2 }}
      />

      {/* Alert system */}
      {alertMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 animate-slideDown">
          <div className={`${t.alertBg} border rounded-2xl p-4 shadow-lg flex items-start gap-3`}>
            <span className="text-xl">⚡</span>
            <div>
              <h4 className={`font-bold ${t.accent} text-sm tracking-wide`}>{alertMsg.title}</h4>
              <p className={`text-xs ${t.textSecondary} mt-0.5`}>{alertMsg.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* AUTH */}
      {!auth.user || auth.authMode === 'forgot' || auth.authMode === 'reset' ? (
        <AuthScreen
          authMode={auth.authMode}
          authEmail={auth.authEmail}
          authPassword={auth.authPassword}
          authPasswordConfirm={auth.authPasswordConfirm}
          authPseudo={auth.authPseudo}
          authLoading={auth.authLoading}
          emailConfirmationPending={auth.emailConfirmationPending}
          passwordResetEmailSent={auth.passwordResetEmailSent}
          setAuthMode={auth.setAuthMode}
          setAuthEmail={auth.setAuthEmail}
          setAuthPassword={auth.setAuthPassword}
          setAuthPasswordConfirm={auth.setAuthPasswordConfirm}
          setAuthPseudo={auth.setAuthPseudo}
          onSubmit={(e) => auth.handleAuthSubmit(e, showAlert)}
          onBackToSignin={auth.backToSignin}
          onForgotPassword={auth.startForgotPassword}
        />
      ) : (
        <div className={`h-full max-h-full relative z-10 flex flex-col p-4 pb-4 overflow-hidden`}>

          {/* HEADER */}
          {data.view === 'dashboard' && (
            <AppHeader
              username={auth.user.user_metadata?.username || auth.user.email || 'Aventurier'}
              showBack={false}
              onLogout={() => { data.setLoading(true); auth.handleLogout(showAlert).then(() => data.setLoading(false)); }}
              showAlert={showAlert}
            />
          )}

          {data.view === 'dashboard' && editingSystem && (
            <GameSystemEditor
              key={editingSystem.id}
              system={editingSystem}
              onSave={(fields) => gameSystems.saveSystem(editingSystem.id, fields)}
              onDelete={() => gameSystems.deleteSystem(editingSystem.id)}
              onClose={() => { setEditingSystemId(null); setPendingHero(null); }}
              heroName={pendingHero?.name}
              onCreateHero={pendingHero ? async (structure) => {
                const created = await data.handleCreateCharacter(pendingHero.name, pendingHero.race, 'homebrew', { systemId: editingSystem.id, structure });
                if (created) { setPendingHero(null); setEditingSystemId(null); }
              } : undefined}
            />
          )}

          {/* DASHBOARD */}
          {data.view === 'dashboard' && !editingSystem && (
            <Dashboard
              characters={data.characters}
              sharedCharacters={data.sharedCharacters}
              onLeaveShare={(id) => { if (auth.user) data.removeCharacterViewer(id, auth.user.id); }}
              campaigns={data.campaigns}
              onCreateCampaign={data.createCampaign}
              onRenameCampaign={data.renameCampaign}
              onDeleteCampaign={data.deleteCampaign}
              onAssignCampaign={data.assignCampaign}
              emailConfirmed={!!auth.user.email_confirmed_at}
              onLoadCharacter={(id) => data.loadCharacterData(id)}
              onCreateCharacter={(name, race, system, homebrew) => data.handleCreateCharacter(name, race, system, homebrew)}
              gameSystems={gameSystems.systems}
              onStartNewModel={async (modelName, heroName, heroRace) => {
                // Tout nouveau modèle part de « Libre » (caractéristiques, Race et Classe de D&D par défaut).
                const model = await gameSystems.createSystem(modelName, 'libre');
                if (!model) return false;
                setPendingHero({ name: heroName, race: heroRace });
                setEditingSystemId(model.id);
                return true;
              }}
              onOpenGameSystem={setEditingSystemId}
            />
          )}

          {/* CHARACTER SHEET */}
          {data.view === 'sheet' && data.activeChar && (
            <div className="flex flex-col flex-1 overflow-hidden" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
              {data.readOnly && (
                <div className="mb-2 flex items-center justify-center gap-2 rounded-xl border border-sky-300/40 bg-sky-500/15 px-3 py-1.5 text-[10px] font-semibold text-sky-100 shrink-0">
                  <Eye size={12} />
                  <span className="truncate">
                    Lecture seule · fiche de {data.sharedCharacters.find(s => s.character.id === data.activeChar!.id)?.ownerName ?? 'un joueur'}
                  </span>
                  <span className="flex items-center gap-1 shrink-0 text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> en direct</span>
                </div>
              )}
              {hbData ? (
                <HomebrewCombatHUD
                  activeChar={data.activeChar}
                  data={hbData}
                  hpPercent={hpPercent}
                  activeConditions={data.activeConditions}
                  onChange={saveHb}
                  onOpenAvatar={() => setModalType('edit_profile')}
                  onOpenProfile={() => setModalType('edit_profile')}
                  onOpenHealth={() => setModalType('edit_hp')}
                  onOpenConditions={() => setModalType('edit_conditions')}
                  onOpenStats={() => requestTabChange('attributes')}
                  renderAvatar={() => renderActiveAvatar(data.activeChar!)}
                />
              ) : pf1Data && pf1Sheet ? (
                <Pf1CombatHUD
                  activeChar={data.activeChar}
                  sheet={pf1Sheet}
                  hasArmor={!!pf1Data.armor || !!pf1Data.shield}
                  hpPercent={hpPercent}
                  activeConditions={data.activeConditions}
                  onOpenAvatar={() => setModalType('edit_profile')}
                  onOpenProfile={() => setModalType('edit_profile')}
                  onOpenHealth={() => setModalType('edit_hp')}
                  onOpenConditions={() => setModalType('edit_conditions')}
                  onOpenHelp={() => setModalType('pf1_help')}
                  onOpenBuild={() => setModalType('pf1_build')}
                  onOpenDefense={() => setModalType('pf1_defense')}
                  renderAvatar={() => renderActiveAvatar(data.activeChar!)}
                />
              ) : (
              <DnDCombatHUD
                activeChar={data.activeChar}
                hpPercent={hpPercent}
                armorBonus={data.items.filter(it => it.category === 'armure' && it.equipped).reduce((s, it) => s + (it.defense_bonus ?? 0), 0)}
                activeConditions={data.activeConditions}
                coreAttributes={coreAttributes}
                getModValue={data.getModValue}
                onOpenAvatar={() => setModalType('edit_profile')}
                onOpenProfile={() => setModalType('edit_profile')}
                onOpenHealth={() => setModalType('edit_hp')}
                onOpenConditions={() => setModalType('edit_conditions')}
                onOpenCombatEdit={() => setModalType('edit_character')}
                onOpenAttributesEdit={() => setModalType('edit_attributes')}
                onToggleInspiration={() => {
                  const nextInspi = !data.activeChar!.heroic_inspiration;
                  data.syncCharacterField('heroic_inspiration', nextInspi);
                  showAlert(nextInspi ? 'Inspiration' : 'Inspiration dépensée', nextInspi ? 'Inspiration activée.' : 'Inspiration consommée.');
                }}
                onSpendHitDie={data.handleSpendHitDie}
                onRecoverHitDie={data.handleRecoverHitDie}
                renderAvatar={() => renderActiveAvatar(data.activeChar!)}
              />
              )}



              <main className="flex-1 min-h-0 overflow-hidden">
                <div key={activeTab} className={`h-full overflow-y-auto space-y-2 pb-24 pr-1 ${slideClass}`}>

                {activeTab === 'home' && (
                  <DnDAttributes
                    features={data.features}
                    items={data.items}
                    resources={data.resources}
                    skills={pf1Data || hbData ? [] : data.skills}
                    familiars={data.familiars}
                    activeChar={data.activeChar!}
                    getModValue={data.getModValue}
                    onToggleFeatureUse={data.toggleFeatureUse}
                    onShortRest={data.handleShortRest}
                    onLongRest={data.handleLongRest}
                    onPf1Rest={pf1Data ? data.handlePf1NightRest : undefined}
                    onUpdateResourceCurrent={data.handleUpdateResourceCurrent}
                    onUpdateFamiliarHp={data.handleUpdateFamiliarHp}
                    onNavigateTab={requestTabChange}
                    systemSections={hbData ? <HomebrewHomeSections data={hbData} onChange={saveHb} /> : pf1Data && pf1Sheet && (
                      <Pf1DefenseSection data={pf1Data} sheet={pf1Sheet} onOpenDefense={() => setModalType('pf1_defense')} />
                    )}
                  />
                )}

                {activeTab === 'spells' && pf1Data && pf1Sheet && (
                  <Pf1ActionsTab
                    data={pf1Data}
                    sheet={pf1Sheet}
                    spells={data.spells}
                    slots={pf1Slots}
                    onChange={data.syncPf1Data}
                    onToggleSlot={togglePf1Slot}
                    onOpenAttack={(attack) => { setPf1AttackTarget(attack); setModalType('pf1_attack'); }}
                    onOpenMagic={() => setModalType('pf1_magic')}
                    onOpenAddSpell={() => setModalType('add_spell')}
                    onEditSpell={openEditSpell}
                  />
                )}

                {activeTab === 'spells' && !pf1Data && (
                  <DnDSpellcasting
                    spellSlots={hbData && !hbData.structure.spellSlots ? [] : data.spellSlots}
                    spells={data.spells}
                    spellDc={data.activeChar.spell_dc}
                    spellAttack={data.activeChar.spell_attack}
                    onOpenEditSpellSlot={(slot) => {
                      data.setNewSpellSlot({ level: slot.level, max: slot.max, current: slot.current });
                      setModalType('edit_spell_slot');
                    }}
                    onToggleSpellSlot={data.handleToggleSpellSlot}
                    onOpenAddSpell={() => setModalType('add_spell')}
                    onEditSpellcasting={() => setModalType('edit_spellcasting')}
                    onEditSpell={openEditSpell}
                  />
                )}

                {activeTab === 'features' && (
                  <DnDFeatures
                    features={data.features}
                    resources={data.resources}
                    familiars={data.familiars}
                    onShortRest={data.handleShortRest}
                    onLongRest={data.handleLongRest}
                    onOpenEditFeature={openEditFeature}
                    onOpenCreateFeature={openCreateFeature}
                    onOpenAddResource={() => { data.setNewResource({ name: '', max: 10, current: 10, recharge: 'LONG_REST' }); setModalType('add_resource'); }}
                    onOpenEditResource={(res) => { data.setNewResource({ id: res.id, name: res.name, max: res.max, current: res.current, recharge: res.recharge ?? 'LONG_REST' }); setModalType('add_resource'); }}
                    onUpdateResourceCurrent={data.handleUpdateResourceCurrent}
                    onOpenAddFamiliar={() => { data.setNewFamiliar({ name: '', species: '', description: '', hp_current: 1, hp_max: 1, ac: 10, speed: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, passive_perception: 10, senses: '', abilities: '', resistances: '', darkvision: '', actions: '', avatar_url: '', status: 'present' }); setModalType('add_familiar'); }}
                    onOpenEditFamiliar={(fam: Familiar) => { data.setNewFamiliar({ id: fam.id, name: fam.name, species: fam.species || '', description: fam.description || '', hp_current: fam.hp_current, hp_max: fam.hp_max, ac: fam.ac ?? 10, speed: fam.speed || '', str: fam.str ?? 10, dex: fam.dex ?? 10, con: fam.con ?? 10, int: fam.int ?? 10, wis: fam.wis ?? 10, cha: fam.cha ?? 10, passive_perception: fam.passive_perception ?? 10, senses: fam.senses || '', abilities: fam.abilities || '', resistances: fam.resistances || '', darkvision: fam.darkvision || '', actions: fam.actions || '', avatar_url: fam.avatar_url || '', status: fam.status }); setModalType('add_familiar'); }}
                    onUpdateFamiliarHp={data.handleUpdateFamiliarHp}
                    featureGroups={hbData ? featureTypesOf(hbData.structure) : undefined}
                    showFeatures={hbData ? hbData.structure.sections.features : true}
                    showResources={hbData ? resourcesEnabled(hbData.structure) : true}
                  />
                )}

                {activeTab === 'attributes' && pf1Data && pf1Sheet && (
                  <Pf1SheetTab
                    data={pf1Data}
                    sheet={pf1Sheet}
                    onChange={data.syncPf1Data}
                  />
                )}

                {activeTab === 'attributes' && hbData && <HomebrewSkillsTab data={hbData} onChange={saveHb} />}

                {activeTab === 'attributes' && !pf1Data && !hbData && (
                  <DnDSkillsAndSaves
                    activeChar={data.activeChar}
                    skills={data.skills}
                    getModValue={data.getModValue}
                    onToggleSkill={data.handleToggleSkill}
                    saveThrows={data.saveThrows}
                    onToggleSave={data.handleToggleSave}
                  />
                )}

                {activeTab === 'inventory' && (
                  <DnDInventory
                    hidePurse={!!hbData}
                    activeChar={data.activeChar}
                    items={data.items}
                    onToggleItemEquip={data.handleToggleItemEquip}
                    onOpenAddItem={() => setModalType('add_item')}
                    onOpenCrafting={() => setModalType(pf1Data ? 'pf1_crafting' : 'crafting')}
                    extraSections={pf1Data && pf1Sheet && (
                      <Pf1CraftProjectsCard
                        projects={pf1Data.craftProjects}
                        sheet={pf1Sheet}
                        onCheck={data.handlePf1CraftCheck}
                        onAbandon={data.handlePf1AbandonCraftProject}
                      />
                    )}
                    onOpenItemAction={(item: Item) => {
                      setItemActionTarget(item);
                      setModalType('item_action');
                    }}
                    onOpenEditItem={(item: Item) => {
                      data.setNewItem({
                        id: item.id,
                        name: item.name,
                        description: item.description || '',
                        quantity: item.quantity,
                        equipped: item.equipped,
                        category: item.category || 'objet',
                        damage: item.damage || '',
                        range: item.range || '',
                        defense_bonus: item.defense_bonus || 0,
                      });
                      setModalType('add_item');
                    }}
                    onUpdateCurrency={data.syncCharacterField}
                  />
                )}

                {activeTab === 'biography' && (
                  <DnDBiography
                    biography={data.biography}
                    onOpenEdit={() => setModalType('edit_biography')}
                    onOpenPersonalityEdit={() => setModalType('edit_personality')}
                    onOpenBackstoryEdit={() => setModalType('edit_backstory')}
                  />
                )}

                {activeTab === 'notes' && (
                  <DnDNotes
                    notes={data.notes}
                    onOpenAddNote={() => { data.setNewNote({ title: '', content: '' }); setModalType('add_note'); }}
                    onOpenEditNote={(note) => { data.setNewNote({ id: note.id, title: note.title, content: note.content }); setModalType('add_note'); }}
                    onDeleteNote={data.handleDeleteNote}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsTab
                    activeCharacterName={data.activeChar?.name}
                    // Fiche d'un autre joueur : ni thème de fiche, ni suppression, ni partage.
                    characterTheme={data.readOnly ? undefined : data.activeChar.theme ?? null}
                    onChangeCharacterTheme={data.readOnly ? undefined : (theme) => data.syncCharacterField('theme', theme)}
                    onDeleteCharacter={data.readOnly ? undefined : data.handleDeleteCharacter}
                    shareSection={!data.readOnly && (
                      <CharacterShareCard
                        characterId={data.activeChar.id}
                        createShareLink={data.createShareLink}
                        fetchCharacterViewers={data.fetchCharacterViewers}
                        removeCharacterViewer={data.removeCharacterViewer}
                      />
                    )}
                  />
                )}
                </div>
              </main>

              <BottomNav activeTab={activeTab} setActiveTab={requestTabChange} onDashboard={() => data.setView('dashboard')} iconOverrides={pf1Data ? { spells: Swords } : undefined} hiddenTabs={hiddenTabs} />
            </div>
          )}

          {/* MODALS */}
          {modalType === 'edit_profile' && data.activeChar && (
            <EditProfileModal
              activeChar={data.activeChar}
              syncCharacterField={data.syncCharacterField}
              pf1={pf1Data ? { data: pf1Data, onChange: (next) => data.syncPf1Data(next) } : undefined}
              onAvatarUpload={data.handleAvatarUpload}
              onRemoveAvatar={async () => {
                const char = data.activeChar!;
                data.setActiveChar({ ...char, avatar_url: '', avatar_key: '' });
                await supabase.from('characters').update({ avatar_url: '', avatar_key: '' }).eq('id', char.id);
              }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'edit_character' && data.activeChar && (
            <EditCombatModal activeChar={data.activeChar} syncCharacterField={data.syncCharacterField} onClose={() => setModalType(null)} />
          )}
          {modalType === 'edit_attributes' && data.activeChar && (
            <EditAttributesModal activeChar={data.activeChar} coreAttributes={coreAttributes} syncCharacterField={data.syncCharacterField} onClose={() => setModalType(null)} />
          )}
          {modalType === 'edit_hp' && data.activeChar && (
            <EditHpModal activeChar={data.activeChar} syncCharacterField={data.syncCharacterField} applyDamage={data.applyDamage} applyHealing={data.applyHealing} onClose={() => setModalType(null)} />
          )}
          {modalType === 'edit_conditions' && (
            <EditConditionsModal activeConditions={data.activeConditions} setActiveConditions={data.setActiveConditions} onClose={() => setModalType(null)} />
          )}
          {modalType === 'add_feature' && (
            <AddFeatureModal perDayOnly={!!pf1Data} typeOptions={hbData ? featureTypesOf(hbData.structure) : undefined} newFeature={data.newFeature} setNewFeature={data.setNewFeature} resources={data.resources} onSubmit={(e) => { data.handleSaveFeature(e); setModalType(null); }} onDelete={data.handleDeleteFeature} onClose={() => setModalType(null)} />
          )}
          {modalType === 'add_resource' && (
            <AddResourceModal perDayOnly={!!pf1Data} newResource={data.newResource} setNewResource={data.setNewResource} onSubmit={async (e) => { const ok = await data.handleSaveResource(e); if (ok) setModalType(null); }} onDelete={async (id) => { await data.handleDeleteResource(id); setModalType(null); }} onClose={() => setModalType(null)} />
          )}
          {modalType === 'edit_spell_slot' && (
            <EditSpellSlotModal
              newSpellSlot={data.newSpellSlot}
              setNewSpellSlot={data.setNewSpellSlot}
              onSave={async () => {
                data.setSpellSlots(prev => prev.map(s => s.level === data.newSpellSlot.level ? { ...s, max: data.newSpellSlot.max, current: Math.min(data.newSpellSlot.current, data.newSpellSlot.max) } : s));
                setModalType(null);
                if (data.activeChar) {
                  await supabase
                    .from('spell_slots')
                    .update({
                      max: data.newSpellSlot.max,
                      current: Math.min(data.newSpellSlot.current, data.newSpellSlot.max),
                    })
                    .eq('character_id', data.activeChar.id)
                    .eq('level', data.newSpellSlot.level);
                }
                showAlert("Slots Synchronisés", "Nombre total et utilisations restantes mis à jour.");
              }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'edit_spellcasting' && data.activeChar && (
            <EditSpellcastingModal activeChar={data.activeChar} syncCharacterField={data.syncCharacterField} onClose={() => setModalType(null)} />
          )}
          {modalType === 'add_spell' && (
            <AddSpellModal newSpell={data.newSpell} setNewSpell={data.setNewSpell} onSubmit={async (e) => { await data.handleAddSpell(e); setModalType(null); }} onDelete={data.handleDeleteSpell} onClose={() => { data.setNewSpell({ name: '', level: 0, range: '', duration: '', components: [], material_components: '', casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', upcast_damage: '', desc: '' }); setModalType(null); }} />
          )}
          {modalType === 'death_saves' && data.activeChar && (
            <DeathSavingThrowsModal
              characterName={data.activeChar.name}
              onStabilize={() => {
                data.syncCharacterField('hp_current', 1);
                setModalType(null);
              }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'add_familiar' && (
            <AddFamiliarModal
              newFamiliar={data.newFamiliar}
              setNewFamiliar={data.setNewFamiliar}
              onSubmit={async (e) => { await data.handleSaveFamiliar(e); setModalType(null); }}
              onDelete={data.handleDeleteFamiliar}
              onAvatarUpload={data.handleFamiliarAvatarUpload}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'add_item' && (
            <AddItemModal
              newItem={data.newItem}
              setNewItem={data.setNewItem}
              onSubmit={async (e) => { await data.handleSaveItem(e); setModalType(null); }}
              onDelete={data.handleDeleteItem}
              onClose={() => {
                data.setNewItem({ name: '', description: '', quantity: 1, equipped: false, category: 'objet', damage: '', range: '', defense_bonus: 0 });
                setModalType(null);
              }}
            />
          )}
          {modalType === 'pf1_crafting' && pf1Sheet && data.activeChar && (
            <Pf1CraftingModal
              sheet={pf1Sheet}
              purseCp={data.activeChar.gold * 100 + data.activeChar.silver * 10 + data.activeChar.copper}
              onStartProject={data.handlePf1StartCraftProject}
              onCraftMagic={data.handlePf1CraftMagicItem}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'crafting' && (
            <CraftingModal
              items={data.items}
              onSubmit={data.handleCraftItem}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'item_action' && itemActionTarget && (
            <ItemActionModal
              item={itemActionTarget}
              onUse={data.handleUseItem}
              onSell={data.handleSellItem}
              onClose={() => {
                setItemActionTarget(null);
                setModalType(null);
              }}
            />
          )}
          {modalType === 'edit_biography' && (
            <EditBiographyModal
              biography={data.biography}
              onSave={data.saveBiography}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'edit_backstory' && (
            <EditBackstoryModal
              biography={data.biography}
              onSave={data.saveBiography}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'edit_personality' && (
            <EditPersonalityModal
              biography={data.biography}
              onSave={data.saveBiography}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'pf1_help' && (
            <Pf1HelpModal onClose={() => setModalType(null)} />
          )}
          {modalType === 'pf1_build' && pf1Data && data.activeChar && (
            <Pf1StatsModal
              data={pf1Data}
              onSave={async (next) => { setModalType(null); await data.syncPf1Data(next); }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'pf1_defense' && pf1Data && data.activeChar && (
            <Pf1DefenseModal
              data={pf1Data}
              speed={data.activeChar.speed}
              level={data.activeChar.level}
              onSave={async (next, speed) => {
                setModalType(null);
                await data.syncPf1Data(next);
                if (speed !== data.activeChar!.speed) await data.syncCharacterField('speed', speed);
              }}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === 'pf1_attack' && pf1Data && (
            <Pf1AttackModal
              attack={pf1AttackTarget}
              onSave={(attack) => {
                const exists = pf1Data.attacks.some(a => a.id === attack.id);
                data.syncPf1Data({ ...pf1Data, attacks: exists ? pf1Data.attacks.map(a => (a.id === attack.id ? attack : a)) : [...pf1Data.attacks, attack] });
                setPf1AttackTarget(null);
                setModalType(null);
              }}
              onDelete={(id) => {
                data.syncPf1Data({ ...pf1Data, attacks: pf1Data.attacks.filter(a => a.id !== id) });
                setPf1AttackTarget(null);
                setModalType(null);
              }}
              onClose={() => { setPf1AttackTarget(null); setModalType(null); }}
            />
          )}
          {modalType === 'pf1_magic' && pf1Data && (
            <Pf1MagicModal data={pf1Data} onSave={(next) => { data.syncPf1Data(next); setModalType(null); }} onClose={() => setModalType(null)} />
          )}
          {modalType === 'add_note' && (
            <AddNoteModal
              newNote={data.newNote}
              setNewNote={data.setNewNote}
              onSubmit={data.handleSaveNote}
              onClose={() => { data.setNewNote({ title: '', content: '' }); setModalType(null); }}
            />
          )}
        </div>
      )}

      {/* Global styles */}
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInFromRight {
          animation: slideInFromRight 280ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes slideInFromLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInFromLeft {
          animation: slideInFromLeft 280ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleUp {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes loaderBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .animate-loaderBlink {
          animation: loaderBlink 1.1s ease-in-out infinite;
        }
        @keyframes loaderBar {
          0% { background-position: 200% center; width: 30%; }
          50% { background-position: 0% center; width: 80%; }
          100% { background-position: 200% center; width: 30%; }
        }
        .animate-loaderBar {
          animation: loaderBar 1.6s ease-in-out infinite;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
      `}</style>
    </div>
    </div>
  );
}
