import { useThemeClasses } from "../contexts/AppSettingsContext";
import { LogIn, Mail, Sparkles } from "lucide-react";

interface Props {
  authMode: "signin" | "signup";
  authEmail: string;
  authPassword: string;
  authPseudo: string;
  authLoading: boolean;
  emailConfirmationPending: boolean;
  setAuthMode: (mode: "signin" | "signup") => void;
  setAuthEmail: (v: string) => void;
  setAuthPassword: (v: string) => void;
  setAuthPseudo: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToSignin: () => void;
}

export function AuthScreen({
  authMode,
  authEmail,
  authPassword,
  authPseudo,
  authLoading,
  emailConfirmationPending,
  setAuthMode,
  setAuthEmail,
  setAuthPassword,
  setAuthPseudo,
  onSubmit,
  onBackToSignin,
}: Props) {
  const t = useThemeClasses();

  if (emailConfirmationPending) {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col justify-center px-6 relative z-10">
        <div
          className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-6 shadow-2xl ${t.cardShadow} space-y-5 text-center`}
        >
          <div className="flex justify-center">
            <img src="/sq-logo.svg" alt="SideQuest" className="w-full h-full" />
          </div>
          <div className={`flex flex-col items-center gap-3 ${t.textSecondary}`}>
            <span className={`flex items-center justify-center w-12 h-12 rounded-2xl ${t.inputBg} border ${t.cardBorder}`}>
              <Mail size={22} className={t.accent} />
            </span>
            <h2 className={`text-sm font-bold ${t.textPrimary} uppercase tracking-widest`}>
              Confirmez votre email
            </h2>
            <p className={`text-xs ${t.textSecondary} leading-relaxed`}>
              Un lien de confirmation a été envoyé à{" "}
              <span className={`font-semibold ${t.accent}`}>{authEmail}</span>.
              <br />
              Cliquez sur ce lien pour activer votre compte, puis connectez-vous.
            </p>
            <p className={`text-[10px] ${t.textMuted} italic`}>
              Pensez à vérifier vos spams si vous ne trouvez pas l'email.
            </p>
          </div>
          <button
            onClick={onBackToSignin}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium uppercase tracking-widest transition-all active:scale-[0.99] bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} shadow-sm hover:brightness-105`}
          >
            <LogIn size={13} />
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col justify-center px-6 relative z-10">
      <div
        className={`${t.cardBg} border ${t.cardBorder} rounded-3xl p-6 shadow-2xl ${t.cardShadow} space-y-6`}
      >
        <div className="flex justify-center">
          <img
            src="/sq-logo.svg"
            alt="SideQuest"
            className="w-full h-full"
          />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === "signup" && (
            <div className="space-y-1">
              <label
                className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}
              >
                Pseudo
              </label>
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
            <label
              className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}
            >
              Adresse Email
            </label>
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
            <label
              className={`text-[10px] ${t.textMuted} uppercase font-bold font-mono block`}
            >
              Mot de passe
            </label>
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
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium uppercase tracking-widest transition-all disabled:opacity-50 active:scale-[0.99] bg-linear-to-b ${t.btnPrimaryFrom} ${t.btnPrimaryTo} ${t.btnPrimaryText} border ${t.btnPrimaryBorder} shadow-sm hover:brightness-105`}
          >
            {authLoading ? (
              <>
                <span className="w-4 h-4 rounded-md flex items-center justify-center bg-white/10 border border-white/15">
                  <Sparkles size={11} className="animate-pulse" />
                </span>
                Connexion...
              </>
            ) : authMode === "signin" ? (
              <>
                <span className="w-4 h-4 rounded-md flex items-center justify-center bg-white/10 border border-white/15">
                  <LogIn size={11} />
                </span>
                Se connecter
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Forger mon compte
              </>
            )}
          </button>
        </form>

        <div className={`text-center pt-2 border-t ${t.cardBorder}`}>
          <button
            onClick={() =>
              setAuthMode(authMode === "signin" ? "signup" : "signin")
            }
            className={`text-xs ${t.accent} hover:brightness-110 transition-colors font-medium`}
          >
            {authMode === "signin"
              ? "Nouveau ici ? Créer un compte d'aventurier"
              : "Déjà membre ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
