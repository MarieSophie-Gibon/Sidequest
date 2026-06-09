import { createContext, useContext, useState, useEffect } from 'react';

export interface DashboardVisibility {
  showClassFeatures: boolean;
  showTraits: boolean;
  showEquipment: boolean;
  showProficientSkills: boolean;
}

interface AppSettings {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  dashboardVisibility: DashboardVisibility;
  setDashboardVisibility: React.Dispatch<React.SetStateAction<DashboardVisibility>>;
}

const AppSettingsContext = createContext<AppSettings | null>(null);

const STORAGE_KEY = 'sidequest_settings';

function loadSettings(): { isDark: boolean; dashboardVisibility: DashboardVisibility } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    isDark: false,
    dashboardVisibility: { showClassFeatures: true, showTraits: true, showEquipment: false, showProficientSkills: true }
  };
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const saved = loadSettings();
  const [isDark, setIsDark] = useState(saved.isDark);
  const [dashboardVisibility, setDashboardVisibility] = useState<DashboardVisibility>(saved.dashboardVisibility);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ isDark, dashboardVisibility }));
  }, [isDark, dashboardVisibility]);

  useEffect(() => {
    const bgColor = isDark ? '#1a1130' : '#5f7fa6';
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bgColor);
  }, [isDark]);

  return (
    <AppSettingsContext.Provider value={{ isDark, setIsDark, dashboardVisibility, setDashboardVisibility }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}

// Design tokens
export function useThemeClasses() {
  const { isDark } = useAppSettings();

  return isDark ? {
    // Dark neon violet - glassmorphism
    pageBg: 'bg-[#1a1130]/85',
    cardBg: 'bg-violet-900/22 backdrop-blur-xl',
    cardBorder: 'border-violet-400/55',
    cardShadow: 'shadow-[0_8px_32px_rgba(139,92,246,0.22)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    accent: 'text-violet-200',
    accentBg: 'bg-violet-500/20 backdrop-blur-sm',
    accentBorder: 'border-violet-300/55',
    inputBg: 'bg-violet-900/28 backdrop-blur-sm',
    inputBorder: 'border-violet-400/55',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-violet-500',
    btnPrimaryTo: 'to-fuchsia-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-violet-300/60',
    btnSecondaryBg: 'bg-violet-900/22 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-100',
    btnSecondaryBorder: 'border-violet-400/55',
    navBg: 'bg-violet-900/38 backdrop-blur-xl',
    navBorder: 'border-violet-400/55',
    navActive: 'text-violet-200 bg-linear-to-b from-violet-500/35 to-fuchsia-600/35 border border-violet-300/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-violet-200',
    glow: 'rgba(139, 92, 246, 0.25)',
    glowAccent: 'rgba(192, 132, 252, 0.38)',
    alertBg: 'bg-violet-900/55 backdrop-blur-xl border-violet-400/55',
    selectionBg: 'selection:bg-violet-500/30',
    scrollbarThumb: 'scrollbar-thumb-violet-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-violet-900/42 backdrop-blur-xl border-violet-400/50',
    hpBar: 'from-violet-500 to-fuchsia-500',
    badge: 'bg-violet-500/28 text-violet-100 border-violet-300/60',
    bgImage: '/bg-dark.jpg',
  } : {
    // Silver blue (dark-like ambience)
    pageBg: 'bg-[#7f9bc0]/72',
    cardBg: 'bg-[#6f8fb9]/34 backdrop-blur-xl',
    cardBorder: 'border-[#b4c9e8]/65',
    cardShadow: 'shadow-[0_14px_44px_rgba(74,137,216,0.34)]',
    textPrimary: 'text-slate-50',
    textSecondary: 'text-sky-100',
    textMuted: 'text-blue-100/90',
    accent: 'text-sky-100',
    accentBg: 'bg-[#8cb2e2]/30 backdrop-blur-sm',
    accentBorder: 'border-[#c0d7f8]/68',
    inputBg: 'bg-[#6a8ab4]/30 backdrop-blur-sm',
    inputBorder: 'border-[#bbd1f0]/62',
    inputText: 'text-slate-50',
    btnPrimaryFrom: 'from-sky-400',
    btnPrimaryTo: 'to-blue-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-sky-100/70',
    btnSecondaryBg: 'bg-[#7092bf]/30 backdrop-blur-sm',
    btnSecondaryText: 'text-sky-50',
    btnSecondaryBorder: 'border-[#c0d6f5]/60',
    navBg: 'bg-[#6c8dba]/40 backdrop-blur-xl',
    navBorder: 'border-[#bfd5f4]/62',
    navActive: 'text-white bg-linear-to-b from-sky-400/45 to-blue-600/50 border border-sky-200/65 backdrop-blur-sm',
    navInactive: 'text-blue-100/90 hover:text-white',
    glow: 'rgba(120, 193, 255, 0.34)',
    glowAccent: 'rgba(170, 220, 255, 0.46)',
    alertBg: 'bg-[#6f94c4]/34 backdrop-blur-xl border-[#c0d6f5]/60',
    selectionBg: 'selection:bg-sky-300/30',
    scrollbarThumb: 'scrollbar-thumb-blue-300',
    modalOverlay: 'bg-slate-900/35 backdrop-blur-lg',
    modalBg: 'bg-[#6f94c4]/36 backdrop-blur-xl border-[#c0d6f5]/60',
    hpBar: 'from-sky-400 to-blue-400',
    badge: 'bg-sky-300/35 text-white border-sky-100/65',
    bgImage: '/bg-light.jpg',
  };
}
