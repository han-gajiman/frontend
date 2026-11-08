import { Platform } from 'react-native';

import { apiRequest, ApiError } from '@/api/client';

// 웹 소셜 로그인 (AUTH-01). 웹에는 카카오·Google 네이티브 SDK가 없어서 로그인 화면으로 이동했다가 /login으로 돌아옵니다.
// - 카카오: 서버가 준 로그인 주소로 이동 → /login?code=...&state=... → 서버가 코드를 토큰으로 바꿔 로그인
// - Google: Google 로그인으로 이동 → /login#id_token=...&state=... → 기존 POST /auth/google
// 돌아온 요청이 우리가 보낸 것인지 state(와 Google은 nonce)로 확인합니다. 둘 다 이 탭의 sessionStorage에만 둡니다.

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const PENDING_KEY = 'hangajiman.socialLogin';

type Provider = 'KAKAO' | 'GOOGLE';
type Pending = { provider: Provider; state: string; nonce?: string };

export type WebSocialRedirect =
  | { provider: 'KAKAO'; code: string; redirectUri: string }
  | { provider: 'GOOGLE'; idToken: string }
  | { cancelled: true }
  | { error: string };

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

// 앱이 뜨자마자 주소를 기억해 둡니다. (로그인 여부에 따라 화면이 바뀌면서 주소의 code·id_token이 사라질 수 있어서)
const initialLocation = isWeb ? { search: window.location.search, hash: window.location.hash } : null;
// 로그인 화면이 여러 번 그려져도(개발 모드 등) 같은 결과를 돌려주고, 한 번 처리하면 비웁니다.
let redirectResult: WebSocialRedirect | null | undefined;

// 카카오·Google에서 막 돌아온 페이지인지 (인트로를 건너뛰고 바로 로그인 화면을 띄우는 데 씀)
export const returnedFromSocialLogin =
  !!initialLocation && /[?&#]state=/.test(initialLocation.search + initialLocation.hash);

const redirectUri = () => `${window.location.origin}/login`;

const randomString = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

function savePending(pending: Pending) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    throw new ApiError('SOCIAL_LOGIN_FAILED', '브라우저 저장소를 쓸 수 없어 로그인할 수 없어요. 시크릿 창이 아니라면 다시 시도해 주세요.');
  }
}

function takePending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Pending) : null;
  } catch {
    return null;
  }
}

// 카카오 로그인 화면으로 이동합니다. 페이지를 떠나므로 돌아오지 않습니다.
export async function startKakaoWebLogin(): Promise<never> {
  const state = randomString();
  const query = `redirectUri=${encodeURIComponent(redirectUri())}&state=${state}`;
  const { url } = await apiRequest<{ url: string }>(`/auth/kakao/web/authorize-url?${query}`);
  savePending({ provider: 'KAKAO', state });
  window.location.assign(url);
  return new Promise<never>(() => {}); // 이동하는 동안 버튼은 계속 로딩
}

// Google 로그인 화면으로 이동합니다. ID 토큰을 주소 # 뒤로 돌려받습니다.
export function startGoogleWebLogin(): Promise<never> {
  if (!GOOGLE_WEB_CLIENT_ID) throw new ApiError('SOCIAL_LOGIN_UNAVAILABLE', 'Google 로그인 키가 설정되지 않았어요.');
  const state = randomString();
  const nonce = randomString();
  savePending({ provider: 'GOOGLE', state, nonce });
  const params = new URLSearchParams({
    client_id: GOOGLE_WEB_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    state,
    prompt: 'select_account',
  });
  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  return new Promise<never>(() => {});
}

// ID 토큰 안의 nonce (서명 검증은 서버가 Google에 맡기고, 여기서는 우리가 보낸 요청인지만 확인)
function nonceOf(idToken: string): string | undefined {
  try {
    const payload = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='))).nonce;
  } catch {
    return undefined;
  }
}

const FAILED = '소셜 로그인에 실패했어요. 다시 시도해 주세요.';

// 카카오·Google에서 돌아온 결과. 돌아온 게 아니거나 이미 처리했으면 null
export function takeWebSocialRedirect(): WebSocialRedirect | null {
  if (redirectResult === undefined) redirectResult = readRedirect();
  return redirectResult;
}

// 결과를 처리했으면 비웁니다. (카카오 인가 코드는 한 번만 쓸 수 있음)
export function clearWebSocialRedirect() {
  redirectResult = null;
}

function readRedirect(): WebSocialRedirect | null {
  if (!initialLocation) return null;
  const query = new URLSearchParams(initialLocation.search);
  const hash = new URLSearchParams(initialLocation.hash.replace(/^#/, ''));
  const state = query.get('state') ?? hash.get('state');
  if (!state) return null;

  // 주소에 남은 코드·토큰은 바로 지웁니다 (새로고침·공유 방지)
  window.history.replaceState(null, '', window.location.pathname);
  const pending = takePending();
  if (!pending || pending.state !== state) return { error: FAILED };

  const error = query.get('error') ?? hash.get('error');
  if (error) return error === 'access_denied' ? { cancelled: true } : { error: FAILED };

  if (pending.provider === 'KAKAO') {
    const code = query.get('code');
    return code ? { provider: 'KAKAO', code, redirectUri: redirectUri() } : { error: FAILED };
  }
  const idToken = hash.get('id_token');
  if (!idToken || nonceOf(idToken) !== pending.nonce) return { error: FAILED };
  return { provider: 'GOOGLE', idToken };
}
