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
