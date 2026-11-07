import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useApi } from '@/shared/hooks/useApi';

import { getStones } from '../api';

// 돌탑에 쌓은 돌의 기록을 오래된 날부터 차례로 보여줍니다. (TOWER-03 30일 회고, 스크롤은 감싸는 화면이 맡습니다)
export function StoneLogList({ wishId }: { wishId: number }) {
  const fetchStones = useCallback(() => getStones(wishId), [wishId]);
  const { data, error, reload } = useApi(fetchStones);

  return (
    <View className="gap-2">
      <Text className="font-semibold text-gray-900">매일의 기록</Text>
      {data ? (
        data.length > 0 ? (
          data.map((stone) => (
            <View key={stone.stoneId} className="gap-1 rounded-2xl bg-gray-100 px-4 py-3">
              <Text className="text-xs text-gray-500">{stone.stoneDate.replaceAll('-', '.')}</Text>
              <Text className={stone.content ? 'text-base leading-6 text-gray-900' : 'text-gray-500'}>
                {stone.content ?? '글 없이 돌만 쌓은 날이에요'}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500">쌓은 돌이 없어요</Text>
        )
      ) : error ? (
        <Pressable onPress={reload} accessibilityRole="button">
          <Text className="text-gray-500">기록을 불러오지 못했어요. 눌러서 다시 시도</Text>
        </Pressable>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}
