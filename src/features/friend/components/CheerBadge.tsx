import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, Text } from 'react-native';

import { useApi } from '@/shared/hooks/useApi';

import { getCheers } from '../api';

// 돌탑 옆 받은 응원 수. 안 읽은 응원 API가 없어 전체 개수를 보여줍니다.
// 보조 정보라 0개이거나 불러오는 중·에러면 그리지 않습니다. (목록과 에러는 내 돌탑 시트에서 확인)
export function CheerBadge({ wishId, onPress, style }: { wishId: number; onPress: () => void; style?: object }) {
  const fetchCheers = useCallback(() => getCheers(wishId), [wishId]);
  const { data, error } = useApi(fetchCheers);
  const count = data?.content.length ?? 0;

  if (error || count === 0) return null;

  const label = `${count}${data?.hasNext ? '+' : ''}`;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`받은 응원 ${label}개, 내 돌탑 열기`}
      className="flex-row items-center gap-1 rounded-full bg-white/85 px-2.5 py-1"
      style={style}>
      <Ionicons name="chatbubble-ellipses" size={13} color="#5b62e8" />
      <Text className="text-xs font-bold text-gray-800">{label}</Text>
    </Pressable>
  );
}
