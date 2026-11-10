import { router } from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, type TextInputInstance, View } from 'react-native';

import { TIME_TRAVEL_ENABLED } from '@/features/demo/api';
import { DemoTimeTravel } from '@/features/demo/components/DemoTimeTravel';
import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { getTodayTodos } from '@/features/plan/api';
import type { PlanTodo } from '@/features/plan/types';
import { createStone } from '@/features/stone/api';
import { TodayStone } from '@/features/stone/components/TodayStone';
import { getMe } from '@/features/user/api';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

const PRACTICE_MAX_LENGTH = 100;
const LIST_ROW_HEIGHT = 44;
const LIST_VISIBLE_ROWS = 2;

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
  // PLAN-02 소원 캘린더에 적어 둔 오늘 할 일. 기록 칸을 누르면 아래로 펼쳐지고, 하나 고르면 기록에 붙고 닫힙니다.
  // 쌓을 때 기록에 남아 있는 할 일은 완료 체크
  const todayTodos = useApi(getTodayTodos);
  // 실서비스: 서버가 허락한 시연 계정만 시간 이동 버튼 (DEMO-01)
  const me = useApi(getMe);
  const canTimeTravel = !TIME_TRAVEL_ENABLED && me.data?.canTimeTravel === true;
  const [pickedTodos, setPickedTodos] = useState<PlanTodo[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const inputRef = useRef<TextInputInstance>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pressingList = useRef(false); // 목록을 누르는 중이면 입력칸 포커스가 빠져도 닫지 않음
  const choices = (todayTodos.data ?? []).filter((t) => !t.done); // 고른 할 일도 목록에 그대로 (✓ 표시)
  const isPicked = (todo: PlanTodo) => pickedTodos.some((p) => p.todoId === todo.todoId);

  // 누르면 기록 칸에 붙이고, 이미 붙인 할 일을 다시 누르면 뺍니다. 목록은 열린 채로 둡니다.
  const pickTodo = (todo: PlanTodo) => {
    if (isPicked(todo)) {
      setPickedTodos(pickedTodos.filter((p) => p.todoId !== todo.todoId));
      setPractice(
        practice
          .split(', ')
          .filter((part) => part !== todo.content)
          .join(', '),
      );
    } else {
      const next = practice.trim() ? `${practice.trim()}, ${todo.content}` : todo.content;
      if (next.length <= PRACTICE_MAX_LENGTH) {
        // 100자를 넘으면 붙이지 않음
        setPickedTodos([...pickedTodos, todo]);
        setPractice(next);
      }
    }
    inputRef.current?.focus(); // 이어서 쓰거나 더 고를 수 있게
  };

  // 입력칸 바깥을 누르면 닫음. 목록을 누를 때는 (웹은 누르기 전에 blur가 와서) 닫지 않습니다.
  const handleBlur = () => {
    closeTimer.current = setTimeout(() => {
      if (pressingList.current) {
        pressingList.current = false;
        return;
      }
      setListOpen(false);
    }, 150);
  };
  const handleFocus = () => {
    clearTimeout(closeTimer.current);
    pressingList.current = false; // 목록을 누른 뒤 다시 포커스가 오면 표시를 지워서, 다음 바깥 누름에는 닫히게
    setListOpen(true);
  };
  const tabBarHeight = useBottomTabBarHeight(); // 떠 있는 탭 바에 가리지 않게

  const handleDrop = async () => {
    // 고른 뒤 기록에서 지운 할 일은 완료로 치지 않음
    const doneIds = pickedTodos.filter((t) => practice.includes(t.content)).map((t) => t.todoId);
    const result = await stone.run(wish.wishId, practice.trim(), doneIds);
    if (!result.ok) return false;
    setStackedAt(wish.stoneCount);
    setPractice('');
    setPickedTodos([]);
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
          {/* 목록은 입력칸 바로 위(돌탑 쪽)에 겹쳐 띄워서, 열려도 입력칸이 밀리지 않고 탭 바와도 안 겹치게 */}
          <View style={{ zIndex: 10 }}>
            <TextInput
              ref={inputRef}
              value={practice}
              onChangeText={setPractice}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="오늘 하루는 어땠나요?"
              placeholderTextColor="#78716c"
              maxLength={PRACTICE_MAX_LENGTH}
              accessibilityLabel="오늘의 실천 기록 (선택)"
              className="h-11 rounded-xl bg-white/70 px-4 text-base text-gray-900"
            />
            {listOpen && choices.length > 0 && (
              <View
                className="overflow-hidden rounded-xl bg-white/95"
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: 6,
                  elevation: 6,
                }}>
                <Text className="px-4 pb-1 pt-2.5 text-xs font-semibold text-gray-500">
                  캘린더에 적어 둔 오늘 할 일
                  {choices.length > LIST_VISIBLE_ROWS ? ` ${choices.length}개 · 밀어서 더 보기` : ''}
                </Text>
                {/* 두 줄 높이까지만 보이고 나머지는 스크롤 (할 일이 많아도 돌탑 쪽으로 밀려 올라가지 않게) */}
                <ScrollView
                  style={{ maxHeight: LIST_ROW_HEIGHT * LIST_VISIBLE_ROWS }}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator>
                  {choices.map((todo, i) => (
                    <Pressable
                      key={todo.todoId}
                      onPressIn={() => {
                        pressingList.current = true;
                      }}
                      onPress={() => pickTodo(todo)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isPicked(todo) }}
                      accessibilityLabel={`오늘 할 일: ${todo.content}`}
                      style={{ height: LIST_ROW_HEIGHT }}
                      className={`flex-row items-center gap-2 px-4 active:bg-gray-100 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                      <Text className={isPicked(todo) ? 'font-bold text-violet-600' : 'text-gray-400'}>
                        {isPicked(todo) ? '✓' : '+'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`flex-1 text-[15px] ${isPicked(todo) ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                        {todo.content}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
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

      {(TIME_TRAVEL_ENABLED || canTimeTravel) && <DemoTimeTravel onDone={reload} withReset={canTimeTravel} />}
    </View>
  );
}
