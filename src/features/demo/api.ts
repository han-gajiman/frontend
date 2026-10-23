import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

// 시연 버튼 표시 여부. 시연용 빌드에서만 EXPO_PUBLIC_DEMO=true
export const DEMO_ENABLED = process.env.EXPO_PUBLIC_DEMO === 'true';

// POST /demo/time-travel (DEMO-01) — 서버 시계를 N일 이동하고 완성 스케줄러를 즉시 실행
export function timeTravel(days: number): Promise<{ serverNow: string }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.timeTravel(days));
  }
  return apiRequest<{ serverNow: string }>('/demo/time-travel', { method: 'POST', body: { days } });
}
