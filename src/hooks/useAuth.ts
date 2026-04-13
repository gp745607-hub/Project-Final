import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  email: string;
  name: string;
  id: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: {
            email: session.user.email || '',
            name: 'Administrateur MADE',
            id: session.user.id,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            email: session.user.email || '',
            name: 'Administrateur MADE',
            id: session.user.id,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      if (data.user) {
        setAuthState({
          user: {
            email: data.user.email || '',
            name: 'Administrateur MADE',
            id: data.user.id,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      }

      return { success: false, error: 'Erreur de connexion' };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  };
}
