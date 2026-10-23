import { create } from 'zustand';

// 로그인 상태. 지금은 메모리에만 저장해서 앱을 다시 켜면 로그아웃됩니다.
// TODO(AUTH-03): expo-secure-store에 토큰 저장 + 자동 재발급
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  onboarded: boolean;
  signIn: (tokens: { accessToken: string; refreshToken: string; onboarded: boolean }) => void;
  completeOnboarding: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  onboarded: false,
  signIn: ({ accessToken, refreshToken, onboarded }) => set({ accessToken, refreshToken, onboarded }),
  completeOnboarding: () => set({ onboarded: true }),
  signOut: () => set({ accessToken: null, refreshToken: null, onboarded: false }),
}));
