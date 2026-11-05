import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getMe } from '@/features/user/api';
import { getWishes } from '@/features/wish/api';
import { TowerPager } from '@/features/wish/components/TowerPager';
import type { WishSummary } from '@/features/wish/types';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// TOWER-03 돌탑 모아보기: 회차(첫 돌탑 시작일부터 1년 = 1회차)별 완성 돌탑, 최대 12개
// ?round=N으로 열면 그 회차부터 보여줍니다 (1년 회고 알림에서 이동).
// 가장 최근에 끝난 돌탑부터 한 장씩 넘겨 봅니다.
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

const newestFirst = (wishes: WishSummary[]) => [...wishes].sort((a, b) => b.startDate.localeCompare(a.startDate));

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
          <View className="flex-1 gap-3">
            <Text className="px-6 text-gray-500">
              {selected}회차에 완성한 돌탑 {wishes.length} / 12
            </Text>
            <TowerPager wishes={newestFirst(wishes)} />
          </View>
        )}
      </AsyncContent>
    </View>
  );
}
