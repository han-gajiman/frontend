// docs/API명세서.md 🔐 Auth · 회원 기준

import type { LoginProvider } from '@/features/auth/types';

// GET /users/me
export type Me = {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  provider: LoginProvider;
  hasActiveWish: boolean;
  hasUnreadLetter: boolean; // 안 읽은 받은 엽서 (메인 우체통 깃발)
};
