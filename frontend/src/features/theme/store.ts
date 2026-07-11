import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  apply: () => void;
}

function set_html(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove('dark', 'light');
  el.classList.add(theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set_html(next);
        set({ theme: next });
      },
      apply: () => set_html(get().theme),
    }),
    { name: 'ideago.theme' },
  ),
);
