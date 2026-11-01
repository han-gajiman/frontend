import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEMO_ENABLED } from '@/features/demo/api';
import { DemoTimeTravel } from '@/features/demo/components/DemoTimeTravel';
import { FriendTowersPeek } from '@/features/friend/components/FriendTowersPeek';
import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { createStone } from '@/features/stone/api';
import { StoneTower } from '@/features/stone/components/StoneTower';
import { TodayStone } from '@/features/stone/components/TodayStone';
import { GROUND_HEIGHT, TowerBackground } from '@/features/stone/components/TowerBackground';
import { VisibilityToggle } from '@/features/wish/components/VisibilityToggle';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { HomeHeader } from './HomeHeader';

const TOWER_DAYS = 30;
type Rect = { x: number; y: number; width: number; height: number };

// HOME-01 홈 = 돌탑 화면 (STONE-01 오늘의 돌, STONE-02 돌탑, WISH-04 공개 범위, DEMO-01 시간 이동)
// 오늘 쌓았는지·30일이 지났는지·저녁 하늘은 모두 서버 응답(stonedToday, status) 기준입니다. 클라이언트 시계 사용 금지.
export function TowerHome({ wish, reload }: { wish: CurrentWish; reload: () => void }) {
  const completed = wish.status === 'COMPLETED';
  const evening = wish.stonedToday && !completed;
  const canStack = !completed && !wish.stonedToday;

  const [practice, setPractice] = useState('');
  // 쌓기 성공 직후 새로 불러오기 전까지 오늘의 돌을 숨깁니다. (쌓은 시점의 돌 개수로 기억해서, 다음 날이 되면 다시 보임)
  const [stackedAt, setStackedAt] = useState<number | null>(null);
  const stone = useSubmit(createStone);

  // 배경의 땅이 탑 바닥부터 화면 끝까지 이어지도록 높이를 계산합니다.
  const insets = useSafeAreaInsets();
  const [screenHeight, setScreenHeight] = useState(0);
  const [towerBottom, setTowerBottom] = useState(0);
  const groundHeight = towerBottom > 0 ? Math.max(GROUND_HEIGHT, screenHeight - towerBottom + GROUND_HEIGHT) : GROUND_HEIGHT;

  // 오늘의 돌을 놓을 자리 = 탑 영역. 드래그를 시작할 때마다 화면 좌표를 다시 잽니다.
  const towerRef = useRef<ComponentRef<typeof View>>(null);
  const towerRect = useRef<Rect | null>(null);
  const measureTower = () =>
    towerRef.current?.measureInWindow((x, y, width, height) => {
      towerRect.current = { x, y, width, height };
    });
  const isOverTower = (pageX: number, pageY: number) => {
    const r = towerRect.current;
    return !!r && pageX >= r.x && pageX <= r.x + r.width && pageY >= r.y && pageY <= r.y + r.height;
  };

  const handleDrop = async () => {
    const result = await stone.run(wish.wishId, practice.trim());
    if (!result.ok) return false;
    setStackedAt(wish.stoneCount);
    setPractice('');
    reload();
    return true;
  };

  return (
    <View className="flex-1" onLayout={(e) => setScreenHeight(e.nativeEvent.layout.height)}>
      <TowerBackground
        spotId={wish.spot.id}
        imageUrl={wish.spot.backgroundImageUrl}
        visited={wish.spot.visited}
        evening={evening}
        groundHeight={groundHeight}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <HomeHeader light={evening} />

          <View className="gap-1 px-6 pt-2">
            <Text className={`text-sm ${evening ? 'text-white/80' : 'text-gray-600'}`}>
              {wish.spot.name}
              {!wish.spot.visited && ' · 방문 전'}
            </Text>
            <View className="flex-row items-baseline gap-2">
              <Text className={`text-2xl font-bold ${evening ? 'text-white' : 'text-gray-900'}`}>
                돌 {wish.stoneCount}/{TOWER_DAYS}
              </Text>
              <Text className={`text-sm ${evening ? 'text-white/70' : 'text-gray-500'}`}>{wish.dayIndex}일째</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <VisibilityToggle wish={wish} onChanged={reload} light={evening} />
              <Pressable onPress={() => router.push('/cheers')} hitSlop={8}>
                <Text className={`text-sm underline ${evening ? 'text-white/80' : 'text-gray-600'}`}>받은 응원</Text>
              </Pressable>
            </View>
          </View>

          <View
            ref={towerRef}
            className="flex-1"
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              setTowerBottom(insets.top + y + height);
              measureTower();
            }}>
            <StoneTower
              count={wish.stoneCount}
              stonedToday={wish.stonedToday}
              completed={completed}
              inscription={wish.content}
            />
            <FriendTowersPeek bottom={GROUND_HEIGHT - 14} />
          </View>

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
                    disabled={!canStack || stone.submitting}
                    isOverTower={isOverTower}
                    onDragStart={measureTower}
                    onDrop={handleDrop}
                  />
                )}
              </>
            )}

            {DEMO_ENABLED && (
              <DemoTimeTravel onDone={reload} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
