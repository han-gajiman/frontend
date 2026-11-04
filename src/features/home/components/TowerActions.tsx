import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { DEMO_ENABLED } from '@/features/demo/api';
import { DemoTimeTravel } from '@/features/demo/components/DemoTimeTravel';
import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { createStone } from '@/features/stone/api';
import { TodayStone } from '@/features/stone/components/TodayStone';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

type TowerActionsProps = {
  wish: CurrentWish;
  reload: () => void;
  isOverTower: (pageX: number, pageY: number) => boolean;
  onDragStart: () => void;
};

// 홈 하단: 쌓기 전(실천 기록 + 오늘의 돌) / 오늘 완료 / 30일 완성(회고로) + 시연 버튼
// 상태는 모두 서버 응답(stonedToday, status) 기준입니다. 클라이언트 시계 사용 금지.
export function TowerActions({ wish, reload, isOverTower, onDragStart }: TowerActionsProps) {
  const completed = wish.status === 'COMPLETED';
  const [practice, setPractice] = useState('');
  // 쌓기 성공 직후 새로 불러오기 전까지 오늘의 돌을 숨깁니다. (쌓은 시점의 돌 개수로 기억해서, 다음 날이 되면 다시 보임)
  const [stackedAt, setStackedAt] = useState<number | null>(null);
  const stone = useSubmit(createStone);

  const handleDrop = async () => {
    const result = await stone.run(wish.wishId, practice.trim());
    if (!result.ok) return false;
    setStackedAt(wish.stoneCount);
    setPractice('');
    reload();
    return true;
  };

  return (
    <View className="gap-3 px-6 pb-4">
      {completed ? (
        <Button label="완성 회고하기" onPress={() => router.push('/reflection')} />
      ) : wish.stonedToday ? (
        <View className="items-center gap-1 py-4">
          <Text style={{ fontFamily: TITLE_FONT }} className="text-xl text-white">
            오늘도 한 가지 했어요
          </Text>
          <Text className="text-sm text-white/70">내일 또 한 개 쌓아요</Text>
        </View>
      ) : (
        <>
          <TextInput
            value={practice}
            onChangeText={setPractice}
            placeholder={`오늘 한 일 (선택) · ${wish.actionGoal}`}
            placeholderTextColor="#78716c"
            maxLength={100}
            accessibilityLabel="오늘의 실천 기록 (선택)"
            className="h-11 rounded-xl bg-white/70 px-4 text-base text-gray-900"
          />
          <ErrorText error={stone.error} />
          {stackedAt !== wish.stoneCount && (
            <TodayStone
              index={wish.stoneCount}
              disabled={stone.submitting}
              isOverTower={isOverTower}
              onDragStart={onDragStart}
              onDrop={handleDrop}
            />
          )}
        </>
      )}

      {DEMO_ENABLED && <DemoTimeTravel onDone={reload} />}
    </View>
  );
}
