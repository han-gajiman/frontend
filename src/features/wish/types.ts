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
    backgroundImageUrl: string | null; // 지금은 앱 안의 일러스트(assets/spots)를 쓰고 이 값은 쓰지 않습니다.
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
  endDate: string;
  stoneCount: number;
  spotId: number;
  spotName: string;
  visited: boolean;
  result: WishResult | null;
  reflection: string | null; // 30일 회고
};

// GET /wishes/rounds — 소원 묶음(회차). 화면에서는 "첫 번째 소원"
export type RoundSummary = {
  round: number;
  towerCount: number;
  reviewAt: string | null; // 1년 회고를 쓸 수 있는 날 (첫 돌탑 전이면 null)
  canWriteReview: boolean;
  review: string | null; // 1년 회고
};

// POST /wishes/rounds/{round}/review
export type YearReviewResponse = {
  round: number;
  content: string;
};
