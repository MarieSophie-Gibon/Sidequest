import { createContext, useContext, useState, useEffect } from 'react';

export interface DashboardVisibility {
  showClassFeatures: boolean;
  showTraits: boolean;
  showEquipment: boolean;
  showProficientSkills: boolean;
}

export type ThemeName = 'violet' | 'ocean' | 'forest' | 'crimson' | 'amber' | 'azure';
export type BgChoice = 'auto' | 'dark' | 'light' | 'none' | 'custom';

const CUSTOM_BG_KEY = 'sidequest_custom_bg';

export interface ThemeTokens {
  pageBg: string; cardBg: string; cardBorder: string; cardShadow: string;
  textPrimary: string; textSecondary: string; textMuted: string;
  accent: string; accentBg: string; accentBorder: string;
  inputBg: string; inputBorder: string; inputText: string;
  btnPrimaryFrom: string; btnPrimaryTo: string; btnPrimaryText: string; btnPrimaryBorder: string;
  btnSecondaryBg: string; btnSecondaryText: string; btnSecondaryBorder: string;
  navBg: string; navBorder: string; navActive: string; navInactive: string;
  glow: string; glowAccent: string;
  alertBg: string; selectionBg: string; scrollbarThumb: string;
  modalOverlay: string; modalBg: string;
  hpBar: string; badge: string; bgImage: string;
}

interface AppSettings {
  isDark: boolean;
  themeName: ThemeName;
  setThemeName: (v: ThemeName) => void;
  bgChoice: BgChoice;
  setBgChoice: (v: BgChoice) => void;
  customBgImage: string;
  setCustomBgImage: (v: string) => void;
  bgOverlay: boolean;
  setBgOverlay: (v: boolean) => void;
  dashboardVisibility: DashboardVisibility;
  setDashboardVisibility: React.Dispatch<React.SetStateAction<DashboardVisibility>>;
}

const AppSettingsContext = createContext<AppSettings | null>(null);

const STORAGE_KEY = 'sidequest_settings';

const DEFAULT_DASHBOARD: DashboardVisibility = {
  showClassFeatures: true, showTraits: true, showEquipment: false, showProficientSkills: true,
};

function loadSettings(): { themeName: ThemeName; bgChoice: BgChoice; bgOverlay: boolean; dashboardVisibility: DashboardVisibility } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate from old isDark format
      if (!parsed.themeName) {
        return {
          themeName: parsed.isDark ? 'violet' : 'azure',
          bgChoice: 'auto',
          bgOverlay: true,
          dashboardVisibility: parsed.dashboardVisibility ?? DEFAULT_DASHBOARD,
        };
      }
      return {
        themeName: parsed.themeName ?? 'violet',
        bgChoice: parsed.bgChoice ?? 'auto',
        bgOverlay: parsed.bgOverlay ?? true,
        dashboardVisibility: parsed.dashboardVisibility ?? DEFAULT_DASHBOARD,
      };
    }
  } catch { /* ignore */ }
  return { themeName: 'violet', bgChoice: 'auto', bgOverlay: true, dashboardVisibility: DEFAULT_DASHBOARD };
}

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const saved = loadSettings();
  const [themeName, setThemeName] = useState<ThemeName>(saved.themeName);
  const [bgChoice, setBgChoice] = useState<BgChoice>(saved.bgChoice);
  const [bgOverlay, setBgOverlay] = useState<boolean>(saved.bgOverlay);
  const [customBgImage, setCustomBgImageState] = useState<string>(() => {
    try { return localStorage.getItem(CUSTOM_BG_KEY) ?? ''; } catch { return ''; }
  });
  const [dashboardVisibility, setDashboardVisibility] = useState<DashboardVisibility>(saved.dashboardVisibility);

  function setCustomBgImage(v: string) {
    setCustomBgImageState(v);
    try {
      if (v) localStorage.setItem(CUSTOM_BG_KEY, v);
      else localStorage.removeItem(CUSTOM_BG_KEY);
    } catch { /* quota exceeded — ignore */ }
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeName, bgChoice, bgOverlay, dashboardVisibility }));
  }, [themeName, bgChoice, bgOverlay, dashboardVisibility]);

  useEffect(() => {
    const ROOT_BG: Record<ThemeName, string> = {
      violet: '#1a1130', ocean: '#081a20', forest: '#0d1f18',
      crimson: '#1f0d12', amber: '#1f1508', azure: '#5f7fa6',
    };
    const bgColor = ROOT_BG[themeName];
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', bgColor);
  }, [themeName]);

  const isDark = themeName !== 'azure';

  return (
    <AppSettingsContext.Provider value={{ isDark, themeName, setThemeName, bgChoice, setBgChoice, customBgImage, setCustomBgImage, bgOverlay, setBgOverlay, dashboardVisibility, setDashboardVisibility }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}

const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  violet: {
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
    alertBg: 'bg-violet-900/88 backdrop-blur-xl border-violet-300/80',
    selectionBg: 'selection:bg-violet-500/30',
    scrollbarThumb: 'scrollbar-thumb-violet-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-violet-900/42 backdrop-blur-xl border-violet-400/50',
    hpBar: 'from-violet-500 to-fuchsia-500',
    badge: 'bg-violet-500/28 text-violet-100 border-violet-300/60',
    bgImage: '/bg-dark.jpg',
  },
  ocean: {
    pageBg: 'bg-[#081a20]/85',
    cardBg: 'bg-cyan-900/22 backdrop-blur-xl',
    cardBorder: 'border-cyan-400/55',
    cardShadow: 'shadow-[0_8px_32px_rgba(6,182,212,0.22)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    accent: 'text-cyan-200',
    accentBg: 'bg-cyan-500/20 backdrop-blur-sm',
    accentBorder: 'border-cyan-300/55',
    inputBg: 'bg-cyan-900/28 backdrop-blur-sm',
    inputBorder: 'border-cyan-400/55',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-cyan-500',
    btnPrimaryTo: 'to-teal-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-cyan-300/60',
    btnSecondaryBg: 'bg-cyan-900/22 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-100',
    btnSecondaryBorder: 'border-cyan-400/55',
    navBg: 'bg-cyan-900/38 backdrop-blur-xl',
    navBorder: 'border-cyan-400/55',
    navActive: 'text-cyan-200 bg-linear-to-b from-cyan-500/35 to-teal-600/35 border border-cyan-300/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-cyan-200',
    glow: 'rgba(6, 182, 212, 0.25)',
    glowAccent: 'rgba(34, 211, 238, 0.38)',
    alertBg: 'bg-cyan-900/88 backdrop-blur-xl border-cyan-300/80',
    selectionBg: 'selection:bg-cyan-500/30',
    scrollbarThumb: 'scrollbar-thumb-cyan-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-cyan-900/42 backdrop-blur-xl border-cyan-400/50',
    hpBar: 'from-cyan-500 to-teal-500',
    badge: 'bg-cyan-500/28 text-cyan-100 border-cyan-300/60',
    bgImage: '/bg-dark.jpg',
  },
  forest: {
    pageBg: 'bg-[#0d1f18]/85',
    cardBg: 'bg-emerald-900/22 backdrop-blur-xl',
    cardBorder: 'border-emerald-400/55',
    cardShadow: 'shadow-[0_8px_32px_rgba(16,185,129,0.22)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    accent: 'text-emerald-200',
    accentBg: 'bg-emerald-500/20 backdrop-blur-sm',
    accentBorder: 'border-emerald-300/55',
    inputBg: 'bg-emerald-900/28 backdrop-blur-sm',
    inputBorder: 'border-emerald-400/55',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-emerald-500',
    btnPrimaryTo: 'to-teal-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-emerald-300/60',
    btnSecondaryBg: 'bg-emerald-900/22 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-100',
    btnSecondaryBorder: 'border-emerald-400/55',
    navBg: 'bg-emerald-900/38 backdrop-blur-xl',
    navBorder: 'border-emerald-400/55',
    navActive: 'text-emerald-200 bg-linear-to-b from-emerald-500/35 to-teal-600/35 border border-emerald-300/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-emerald-200',
    glow: 'rgba(16, 185, 129, 0.25)',
    glowAccent: 'rgba(52, 211, 153, 0.38)',
    alertBg: 'bg-emerald-900/88 backdrop-blur-xl border-emerald-300/80',
    selectionBg: 'selection:bg-emerald-500/30',
    scrollbarThumb: 'scrollbar-thumb-emerald-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-emerald-900/42 backdrop-blur-xl border-emerald-400/50',
    hpBar: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-500/28 text-emerald-100 border-emerald-300/60',
    bgImage: '/bg-dark.jpg',
  },
  crimson: {
    pageBg: 'bg-[#1f0d12]/85',
    cardBg: 'bg-rose-900/22 backdrop-blur-xl',
    cardBorder: 'border-rose-400/55',
    cardShadow: 'shadow-[0_8px_32px_rgba(244,63,94,0.22)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    accent: 'text-rose-200',
    accentBg: 'bg-rose-500/20 backdrop-blur-sm',
    accentBorder: 'border-rose-300/55',
    inputBg: 'bg-rose-900/28 backdrop-blur-sm',
    inputBorder: 'border-rose-400/55',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-rose-500',
    btnPrimaryTo: 'to-pink-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-rose-300/60',
    btnSecondaryBg: 'bg-rose-900/22 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-100',
    btnSecondaryBorder: 'border-rose-400/55',
    navBg: 'bg-rose-900/38 backdrop-blur-xl',
    navBorder: 'border-rose-400/55',
    navActive: 'text-rose-200 bg-linear-to-b from-rose-500/35 to-pink-600/35 border border-rose-300/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-rose-200',
    glow: 'rgba(244, 63, 94, 0.25)',
    glowAccent: 'rgba(251, 113, 133, 0.38)',
    alertBg: 'bg-rose-900/88 backdrop-blur-xl border-rose-300/80',
    selectionBg: 'selection:bg-rose-500/30',
    scrollbarThumb: 'scrollbar-thumb-rose-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-rose-900/42 backdrop-blur-xl border-rose-400/50',
    hpBar: 'from-rose-500 to-pink-500',
    badge: 'bg-rose-500/28 text-rose-100 border-rose-300/60',
    bgImage: '/bg-dark.jpg',
  },
  amber: {
    pageBg: 'bg-[#1f1508]/85',
    cardBg: 'bg-amber-900/22 backdrop-blur-xl',
    cardBorder: 'border-amber-400/55',
    cardShadow: 'shadow-[0_8px_32px_rgba(245,158,11,0.22)]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    accent: 'text-amber-200',
    accentBg: 'bg-amber-500/20 backdrop-blur-sm',
    accentBorder: 'border-amber-300/55',
    inputBg: 'bg-amber-900/28 backdrop-blur-sm',
    inputBorder: 'border-amber-400/55',
    inputText: 'text-white',
    btnPrimaryFrom: 'from-amber-500',
    btnPrimaryTo: 'to-orange-600',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border-amber-300/60',
    btnSecondaryBg: 'bg-amber-900/22 backdrop-blur-sm',
    btnSecondaryText: 'text-slate-100',
    btnSecondaryBorder: 'border-amber-400/55',
    navBg: 'bg-amber-900/38 backdrop-blur-xl',
    navBorder: 'border-amber-400/55',
    navActive: 'text-amber-200 bg-linear-to-b from-amber-500/35 to-orange-600/35 border border-amber-300/60 backdrop-blur-sm',
    navInactive: 'text-slate-400 hover:text-amber-200',
    glow: 'rgba(245, 158, 11, 0.25)',
    glowAccent: 'rgba(251, 191, 36, 0.38)',
    alertBg: 'bg-amber-900/88 backdrop-blur-xl border-amber-300/80',
    selectionBg: 'selection:bg-amber-500/30',
    scrollbarThumb: 'scrollbar-thumb-amber-700',
    modalOverlay: 'bg-black/50 backdrop-blur-lg',
    modalBg: 'bg-amber-900/42 backdrop-blur-xl border-amber-400/50',
    hpBar: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-500/28 text-amber-100 border-amber-300/60',
    bgImage: '/bg-dark.jpg',
  },
  azure: {
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
    alertBg: 'bg-[#5c7fad]/86 backdrop-blur-xl border-[#d3e3fa]/85',
    selectionBg: 'selection:bg-sky-300/30',
    scrollbarThumb: 'scrollbar-thumb-blue-300',
    modalOverlay: 'bg-slate-900/35 backdrop-blur-lg',
    modalBg: 'bg-[#6f94c4]/36 backdrop-blur-xl border-[#c0d6f5]/60',
    hpBar: 'from-sky-400 to-blue-400',
    badge: 'bg-sky-300/35 text-white border-sky-100/65',
    bgImage: '/bg-light.jpg',
  },
} as const;

// Design tokens
export function useThemeClasses() {
  const { themeName, bgChoice, customBgImage } = useAppSettings();
  const tokens = { ...THEME_TOKENS[themeName] };
  if (bgChoice === 'custom') {
    tokens.bgImage = customBgImage;
  } else if (bgChoice !== 'auto') {
    tokens.bgImage = bgChoice === 'none' ? '' : bgChoice === 'dark' ? '/bg-dark.jpg' : '/bg-light.jpg';
  }
  return tokens;
}
