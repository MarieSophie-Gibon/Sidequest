import { useState, useRef, useEffect } from 'react';
import { useThemeClasses } from '../contexts/AppSettingsContext';
import { supabase } from '../supabaseClient';
import { ChevronDown } from 'lucide-react';

interface Props {
  username: string;
  onLogout: () => void;
  showAlert: (title: string, text: string) => void;
}

export function UserMenu({ username, onLogout, showAlert }: Props) {
  const t = useThemeClasses();
  const [isOpen, setIsOpen] = useState(false);
  const [editMode, setEditMode] = useState<'pseudo' | 'email' | 'password' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditMode(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdatePseudo = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { username: inputValue.trim() } });
    setLoading(false);
    if (error) {
      showAlert('Erreur', error.message);
    } else {
      showAlert('Pseudo mis à jour', `Vous êtes maintenant "${inputValue.trim()}".`);
      setEditMode(null);
      setInputValue('');
    }
  };

  const handleUpdateEmail = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: inputValue.trim() });
    setLoading(false);
    if (error) {
      showAlert('Erreur', error.message);
    } else {
      showAlert('Email mis à jour', 'Un lien de confirmation a été envoyé.');
      setEditMode(null);
      setInputValue('');
    }
  };

  const handleUpdatePassword = async () => {
    if (!inputValue || inputValue.length < 6) {
      showAlert('Erreur', 'Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (inputValue !== confirmValue) {
      showAlert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: inputValue });
    setLoading(false);
    if (error) {
      showAlert('Erreur', error.message);
    } else {
      showAlert('Mot de passe changé', 'Votre nouveau mot de passe est actif.');
      setEditMode(null);
      setInputValue('');
      setConfirmValue('');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('⚠️ Supprimer votre compte ? Cette action est irréversible.');
    if (!confirmed) return;
    setLoading(true);
    const { error } = await supabase.rpc('delete_user');
    setLoading(false);
    if (error) {
      showAlert('Erreur', error.message);
    } else {
      await supabase.auth.signOut();
      showAlert('Compte supprimé', 'Votre compte a été définitivement supprimé.');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setEditMode(null); }}
        className={`text-xs ${t.textSecondary} uppercase tracking-wider font-mono hover:${t.accent} transition-colors flex items-center gap-1`}
      >
        <span>{username}</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-56 ${t.cardBg} border ${t.cardBorder} rounded-xl shadow-lg ${t.cardShadow} z-50 overflow-hidden animate-scaleUp`}>
          {!editMode ? (
            <div className="py-1">
              <button
                onClick={() => { setEditMode('pseudo'); setInputValue(''); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium ${t.textPrimary} hover:${t.accentBg} transition-colors flex items-center gap-2`}
              >
                <span>✏️</span> Changer le pseudo
              </button>
              <button
                onClick={() => { setEditMode('email'); setInputValue(''); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium ${t.textPrimary} hover:${t.accentBg} transition-colors flex items-center gap-2`}
              >
                <span>📧</span> Changer l'email
              </button>
              <button
                onClick={() => { setEditMode('password'); setInputValue(''); setConfirmValue(''); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium ${t.textPrimary} hover:${t.accentBg} transition-colors flex items-center gap-2`}
              >
                <span>🔒</span> Changer le mot de passe
              </button>
              <div className={`border-t ${t.cardBorder} my-1`} />
              <button
                onClick={onLogout}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium ${t.textSecondary} hover:${t.accentBg} transition-colors flex items-center gap-2`}
              >
                <span>🚪</span> Déconnexion
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
              >
                <span>🗑️</span> Supprimer le compte
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <p className={`text-[10px] ${t.textMuted} uppercase font-bold`}>
                {editMode === 'pseudo' && 'Nouveau pseudo'}
                {editMode === 'email' && 'Nouvel email'}
                {editMode === 'password' && 'Nouveau mot de passe'}
              </p>
              <input
                type={editMode === 'password' ? 'password' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={editMode === 'pseudo' ? 'Nom d\'aventurier...' : editMode === 'email' ? 'email@exemple.com' : 'Mot de passe...'}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg p-2 w-full text-xs focus:outline-none`}
                autoFocus
              />
              {editMode === 'password' && (
                <input
                  type="password"
                  value={confirmValue}
                  onChange={(e) => setConfirmValue(e.target.value)}
                  placeholder="Confirmer..."
                  className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-lg p-2 w-full text-xs focus:outline-none`}
                />
              )}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setEditMode(null)}
                  className={`flex-1 ${t.btnSecondaryBg} ${t.btnSecondaryText} border ${t.btnSecondaryBorder} py-1.5 rounded-lg text-[10px] font-bold uppercase`}
                >
                  Annuler
                </button>
                <button
                  disabled={loading}
                  onClick={() => {
                    if (editMode === 'pseudo') handleUpdatePseudo();
                    else if (editMode === 'email') handleUpdateEmail();
                    else handleUpdatePassword();
                  }}
                  className={`flex-1 bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} py-1.5 rounded-lg text-[10px] font-bold uppercase`}
                >
                  {loading ? '...' : 'Valider'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
