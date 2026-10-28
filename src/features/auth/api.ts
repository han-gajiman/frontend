import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import type { LoginResponse, OnboardingRequest } from './types';

// POST /auth/kakao — kakaoAccessToken은 앱의 카카오 SDK에서 받은 토큰
// TODO(AUTH-01): 카카오 SDK 연동 (개발 빌드 필요할 수 있음)
export function loginWithKakao(kakaoAccessToken: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('KAKAO'));
  }
  return apiRequest<LoginResponse>('/auth/kakao', { method: 'POST', body: { accessToken: kakaoAccessToken } });
}

// POST /auth/google — idToken은 앱의 Google 로그인에서 받은 ID 토큰
// TODO(AUTH-01): Google 로그인 SDK 연동 (개발 빌드 필요할 수 있음)
export function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('GOOGLE'));
  }
  return apiRequest<LoginResponse>('/auth/google', { method: 'POST', body: { idToken } });
}

// 로컬 개발용 로그인 버튼 표시 여부. 실제 서버(USE_MOCK=false) + EXPO_PUBLIC_DEV_LOGIN=true일 때만
export const DEV_LOGIN_ENABLED = !USE_MOCK && process.env.EXPO_PUBLIC_DEV_LOGIN === 'true';

// POST /dev/login — 백엔드 local 프로필 전용. 카카오·Google SDK 없이 실제 토큰을 받습니다.
export function loginForDev(): Promise<LoginResponse> {
  const devKey = process.env.EXPO_PUBLIC_DEV_LOGIN_KEY ?? 'me';
  return apiRequest<LoginResponse>('/dev/login', { method: 'POST', body: { devKey } });
}

// POST /users/me/onboarding
export function completeOnboarding(body: OnboardingRequest): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.completeOnboarding(body));
  }
  return apiRequest<void>('/users/me/onboarding', { method: 'POST', body });
}

// POST /auth/logout — 서버에서 Refresh Token 폐기
export function logout(refreshToken: string): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => undefined);
  }
  return apiRequest<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
}
