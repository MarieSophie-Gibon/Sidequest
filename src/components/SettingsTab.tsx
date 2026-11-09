import { useState, useRef, type ReactNode } from 'react';
import { useAppSettings, useThemeClasses } from '../contexts/AppSettingsContext';
import type { CharacterTheme, ThemeName } from '../contexts/AppSettingsContext';
import { Sword, Sparkles, Shield, GraduationCap, Trash2, AlertTriangle, Check, Upload, X, Palette, MessageSquare, Coffee } from 'lucide-react';
import { ContactAdminModal } from './modals/ContactAdminModal';
import { KOFI_URL } from '../config';

interface Props {
  activeCharacterName?: string;
  onDeleteCharacter?: () => Promise<boolean>;
  /** Thème propre au personnage ; null = il suit le thème par défaut de l'app. */
  characterTheme?: CharacterTheme | null;
  onChangeCharacterTheme?: (theme: CharacterTheme | null) => void;
  /** Encart de partage avec le MJ (absent sur une fiche en lecture seule). */
  shareSection?: ReactNode;
}

/** Réduit l'image (côté max 1600 px, JPEG) pour qu'elle tienne en base et en localStorage. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')); };
    img.src = url;
  });
}

const THEME_OPTIONS: { name: ThemeName; label: string; color: string }[] = [
  { name: 'violet',  label: 'Violet',   color: '#8b5cf6' },
  { name: 'ocean',   label: 'Océan',    color: '#06b6d4' },
  { name: 'forest',  label: 'Forêt',    color: '#10b981' },
  { name: 'crimson', label: 'Cramoisi', color: '#f43f5e' },
  { name: 'amber',   label: 'Doré',     color: '#f59e0b' },
  { name: 'azure',   label: 'Azur',     color: '#60a5fa' },
];

export function SettingsTab({ activeCharacterName, onDeleteCharacter, characterTheme, onChangeCharacterTheme, shareSection }: Props) {
  const settings = useAppSettings();
  const { dashboardVisibility, setDashboardVisibility } = settings;
  const t = useThemeClasses();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Portée des réglages de thème. Sur une fiche, on modifie le personnage par défaut :
  // le thème de l'app ne change que si on le choisit explicitement.
  const canHaveOwnTheme = !!onChangeCharacterTheme;
  const [scope, setScope] = useState<'character' | 'app'>(canHaveOwnTheme ? 'character' : 'app');
  const editingCharacter = canHaveOwnTheme && scope === 'character';
  const ownTheme = canHaveOwnTheme && characterTheme ? characterTheme : null;
  // Un personnage sans thème propre affiche le thème de l'app : c'est le point de départ de sa première modification.
  const current: CharacterTheme = editingCharacter ? (ownTheme ?? settings.defaultTheme) : settings.defaultTheme;
  const { themeName, bgChoice, bgOverlay } = current;
  const customBgImage = current.customBg ?? '';

  function apply(patch: Partial<CharacterTheme>) {
    if (editingCharacter) {
      onChangeCharacterTheme!({ ...(ownTheme ?? settings.defaultTheme), ...patch });
      return;
    }
    if (patch.themeName !== undefined) settings.setThemeName(patch.themeName);
    if (patch.bgChoice !== undefined) settings.setBgChoice(patch.bgChoice);
    if (patch.bgOverlay !== undefined) settings.setBgOverlay(patch.bgOverlay);
    if (patch.customBg !== undefined) settings.setCustomBgImage(patch.customBg);
  }

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // reset so same file can be re-picked
    e.target.value = '';
    if (!file) return;
    try {
      apply({ customBg: await compressImage(file), bgChoice: 'custom' });
    } catch { /* image illisible : on ignore */ }
  }

  const toggleItems: { key: keyof typeof dashboardVisibility; label: string; icon: typeof Sword }[] = [
    { key: 'showClassFeatures', label: 'Capacités de Classe', icon: Sword },
    { key: 'showTraits', label: 'Traits & Dons', icon: Sparkles },
    { key: 'showEquipment', label: 'Équipement', icon: Shield },
    { key: 'showProficientSkills', label: 'Maîtrises', icon: GraduationCap },
  ];

  return (
    <div className="space-y-2 tab-grid">
      {/* Portée du thème : ce personnage ou l'app entière */}
      {canHaveOwnTheme && (
        <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow} space-y-2`}>
          <span className={`text-xs font-bold ${t.textPrimary} flex items-center gap-1.5`}><Palette size={14} /> Thème à modifier</span>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['character', activeCharacterName ? `« ${activeCharacterName} »` : 'Ce personnage'],
              ['app', 'Thème de l’app'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className={`py-2 px-2 rounded-xl border text-[11px] font-semibold truncate transition-all ${scope === key ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textMuted} hover:opacity-100`}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className={`text-[10px] ${t.textMuted}`}>
            {editingCharacter
              ? (ownTheme
                ? 'Ce personnage a son propre thème, appliqué uniquement sur sa fiche.'
                : 'Ce personnage suit le thème de l’app. Le modifier ci-dessous lui crée son propre thème.')
              : 'Thème des personnages qui n’ont pas leur propre thème. L’accueil garde toujours son thème violet.'
                + (ownTheme ? ' Ce personnage ayant son propre thème, les changements ne seront pas visibles ici.' : '')}
          </p>
          {editingCharacter && ownTheme && (
            <button
              type="button"
              onClick={() => onChangeCharacterTheme!(null)}
              className={`w-full py-1.5 rounded-xl border text-[10px] font-semibold transition-all active:scale-95 ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`}
            >
              Revenir au thème de l’app
            </button>
          )}
        </div>
      )}

      {/* Couleur de thème */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-3`}>Couleur du Thème</h4>
        <div className="grid grid-cols-6 gap-2">
          {THEME_OPTIONS.map(opt => (
            <button
              key={opt.name}
              onClick={() => apply({ themeName: opt.name })}
              className="flex flex-col items-center gap-1 group"
              title={opt.label}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${themeName === opt.name ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                style={{ backgroundColor: opt.color, boxShadow: themeName === opt.name ? `0 0 12px ${opt.color}88` : undefined }}
              >
                {themeName === opt.name && <Check size={14} className="text-white drop-shadow" />}
              </span>
              <span className={`text-[9px] font-medium ${themeName === opt.name ? t.textPrimary : t.textMuted}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Arrière-plan */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-3`}>Arrière-plan</h4>

        {/* Ligne 1 : affichage */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: 'Par défaut', sub: 'Avec flou',   active: bgChoice !== 'none' && bgOverlay,  onClick: () => apply({ bgOverlay: true, ...(bgChoice === 'none' && { bgChoice: 'auto' as const }) }) },
            { label: 'Sans flou',   sub: 'Image nette', active: bgChoice !== 'none' && !bgOverlay, onClick: () => apply({ bgOverlay: false, ...(bgChoice === 'none' && { bgChoice: 'auto' as const }) }) },
            { label: 'Aucun',       sub: 'Couleur unie', active: bgChoice === 'none',               onClick: () => apply({ bgChoice: 'none' }) },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all duration-200 ${
                opt.active ? `${t.accentBg} ${t.accentBorder} scale-[1.03]` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} opacity-70 hover:opacity-100`
              }`}
            >
              <span className={`text-[11px] font-semibold ${opt.active ? t.accent : t.textPrimary}`}>{opt.label}</span>
              <span className={`text-[9px] ${t.textMuted}`}>{opt.sub}</span>
            </button>
          ))}
        </div>

        {/* Ligne 2 : source */}
        <div className={`grid grid-cols-2 gap-2 transition-opacity duration-200 ${bgChoice === 'none' ? 'opacity-30 pointer-events-none' : ''}`}>
          {/* BG par défaut */}
          <button
            onClick={() => apply({ bgChoice: 'auto' })}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-all duration-200 ${
              bgChoice === 'auto' ? `${t.accentBg} ${t.accentBorder} scale-[1.03]` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} opacity-70 hover:opacity-100`
            }`}
          >
            <span className={`text-[11px] font-semibold ${bgChoice === 'auto' ? t.accent : t.textPrimary}`}>BG par défaut</span>
            <span className={`text-[9px] ${t.textMuted}`}>Image du thème</span>
          </button>

          {/* BG personnalisé */}
          <button
            onClick={() => customBgImage ? apply({ bgChoice: 'custom' }) : fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 py-2 px-2 rounded-xl border transition-all duration-200 overflow-hidden ${
              bgChoice === 'custom' ? `${t.accentBg} ${t.accentBorder} scale-[1.03]` : `${t.btnSecondaryBg} ${t.btnSecondaryBorder} opacity-70 hover:opacity-100`
            }`}
          >
            {customBgImage
              ? <img src={customBgImage} alt="bg" className="w-8 h-6 object-cover rounded-md border border-white/20 shrink-0" />
              : <Upload size={13} className={t.textMuted} />}
            <div className="flex flex-col items-start min-w-0">
              <span className={`text-[11px] font-semibold ${bgChoice === 'custom' ? t.accent : t.textPrimary}`}>Personnalisé</span>
              <span className={`text-[9px] ${t.textMuted}`}>{customBgImage ? 'Mon image' : 'Importer…'}</span>
            </div>
          </button>
        </div>

        {/* Actions image perso */}
        {customBgImage && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-[10px] font-semibold transition-all active:scale-95 ${t.btnSecondaryBg} ${t.btnSecondaryBorder} ${t.textSecondary}`}
            >
              <Upload size={11} /> Changer l’image
            </button>
            <button
              onClick={() => apply({ customBg: '', ...(bgChoice === 'custom' && { bgChoice: 'auto' as const }) })}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-all active:scale-95 bg-rose-500/15 border-rose-400/40 text-rose-300 hover:bg-rose-500/25"
            >
              <X size={11} /> Supprimer
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
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
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${dashboardVisibility[item.key] ? `${t.accentBg} border ${t.accentBorder}` : 'bg-slate-700/50 border border-slate-600/50'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${dashboardVisibility[item.key] ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {shareSection}

      {/* Aide et soutien */}
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-2xl p-3 shadow-sm ${t.cardShadow}`}>
        <h4 className={`text-xs font-bold ${t.textSecondary} uppercase tracking-wider mb-3`}>Aide et soutien</h4>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => { setContactSent(false); setContactOpen(true); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${t.btnSecondaryBg} ${t.btnSecondaryBorder} hover:brightness-105`}
          >
            <MessageSquare size={16} className={t.accent} />
            <span className="min-w-0">
              <span className={`block text-xs font-semibold ${t.textPrimary}`}>Signaler un bug ou proposer une idée</span>
              <span className={`block text-[10px] ${t.textMuted}`}>Le message m’arrive directement par e-mail.</span>
            </span>
          </button>
          {contactSent && <p className="text-[11px] text-emerald-400 px-1">Message envoyé, merci ! Je te réponds par e-mail si besoin.</p>}
          {KOFI_URL && (
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all active:scale-[0.98] bg-amber-500/15 border-amber-400/40 hover:bg-amber-500/25"
            >
              <Coffee size={16} className="text-amber-300" />
              <span className="min-w-0">
                <span className={`block text-xs font-semibold ${t.textPrimary}`}>Soutenir SideQuest sur Ko-fi</span>
                <span className={`block text-[10px] ${t.textMuted}`}>Un café pour aider à faire vivre l’app.</span>
              </span>
            </a>
          )}
        </div>
      </div>
      {contactOpen && (
        <ContactAdminModal
          context={activeCharacterName ? `Personnage affiché : ${activeCharacterName}` : undefined}
          onSent={() => { setContactOpen(false); setContactSent(true); }}
          onClose={() => setContactOpen(false)}
        />
      )}

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
