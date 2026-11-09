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

// PATCH /users/me/nickname (AUTH-04) — 회원끼리 겹치면 409 NICKNAME_DUPLICATED
export function changeNickname(nickname: string): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.changeNickname(nickname));
  }
  return apiRequest<void>('/users/me/nickname', { method: 'PATCH', body: { nickname } });
}

// DELETE /users/me (AUTH-06) — 즉시 삭제. 소셜 연결 끊기·데이터 삭제는 서버가 처리
export function deleteAccount(): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.deleteAccount());
  }
  return apiRequest<void>('/users/me', { method: 'DELETE' });
}
