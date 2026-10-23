import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/api/client';

export type ApiState<T> = {
  data: T | undefined;
  error: ApiError | undefined;
  loading: boolean;
  reload: () => void;
};

type Result<T> = Omit<ApiState<T>, 'reload'>;

// 화면 진입 시 API를 호출하고 로딩·에러·데이터 상태를 돌려줍니다.
// 다른 화면에 갔다가 돌아오면 다시 불러옵니다. (예: 돌을 쌓고 홈으로 돌아올 때)
// fetcher는 컴포넌트 밖에 선언하거나 useCallback으로 감싸세요. (바뀔 때마다 다시 호출됨)
export function useApi<T>(fetcher: () => Promise<T>): ApiState<T> {
  const [result, setResult] = useState<Result<T>>({ data: undefined, error: undefined, loading: true });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // 화면을 떠난 뒤 도착한 응답은 무시
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setResult({ data, error: undefined, loading: false });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const error = e instanceof ApiError ? e : new ApiError('INTERNAL_ERROR', '잠시 후 다시 시도해 주세요.');
        setResult((prev) => ({ data: prev.data, error, loading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadKey]);

  const reload = useCallback(() => {
    setResult((prev) => ({ ...prev, error: undefined, loading: true }));
    setReloadKey((key) => key + 1);
  }, []);

  // 첫 진입은 위 useEffect가 불러오므로, 다시 돌아왔을 때만 reload
  const visited = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (visited.current) reload();
      visited.current = true;
    }, [reload]),
  );

  return { ...result, reload };
}
