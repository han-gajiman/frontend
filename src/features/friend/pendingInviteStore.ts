import { create } from 'zustand';

// 로그인·온보딩 전에 초대 링크로 들어온 경우, 코드를 기억해 뒀다가 홈에 도착하면 이어서 수락합니다.
// (기능명세서 흐름: 초대 링크로 진입 → 로그인 → 온보딩 → 친구 수락)
type PendingInviteState = {
  code: string | null;
  setCode: (code: string) => void;
  clear: () => void;
};

export const usePendingInviteStore = create<PendingInviteState>((set) => ({
  code: null,
  setCode: (code) => set({ code }),
  clear: () => set({ code: null }),
}));
