import { useThemeClasses } from '../contexts/AppSettingsContext';

interface Props {
  authMode: 'signin' | 'signup';
  authEmail: string;
  authPassword: string;
  authPseudo: string;
  authLoading: boolean;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  setAuthEmail: (v: string) => void;
  setAuthPassword: (v: string) => void;
  setAuthPseudo: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthScreen({ authMode, authEmail, authPassword, authPseudo, authLoading, setAuthMode, setAuthEmail, setAuthPassword, setAuthPseudo, onSubmit }: Props) {
  const t = useThemeClasses();

  return (
    <div className="max-w-md mx-auto h-full flex flex-col justify-center px-6 relative z-10">
      <div className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-6 shadow-2xl ${t.cardShadow} space-y-6`}>
        <div className="text-center space-y-2">
          <span className="text-4xl block">⚔️</span>
          <h1 className={`text-2xl font-black tracking-tight bg-linear-to-r ${t.btnPrimaryFrom} ${t.btnPrimaryTo} bg-clip-text text-transparent uppercase font-mono`}>
            SideQuest
          </h1>
          <p className={`text-xs ${t.textSecondary}`}>
            {authMode === 'signin' ? 'Accédez à votre grimoire de personnages' : 'Rejoignez la taverne des aventuriers'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-1">
              <label className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}>Pseudo</label>
              <input
                type="text"
                placeholder="Nom d'aventurier..."
                value={authPseudo}
                onChange={(e) => setAuthPseudo(e.target.value)}
                className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-3 w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all`}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}>Adresse Email</label>
            <input
              type="email"
              placeholder="votre.email@royaume.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-3 w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all`}
              required
            />
          </div>

          <div className="space-y-1">
            <label className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}>Mot de passe</label>
            <input
              type="password"
              placeholder="Min. 6 caractères..."
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className={`${t.inputBg} border ${t.inputBorder} ${t.inputText} rounded-xl p-3 w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className={`w-full bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} font-bold shadow-lg hover:brightness-110 active:scale-95 border ${t.btnPrimaryBorder} py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50`}
          >
            {authLoading ? 'Invocations...' : authMode === 'signin' ? 'Entrer dans la taverne' : 'Forger mon compte'}
          </button>
        </form>

        <div className={`text-center pt-2 border-t ${t.cardBorder}`}>
          <button
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className={`text-xs ${t.accent} hover:brightness-110 transition-colors font-medium`}
          >
            {authMode === 'signin' ? "Nouveau ici ? Créer un compte d'aventurier" : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
