import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { Spot, VisitResponse } from './types';

// GET /spots?category=PASS
export function getSpots(category?: string): Promise<Spot[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getSpots(category));
  }
  return apiRequest<Spot[]>(category ? `/spots?category=${category}` : '/spots');
}

// POST /spots/{spotId}/visits (SPOT-03) — 앱이 기기 안에서 반경을 확인한 뒤 결과만 보냅니다. 위치 정보는 보내지 않습니다.
export function createVisit(spotId: number): Promise<VisitResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.createVisit(spotId));
  }
  return apiRequest<VisitResponse>(`/spots/${spotId}/visits`, { method: 'POST' });
}
