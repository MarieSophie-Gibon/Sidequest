import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { supabase } from '../../supabaseClient';
import { AVATAR_TEMPLATES } from '../../constants';
import type { Character } from '../../types/rpg.types';
import { ModalActions, ModalHeader } from './ModalControls';

interface Props {
  activeChar: Character;
  setActiveChar: React.Dispatch<React.SetStateAction<Character | null>>;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showAlert: (title: string, text: string) => void;
  onClose: () => void;
}

export function ChangeAvatarModal({ activeChar, setActiveChar, onAvatarUpload, showAlert, onClose }: Props) {
  const t = useThemeClasses();
  const iconColor = t.accent.includes('violet') ? '#a78bfa' : '#3b82f6';

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title="Portrait" onClose={onClose} />

        <div className={`border-2 border-dashed ${t.cardBorder} rounded-2xl p-4 text-center cursor-pointer relative group transition-all`}>
          <input type="file" accept="image/*" onChange={onAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <span className="text-xl block mb-1">📷</span>
          <span className={`text-[11px] font-bold ${t.accent} uppercase tracking-wider`}>Importer une image</span>
        </div>

        {activeChar.avatar_url && (
          <button
            type="button"
            onClick={async () => {
              setActiveChar({ ...activeChar, avatar_url: '', avatar_key: 'horns' });
              await supabase.from('characters').update({ avatar_url: '', avatar_key: 'horns' }).eq('id', activeChar.id);
              showAlert("Avatar", "L'image a été supprimée.");
            }}
            className="w-full py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30"
          >
            Supprimer l'image
          </button>
        )}

        <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${t.cardBorder}`}>
          {Object.keys(AVATAR_TEMPLATES).map(key => (
            <button
              key={key}
              type="button"
              onClick={async () => {
                setActiveChar({ ...activeChar, avatar_key: key, avatar_url: '' });
                await supabase.from('characters').update({ avatar_key: key, avatar_url: '' }).eq('id', activeChar.id);
                onClose();
                showAlert("Avatar", "Portrait mis à jour.");
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${activeChar.avatar_key === key && !activeChar.avatar_url ? `${t.accentBg} ${t.accentBorder} ${t.accent}` : `${t.inputBg} ${t.inputBorder} ${t.textMuted}`}`}
            >
              <div className="w-8 h-8">{AVATAR_TEMPLATES[key].icon(activeChar.avatar_key === key ? iconColor : '#94a3b8')}</div>
              <span className="text-[8px] font-bold uppercase">{AVATAR_TEMPLATES[key].name}</span>
            </button>
          ))}
        </div>
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
