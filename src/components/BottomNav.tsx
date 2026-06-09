import { useThemeClasses } from '../contexts/AppSettingsContext';
import { ArrowLeft, LayoutDashboard, BookOpen, Star, Swords, Backpack, Settings } from 'lucide-react';

type TabKey = 'home' | 'spells' | 'features' | 'attributes' | 'inventory' | 'settings';

interface Props {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onDashboard?: () => void;
}

const TABS: { key: TabKey; icon: typeof LayoutDashboard }[] = [
  { key: 'home', icon: LayoutDashboard },
  { key: 'spells', icon: BookOpen },
  { key: 'features', icon: Star },
  { key: 'attributes', icon: Swords },
  { key: 'inventory', icon: Backpack },
  { key: 'settings', icon: Settings },
];

export function BottomNav({ activeTab, setActiveTab, onDashboard }: Props) {
  const t = useThemeClasses();

  return (
    <nav
      className={`absolute left-4 right-4 z-40 ${t.navBg} border ${t.navBorder} rounded-2xl p-2 shadow-lg ${t.cardShadow} flex justify-between items-center backdrop-blur-sm`}
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {onDashboard && (
        <button
          onClick={onDashboard}
          className={`flex items-center justify-center flex-1 py-2 transition-all rounded-xl active:scale-95 ${t.navInactive}`}
        >
          <ArrowLeft size={20} />
        </button>
      )}
      {TABS.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center flex-1 py-2 transition-all rounded-xl active:scale-95 ${activeTab === tab.key ? t.navActive : t.navInactive}`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </nav>
  );
}
