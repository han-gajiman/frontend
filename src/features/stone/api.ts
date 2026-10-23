import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { CreateStoneResponse } from './types';

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
