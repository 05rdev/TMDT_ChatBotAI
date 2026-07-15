import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './useCartStore';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  resetAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, isAuthenticated: true, hasHydrated: true });
      },
      setUser: (user) => {
        set({ user });
      },
      resetAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        useCartStore.getState().clearCart();
        set({ user: null, isAuthenticated: false, hasHydrated: true });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        useCartStore.getState().clearCart();
        set({ user: null, isAuthenticated: false, hasHydrated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined;
        const hasTokens =
          typeof window !== 'undefined' &&
          Boolean(localStorage.getItem('accessToken') && localStorage.getItem('refreshToken'));

        if (!hasTokens) {
          return {
            ...currentState,
            user: null,
            isAuthenticated: false,
            hasHydrated: true,
          };
        }

        return {
          ...currentState,
          ...persisted,
          hasHydrated: true,
        };
      },
    }
  )
);
