import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { useCharacterData } from './hooks/useCharacterData';
import { useSwipeNav } from './hooks/useSwipeNav';
import { useThemeClasses, useAppSettings } from './contexts/AppSettingsContext';
import type { Character, CoreAttribute, Feature, Item, Familiar } from './types/rpg.types';
import { User } from 'lucide-react';

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
import { ChangeAvatarModal } from './components/modals/ChangeAvatarModal';
import { EditConditionsModal } from './components/modals/EditConditionsModal';
import { EditSpellcastingModal } from './components/modals/EditSpellcastingModal';
import { EditBiographyModal } from './components/modals/EditBiographyModal';
import { EditBackstoryModal } from './components/modals/EditBackstoryModal';
import { EditPersonalityModal } from './components/modals/EditPersonalityModal';
import { AddFamiliarModal } from './components/modals/AddFamiliarModal';
import { DeathSavingThrowsModal } from './components/modals/DeathSavingThrowsModal';

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
  const [activeTab, setActiveTab] = useState<'home' | 'spells' | 'features' | 'attributes' | 'inventory' | 'biography' | 'settings'>('home');
  const swipe = useSwipeNav(activeTab, setActiveTab);

  const [modalType, setModalType] = useState<string | null>(null);

  // Death saves auto-trigger
  const deathSaveShownRef = useRef(false);
  useEffect(() => {
    if (data.activeChar?.hp_current === 0 && !deathSaveShownRef.current) {
      deathSaveShownRef.current = true;
      setModalType('death_saves');
    } else if ((data.activeChar?.hp_current ?? 0) > 0) {
      deathSaveShownRef.current = false;
    }
  }, [data.activeChar?.hp_current]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    } else {
      data.setNewFeature({ name: '', max: 3, recharge: 'LONG_REST', description: '', category: 'passive', type: 'don', resource_id: '', resource_cost: 0 });
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
          <img src="/logo.svg" alt="SideQuest" className="w-full h-full object-contain animate-loaderBlink" />
        </div>
        {/* Loading bar */}
        <div className="relative z-10 mt-6 w-48 sm:w-56 flex flex-col items-center gap-2">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(139,92,246,0.2)' }}>
            <div className="h-full rounded-full animate-loaderBar" style={{ background: 'linear-gradient(90deg, #a78bfa, #e879f9, #a78bfa)', backgroundSize: '200% 100%' }} />
          </div>
          <span className="text-xs tracking-widest uppercase animate-loaderBlink" style={{ color: 'rgba(167,139,250,0.7)' }}>Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh max-h-dvh flex justify-center bg-black overflow-hidden">
      <div className={`${t.pageBg} w-full max-w-md h-full max-h-dvh ${t.textPrimary} font-sans overflow-hidden relative ${t.selectionBg}`}>

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
      {!auth.user ? (
        <AuthScreen
          authMode={auth.authMode}
          authEmail={auth.authEmail}
          authPassword={auth.authPassword}
          authPseudo={auth.authPseudo}
          authLoading={auth.authLoading}
          setAuthMode={auth.setAuthMode}
          setAuthEmail={auth.setAuthEmail}
          setAuthPassword={auth.setAuthPassword}
          setAuthPseudo={auth.setAuthPseudo}
          onSubmit={(e) => auth.handleAuthSubmit(e, showAlert)}
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

          {/* DASHBOARD */}
          {data.view === 'dashboard' && (
            <Dashboard
              characters={data.characters}
              onLoadCharacter={(id) => data.loadCharacterData(id)}
              onCreateCharacter={(name, race) => data.handleCreateCharacter(name, race)}
            />
          )}

          {/* CHARACTER SHEET */}
          {data.view === 'sheet' && data.activeChar && (
            <div className="flex flex-col flex-1 overflow-hidden" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
              <DnDCombatHUD
                activeChar={data.activeChar}
                hpPercent={hpPercent}
                activeConditions={data.activeConditions}
                coreAttributes={coreAttributes}
                getModValue={data.getModValue}
                onOpenAvatar={() => setModalType('change_avatar')}
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



              <main className="flex-1 overflow-y-auto space-y-2 pb-24 pr-1">

                {activeTab === 'home' && (
                  <DnDAttributes
                    features={data.features}
                    items={data.items}
                    resources={data.resources}
                    skills={data.skills}
                    familiars={data.familiars}
                    activeChar={data.activeChar!}
                    getModValue={data.getModValue}
                    onToggleFeatureUse={data.toggleFeatureUse}
                    onShortRest={data.handleShortRest}
                    onLongRest={data.handleLongRest}
                    onUpdateResourceCurrent={data.handleUpdateResourceCurrent}
                    onUpdateFamiliarHp={data.handleUpdateFamiliarHp}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'spells' && (
                  <DnDSpellcasting
                    spellSlots={data.spellSlots}
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
                    onEditSpell={(spell) => {
                      data.setNewSpell({
                        id: spell.id,
                        name: spell.name,
                        level: spell.level,
                        range: spell.range || '',
                        duration: spell.duration || '',
                        components: spell.components || [],
                        casting_type: spell.casting_type || 'action',
                        is_aoe: spell.is_aoe || false,
                        save_type: spell.save_type || '',
                        save_effect: spell.save_effect || '',
                        concentration: spell.concentration || false,
                        damage: spell.damage || '',
                        desc: spell.desc || '',
                      });
                      setModalType('add_spell');
                    }}
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
                    onOpenAddFamiliar={() => { data.setNewFamiliar({ name: '', species: '', description: '', hp_current: 1, hp_max: 1, ac: 10, speed: '', str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, passive_perception: 10, senses: '', abilities: '', status: 'present' }); setModalType('add_familiar'); }}
                    onOpenEditFamiliar={(fam: Familiar) => { data.setNewFamiliar({ id: fam.id, name: fam.name, species: fam.species || '', description: fam.description || '', hp_current: fam.hp_current, hp_max: fam.hp_max, ac: fam.ac ?? 10, speed: fam.speed || '', str: fam.str ?? 10, dex: fam.dex ?? 10, con: fam.con ?? 10, int: fam.int ?? 10, wis: fam.wis ?? 10, cha: fam.cha ?? 10, passive_perception: fam.passive_perception ?? 10, senses: fam.senses || '', abilities: fam.abilities || '', status: fam.status }); setModalType('add_familiar'); }}
                    onUpdateFamiliarHp={data.handleUpdateFamiliarHp}
                  />
                )}

                {activeTab === 'attributes' && (
                  <DnDSkillsAndSaves
                    activeChar={data.activeChar}
                    skills={data.skills}
                    getModValue={data.getModValue}
                    onToggleSkill={data.handleToggleSkill}
                  />
                )}

                {activeTab === 'inventory' && (
                  <DnDInventory
                    activeChar={data.activeChar}
                    items={data.items}
                    onToggleItemEquip={data.handleToggleItemEquip}
                    onOpenAddItem={() => setModalType('add_item')}
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

                {activeTab === 'settings' && (
                  <SettingsTab
                    activeCharacterName={data.activeChar?.name}
                    onDeleteCharacter={data.handleDeleteCharacter}
                  />
                )}
              </main>

              <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onDashboard={() => data.setView('dashboard')} />
            </div>
          )}

          {/* MODALS */}
          {modalType === 'edit_profile' && data.activeChar && (
            <EditProfileModal activeChar={data.activeChar} syncCharacterField={data.syncCharacterField} onClose={() => setModalType(null)} />
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
            <AddFeatureModal newFeature={data.newFeature} setNewFeature={data.setNewFeature} resources={data.resources} onSubmit={(e) => { data.handleSaveFeature(e); setModalType(null); }} onDelete={data.handleDeleteFeature} onClose={() => setModalType(null)} />
          )}
          {modalType === 'add_resource' && (
            <AddResourceModal newResource={data.newResource} setNewResource={data.setNewResource} onSubmit={async (e) => { const ok = await data.handleSaveResource(e); if (ok) setModalType(null); }} onDelete={async (id) => { await data.handleDeleteResource(id); setModalType(null); }} onClose={() => setModalType(null)} />
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
            <AddSpellModal newSpell={data.newSpell} setNewSpell={data.setNewSpell} onSubmit={async (e) => { await data.handleAddSpell(e); setModalType(null); }} onDelete={data.handleDeleteSpell} onClose={() => { data.setNewSpell({ name: '', level: 0, range: '', duration: '', components: [], casting_type: 'action', is_aoe: false, save_type: '', save_effect: '', concentration: false, damage: '', desc: '' }); setModalType(null); }} />
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
          {modalType === 'change_avatar' && data.activeChar && (
            <ChangeAvatarModal
              activeChar={data.activeChar}
              setActiveChar={data.setActiveChar}
              onAvatarUpload={(e) => { data.handleAvatarUpload(e); setModalType(null); }}
              showAlert={showAlert}
              onClose={() => setModalType(null)}
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
        </div>
      )}

      {/* Global styles */}
      <style>{`
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
