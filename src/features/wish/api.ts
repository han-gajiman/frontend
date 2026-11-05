import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type {
  CreateWishRequest,
  CreateWishResponse,
  CurrentWish,
  ReflectionRequest,
  RoundSummary,
  Visibility,
  WishSummary,
  YearReviewResponse,
} from './types';

// GET /wishes/current — 진행 중 돌탑이 없으면 null
export function getCurrentWish(): Promise<CurrentWish | null> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getCurrentWish());
  }
  return apiRequest<CurrentWish | null>('/wishes/current');
}

// POST /wishes — 등록 후 수정·취소 불가
export function createWish(body: CreateWishRequest): Promise<CreateWishResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.createWish(body));
  }
  return apiRequest<CreateWishResponse>('/wishes', { method: 'POST', body });
}

// POST /wishes/{wishId}/reflection — status=COMPLETED일 때만
export function submitReflection(wishId: number, body: ReflectionRequest): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.submitReflection(wishId, body));
  }
  return apiRequest<void>(`/wishes/${wishId}/reflection`, { method: 'POST', body });
}

// PATCH /wishes/{wishId}/visibility (WISH-04) — 본인 돌탑만
export function changeVisibility(wishId: number, visibility: Visibility): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.changeVisibility(wishId, visibility));
  }
  return apiRequest<void>(`/wishes/${wishId}/visibility`, { method: 'PATCH', body: { visibility } });
}

// GET /wishes?round=1 — round 생략 시 현재 회차
export function getWishes(round?: number): Promise<WishSummary[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getWishes(round));
  }
  return apiRequest<WishSummary[]>(round ? `/wishes?round=${round}` : '/wishes');
}

// GET /wishes/rounds — 돌탑이 있는 묶음 + 현재 묶음, 오래된 순
export function getRounds(): Promise<RoundSummary[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getRounds());
  }
  return apiRequest<RoundSummary[]>('/wishes/rounds');
}

// POST /wishes/rounds/{round}/review — 끝난 묶음에 한 번만, 수정 불가
export function writeYearReview(round: number, content: string): Promise<YearReviewResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.writeYearReview(round, content));
  }
  return apiRequest<YearReviewResponse>(`/wishes/rounds/${round}/review`, { method: 'POST', body: { content } });
}
