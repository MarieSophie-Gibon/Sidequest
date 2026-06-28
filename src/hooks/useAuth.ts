import { useState } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    username?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPasswordConfirm, setAuthPasswordConfirm] = useState('');
  const [authPseudo, setAuthPseudo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false);
  const [passwordResetEmailSent, setPasswordResetEmailSent] = useState(false);

  function getNetworkAwareMessage(rawMessage?: string, fallback = 'Une erreur est survenue.') {
    const message = (rawMessage || '').toLowerCase();
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const looksLikeNetwork =
      message.includes('network') ||
      message.includes('failed to fetch') ||
      message.includes('fetch') ||
      message.includes('offline') ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('connection');

    if (offline || looksLikeNetwork) {
      return 'Erreur reseau : connexion impossible. Verifiez votre internet puis reessayez.';
    }

    return rawMessage || fallback;
  }

  async function handleAuthSubmit(e: React.FormEvent, showAlert: (title: string, text: string) => void) {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === 'forgot') {
        const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo,
        });

        if (error) throw error;
        setPasswordResetEmailSent(true);
        showAlert('Email envoye', `Un lien de reinitialisation a ete envoye a ${authEmail}.`);
        return;
      }

      if (authMode === 'reset') {
        if (authPassword.length < 6) {
          showAlert('Mot de passe invalide', 'Le mot de passe doit contenir au moins 6 caracteres.');
          return;
        }
        if (authPassword !== authPasswordConfirm) {
          showAlert('Mots de passe differents', 'Les deux mots de passe doivent etre identiques.');
          return;
        }

        const { error } = await supabase.auth.updateUser({ password: authPassword });
        if (error) throw error;

        await supabase.auth.signOut();
        setUser(null);
        setAuthMode('signin');
        setAuthPassword('');
        setAuthPasswordConfirm('');
        showAlert('Mot de passe mis a jour', 'Reconnectez-vous avec votre nouveau mot de passe.');
        return;
      }

      if (authMode === 'signup') {
        if (!authPseudo.trim()) {
          showAlert('Pseudo requis', 'Veuillez renseigner un pseudo pour votre aventurier.');
          setAuthLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { username: authPseudo.trim() } }
        });

        if (error) throw error;
        if (data.user && !data.session) {
          // Email confirmation required — do not sign in yet
          setEmailConfirmationPending(true);
          showAlert("Vérifiez votre messagerie", `Un email de confirmation a été envoyé à ${authEmail}. Cliquez sur le lien pour activer votre compte.`);
        } else if (data.user) {
          showAlert("Compte créé !", "Bienvenue dans l'aventure. Votre profil est enregistré.");
          setUser(data.user);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });

        if (error) throw error;
        if (data.user) {
          showAlert("Heureux retour !", `Bon retour parmi nous, ${data.user.user_metadata?.username || 'aventurier'}.`);
          setUser(data.user);
        }
      }
    } catch (err: unknown) {
      const message = getNetworkAwareMessage((err as Error)?.message, "Erreur d'authentification.");
      showAlert("Erreur d'authentification", message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout(showAlert: (title: string, text: string) => void) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert('Erreur de deconnexion', getNetworkAwareMessage(error.message, 'Impossible de vous deconnecter.'));
    } else {
      setUser(null);
      showAlert("Déconnecté", "À bientôt pour de nouvelles SideQuests !");
    }
  }

  function startForgotPassword() {
    setEmailConfirmationPending(false);
    setPasswordResetEmailSent(false);
    setAuthMode('forgot');
    setAuthPassword('');
    setAuthPasswordConfirm('');
  }

  function backToSignin() {
    setEmailConfirmationPending(false);
    setPasswordResetEmailSent(false);
    setAuthMode('signin');
    setAuthPassword('');
    setAuthPasswordConfirm('');
  }

  function enterPasswordRecovery(email?: string) {
    setEmailConfirmationPending(false);
    setPasswordResetEmailSent(false);
    setAuthMode('reset');
    setAuthEmail(email || '');
    setAuthPassword('');
    setAuthPasswordConfirm('');
    setUser(null);
  }

  return {
    user, setUser,
    authMode, setAuthMode,
    authEmail, setAuthEmail,
    authPassword, setAuthPassword,
    authPasswordConfirm, setAuthPasswordConfirm,
    authPseudo, setAuthPseudo,
    authLoading,
    emailConfirmationPending, setEmailConfirmationPending,
    passwordResetEmailSent,
    handleAuthSubmit,
    handleLogout,
    startForgotPassword,
    backToSignin,
    enterPasswordRecovery,
  };
}
