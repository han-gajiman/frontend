import { apiRequest, type Page } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { AcceptedFriend, Cheer, Friend, Invite } from './types';

// POST /friends/invites (FRIEND-01) — 7일 동안 여러 명이 쓸 수 있는 초대 링크
export function createInvite(): Promise<Invite> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.createInvite());
  }
  return apiRequest<Invite>('/friends/invites', { method: 'POST' });
}

// POST /friends/invites/{inviteCode}/accept (FRIEND-01)
export function acceptInvite(inviteCode: string): Promise<AcceptedFriend> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.acceptInvite(inviteCode));
  }
  return apiRequest<AcceptedFriend>(`/friends/invites/${encodeURIComponent(inviteCode)}/accept`, {
    method: 'POST',
  });
}

// GET /friends (FRIEND-02) — 최근에 친구가 된 순. 친구 수 제한이 없어 한 번에 최대 50명
export function getFriends(): Promise<Page<Friend>> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getFriends());
  }
  return apiRequest<Page<Friend>>('/friends?size=50');
}

// GET /wishes/{wishId}/cheers (FRIEND-03) — 최신순
export function getCheers(wishId: number): Promise<Page<Cheer>> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getCheers(wishId));
  }
  return apiRequest<Page<Cheer>>(`/wishes/${wishId}/cheers?size=50`);
}

// POST /wishes/{wishId}/cheers (FRIEND-03) — 친구의 친구 공개 진행 중 돌탑에만, 100자
export function writeCheer(wishId: number, message: string): Promise<{ cheerId: number }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.writeCheer(wishId, message));
  }
  return apiRequest<{ cheerId: number }>(`/wishes/${wishId}/cheers`, { method: 'POST', body: { message } });
}

// POST /friends/{friendId}/nudge (FRIEND-04) — 오늘 안 쌓은 친구에게, 같은 친구 하루 1번
export function nudge(friendId: number): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.nudge(friendId));
  }
  return apiRequest<void>(`/friends/${friendId}/nudge`, { method: 'POST' });
}
