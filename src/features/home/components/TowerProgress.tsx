import { Text, View } from 'react-native';

import type { CurrentWish } from '@/features/wish/types';

import { towerTheme } from '../towerTheme';

const TOWER_DAYS = 30;

// 홈 상단 왼쪽 진행 정보: 명소 이름, 돌 N/30, N일째
export function TowerProgress({ wish }: { wish: CurrentWish }) {
  const theme = towerTheme(true); // 배경 위쪽은 언제나 어두운 하늘

  return (
    <View className="gap-1">
      <Text className={`text-sm ${theme.secondary}`}>
        {wish.spot.name}
        {wish.spot.visited ? ' · 방문함' : ' · 방문 전'}
      </Text>
      <View className="flex-row items-baseline gap-2">
        <Text className={`text-2xl font-bold ${theme.primary}`}>
          돌 {wish.stoneCount}/{TOWER_DAYS}
        </Text>
        <Text className={`text-sm ${theme.muted}`}>{wish.dayIndex}일째</Text>
      </View>
    </View>
  );
}
