import { useState } from 'react';
import type { Character } from '../types/rpg.types';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { Swords, User } from 'lucide-react';

interface Props {
  characters: Character[];
  onLoadCharacter: (charId: string) => void;
  onCreateCharacter: (name: string, race: string) => Promise<Character | null | undefined>;
}

export function Dashboard({ characters, onLoadCharacter, onCreateCharacter }: Props) {
  const [isCreateHeroModalOpen, setIsCreateHeroModalOpen] = useState(false);
  const [newHeroNameInput, setNewHeroNameInput] = useState('Nouveau Héros');
  const [newHeroRaceInput, setNewHeroRaceInput] = useState('Humain');
  const t = useThemeClasses();

  return (
    <div className="flex flex-col flex-1 min-h-0">

      <div className="flex-1 overflow-y-auto space-y-2 pb-3">
        {characters.length > 0 ? (
          characters.map(char => (
            <div
              key={char.id}
              onClick={() => onLoadCharacter(char.id)}
              className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 flex items-stretch gap-3 cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md ${t.cardShadow} group relative overflow-hidden`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" style={{ boxShadow: `inset 0 0 30px ${t.glowAccent}` }} />

              {/* Avatar */}
              <div className={`relative w-14 min-w-14 rounded-xl overflow-hidden border ${t.cardBorder} ${t.inputBg} shrink-0`}>
                {char.avatar_url ? (
                  <img src={char.avatar_url} alt={char.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 w-full h-full p-2 flex items-center justify-center">
                    <User size={24} className={t.textMuted} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="relative z-10 flex-1 flex flex-col justify-center min-w-0">
                <h2 className={`text-sm font-bold ${t.textPrimary} group-hover:${t.accent} transition-colors truncate`}>{char.name}</h2>
                <p className={`text-[10px] ${t.textSecondary} mt-0.5 font-medium truncate`}>
                  Niv. {char.level} • <span className={t.accent}>{char.class}</span> {char.race}
                </p>
                <div className={`text-[9px] font-mono ${t.textMuted} mt-1.5 flex gap-2 uppercase`}>
                  <span>HP: {char.hp_current}/{char.hp_max}</span>
                  <span>CA: {char.ac}</span>
                </div>
              </div>

              <span className={`${t.textMuted} group-hover:${t.accent} group-hover:translate-x-1 transition-all text-lg relative z-10 self-center`}>➔</span>
            </div>
          ))
        ) : (
          <div className={`border-2 border-dashed ${t.cardBorder} rounded-2xl p-8 text-center ${t.cardBg}/70`}>
            <p className={`text-sm ${t.textSecondary} italic`}>Aucun aventurier n'est encore enregistré.</p>
          </div>
        )}
      </div>

      <div className="pt-2 pb-1 shrink-0">
        <button
          onClick={() => {
            setNewHeroNameInput('Nouveau Héros');
            setNewHeroRaceInput('Humain');
            setIsCreateHeroModalOpen(true);
          }}
          className={`w-full flex items-center justify-center gap-2.5 ${t.cardBg} border ${t.accentBorder} ${t.accent} rounded-2xl py-3 text-xs font-bold uppercase tracking-widest shadow-md hover:brightness-110 active:scale-[0.98] transition-all`}
          style={{ boxShadow: `0 0 18px ${t.glowAccent}` }}
        >
          <Swords size={15} />
          Forger un nouveau héros
        </button>
      </div>

      {isCreateHeroModalOpen && (
        <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const created = await onCreateCharacter(newHeroNameInput, newHeroRaceInput);
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
