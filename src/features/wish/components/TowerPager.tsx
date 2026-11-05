import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { type GestureResponderEvent, Platform, Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { StoneTower } from '@/features/stone/components/StoneTower';

import { crownOf, FULL_STONES, RESULT_LABEL } from '../towerLabels';
import type { WishSummary } from '../types';

import { TowerReflectionDialog } from './TowerReflectionDialog';

const SWIPE_DISTANCE = 50; // 이만큼 밀면 다음 돌탑으로
const TAP_SLOP = 8; // 이보다 많이 움직이면 누른 것이 아니라 민 것
const AFTER_SWIPE_MS = 300; // 웹은 밀고 손을 떼도 누름(click)이 따라오므로 잠시 무시합니다.
const MOVE = { duration: 280, easing: Easing.out(Easing.cubic) };

// TOWER-03 완성한 돌탑을 한 장씩 넘겨 봅니다. 왼쪽으로 밀면 다음 돌탑으로 갑니다. 돌탑을 누르면 30일 회고가 뜹니다.
// 웹의 마우스 끌기와 폰의 손가락 밀기가 똑같이 동작하도록 기본 터치 이벤트로 만듭니다. 화살표로도 넘길 수 있습니다.
export function TowerPager({ wishes, initialIndex }: { wishes: WishSummary[]; initialIndex: number }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(initialIndex);
  const [reflectionOf, setReflectionOf] = useState<WishSummary | null>(null);
  const x = useSharedValue(0);
  const startX = useRef(0);
  const swipedAt = useRef(0);
  const last = wishes.length - 1;
  const current = Math.min(index, last); // 다시 불러와 개수가 줄어도 범위 안에

  const goTo = (next: number) => {
    setIndex(next);
    x.set(withTiming(-next * width, MOVE));
  };

  const handleMove = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - startX.current;
    const atEdge = (current === 0 && dx > 0) || (current === last && dx < 0);
    x.set(-current * width + (atEdge ? dx * 0.3 : dx)); // 끝에서는 조금만 밀림
  };
  const handleRelease = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - startX.current;
    if (Math.abs(dx) > TAP_SLOP) swipedAt.current = Date.now();
    if (dx <= -SWIPE_DISTANCE && current < last) goTo(current + 1);
    else if (dx >= SWIPE_DISTANCE && current > 0) goTo(current - 1);
    else goTo(current);
  };

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View className="flex-1 gap-3">
      <View
        className="flex-1 overflow-hidden"
        onLayout={(e) => {
          const nextWidth = e.nativeEvent.layout.width;
          setWidth(nextWidth);
          x.set(-current * nextWidth);
        }}>
        <Animated.View
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={(e) => {
            startX.current = e.nativeEvent.pageX;
          }}
          onResponderMove={handleMove}
          onResponderRelease={handleRelease}
          onResponderTerminate={() => goTo(current)}
          style={[
            { flex: 1 },
            Platform.OS === 'web' && ({ cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' } as object),
            rowStyle,
          ]}>
          {width > 0 &&
            wishes.map((wish, i) =>
              // 지금 보는 돌탑과 양옆만 그립니다.
              Math.abs(i - current) <= 1 ? (
                <View
                  key={wish.wishId}
                  style={{ position: 'absolute', top: 0, bottom: 0, left: i * width, width }}
                  className="px-6"
                  accessibilityElementsHidden={i !== current}
                  importantForAccessibility={i === current ? 'auto' : 'no-hide-descendants'}>
                  <TowerCard
                    wish={wish}
                    onOpenReflection={() => {
                      if (Date.now() - swipedAt.current > AFTER_SWIPE_MS) setReflectionOf(wish);
                    }}
                  />
                </View>
              ) : null,
            )}
        </Animated.View>
      </View>

      <View className="flex-row items-center justify-center gap-4 pb-3">
        <ArrowButton
          icon="chevron-back"
          label="이전 돌탑"
          disabled={current === 0}
          onPress={() => goTo(current - 1)}
        />
        <Text className="min-w-16 text-center text-gray-600">
          {current + 1} / {wishes.length}
        </Text>
        <ArrowButton
          icon="chevron-forward"
          label="다음 돌탑"
          disabled={current === last}
          onPress={() => goTo(current + 1)}
        />
      </View>

      {reflectionOf && <TowerReflectionDialog wish={reflectionOf} onClose={() => setReflectionOf(null)} />}
    </View>
  );
}

function TowerCard({ wish, onOpenReflection }: { wish: WishSummary; onOpenReflection: () => void }) {
  return (
    <View className="flex-1 gap-3">
      <View className="flex-1">
        <StoneTower
          count={wish.stoneCount}
          stonedToday={false}
          completed={false}
          crown={crownOf(wish)}
          inscription={wish.content}
          background={{ spotId: wish.spotId, visited: wish.visited }}
          onPress={onOpenReflection}
          pressLabel="30일 회고 보기"
        />
      </View>
      <View className="items-center gap-1">
        <Text className="text-xs text-gray-500">
          {wish.startDate} · {wish.spotName}
        </Text>
        <Text className="text-center text-lg font-bold text-gray-900">{wish.content}</Text>
        <Text className="text-gray-600">
          돌 {wish.stoneCount}/{FULL_STONES} · {wish.result ? RESULT_LABEL[wish.result] : '회고 전'}
        </Text>
        <Pressable onPress={onOpenReflection} hitSlop={8} accessibilityRole="button">
          <Text className="font-medium text-gray-900 underline">30일 회고 보기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ArrowButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      className={`h-11 w-11 items-center justify-center rounded-full bg-gray-100 ${disabled ? 'opacity-40' : ''}`}>
      <Ionicons name={icon} size={22} color="#374151" />
    </Pressable>
  );
}
