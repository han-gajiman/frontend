import { Platform } from 'react-native';

import { apiRequest } from '@/api/client';
import { mockCall, USE_MOCK } from '@/api/mock';
import { mockServer } from '@/api/mockServer';

import { getGoogleIdToken, getKakaoAccessToken } from './social';
import { startGoogleWebLogin, startKakaoWebLogin, type WebSocialRedirect } from './socialWeb';
import type { FindEmailResponse, LocalSignupRequest, LoginResponse, OnboardingRequest } from './types';

// POST /auth/kakao — 카카오 SDK로 받은 액세스 토큰을 보냅니다. 로그인 창을 닫으면 null
export async function loginWithKakao(): Promise<LoginResponse | null> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('KAKAO'));
  }
  if (Platform.OS === 'web') return startKakaoWebLogin(); // 카카오 로그인 화면으로 이동 → /login으로 돌아옴
  const accessToken = await getKakaoAccessToken();
  if (!accessToken) return null;
  return apiRequest<LoginResponse>('/auth/kakao', { method: 'POST', body: { accessToken } });
}

// POST /auth/google — Google 로그인으로 받은 ID 토큰을 보냅니다. 로그인 창을 닫으면 null
export async function loginWithGoogle(): Promise<LoginResponse | null> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.login('GOOGLE'));
  }
  if (Platform.OS === 'web') return startGoogleWebLogin();
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

// 웹에서 카카오·Google 로그인 화면을 거쳐 돌아온 뒤 마무리 (takeWebSocialRedirect 결과)
// 카카오: POST /auth/kakao/web/code (서버가 인가 코드를 토큰으로 바꿈), Google: POST /auth/google
export function finishWebSocialLogin(
  redirect: Extract<WebSocialRedirect, { provider: string }>,
): Promise<LoginResponse> {
  if (redirect.provider === 'KAKAO') {
    return apiRequest<LoginResponse>('/auth/kakao/web/code', {
      method: 'POST',
      body: { code: redirect.code, redirectUri: redirect.redirectUri },
    });
  }
  return apiRequest<LoginResponse>('/auth/google', { method: 'POST', body: { idToken: redirect.idToken } });
}

// POST /auth/signup/local — 자체 회원가입. 가입하면 바로 로그인 토큰이 오고, 약관 동의는 온보딩에서
export function signupWithEmail(body: LocalSignupRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.signupLocal(body));
  }
  return apiRequest<LoginResponse>('/auth/signup/local', { method: 'POST', body });
}

// POST /auth/find-email — 아이디(이메일) 찾기. 닉네임으로 가입한 이메일을 가려서 돌려줌 (없으면 빈 배열)
export function findEmails(nickname: string): Promise<FindEmailResponse> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.findEmails(nickname));
  }
  return apiRequest<FindEmailResponse>('/auth/find-email', { method: 'POST', body: { nickname } });
}

// POST /auth/password/reset-code — 비밀번호 찾기 인증코드 메일. 가입 여부와 관계없이 성공(204)
export function sendResetCode(email: string): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => undefined);
  }
  return apiRequest<void>('/auth/password/reset-code', { method: 'POST', body: { email } });
}

// POST /auth/password/reset — 인증코드 확인 후 새 비밀번호. 틀리면 AUTH_RESET_CODE_INVALID
export function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  if (USE_MOCK) {
    return mockCall(() => mockServer.resetPassword(email, code, newPassword));
  }
  return apiRequest<void>('/auth/password/reset', { method: 'POST', body: { email, code, newPassword } });
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
