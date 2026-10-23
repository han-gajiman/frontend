import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { ApiState } from '@/shared/hooks/useApi';

// 모든 화면에 필요한 공통 상태: 로딩 / 에러 / 오프라인 / 빈 상태

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" />
    </View>
  );
}

type ErrorStateProps = {
  code?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ code, message, onRetry }: ErrorStateProps) {
  const offline = code === 'NETWORK_ERROR';

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white px-8">
      <Text className="text-lg font-bold text-gray-900">
        {offline ? '인터넷에 연결되어 있지 않아요' : '문제가 생겼어요'}
      </Text>
      <Text className="text-center text-gray-500">
        {offline ? '연결을 확인한 뒤 다시 시도해 주세요.' : (message ?? '잠시 후 다시 시도해 주세요.')}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} className="mt-2 rounded-xl bg-gray-900 px-5 py-3">
          <Text className="font-semibold text-white">다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white px-8">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      {description && <Text className="text-center text-gray-500">{description}</Text>}
      {actionLabel && onAction && (
        <Pressable onPress={onAction} className="mt-2 rounded-xl bg-gray-900 px-5 py-3">
          <Text className="font-semibold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

type AsyncContentProps<T> = {
  state: ApiState<T>;
  // 빈 상태 판단 (예: data === null, data.length === 0)
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

// useApi 결과를 받아 상태에 맞는 화면을 그립니다.
export function AsyncContent<T>({ state, isEmpty, empty, children }: AsyncContentProps<T>) {
  const { data, error, loading, reload } = state;

  if (loading && data === undefined) return <LoadingState />;
  if (error) return <ErrorState code={error.code} message={error.message} onRetry={reload} />;
  if (data === undefined) return <LoadingState />;
  if (isEmpty?.(data)) return <>{empty}</>;
  return <>{children(data)}</>;
}
