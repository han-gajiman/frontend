import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json에 소셜 로그인 네이티브 설정을 더합니다. 키는 .env.local(로컬) 또는 EAS 환경변수에서 읽습니다.
// 키가 없으면 해당 플러그인을 빼서, 키 없이도 빌드·실행은 됩니다(그 로그인 버튼만 안내 문구를 띄움).
const KAKAO_NATIVE_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// iOS 클라이언트 ID "123-abc.apps.googleusercontent.com" → URL 스킴 "com.googleusercontent.apps.123-abc"
const GOOGLE_IOS_URL_SCHEME = GOOGLE_IOS_CLIENT_ID
  ? `com.googleusercontent.apps.${GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '')}`
  : undefined;

type PluginEntry = NonNullable<ExpoConfig['plugins']>[number];

const socialPlugins: PluginEntry[] = [
  // 카카오 Android SDK 저장소
  ['expo-build-properties', { android: { extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'] } }],
];
if (KAKAO_NATIVE_APP_KEY) {
  socialPlugins.push(['@react-native-seoul/kakao-login', { kakaoAppKey: KAKAO_NATIVE_APP_KEY }]);
}
if (GOOGLE_IOS_URL_SCHEME) {
  socialPlugins.push(['@react-native-google-signin/google-signin', { iosUrlScheme: GOOGLE_IOS_URL_SCHEME }]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'frontend',
  slug: config.slug ?? 'frontend',
  plugins: [...(config.plugins ?? []), ...socialPlugins],
});
