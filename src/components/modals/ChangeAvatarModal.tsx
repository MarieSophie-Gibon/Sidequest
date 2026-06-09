import { useThemeClasses } from '../../contexts/AppSettingsContext';
import { supabase } from '../../supabaseClient';
import { User } from 'lucide-react';
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

  return (
    <div className={`fixed inset-0 ${t.modalOverlay} z-50 flex items-center justify-center p-4`}>
      <div className={`${t.modalBg} border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto`}>
        <ModalHeader title="Portrait" onClose={onClose} />

        <div className={`w-28 h-28 mx-auto rounded-2xl border ${t.cardBorder} ${t.inputBg} overflow-hidden flex items-center justify-center`}>
          {activeChar.avatar_url ? (
            <img src={activeChar.avatar_url} alt="Portrait" className="w-full h-full object-cover" />
          ) : (
            <User size={42} className={t.textMuted} />
          )}
        </div>

        <div className={`border-2 border-dashed ${t.cardBorder} rounded-2xl p-4 text-center cursor-pointer relative group transition-all`}>
          <input type="file" accept="image/*" onChange={onAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <span className="text-xl block mb-1">📷</span>
          <span className={`text-[11px] font-bold ${t.accent} uppercase tracking-wider`}>Importer une image</span>
        </div>

        {activeChar.avatar_url && (
          <button
            type="button"
            onClick={async () => {
              setActiveChar({ ...activeChar, avatar_url: '', avatar_key: '' });
              await supabase.from('characters').update({ avatar_url: '', avatar_key: '' }).eq('id', activeChar.id);
              showAlert("Avatar", "L'image a été supprimée.");
            }}
            className="w-full py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-rose-500/30"
          >
            Supprimer l'image
          </button>
        )}
        <ModalActions onCancel={onClose} onSave={onClose} saveLabel="Sauvegarder" />
      </div>
    </div>
  );
}
