import { useThemeClasses } from '../contexts/AppSettingsContext';
import { UserMenu } from './UserMenu';
import { ArrowLeft } from 'lucide-react';

interface Props {
  username: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogout: () => void;
  showAlert: (title: string, text: string) => void;
}

export function AppHeader({ username, showBack, onBack, onLogout, showAlert }: Props) {
  const t = useThemeClasses();

  return (
    <header className={`${t.navBg} border-b ${t.cardBorder} rounded-2xl mb-3 px-2 py-0 flex justify-between items-center shrink-0 shadow-lg ${t.cardShadow}`}>
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            onClick={onBack}
            className={`w-7 h-7 flex items-center justify-center rounded-full ${t.inputBg} border ${t.cardBorder} ${t.textSecondary} hover:${t.accent} transition-all active:scale-90`}
          >
            <ArrowLeft size={14} />
          </button>
        )}
        <img src="/logo.svg" alt="SideQuest" className="h-14" />
      </div>
      <UserMenu
        username={username}
        onLogout={onLogout}
        showAlert={showAlert}
      />
    </header>
  );
}
