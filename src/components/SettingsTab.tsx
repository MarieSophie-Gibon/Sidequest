import { useAppSettings, useThemeClasses } from '../contexts/AppSettingsContext';
import { Sword, Sparkles, Moon, Sun, Shield } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export function SettingsTab({ onLogout }: Props) {
  const { isDark, setIsDark, dashboardVisibility, setDashboardVisibility } = useAppSettings();
  const t = useThemeClasses();

  const toggleItems: { key: keyof typeof dashboardVisibility; label: string; icon: typeof Sword }[] = [
    { key: 'showClassFeatures', label: 'Capacités de Classe', icon: Sword },
    { key: 'showTraits', label: 'Traits & Dons', icon: Sparkles },
    { key: 'showEquipment', label: 'Équipement', icon: Shield },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Light / Dark */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-4`}>Apparence</h4>
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
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-4`}>Éléments du Dashboard</h4>
        <div className="space-y-3">
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

      {/* Déconnexion */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-4 text-center shadow-sm ${t.cardShadow}`}>
        <button
          onClick={onLogout}
          className={`w-full ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.btnSecondaryBorder} py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all hover:brightness-105 active:scale-95`}
        >
          Quitter ma Session
        </button>
      </div>
    </div>
  );
}
