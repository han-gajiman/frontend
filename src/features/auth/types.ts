// docs/API명세서.md 🔐 Auth · 회원 기준

// 소셜 로그인: 카카오 + Google (10/27 Apple 제외)
export type SocialProvider = 'KAKAO' | 'GOOGLE';

// 가입 경로: 소셜 + 자체 로그인(이메일·비밀번호, 11/3)
export type LoginProvider = SocialProvider | 'LOCAL';

// POST /auth/signup/local
export type LocalSignupRequest = {
  email: string;
  password: string; // 8자 이상
  nickname: string; // 30자 이하
};

export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /auth/find-email 응답: 닉네임으로 가입한 이메일을 가린 것 (예: st***@ex***.com)
export type FindEmailResponse = { emails: string[] };

export const RESET_CODE_LENGTH = 6;
export const RESET_CODE_RESEND_SECONDS = 60; // 서버도 60초 안 재요청은 무시

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  onboarded: boolean;
};

export type OnboardingRequest = {
  nickname: string;
  agreements: { terms: boolean; privacy: boolean; location: boolean };
  agreementVersion: string;
};
