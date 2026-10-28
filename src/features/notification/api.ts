import { apiRequest, type Page } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { AppNotification } from './types';

// GET /notifications (NOTI-01) — 최신순, 최근 50개
export function getNotifications(): Promise<Page<AppNotification>> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.getNotifications());
  }
  return apiRequest<Page<AppNotification>>('/notifications?size=50');
}

// PATCH /notifications/{id}/read (NOTI-01)
export function markNotificationRead(id: number): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.markNotificationRead(id));
  }
  return apiRequest<void>(`/notifications/${id}/read`, { method: 'PATCH' });
}
