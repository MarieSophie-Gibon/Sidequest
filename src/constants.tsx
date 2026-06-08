import type { Skill, ThemeOption } from './types/rpg.types';

export interface AvatarTemplate {
  name: string;
  icon: (color: string) => React.ReactNode;
}

export const THEMES: Record<string, ThemeOption> = {
  pyro: {
    name: 'Pyro (Feu / Tieffelin)',
    primary: 'text-rose-700',
    bg: 'bg-rose-100',
    border: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-700 border-rose-300',
    iconColor: '#f43f5e',
    elementIcon: '🔥',
    glow: 'rgba(244, 63, 94, 0.25)'
  },
  cryo: {
    name: 'Cryo (Glace)',
    primary: 'text-cyan-700',
    bg: 'bg-cyan-100',
    border: 'border-cyan-300',
    badge: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    iconColor: '#06b6d4',
    elementIcon: '❄️',
    glow: 'rgba(6, 182, 212, 0.25)'
  },
  geo: {
    name: 'Geo (Terre / Or)',
    primary: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    iconColor: '#f59e0b',
    elementIcon: '🪨',
    glow: 'rgba(245, 158, 11, 0.25)'
  },
  electro: {
    name: 'Electro (Foudre)',
    primary: 'text-violet-700',
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    badge: 'bg-violet-100 text-violet-700 border-violet-300',
    iconColor: '#8b5cf6',
    elementIcon: '⚡',
    glow: 'rgba(139, 92, 246, 0.25)'
  }
};

export const AVATAR_TEMPLATES: Record<string, AvatarTemplate> = {
  horns: {
    name: 'Tieffeline',
    icon: (color: string) => (
      <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none">
        <path d="M4 11C2.5 7 4.5 3 7.5 2C8 3.5 7.5 5.5 6.5 7C9 7.5 11 9.5 11.5 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 11C21.5 7 19.5 3 16.5 2C16 3.5 16.5 5.5 17.5 7C15 7.5 13 9.5 12.5 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 9C9 9 7 11 7 14C7 18 12 21 12 21C12 21 17 18 17 14C17 11 15 9 12 9Z" fill="rgba(30, 41, 59, 0.8)" stroke={color} strokeWidth="1.5"/>
        <circle cx="10" cy="13.5" r="1.2" fill={color} className="animate-pulse"/>
        <circle cx="14" cy="13.5" r="1.2" fill={color} className="animate-pulse"/>
        <path d="M11 17H13" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      </svg>
    )
  },
  phoenix: {
    name: 'Phénix',
    icon: (color: string) => (
      <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C10 5 8 6.5 8 9.5C8 12.5 10.5 14 12 14C13.5 14 16 12.5 16 9.5C16 6.5 14 5 12 2Z" fill="rgba(30, 41, 59, 0.8)" stroke={color} strokeWidth="1.5"/>
        <path d="M3 13C6 14 8.5 11.5 9 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 13C18 14 15.5 11.5 15 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 14V22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M9 18L12 21L15 18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  spark: {
    name: 'Astral',
    icon: (color: string) => (
      <svg className="w-full h-full p-1.5" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15 8L21 9.5L16.5 14L18 20L12 17L6 20L7.5 14L3 9.5L9 8L12 2Z" fill="rgba(30, 41, 59, 0.8)" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="2.5" fill="none" stroke={color} strokeWidth="1"/>
        <path d="M12 6V16M7 11H17" stroke={color} strokeWidth="0.75" strokeDasharray="1.5 1.5"/>
      </svg>
    )
  }
};

export const DEFAULT_SKILLS_TEMPLATES: Omit<Skill, 'proficient'>[] = [
  { name: 'Acrobaties', attr: 'dex' },
  { name: 'Arcanes', attr: 'int' },
  { name: 'Athlétisme', attr: 'str' },
  { name: 'Discrétion', attr: 'dex' },
  { name: 'Histoire', attr: 'int' },
  { name: 'Intimidation', attr: 'cha' },
  { name: 'Intuition', attr: 'wis' },
  { name: 'Investigation', attr: 'int' },
  { name: 'Médecine', attr: 'wis' },
  { name: 'Nature', attr: 'int' },
  { name: 'Perception', attr: 'wis' },
  { name: 'Persuasion', attr: 'cha' },
  { name: 'Religion', attr: 'int' },
  { name: 'Représentation', attr: 'cha' },
  { name: 'Supercherie', attr: 'cha' },
  { name: 'Survie', attr: 'wis' }
];
