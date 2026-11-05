import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { CurrentWish } from '@/features/wish/types';

import { towerTheme } from '../towerTheme';

const TOWER_DAYS = 30;

// 홈 상단 진행 정보: 명소 이름, 돌 N/30, N일째, 공개 상태 아이콘(누르면 내 돌탑 시트)
export function TowerProgress({
  wish,
  onOpenSheet,
}: {
  wish: CurrentWish;
  onOpenSheet: () => void;
}) {
  const theme = towerTheme(true); // 배경 위쪽은 언제나 어두운 하늘
  const isFriends = wish.visibility === 'FRIENDS';

  return (
    <View className="gap-1 px-6 pt-2">
      <Text className={`text-sm ${theme.secondary}`}>
        {wish.spot.name}
        {wish.spot.visited ? ' · 방문함' : ' · 방문 전'}
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-2">
          <Text className={`text-2xl font-bold ${theme.primary}`}>
            돌 {wish.stoneCount}/{TOWER_DAYS}
          </Text>
          <Text className={`text-sm ${theme.muted}`}>{wish.dayIndex}일째</Text>
        </View>
        <Pressable
          onPress={onOpenSheet}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`공개 범위: ${isFriends ? '친구 공개' : '나만 보기'}, 내 돌탑 열기`}>
          <Ionicons name={isFriends ? 'people-outline' : 'lock-closed-outline'} size={20} color={theme.icon} />
        </Pressable>
      </View>
    </View>
  );
}
