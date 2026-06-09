import { useState } from 'react';
import { useAppSettings, useThemeClasses } from '../contexts/AppSettingsContext';
import { Sword, Sparkles, Moon, Sun, Shield, GraduationCap, Trash2, AlertTriangle } from 'lucide-react';

interface Props {
  activeCharacterName?: string;
  onDeleteCharacter?: () => Promise<boolean>;
}

export function SettingsTab({ activeCharacterName, onDeleteCharacter }: Props) {
  const { isDark, setIsDark, dashboardVisibility, setDashboardVisibility } = useAppSettings();
  const t = useThemeClasses();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleItems: { key: keyof typeof dashboardVisibility; label: string; icon: typeof Sword }[] = [
    { key: 'showClassFeatures', label: 'Capacités de Classe', icon: Sword },
    { key: 'showTraits', label: 'Traits & Dons', icon: Sparkles },
    { key: 'showEquipment', label: 'Équipement', icon: Shield },
    { key: 'showProficientSkills', label: 'Maîtrises', icon: GraduationCap },
  ];

  return (
    <div className="space-y-2">
      {/* Mode Light / Dark */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-3`}>Apparence</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{isDark ? <Moon size={20} /> : <Sun size={20} />}</span>
            <div>
              <p className={`text-sm font-semibold ${t.textPrimary}`}>{isDark ? 'Mode Sombre' : 'Mode Clair'}</p>
              <p className={`text-[10px] ${t.textMuted}`}>{isDark ? 'Neon Violet' : 'Silver Blue'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.5)]' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${isDark ? 'left-6.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Dashboard visibility toggles */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-3`}>Éléments du Dashboard</h4>
        <div className="space-y-2">
          {toggleItems.map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <item.icon size={16} />
                <span className={`text-xs font-medium ${t.textPrimary}`}>{item.label}</span>
              </div>
              <button
                onClick={() => setDashboardVisibility(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${dashboardVisibility[item.key] ? (isDark ? 'bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]' : 'bg-blue-500') : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${dashboardVisibility[item.key] ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      {onDeleteCharacter && (
        <div className={`${t.cardBg} border border-rose-400/45 rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">Zone sensible</h4>
          <p className={`text-[11px] ${t.textMuted} mb-3`}>
            Supprimer définitivement {activeCharacterName ? `"${activeCharacterName}"` : 'ce personnage'}.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 border border-rose-400/55 text-rose-300 text-xs font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              Supprimer le personnage
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] text-rose-200 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                Cette action est irréversible.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className={`${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.btnSecondaryBorder} py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95`}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await onDeleteCharacter();
                    if (!ok) setConfirmDelete(false);
                  }}
                  className="bg-rose-600/85 border border-rose-300/65 text-white py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:brightness-110 active:scale-95"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}
