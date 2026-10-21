import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthUser } from '../api/auth';
import * as authApi from '../api/auth';
import { getAuthClientInfo } from '../lib/deviceClient';
import { clearGoogleSession } from '../lib/googleAuth';
import {
  clearRefreshToken,
  loadRefreshToken,
  saveRefreshToken,
} from '../storage/secureStorage';
import { showToast } from './toastStore';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  applySession: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
  ) => Promise<void>;
  clearSession: () => Promise<void>;
  bootstrap: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  handleSessionExpired: () => void;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (input: {
    confirmation: 'DELETE';
    password?: string;
  }) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      applySession: async (accessToken, refreshToken, user) => {
        await saveRefreshToken(refreshToken);
        set({ token: accessToken, user });
      },

      clearSession: async () => {
        await clearRefreshToken();
        await clearGoogleSession();
        set({ token: null, user: null });
      },

      bootstrap: async () => {
        const refreshToken = await loadRefreshToken();
        if (!refreshToken) {
          set({ token: null, user: null });
          return;
        }
        try {
          const session = await authApi.refreshAuth(refreshToken);
          await get().applySession(
            session.accessToken,
            session.refreshToken,
            session.user,
          );
        } catch {
          await get().clearSession();
        }
      },

      refreshSession: async () => {
        const refreshToken = await loadRefreshToken();
        if (!refreshToken) {
          return null;
        }
        try {
          const session = await authApi.refreshAuth(refreshToken);
          await get().applySession(
            session.accessToken,
            session.refreshToken,
            session.user,
          );
          return session.accessToken;
        } catch {
          get().handleSessionExpired();
          return null;
        }
      },

      handleSessionExpired: () => {
        void get().clearSession();
        showToast('Your session has expired.', 'error');
      },

      register: async (email, password) => {
        const client = await getAuthClientInfo();
        const result = await authApi.register(email, password, client);
        await get().applySession(
          result.accessToken,
          result.refreshToken,
          result.user,
        );
      },

      login: async (email, password) => {
        const client = await getAuthClientInfo();
        const result = await authApi.login(email, password, client);
        await get().applySession(
          result.accessToken,
          result.refreshToken,
          result.user,
        );
      },

      loginWithGoogle: async (idToken) => {
        const client = await getAuthClientInfo();
        const result = await authApi.loginWithGoogle(idToken, client);
        await get().applySession(
          result.accessToken,
          result.refreshToken,
          result.user,
        );
      },

      logout: async () => {
        const refreshToken = await loadRefreshToken();
        try {
          if (refreshToken) {
            await authApi.logoutSession(refreshToken);
          }
        } catch {
          // Still clear locally if server unreachable
        }
        await get().clearSession();
      },

      deleteAccount: async (input) => {
        await authApi.deleteAccount(input);
        await get().clearSession();
      },
    }),
    {
      name: 'b4-auth-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => () => {},
    },
  ),
);
