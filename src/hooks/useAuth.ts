import { useState } from 'react';
import { supabase } from '../supabaseClient';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPseudo, setAuthPseudo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  async function handleAuthSubmit(e: React.FormEvent, showAlert: (title: string, text: string) => void) {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authPseudo.trim()) {
          alert("Veuillez renseigner un pseudo pour votre aventurier.");
          setAuthLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { username: authPseudo.trim() } }
        });

        if (error) throw error;
        if (data.user) {
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
      alert("Erreur d'authentification : " + (err as Error).message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout(showAlert: (title: string, text: string) => void) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Erreur lors de la déconnexion : " + error.message);
    } else {
      setUser(null);
      showAlert("Déconnecté", "À bientôt pour de nouvelles SideQuests !");
    }
  }

  return {
    user, setUser,
    authMode, setAuthMode,
    authEmail, setAuthEmail,
    authPassword, setAuthPassword,
    authPseudo, setAuthPseudo,
    authLoading,
    handleAuthSubmit,
    handleLogout
  };
}
