import { apiRequest, type Page } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { Letter, Postcard, SendLetterRequest } from './types';

// GET /postcards — 내 엽서함 (명소·스타일 순)
export function getPostcards(): Promise<Postcard[]> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getPostcards());
  }
  return apiRequest<Postcard[]>('/postcards');
}

// POST /postcards/letters — 가진 엽서만, 보낸 글은 고칠 수 없음
export function sendLetter(body: SendLetterRequest): Promise<{ letterId: number }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.sendLetter(body));
  }
  return apiRequest<{ letterId: number }>('/postcards/letters', { method: 'POST', body });
}

// GET /postcards/letters/received — 받은 엽서, 최신순
export function getReceivedLetters(): Promise<Page<Letter>> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getReceivedLetters());
  }
  return apiRequest<Page<Letter>>('/postcards/letters/received?size=50');
}

// PATCH /postcards/letters/{id}/read
export function markLetterRead(letterId: number): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.markLetterRead(letterId));
  }
  return apiRequest<void>(`/postcards/letters/${letterId}/read`, { method: 'PATCH' });
}
