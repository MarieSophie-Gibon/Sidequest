import { useState } from 'react';
import type { Character, GameSystem } from '../types/rpg.types';
import { GAME_SYSTEM_LABELS } from '../types/rpg.types';

/** Couleur du badge de système de jeu sur les cartes de personnage. */
const SYSTEM_BADGE: Record<GameSystem, string> = {
  dnd5e: 'text-rose-300 bg-rose-500/12 border-rose-400/35',
  pf1e: 'text-amber-300 bg-amber-500/12 border-amber-400/35',
  homebrew: 'text-emerald-300 bg-emerald-500/12 border-emerald-400/35',
};
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { BookMarked, ChevronRight, Coffee, Mail, MessageSquare, Swords, User } from 'lucide-react';
import type { Campaign, SharedCharacter } from '../hooks/useCharacterData';
import type { GameSystemRecord, HomebrewStructure } from '../systems/homebrew/types';
import { SharedCharactersSection } from './SharedCharactersSection';
import { ContactAdminModal } from './modals/ContactAdminModal';
import { KOFI_URL } from '../config';
import { KofiModal } from './modals/KofiModal';

interface Props {
  characters: Character[];
  /** Fiches partagées avec moi par d'autres joueurs (lecture seule). */
  sharedCharacters: SharedCharacter[];
  onLeaveShare: (characterId: string) => void;
  campaigns: Campaign[];
  onCreateCampaign: (name: string) => Promise<Campaign | null>;
  onRenameCampaign: (id: string, name: string) => void;
  onDeleteCampaign: (id: string) => void;
  onAssignCampaign: (characterId: string, campaignId: string | null) => void;
  emailConfirmed: boolean;
  onLoadCharacter: (charId: string) => void;
  onCreateCharacter: (name: string, race: string, system: GameSystem, homebrew?: { systemId: string; structure: HomebrewStructure }) => Promise<Character | null | undefined>;
  /** Modèles homebrew du joueur (onglet Systèmes), proposés à la création d'un héros. */
  gameSystems: GameSystemRecord[];
  /** Nouveau modèle depuis la création du héros : ouvre sa configuration, le héros est créé ensuite. */
  onStartNewModel: (modelName: string, heroName: string, heroRace: string) => Promise<boolean>;
  /** Ouvre un modèle dans l'éditeur de systèmes. */
  onOpenGameSystem: (id: string) => void;
}

export function Dashboard({
  characters, sharedCharacters, onLeaveShare, campaigns, onCreateCampaign, onRenameCampaign, onDeleteCampaign, onAssignCampaign,
  emailConfirmed, onLoadCharacter, onCreateCharacter, gameSystems, onStartNewModel, onOpenGameSystem,
}: Props) {
  const [isCreateHeroModalOpen, setIsCreateHeroModalOpen] = useState(false);
  const [newHeroNameInput, setNewHeroNameInput] = useState('Nouveau Héros');
  const [newHeroRaceInput, setNewHeroRaceInput] = useState('Humain');
  const [newHeroSystem, setNewHeroSystem] = useState<GameSystem>('dnd5e');
  // Homebrew : modèle choisi, ou création d'un modèle sur place.
  const [modelId, setModelId] = useState<string>('');
  const [newModelOpen, setNewModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const selectedModel = gameSystems.find(g => g.id === modelId) ?? null;
  const homebrewMissingModel = newHeroSystem === 'homebrew' && !selectedModel;
  // Libellé du champ race ; vide si le modèle homebrew n'a pas de race (champ supprimé par le MJ).
  const raceFieldLabel = newHeroSystem === 'homebrew' && selectedModel ? selectedModel.structure.identity.race : 'Race';
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [kofiOpen, setKofiOpen] = useState(false);
  const t = useThemeClasses();

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* -mx/px et -mt/pt : laissent de la place au zoom et à l'ombre des cartes, que le défilement rognerait sinon. */}
      <div className="flex-1 overflow-y-auto space-y-2 tablet:space-y-0 tablet:grid tablet:grid-cols-2 tablet:gap-2 tablet:content-start pb-3 -mx-2 px-2 -mt-1 pt-1">
        {characters.length > 0 ? (
          characters.map(char => (
            <div
              key={char.id}
              onClick={() => onLoadCharacter(char.id)}
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl min-h-21 flex items-stretch cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md ${t.cardShadow} group relative overflow-hidden`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" style={{ boxShadow: `inset 0 0 30px ${t.glowAccent}`, zIndex: 1 }} />

              {/* Avatar : toute la hauteur, collé à gauche, fondu vers la droite dans le verre de la carte */}
              <div
                className="relative w-28 shrink-0 self-stretch"
                style={{
                  maskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
                }}
              >
                {char.avatar_url ? (
                  <img src={char.avatar_url} alt={char.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                ) : (
                  <div className={`absolute inset-0 w-full h-full ${t.inputBg} flex items-center justify-start pl-6`}>
                    <User size={28} className={t.textMuted} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="relative z-10 flex-1 flex flex-col justify-center min-w-0 -ml-6 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className={`text-sm font-bold ${t.textPrimary} group-hover:${t.accent} transition-colors truncate`}>{char.name}</h2>
                  <span className={`shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${SYSTEM_BADGE[char.system ?? 'dnd5e']}`}>
                    {GAME_SYSTEM_LABELS[char.system ?? 'dnd5e']}
                  </span>
                </div>
                <p className={`text-[10px] ${t.textSecondary} mt-0.5 font-medium truncate`}>
                  Niv. {char.level} • <span className={t.accent}>{char.class}</span> {char.race}
                </p>
                <div className={`text-[9px] font-mono ${t.textMuted} mt-1.5 flex gap-2 uppercase`}>
                  <span>HP: {char.hp_current}/{char.hp_max}</span>
                  <span>CA: {char.ac}</span>
                </div>
              </div>

              <span className={`${t.textMuted} group-hover:${t.accent} group-hover:translate-x-1 transition-all text-lg relative z-10 self-center px-3`}>➔</span>
            </div>
          ))
        ) : (
          <div className={`tablet:col-span-2 border-2 border-dashed ${t.cardBorder} rounded-2xl p-8 text-center ${t.cardBg}/70`}>
            <p className={`text-sm ${t.textSecondary} italic`}>Aucun aventurier n'est encore enregistré.</p>
          </div>
        )}

        {/* Mes modèles de fiche (systèmes homebrew) : catégorie à part, comme les fiches partagées */}
        {gameSystems.length > 0 && (
          <>
            <h3 className={`tablet:col-span-2 pt-3 text-[10px] font-bold uppercase tracking-wider ${t.textMuted} flex items-center gap-1.5`}>
              <BookMarked size={12} /> Mes modèles
            </h3>
            {gameSystems.map(sys => {
              const used = characters.filter(c => c.game_system_id === sys.id).length;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => onOpenGameSystem(sys.id)}
                  className={`w-full text-left ${t.cardBg} border border-emerald-300/30 rounded-2xl flex items-center gap-3 px-3 py-2.5 hover:brightness-110 active:scale-[0.98] transition-all shadow-sm ${t.cardShadow}`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/12 border border-emerald-400/35 flex items-center justify-center">
                    <BookMarked size={18} className="text-emerald-300" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{sys.name}</span>
                      <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none text-emerald-300 bg-emerald-500/12 border-emerald-400/35">Modèle</span>
                    </span>
                    <span className={`block text-[10px] ${t.textMuted} truncate`}>
                      {sys.structure.stats.length} caract. · {sys.structure.skills.length} compétences
                      {used > 0 && ` · ${used} héros`}
                    </span>
                  </span>
                  <ChevronRight size={16} className={t.textMuted} />
                </button>
              );
            })}
          </>
        )}

        {/* Fiches que des joueurs ont partagées avec moi (je suis leur MJ), rangées par campagne */}
        <SharedCharactersSection
          sharedCharacters={sharedCharacters}
          campaigns={campaigns}
          onLoadCharacter={onLoadCharacter}
          onLeaveShare={onLeaveShare}
          onCreateCampaign={onCreateCampaign}
          onRenameCampaign={onRenameCampaign}
          onDeleteCampaign={onDeleteCampaign}
          onAssignCampaign={onAssignCampaign}
        />
      </div>

      <div className="pt-2 pb-1 shrink-0">
        {emailConfirmed ? (
          <button
            onClick={() => {
              setNewHeroNameInput('Nouveau Héros');
              setNewHeroRaceInput('Humain');
              setNewHeroSystem('dnd5e');
              setIsCreateHeroModalOpen(true);
            }}
            className={`w-full flex items-center justify-center gap-2.5 ${t.cardBg} border ${t.accentBorder} ${t.accent} rounded-2xl py-3 text-xs font-bold uppercase tracking-widest shadow-md hover:brightness-110 active:scale-[0.98] transition-all`}
            style={{ boxShadow: `0 0 18px ${t.glowAccent}` }}
          >
            <Swords size={15} />
            Créer un nouvel aventurier
          </button>
        ) : (
          <div className={`w-full flex items-center gap-3 ${t.cardBg} border ${t.cardBorder} rounded-2xl py-3 px-4 opacity-60`}>
            <Mail size={15} className={t.textMuted} />
            <span className={`text-xs ${t.textMuted} italic`}>
              Confirmez votre email pour créer un personnage.
            </span>
          </div>
        )}

        {/* Aide et soutien : discret, sous l'action principale */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => { setContactSent(false); setContactOpen(true); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all active:scale-95 ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textMuted} hover:${t.accent} hover:brightness-110`}
          >
            <MessageSquare size={11} /> {contactSent ? 'Message envoyé, merci !' : 'Bug ou idée ?'}
          </button>
          {KOFI_URL && (
            <button
              type="button"
              onClick={() => setKofiOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all active:scale-95 bg-amber-500/10 border-amber-400/30 ${t.textMuted} hover:text-amber-300 hover:bg-amber-500/20`}
            >
              <Coffee size={11} className="text-amber-300" /> Soutenir sur Ko-fi
            </button>
          )}
        </div>
      </div>
      {kofiOpen && <KofiModal onClose={() => setKofiOpen(false)} />}

      {contactOpen && (
        <ContactAdminModal
          onSent={() => { setContactOpen(false); setContactSent(true); }}
          onClose={() => setContactOpen(false)}
        />
      )}

      {isCreateHeroModalOpen && (
        <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (homebrewMissingModel) return;
              const created = await onCreateCharacter(
                newHeroNameInput,
                newHeroRaceInput,
                newHeroSystem,
                newHeroSystem === 'homebrew' && selectedModel ? { systemId: selectedModel.id, structure: selectedModel.structure } : undefined,
              );
              if (created) {
                setIsCreateHeroModalOpen(false);
                setNewHeroNameInput('Nouveau Héros');
                setNewHeroRaceInput('Humain');
              }
            }}
            className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-5 w-full max-w-sm shadow-2xl ${t.cardShadow} space-y-4 animate-scaleUp`}
          >
            <h3 className={`font-bold ${t.textPrimary} text-sm tracking-wide uppercase`}>Forger un nouveau héros</h3>
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Système de jeu</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(GAME_SYSTEM_LABELS) as GameSystem[]).map(sys => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setNewHeroSystem(sys)}
                    className={`py-2.5 px-1 rounded-xl text-[11px] font-bold uppercase tracking-wide border transition-all active:scale-95 ${newHeroSystem === sys ? `bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder} shadow-sm` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
                  >
                    {GAME_SYSTEM_LABELS[sys]}
                  </button>
                ))}
              </div>
            </div>

            {/* Homebrew : choisir un modèle (onglet Systèmes) ou en créer un sur place */}
            {newHeroSystem === 'homebrew' && (
              <div className="space-y-2">
                <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block`}>Modèle de fiche</label>
                {gameSystems.length > 0 && (
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none`}
                  >
                    <option value="">Choisir un modèle…</option>
                    {gameSystems.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                )}
                {newModelOpen ? (
                  <div className={`${t.inputBg} border ${t.cardBorder} rounded-xl p-2.5 space-y-2`}>
                    <input
                      value={newModelName}
                      maxLength={80}
                      placeholder="Nom du nouveau modèle"
                      onChange={(e) => setNewModelName(e.target.value)}
                      className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg px-2.5 py-2 w-full text-xs focus:outline-none`}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setNewModelOpen(false)} className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`}>Annuler</button>
                      <button
                        type="button"
                        disabled={!newModelName.trim() || !newHeroNameInput.trim()}
                        onClick={async () => {
                          // Étape 2 : configuration du modèle, puis création du héros depuis l'éditeur.
                          const started = await onStartNewModel(newModelName, newHeroNameInput, newHeroRaceInput);
                          if (started) {
                            setIsCreateHeroModalOpen(false);
                            setNewModelOpen(false);
                            setNewModelName('');
                          }
                        }}
                        className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold disabled:opacity-40 ${t.accentBg} ${t.accentBorder} ${t.accent}`}
                      >
                        Configurer le modèle →
                      </button>
                    </div>
                    <p className={`text-[10px] ${t.textMuted}`}>Étape suivante : coche les éléments de ton jeu (caractéristiques, compétences, sorts…), puis crée le héros.</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNewModelOpen(true)}
                    className={`w-full py-1.5 rounded-xl border border-dashed ${t.cardBorder} text-[11px] font-semibold ${t.textSecondary}`}
                  >
                    + Nouveau modèle
                  </button>
                )}
                {selectedModel && (
                  <p className={`text-[10px] ${t.textMuted}`}>
                    {selectedModel.structure.stats.length} caractéristiques · {selectedModel.structure.skills.length} compétences. La fiche reçoit une copie de ce modèle.
                  </p>
                )}
              </div>
            )}
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Nom du héros</label>
              <input
                type="text"
                value={newHeroNameInput}
                onChange={(e) => setNewHeroNameInput(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50`}
                autoFocus
              />
            </div>
            {raceFieldLabel && <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>{raceFieldLabel}</label>
              <input
                type="text"
                value={newHeroRaceInput}
                onChange={(e) => setNewHeroRaceInput(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50`}
                placeholder="Humain"
              />
            </div>}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreateHeroModalOpen(false);
                  setNewHeroNameInput('Nouveau Héros');
                  setNewHeroRaceInput('Humain');
                }}
                className={`${t.btnSecondaryBg} ${t.btnSecondaryText} font-bold py-2.5 rounded-xl text-xs uppercase border ${t.btnSecondaryBorder} tracking-wider transition-all hover:brightness-105 active:scale-95`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={homebrewMissingModel}
                className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold shadow-md hover:brightness-110 active:scale-95 border ${t.btnPrimaryBorder} py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40`}
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
