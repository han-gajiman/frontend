import { create } from 'zustand';

import { useAuthStore } from '@/features/auth/store';

// 로그인 전에는 항상 인트로(소원을 품다 → 쌓다 → 경북에서)부터 보여줍니다.
// 건너뛰기·"내 소원 시작하기"로 넘어가면 passed가 되어 로그인 화면으로 가고,
// 로그아웃·탈퇴·토큰 만료로 로그인이 풀리면 다시 인트로부터 시작합니다. (기기에 저장하지 않음)
type IntroState = {
  passed: boolean;
  pass: () => void;
};

export const useIntroStore = create<IntroState>((set) => ({
  passed: false,
  pass: () => set({ passed: true }),
}));

// 로그인이 풀리는 순간 같이 되돌려서, 로그인 화면이 잠깐 보였다가 인트로로 바뀌는 깜빡임이 없게 합니다.
useAuthStore.subscribe((state, prev) => {
  if (prev.accessToken !== null && state.accessToken === null) {
    useIntroStore.setState({ passed: false });
  }
});
