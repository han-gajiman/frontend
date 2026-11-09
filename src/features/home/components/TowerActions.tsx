import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { DEMO_ENABLED } from '@/features/demo/api';
import { DemoTimeTravel } from '@/features/demo/components/DemoTimeTravel';
import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { getTodayTodos } from '@/features/plan/api';
import type { PlanTodo } from '@/features/plan/types';
import { createStone } from '@/features/stone/api';
import { TodayStone } from '@/features/stone/components/TodayStone';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

const PRACTICE_MAX_LENGTH = 100;

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
  // PLAN-02 소원 캘린더에 적어 둔 오늘 할 일. 누르면 기록에 붙고, 쌓으면 완료 체크
  const todayTodos = useApi(getTodayTodos);
  const [pickedTodoIds, setPickedTodoIds] = useState<number[]>([]);
  const openTodos = (todayTodos.data ?? []).filter((t) => !t.done);

  const toggleTodo = (todo: PlanTodo) => {
    if (pickedTodoIds.includes(todo.todoId)) {
      setPickedTodoIds(pickedTodoIds.filter((id) => id !== todo.todoId));
      setPractice(removePiece(practice, todo.content));
      return;
    }
    const next = practice.trim() ? `${practice.trim()}, ${todo.content}` : todo.content;
    if (next.length > PRACTICE_MAX_LENGTH) return; // 100자를 넘으면 붙이지 않음
    setPickedTodoIds([...pickedTodoIds, todo.todoId]);
    setPractice(next);
  };
  const tabBarHeight = useBottomTabBarHeight(); // 떠 있는 탭 바에 가리지 않게

  const handleDrop = async () => {
    const result = await stone.run(wish.wishId, practice.trim(), pickedTodoIds);
    if (!result.ok) return false;
    setStackedAt(wish.stoneCount);
    setPractice('');
    setPickedTodoIds([]);
    todayTodos.reload();
    reload();
    return true;
  };

  return (
    <View className="gap-3 px-6 pt-3" style={{ paddingBottom: tabBarHeight + 8 }}>
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
            placeholder="오늘 하루는 어땠나요?"
            placeholderTextColor="#78716c"
            maxLength={PRACTICE_MAX_LENGTH}
            accessibilityLabel="오늘의 실천 기록 (선택)"
            className="h-11 rounded-xl bg-white/70 px-4 text-base text-gray-900"
          />
          {openTodos.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5">
              {openTodos.map((todo) => {
                const picked = pickedTodoIds.includes(todo.todoId);
                return (
                  <Pressable
                    key={todo.todoId}
                    onPress={() => toggleTodo(todo)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: picked }}
                    accessibilityLabel={`오늘 할 일: ${todo.content}`}
                    className={`rounded-full px-3 py-1.5 ${picked ? 'bg-white' : 'bg-white/35'}`}>
                    <Text className={`text-[13px] ${picked ? 'font-semibold text-gray-900' : 'text-white'}`}>
                      {picked ? '✓ ' : '+ '}
                      {todo.content}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
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

// 기록에서 붙였던 할 일 문구를 뺍니다 (", "로 이어 붙인 조각 단위)
function removePiece(text: string, piece: string): string {
  return text
    .split(', ')
    .filter((part) => part !== piece)
    .join(', ');
}
