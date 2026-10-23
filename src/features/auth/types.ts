// docs/API명세서.md 🔐 Auth · 회원 기준

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
