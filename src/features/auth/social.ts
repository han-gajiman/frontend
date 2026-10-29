import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import { ApiError } from '@/api/client';

// 카카오·Google 네이티브 SDK로 소셜 토큰을 받습니다. (AUTH-01)
// SDK는 Expo Go·웹에 없어서, 버튼을 누를 때만 불러옵니다(앱 시작 시 불러오면 Expo Go에서 앱이 죽음).
// 목 모드에서는 여기를 거치지 않습니다(features/auth/api.ts).
// 사용자가 로그인 창을 닫으면 null을 돌려줍니다(에러 아님).

const KAKAO_NATIVE_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function assertNativeAvailable() {
  if (Platform.OS === 'web' || isExpoGo) {
    throw new ApiError('SOCIAL_LOGIN_UNAVAILABLE', '소셜 로그인은 개발 빌드 앱에서만 돼요. 개발용 로그인을 써 주세요.');
  }
}

function notConfigured(provider: string): never {
  throw new ApiError('SOCIAL_LOGIN_UNAVAILABLE', `${provider} 로그인 키가 설정되지 않았어요.`);
}

// 카카오 액세스 토큰 → POST /auth/kakao
export async function getKakaoAccessToken(): Promise<string | null> {
  assertNativeAvailable();
  if (!KAKAO_NATIVE_APP_KEY) notConfigured('카카오');

  const { login } = await import('@react-native-seoul/kakao-login');
  try {
    const token = await login();
    return token.accessToken;
  } catch (e) {
    // 카카오 SDK는 취소를 에러로 던집니다 (iOS·Android 메시지가 달라 code와 메시지 모두 확인)
    const text = `${(e as { code?: string }).code ?? ''} ${(e as Error).message ?? ''}`.toLowerCase();
    if (text.includes('cancel')) return null;
    throw new ApiError('SOCIAL_LOGIN_FAILED', '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.');
  }
}

// Google ID 토큰 → POST /auth/google
// 토큰의 aud는 Android에서 웹 클라이언트 ID, iOS에서 iOS 클라이언트 ID라 백엔드 GOOGLE_CLIENT_IDS에 둘 다 넣어야 합니다.
export async function getGoogleIdToken(): Promise<string | null> {
  assertNativeAvailable();
  if (!GOOGLE_WEB_CLIENT_ID) notConfigured('Google');

  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = await import(
    '@react-native-google-signin/google-signin'
  );
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, iosClientId: GOOGLE_IOS_CLIENT_ID });
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null; // 사용자가 닫음
    if (!response.data.idToken) throw new Error('idToken 없음 (webClientId 확인)');
    return response.data.idToken;
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new ApiError('SOCIAL_LOGIN_FAILED', 'Google Play 서비스를 업데이트한 뒤 다시 시도해 주세요.');
    }
    throw new ApiError('SOCIAL_LOGIN_FAILED', 'Google 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.');
  }
}

// 로그아웃·탈퇴 시 기기의 소셜 로그인 상태도 지워서, 다음 로그인 때 계정을 다시 고를 수 있게 합니다.
// 실패해도 우리 서비스 로그아웃은 진행합니다. (탈퇴 시 카카오 연결 끊기는 백엔드가 처리)
export async function signOutSocial(): Promise<void> {
  if (Platform.OS === 'web' || isExpoGo) return;
  await Promise.allSettled([
    KAKAO_NATIVE_APP_KEY ? import('@react-native-seoul/kakao-login').then((m) => m.logout()) : undefined,
    GOOGLE_WEB_CLIENT_ID
      ? import('@react-native-google-signin/google-signin').then((m) => m.GoogleSignin.signOut())
      : undefined,
  ]);
}
