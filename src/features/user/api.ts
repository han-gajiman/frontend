import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { Me } from './types';

// GET /users/me (AUTH-04)
export function getMe(): Promise<Me> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getMe());
  }
  return apiRequest<Me>('/users/me');
}

// DELETE /users/me (AUTH-06) — 즉시 삭제. 소셜 연결 끊기·데이터 삭제는 서버가 처리
export function deleteAccount(): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.deleteAccount());
  }
  return apiRequest<void>('/users/me', { method: 'DELETE' });
}
