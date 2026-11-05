// docs/API명세서.md 🌠 Wish 기준

import type { SpotCategory } from '@/features/spot/types';

export type Visibility = 'PRIVATE' | 'FRIENDS';

export type WishStatus = 'ACTIVE' | 'COMPLETED' | 'CLOSED';

export type WishResult = 'ACHIEVED' | 'NOT_ACHIEVED';

// GET /wishes/current
export type CurrentWish = {
  wishId: number;
  content: string;
  actionGoal: string;
  status: WishStatus; // COMPLETED = 30일 경과, 회고 대기
  visibility: Visibility;
  spot: {
    id: number;
    name: string;
    category: SpotCategory;
    visited: boolean;
    backgroundImageUrl: string | null; // null이면 허허벌판 기본 배경
  };
  stoneCount: number;
  stonedToday: boolean; // 오늘 쌓았는지는 서버 기준 (클라이언트 시계로 계산 금지)
  dayIndex: number;
  daysLeft: number;
};

// POST /wishes
export type CreateWishRequest = {
  content: string;
  actionGoal: string;
  spotId: number;
  visibility: Visibility;
};

export type CreateWishResponse = {
  wishId: number;
  startDate: string;
  endDate: string;
};

// POST /wishes/{wishId}/reflection
export type ReflectionRequest = {
  result: WishResult;
  reflection: string;
};

// GET /wishes?round=1
export type WishSummary = {
  wishId: number;
  content: string;
  startDate: string;
  stoneCount: number;
  spotId: number;
  spotName: string;
  visited: boolean;
  result: WishResult | null;
};
