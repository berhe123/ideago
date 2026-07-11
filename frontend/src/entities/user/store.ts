import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResultDto, UserDto } from '@/shared';
import { api, tokenStore, unwrap } from '@/shared/api/client';

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setUser: (user: UserDto | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'FOUNDER' | 'EXPERT';
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      clearSession: () => {
        tokenStore.clear();
        set({ user: null, isAuthenticated: false, hydrated: true });
      },

      login: async (email, password) => {
        tokenStore.clear();
        set({ user: null, isAuthenticated: false, hydrated: true });

        const data = await unwrap<AuthResultDto>(
          api.post('/auth/login', { email: email.trim().toLowerCase(), password }),
        );
        tokenStore.set(data.accessToken, data.refreshToken);
        set({ user: data.user, isAuthenticated: true, hydrated: true });
      },

      register: async (payload) => {
        tokenStore.clear();
        const data = await unwrap<AuthResultDto>(
          api.post('/auth/register', { ...payload, email: payload.email.trim().toLowerCase() }),
        );
        tokenStore.set(data.accessToken, data.refreshToken);
        set({ user: data.user, isAuthenticated: true, hydrated: true });
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', { refreshToken: tokenStore.refresh });
        } catch {
          /* ignore */
        }
        tokenStore.clear();
        set({ user: null, isAuthenticated: false, hydrated: true });
      },

      fetchMe: async () => {
        if (!tokenStore.access) {
          set({ user: null, isAuthenticated: false, hydrated: true });
          return;
        }

        const tokenAtStart = tokenStore.access;
        const cachedUser = get().user;
        if (cachedUser) {
          set({ isAuthenticated: true, hydrated: true });
        }

        try {
          const user = await unwrap<UserDto>(api.get('/users/me'));
          if (tokenStore.access !== tokenAtStart) return;
          set({ user, isAuthenticated: true, hydrated: true });
        } catch {
          if (tokenStore.access !== tokenAtStart) return;
          tokenStore.clear();
          set({ user: null, isAuthenticated: false, hydrated: true });
        }
      },
    }),
    {
      name: 'ideago.auth',
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        const hasToken = !!tokenStore.access;
        useAuthStore.setState({
          isAuthenticated: !!(state?.user && hasToken),
          hydrated: true,
        });
      },
    },
  ),
);
