import { create } from 'zustand';

import type { Locale } from '@/lib/i18n';

export interface SessionState {
  localeOverride: Locale | null;
  setLocaleOverride: (locale: Locale) => void;
  clearLocaleOverride: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  localeOverride: null,
  setLocaleOverride: (locale) => set({ localeOverride: locale }),
  clearLocaleOverride: () => set({ localeOverride: null }),
}));
