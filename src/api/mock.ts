// 백엔드 준비 전에 화면을 만들기 위한 목 API. 실제 데이터 처리는 mockServer.ts가 합니다.
// .env.local의 EXPO_PUBLIC_USE_MOCK=true면 목 서버를, 아니면 실제 서버를 씁니다.
// EXPO_PUBLIC_MOCK_SCENARIO로 화면 상태를 바꿔 확인할 수 있습니다. (값을 바꾸면 Metro 재시작)
//   normal  진행 중 돌탑이 있는 상태로 시작 (기본값)
//   empty   진행 중 돌탑 없이 시작 (시연 경로를 처음부터 확인할 때)
//   error   모든 요청이 서버 에러
//   offline 모든 요청이 네트워크 끊김
//   slow    모든 요청이 3초 지연 (로딩 상태 확인)

import { ApiError } from './client';

export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export type MockScenario = 'normal' | 'empty' | 'error' | 'offline' | 'slow';

export const MOCK_SCENARIO = (process.env.EXPO_PUBLIC_MOCK_SCENARIO ?? 'normal') as MockScenario;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 네트워크 지연·에러 시나리오를 적용한 뒤 목 서버 함수를 실행합니다.
export async function mockCall<T>(handler: () => T): Promise<T> {
  await wait(MOCK_SCENARIO === 'slow' ? 3000 : 400);

  if (MOCK_SCENARIO === 'error') {
    throw new ApiError('INTERNAL_ERROR', '잠시 후 다시 시도해 주세요.', 500);
  }
  if (MOCK_SCENARIO === 'offline') {
    throw new ApiError('NETWORK_ERROR', '인터넷 연결을 확인해 주세요.');
  }
  return handler();
}
