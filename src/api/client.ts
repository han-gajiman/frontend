// 백엔드 공통 응답 형식(docs/API명세서.md)에 맞춘 API 클라이언트.
// Access Token이 만료되면(401 AUTH_INVALID_TOKEN) Refresh Token으로 재발급받아 한 번 다시 보냅니다(AUTH-03).

import { useAuthStore } from '@/features/auth/store';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  hasNext: boolean;
};

// code: 서버 에러 코드(STONE_ALREADY_TODAY 등) 또는 NETWORK_ERROR
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function send<T>(path: string, options: RequestOptions, accessToken: string | null): Promise<T> {
  const { method = 'GET', body } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('NETWORK_ERROR', '인터넷 연결을 확인해 주세요.');
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new ApiError('INVALID_RESPONSE', '잠시 후 다시 시도해 주세요.', response.status);
  }

  if (!response.ok || !envelope.success) {
    const error = envelope.error ?? { code: 'INTERNAL_ERROR', message: '잠시 후 다시 시도해 주세요.' };
    throw new ApiError(error.code, error.message, response.status);
  }

  return envelope.data;
}

// 동시에 여러 요청이 만료돼도 재발급은 한 번만 합니다.
let refreshing: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const { refreshToken, updateTokens, signOut } = useAuthStore.getState();
  if (!refreshToken) throw new ApiError('AUTH_INVALID_REFRESH_TOKEN', '다시 로그인해 주세요.', 401);

  try {
    const tokens = await send<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { method: 'POST', body: { refreshToken } },
      null,
    );
    updateTokens(tokens);
  } catch (e) {
    // 인터넷 문제가 아니라 Refresh Token 자체가 무효·만료면 로그아웃 → 로그인 화면으로
    if (!(e instanceof ApiError) || e.code !== 'NETWORK_ERROR') signOut();
    throw e;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, options, useAuthStore.getState().accessToken);
  } catch (e) {
    const canRefresh =
      e instanceof ApiError &&
      e.code === 'AUTH_INVALID_TOKEN' &&
      !path.startsWith('/auth/') &&
      useAuthStore.getState().refreshToken !== null;
    if (!canRefresh) throw e;

    refreshing ??= refreshTokens().finally(() => {
      refreshing = null;
    });
    await refreshing;
    return send<T>(path, options, useAuthStore.getState().accessToken);
  }
}
