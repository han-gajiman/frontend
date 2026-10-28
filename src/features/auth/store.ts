import { create } from 'zustand';

import { clearSession, loadSession, saveSession } from './tokenStorage';

type Tokens = { accessToken: string; refreshToken: string };

// 로그인 상태. 바뀔 때마다 기기에 저장하고, 앱을 켤 때 hydrate()로 불러옵니다.
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  onboarded: boolean;
  hydrated: boolean; // 저장된 로그인 상태를 불러왔는지 (그 전에는 화면을 정하지 않음)
  hydrate: () => Promise<void>;
  signIn: (tokens: Tokens & { onboarded: boolean }) => void;
  updateTokens: (tokens: Tokens) => void; // 재발급(AUTH-03)
  completeOnboarding: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const persist = () => {
    const { accessToken, refreshToken, onboarded } = get();
    if (accessToken && refreshToken) void saveSession({ accessToken, refreshToken, onboarded });
  };

  return {
    accessToken: null,
    refreshToken: null,
    onboarded: false,
    hydrated: false,
    hydrate: async () => {
      const session = await loadSession();
      set({ ...(session ?? {}), hydrated: true });
    },
    signIn: ({ accessToken, refreshToken, onboarded }) => {
      set({ accessToken, refreshToken, onboarded });
      persist();
    },
    updateTokens: ({ accessToken, refreshToken }) => {
      set({ accessToken, refreshToken });
      persist();
    },
    completeOnboarding: () => {
      set({ onboarded: true });
      persist();
    },
    signOut: () => {
      set({ accessToken: null, refreshToken: null, onboarded: false });
      void clearSession();
    },
  };
});
