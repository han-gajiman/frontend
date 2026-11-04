import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getMe } from '@/features/user/api';
import { getWishes } from '@/features/wish/api';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// TOWER-03 돌탑 모아보기: 회차(첫 돌탑 시작일부터 1년 = 1회차)별 완성 돌탑, 최대 12개
// ?round=N으로 열면 그 회차부터 보여줍니다 (1년 회고 알림에서 이동).
// TODO(디자인): 돌탑 그림으로 보여주기
export default function CollectionScreen() {
  const { round } = useLocalSearchParams<{ round?: string }>();
  const me = useApi(getMe);

  return (
    <Screen title="돌탑 모아보기" scroll={false}>
      <AsyncContent state={me}>
        {(user) => {
          const currentRound = user.journey?.currentRound ?? 1;
          const requested = Number(round);
          const initialRound = requested >= 1 && requested <= currentRound ? requested : currentRound;
          // 탭은 계속 떠 있으므로, 알림으로 다른 회차를 열면 key로 새로 그려 그 회차를 보여줍니다.
          return <RoundCollection key={initialRound} currentRound={currentRound} initialRound={initialRound} />;
        }}
      </AsyncContent>
    </Screen>
  );
}

function RoundCollection({ currentRound, initialRound }: { currentRound: number; initialRound: number }) {
  const [selected, setSelected] = useState(initialRound);
  const fetchRound = useCallback(() => getWishes(selected), [selected]);
  const state = useApi(fetchRound);
  const rounds = Array.from({ length: currentRound }, (_, i) => i + 1);

  return (
    <View className="flex-1 gap-3">
      {currentRound > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-6">
          {rounds.map((r) => (
            <Pressable
              key={r}
              onPress={() => setSelected(r)}
              accessibilityRole="tab"
              accessibilityState={{ selected: r === selected }}
              className={`rounded-full px-4 py-2 ${r === selected ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <Text className={r === selected ? 'font-semibold text-white' : 'text-gray-700'}>{r}회차</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <AsyncContent
        state={state}
        isEmpty={(wishes) => wishes.length === 0}
        empty={
          <EmptyState
            title={`${selected}회차에 완성한 돌탑이 없어요`}
            description="30일 돌탑을 완성하면 여기에 모여요."
            actionLabel="홈으로"
            onAction={() => router.navigate('/')}
          />
        }>
        {(wishes) => (
          <View className="gap-3 px-6">
            <Text className="text-gray-500">
              {selected}회차에 완성한 돌탑 {wishes.length} / 12
            </Text>
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
    </View>
  );
}
