import { apiRequest, type Page } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { CreateStoneResponse, StoneItem } from './types';

const MAX_STONES = 30; // 돌탑 하나의 돌은 최대 30개라 한 번에 받습니다.

// POST /wishes/{wishId}/stones — 오늘(KST) 1개만. content가 있으면 실천 기록, 없으면 출석
export function createStone(wishId: number, content?: string): Promise<CreateStoneResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.createStone(wishId, content || null));
  }
  return apiRequest<CreateStoneResponse>(`/wishes/${wishId}/stones`, {
    method: 'POST',
    body: content ? { content } : {},
  });
}

// GET /wishes/{wishId}/stones — 서버는 최신순으로 주고, 화면에서는 오래된 날부터 보여줍니다.
export async function getStones(wishId: number): Promise<StoneItem[]> {
  const page = USE_MOCK
    ? await mockCall(() => mockServer.getStones(wishId))
    : await apiRequest<Page<StoneItem>>(`/wishes/${wishId}/stones?page=0&size=${MAX_STONES}`);
  return [...page.content].reverse();
}
