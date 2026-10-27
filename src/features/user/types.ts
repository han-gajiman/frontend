// docs/API명세서.md 🔐 Auth · 회원 기준

import type { SocialProvider } from '@/features/auth/types';

// GET /users/me
export type Me = {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  provider: SocialProvider;
  agreements: { location: boolean };
  hasActiveWish: boolean;
  // 첫 돌탑 전이면 null
  journey: { startedOn: string; currentRound: number; reviewAt: string } | null;
};
