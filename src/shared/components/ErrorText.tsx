import { Text } from 'react-native';

import type { ApiError } from '@/api/client';

// 버튼 요청 실패 시 버튼 위에 보여주는 문구
export function ErrorText({ error }: { error?: ApiError }) {
  if (!error) return null;
  return <Text className="text-center text-red-500">{error.message}</Text>;
}
