import { useState } from 'react';
import type { Character, GameSystem } from '../types/rpg.types';
import { GAME_SYSTEM_LABELS } from '../types/rpg.types';

/** Couleur du badge de système de jeu sur les cartes de personnage. */
const SYSTEM_BADGE: Record<GameSystem, string> = {
  dnd5e: 'text-rose-300 bg-rose-500/12 border-rose-400/35',
  pf1e: 'text-amber-300 bg-amber-500/12 border-amber-400/35',
};
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { Coffee, Eye, Mail, MessageSquare, Swords, User, X } from 'lucide-react';
import type { SharedCharacter } from '../hooks/useCharacterData';
import { ContactAdminModal } from './modals/ContactAdminModal';
import { KOFI_URL } from '../config';

interface Props {
  characters: Character[];
  /** Fiches partagées avec moi par d'autres joueurs (lecture seule). */
  sharedCharacters: SharedCharacter[];
  onLeaveShare: (characterId: string) => void;
  emailConfirmed: boolean;
  onLoadCharacter: (charId: string) => void;
  onCreateCharacter: (name: string, race: string, system: GameSystem) => Promise<Character | null | undefined>;
}

export function Dashboard({ characters, sharedCharacters, onLeaveShare, emailConfirmed, onLoadCharacter, onCreateCharacter }: Props) {
  const [isCreateHeroModalOpen, setIsCreateHeroModalOpen] = useState(false);
  const [newHeroNameInput, setNewHeroNameInput] = useState('Nouveau Héros');
  const [newHeroRaceInput, setNewHeroRaceInput] = useState('Humain');
  const [newHeroSystem, setNewHeroSystem] = useState<GameSystem>('dnd5e');
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
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

        {/* Fiches que des joueurs ont partagées avec moi (je suis leur MJ) */}
        {sharedCharacters.length > 0 && (
          <>
            <h3 className={`tablet:col-span-2 pt-3 text-[10px] font-bold uppercase tracking-wider ${t.textMuted} flex items-center gap-1.5`}>
              <Eye size={12} /> Partagées avec moi
            </h3>
            {sharedCharacters.map(({ character: char, ownerName }) => (
              <div
                key={char.id}
                onClick={() => onLoadCharacter(char.id)}
                className={`${t.cardBg} border border-sky-300/30 rounded-2xl flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all shadow-sm ${t.cardShadow}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl overflow-hidden ${t.inputBg} flex items-center justify-center`}>
                  {char.avatar_url
                    ? <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover object-top" />
                    : <User size={18} className={t.textMuted} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold ${t.textPrimary} truncate`}>{char.name}</span>
                    <span className={`shrink-0 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border leading-none ${SYSTEM_BADGE[char.system ?? 'dnd5e']}`}>
                      {GAME_SYSTEM_LABELS[char.system ?? 'dnd5e']}
                    </span>
                  </div>
                  <p className={`text-[10px] ${t.textMuted} truncate`}>Fiche de {ownerName} · Niv. {char.level} · PV {char.hp_current}/{char.hp_max}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onLeaveShare(char.id); }}
                  className={`shrink-0 ${t.textMuted} hover:text-rose-300 transition-colors`}
                  aria-label={`Ne plus suivre la fiche de ${char.name}`}
                  title="Ne plus suivre cette fiche"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </>
        )}
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
            Forger un nouveau héros
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
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all active:scale-95 bg-amber-500/10 border-amber-400/30 ${t.textMuted} hover:text-amber-300 hover:bg-amber-500/20`}
            >
              <Coffee size={11} className="text-amber-300" /> Soutenir sur Ko-fi
            </a>
          )}
        </div>
      </div>

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
              const created = await onCreateCharacter(newHeroNameInput, newHeroRaceInput, newHeroSystem);
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
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(GAME_SYSTEM_LABELS) as GameSystem[]).map(sys => (
                  <button
                    key={sys}
                    type="button"
                    onClick={() => setNewHeroSystem(sys)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all active:scale-95 ${newHeroSystem === sys ? `bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} ${t.btnPrimaryBorder} shadow-sm` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
                  >
                    {GAME_SYSTEM_LABELS[sys]}
                  </button>
                ))}
              </div>
            </div>
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
            <div>
              <label className={`text-[10px] ${t.textMuted} uppercase font-semibold block mb-1`}>Race</label>
              <input
                type="text"
                value={newHeroRaceInput}
                onChange={(e) => setNewHeroRaceInput(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-2.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-400/50`}
                placeholder="Humain"
              />
            </div>
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
                className={`bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold shadow-md hover:brightness-110 active:scale-95 border ${t.btnPrimaryBorder} py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all`}
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
