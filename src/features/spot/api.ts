import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { Spot } from './types';

// GET /spots?category=PASS
export function getSpots(category?: string): Promise<Spot[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getSpots(category));
  }
  return apiRequest<Spot[]>(category ? `/spots?category=${category}` : '/spots');
}
