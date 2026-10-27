// docs/API명세서.md 🔐 Auth · 회원 기준

// 소셜 로그인: 카카오 + Google (10/27 Apple 제외)
export type SocialProvider = 'KAKAO' | 'GOOGLE';

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
