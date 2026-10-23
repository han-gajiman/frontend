import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

type SubmitResult<T> = { ok: true; data: T } | { ok: false };

// 버튼으로 실행하는 요청(등록, 돌 쌓기 등)의 진행 중·에러 상태를 관리합니다.
// run()은 { ok, data }를 돌려주고, 실패하면 error에 담습니다. (204 응답도 ok: true)
export function useSubmit<A extends unknown[], T>(action: (...args: A) => Promise<T>) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError>();

  const run = useCallback(
    async (...args: A): Promise<SubmitResult<T>> => {
      setSubmitting(true);
      setError(undefined);
      try {
        return { ok: true, data: await action(...args) };
      } catch (e) {
        setError(e instanceof ApiError ? e : new ApiError('INTERNAL_ERROR', '잠시 후 다시 시도해 주세요.'));
        return { ok: false };
      } finally {
        setSubmitting(false);
      }
    },
    [action],
  );

  return { run, submitting, error };
}
