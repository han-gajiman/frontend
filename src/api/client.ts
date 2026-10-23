// 백엔드 공통 응답 형식(docs/API명세서.md)에 맞춘 API 클라이언트.
// 토큰 자동 재발급(AUTH-03)은 로그인 구현 때 추가합니다.

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
  accessToken?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken } = options;

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
