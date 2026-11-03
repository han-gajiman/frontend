import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import { getGoogleIdToken, getKakaoAccessToken } from './social';
import type { LocalSignupRequest, LoginResponse, OnboardingRequest } from './types';

// POST /auth/kakao — 카카오 SDK로 받은 액세스 토큰을 보냅니다. 로그인 창을 닫으면 null
export async function loginWithKakao(): Promise<LoginResponse | null> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('KAKAO'));
  }
  const accessToken = await getKakaoAccessToken();
  if (!accessToken) return null;
  return apiRequest<LoginResponse>('/auth/kakao', { method: 'POST', body: { accessToken } });
}

// POST /auth/google — Google 로그인으로 받은 ID 토큰을 보냅니다. 로그인 창을 닫으면 null
export async function loginWithGoogle(): Promise<LoginResponse | null> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('GOOGLE'));
  }
  const idToken = await getGoogleIdToken();
  if (!idToken) return null;
  return apiRequest<LoginResponse>('/auth/google', { method: 'POST', body: { idToken } });
}

// POST /auth/login/local — 자체 로그인 (이메일·비밀번호). 실패하면 AUTH_LOGIN_FAILED
export function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.loginLocal(email, password));
  }
  return apiRequest<LoginResponse>('/auth/login/local', { method: 'POST', body: { email, password } });
}

// POST /auth/signup/local — 자체 회원가입. 가입하면 바로 로그인 토큰이 오고, 약관 동의는 온보딩에서
export function signupWithEmail(body: LocalSignupRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.signupLocal(body));
  }
  return apiRequest<LoginResponse>('/auth/signup/local', { method: 'POST', body });
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
