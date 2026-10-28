import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { DEMO_ENABLED, timeTravel } from '@/features/demo/api';
import { createStone } from '@/features/stone/api';
import { StoneTower } from '@/features/stone/components/StoneTower';
import { getCurrentWish } from '@/features/wish/api';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { TextField } from '@/shared/components/TextField';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

// STONE-01 오늘의 돌 + STONE-02 돌탑 화면 (돌탑 그림은 features/stone/components/StoneTower)
export default function TowerScreen() {
  const state = useApi(getCurrentWish);

  return (
    <Screen title="나의 돌탑" showBack scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(wish) => wish === null}
        empty={
          <EmptyState title="진행 중인 돌탑이 없어요" actionLabel="홈으로" onAction={() => router.replace('/')} />
        }>
        {(wish) => <Tower key={wish!.wishId} wish={wish!} reload={state.reload} />}
      </AsyncContent>
    </Screen>
  );
}

function Tower({ wish, reload }: { wish: CurrentWish; reload: () => void }) {
  const [practice, setPractice] = useState('');
  const stone = useSubmit(createStone);
  const completed = wish.status === 'COMPLETED';

  const handleStone = async () => {
    const result = await stone.run(wish.wishId, practice.trim());
    if (result.ok) {
      setPractice('');
      reload();
    }
  };

  return (
    <View className="flex-1 px-6 pb-4">
      <View className="gap-1 pb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">
            {wish.spot.name} · {wish.dayIndex}일째 · 돌 {wish.stoneCount}/30
          </Text>
          <Pressable onPress={() => router.push('/cheers')} hitSlop={8}>
            <Text className="text-sm text-gray-500 underline">받은 응원</Text>
          </Pressable>
        </View>
        <Text className="text-xl font-bold text-gray-900">{wish.content}</Text>
      </View>

      <StoneTower
        count={wish.stoneCount}
        stonedToday={wish.stonedToday}
        completed={completed}
        backgroundImageUrl={wish.spot.visited ? wish.spot.backgroundImageUrl : null}
      />

      <View className="gap-3 pt-4">
        {completed ? (
          <Button label="완성 회고하기" onPress={() => router.push('/reflection')} />
        ) : wish.stonedToday ? (
          <Text className="py-4 text-center text-gray-500">오늘의 돌을 쌓았어요. 내일 또 만나요!</Text>
        ) : (
          <>
            <TextField
              label="오늘의 실천 기록 (선택)"
              value={practice}
              onChangeText={setPractice}
              placeholder={wish.actionGoal}
              maxLength={100}
            />
            <ErrorText error={stone.error} />
            <Button label="오늘의 돌 쌓기" onPress={handleStone} loading={stone.submitting} />
          </>
        )}

        {DEMO_ENABLED && <DemoTimeTravel onDone={reload} />}
      </View>
    </View>
  );
}

// DEMO-01 시간 가속 (EXPO_PUBLIC_DEMO=true일 때만 표시)
function DemoTimeTravel({ onDone }: { onDone: () => void }) {
  const { run, submitting, error } = useSubmit(timeTravel);

  const travel = async (days: number) => {
    const result = await run(days);
    if (result.ok) onDone();
  };

  return (
    <View className="gap-2 rounded-2xl border border-dashed border-gray-300 p-3">
      <Text className="text-center text-xs text-gray-400">시연용 시간 이동</Text>
      <ErrorText error={error} />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button label="+1일" variant="secondary" onPress={() => travel(1)} loading={submitting} />
        </View>
        <View className="flex-1">
          <Button label="+30일" variant="secondary" onPress={() => travel(30)} loading={submitting} />
        </View>
      </View>
    </View>
  );
}
