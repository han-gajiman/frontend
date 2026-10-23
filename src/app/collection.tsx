import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { getWishes } from '@/features/wish/api';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

const fetchCurrentRound = () => getWishes();

// TOWER-03 돌탑 모아보기: 현재 회차(첫 돌탑 시작일부터 1년)의 완성 돌탑, 최대 12개
// TODO(TOWER-03): 회차 선택, 돌탑 그림으로 보여주기
export default function CollectionScreen() {
  const state = useApi(fetchCurrentRound);

  return (
    <Screen title="돌탑 모아보기" showBack scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(wishes) => wishes.length === 0}
        empty={
          <EmptyState
            title="아직 완성한 돌탑이 없어요"
            description="30일 돌탑을 완성하면 여기에 모여요."
            actionLabel="홈으로"
            onAction={() => router.back()}
          />
        }>
        {(wishes) => (
          <View className="gap-3 px-6">
            <Text className="text-gray-500">올해 완성한 돌탑 {wishes.length} / 12</Text>
            {wishes.map((wish) => (
              <View key={wish.wishId} className="gap-1 rounded-2xl bg-gray-100 p-4">
                <Text className="text-xs text-gray-500">
                  {wish.startDate} · {wish.spotName}
                </Text>
                <Text className="text-lg font-bold text-gray-900">{wish.content}</Text>
                <Text className="text-gray-600">
                  돌 {wish.stoneCount}개 ·{' '}
                  {wish.result === 'ACHIEVED' ? '이루었어요' : wish.result === 'NOT_ACHIEVED' ? '아직이에요' : '회고 전'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}
