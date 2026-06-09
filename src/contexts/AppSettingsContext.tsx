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
    const bgColor = isDark ? '#0f0a1a' : '#f0f4f8';
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
    pageBg: 'bg-[#0f0a1a]/80',
    cardBg: 'bg-violet-950/20 backdrop-blur-xl',
    cardBorder: 'border-violet-400/30',
    cardShadow: 'shadow-[0_8px_32px_rgba(139,92,246,0.15)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accent: 'text-violet-300',
    accentBg: 'bg-violet-500/15 backdrop-blur-sm',
    accentBorder: 'border-violet-400/30',
    inputBg: 'bg-violet-950/25 backdrop-blur-sm',
    inputBorder: 'border-violet-400/30',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-violet-500',
    btnPrimaryTo: 'to-fuchsia-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-violet-400/40',
    btnSecondaryBg: 'bg-violet-950/20 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-200',
    btnSecondaryBorder: 'border-violet-400/30',
    navBg: 'bg-violet-950/35 backdrop-blur-xl',
    navBorder: 'border-violet-400/30',
    navActive: 'text-violet-300 bg-linear-to-b from-violet-500/30 to-fuchsia-600/30 border border-violet-400/40 backdrop-blur-sm',
    navInactive: 'text-slate-500 hover:text-violet-300',
    glow: 'rgba(139, 92, 246, 0.2)',
    glowAccent: 'rgba(192, 132, 252, 0.3)',
    alertBg: 'bg-violet-950/60 backdrop-blur-xl border-violet-500/30',
    selectionBg: 'selection:bg-violet-500/30',
    scrollbarThumb: 'scrollbar-thumb-violet-800',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-violet-950/40 backdrop-blur-xl border-violet-500/25',
    hpBar: 'from-violet-500 to-fuchsia-500',
    badge: 'bg-violet-500/25 text-violet-200 border-violet-400/40',
    bgImage: '/bg-dark.jpg',
  } : {
    // Light silver blue - glassmorphism
    pageBg: 'bg-slate-100/80',
    cardBg: 'bg-white/30 backdrop-blur-xl',
    cardBorder: 'border-slate-300/60',
    cardShadow: 'shadow-[0_8px_32px_rgba(59,130,246,0.08)]',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    accent: 'text-blue-700',
    accentBg: 'bg-blue-50/60 backdrop-blur-sm',
    accentBorder: 'border-blue-200/60',
    inputBg: 'bg-white/20 backdrop-blur-sm',
    inputBorder: 'border-slate-300/70',
    inputText: 'text-slate-900',
    btnPrimaryFrom: 'from-blue-500',
    btnPrimaryTo: 'to-cyan-500',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-blue-400/60',
    btnSecondaryBg: 'bg-white/20 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-700',
    btnSecondaryBorder: 'border-slate-300/70',
    navBg: 'bg-white/35 backdrop-blur-xl',
    navBorder: 'border-slate-300/60',
    navActive: 'text-blue-700 bg-linear-to-b from-blue-50/80 to-cyan-50/80 border border-blue-200/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-blue-600',
    glow: 'rgba(59, 130, 246, 0.1)',
    glowAccent: 'rgba(59, 130, 246, 0.15)',
    alertBg: 'bg-white/70 backdrop-blur-xl border-white/50',
    selectionBg: 'selection:bg-blue-100',
    scrollbarThumb: 'scrollbar-thumb-slate-300',
    modalOverlay: 'bg-slate-900/20 backdrop-blur-lg',
    modalBg: 'bg-white/40 backdrop-blur-xl border-white/60',
    hpBar: 'from-blue-500 to-cyan-400',
    badge: 'bg-blue-100/60 text-blue-700 border-blue-300/60',
    bgImage: '/bg-light.jpg',
  };
}
