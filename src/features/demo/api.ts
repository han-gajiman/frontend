import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

// 시연 모드 (시간 이동 버튼, 방문 인증 위치 확인 생략). 시연용 빌드에서만 EXPO_PUBLIC_DEMO=true
export const DEMO_ENABLED = process.env.EXPO_PUBLIC_DEMO === 'true';
// 시연 모드여도 시간 이동 버튼만 숨기기 (EXPO_PUBLIC_DEMO_TIME_TRAVEL=false)
export const TIME_TRAVEL_ENABLED = DEMO_ENABLED && process.env.EXPO_PUBLIC_DEMO_TIME_TRAVEL !== 'false';

// POST /demo/time-travel (DEMO-01) — N일 이동하고 완성 처리를 즉시 실행
// 실서버는 시연 계정만 자기 날짜를 이동하고(다른 회원은 그대로), 로컬·목 서버는 전체가 이동합니다.
export function timeTravel(days: number): Promise<{ serverNow: string }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.timeTravel(days));
  }
  return apiRequest<{ serverNow: string }>('/demo/time-travel', { method: 'POST', body: { days } });
}

// POST /demo/time-travel/reset — 실제 날짜로 되돌리기 (실서버는 시연 계정만)
export function resetTimeTravel(): Promise<{ serverNow: string }> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.resetTimeTravel());
  }
  return apiRequest<{ serverNow: string }>('/demo/time-travel/reset', { method: 'POST' });
}

// POST /demo/reset-scenario (DEMO-03) — 시연 계정을 처음 세팅한 상태로 (날짜·기록·친구 계정). 시연 계정 본인만
export function resetDemoScenario(): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.resetTimeTravel()).then(() => undefined);
  }
  return apiRequest<void>('/demo/reset-scenario', { method: 'POST' });
}
