// docs/API명세서.md 🔐 Auth · 회원 기준

import type { LoginProvider } from '@/features/auth/types';

// GET /users/me
export type Me = {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  provider: LoginProvider;
  hasActiveWish: boolean;
  hasUnreadLetter: boolean; // 안 읽은 받은 엽서 (서버 응답에 있음, 지금 화면에서는 안 씀)
  canTimeTravel?: boolean; // 실서버에서 시연 계정이면 true → 홈에 시간 이동 버튼 (DEMO-01, 11/9)
};
