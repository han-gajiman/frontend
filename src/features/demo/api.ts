import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

// 시연 모드 (시간 이동 버튼, 방문 인증 위치 확인 생략). 시연용 빌드에서만 EXPO_PUBLIC_DEMO=true
export const DEMO_ENABLED = process.env.EXPO_PUBLIC_DEMO === 'true';
// 시연 모드여도 시간 이동 버튼만 숨기기 (EXPO_PUBLIC_DEMO_TIME_TRAVEL=false)
export const TIME_TRAVEL_ENABLED = DEMO_ENABLED && process.env.EXPO_PUBLIC_DEMO_TIME_TRAVEL !== 'false';

// POST /demo/time-travel (DEMO-01) — 서버 시계를 N일 이동하고 완성 스케줄러를 즉시 실행
export function timeTravel(days: number): Promise<{ serverNow: string }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.timeTravel(days));
  }
  return apiRequest<{ serverNow: string }>('/demo/time-travel', { method: 'POST', body: { days } });
}
