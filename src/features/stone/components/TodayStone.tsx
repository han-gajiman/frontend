import { useRef } from 'react';
import { type GestureResponderEvent, Platform, Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { StoneShape } from './StoneShape';

const TAP_SLOP = 8; // 이보다 적게 움직이고 놓으면 탭으로 봅니다
const TAP_LIFT = -140; // 탭으로 쌓을 때 돌이 탑 쪽으로 떠오르는 거리
const BACK = { duration: 260, easing: Easing.out(Easing.cubic) };

type TodayStoneProps = {
  index: number; // 이번에 쌓을 돌의 순서 (= 지금 돌 개수). 탑의 다음 돌과 같은 모양
  disabled: boolean;
  // 손을 뗀 화면 좌표가 탑 위인지. 드래그를 시작할 때 onDragStart로 탑 위치를 다시 재 둡니다.
  isOverTower: (pageX: number, pageY: number) => boolean;
  onDragStart: () => void;
  // 돌 쌓기 요청. 성공하면 true (화면은 부모가 새로 불러와서 탑에 돌이 떨어지고 이 돌은 사라짐)
  onDrop: () => Promise<boolean>;
};

// STONE-01 오늘의 돌: 손가락으로 끌어 탑 위에 놓으면 쌓입니다. 돌을 톡 누르거나 아래 "눌러서 쌓기" 버튼으로도 쌓여요.
// (버튼은 웹 키보드·스크린 리더처럼 드래그가 어려운 환경용. 접근성 요소는 버튼 하나로 둡니다)
// 탑 밖에 놓거나 요청이 실패하면 원래 자리로 돌아갑니다.
// 드래그는 웹과 폰에서 똑같이 동작하는 기본 터치 이벤트(onResponder*)로, 움직임은 Reanimated 시간 기반 애니메이션으로 처리합니다.
export function TodayStone({ index, disabled, isOverTower, onDragStart, onDrop }: TodayStoneProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lifted = useSharedValue(0);
  const start = useRef({ x: 0, y: 0 }); // 손가락을 댄 화면 좌표

  const goBack = () => {
    x.set(withTiming(0, BACK));
    y.set(withTiming(0, BACK));
    lifted.set(withTiming(0, BACK));
  };
  const drop = async () => {
    const ok = await onDrop();
    if (!ok) goBack();
  };
  // 탭으로 쌓을 때는 돌이 탑 쪽으로 떠오른 뒤 요청합니다.
  const tapStack = () => {
    if (disabled) return;
    y.set(withTiming(TAP_LIFT, { duration: 300, easing: Easing.out(Easing.cubic) }));
    void drop();
  };

  const handleGrant = (e: GestureResponderEvent) => {
    start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    onDragStart();
    lifted.set(withTiming(1, { duration: 120 }));
  };
  const handleMove = (e: GestureResponderEvent) => {
    x.set(e.nativeEvent.pageX - start.current.x);
    y.set(e.nativeEvent.pageY - start.current.y);
  };
  const handleRelease = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    if (Math.hypot(pageX - start.current.x, pageY - start.current.y) < TAP_SLOP) {
      tapStack();
    } else if (isOverTower(pageX, pageY)) {
      void drop();
    } else {
      goBack();
    }
  };

  const stoneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: 1 + lifted.get() * 0.12 }],
  }));

  return (
    <View className="items-center gap-2">
      <Animated.View
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderTerminationRequest={() => false} // 드래그 중에는 다른 요소가 터치를 가져가지 않게
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={handleRelease}
        onResponderTerminate={goBack}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[
          { padding: 12, zIndex: 10, opacity: disabled ? 0.5 : 1 },
          Platform.OS === 'web' && ({ cursor: 'grab', userSelect: 'none', touchAction: 'none' } as object),
          stoneStyle,
        ]}>
        <StoneShape index={index} scale={1} isToday />
      </Animated.View>
      <View className="flex-row items-center gap-2">
        <Text className="text-xs text-white">끌어서 탑 위에 올려 주세요</Text>
        <Pressable
          onPress={tapStack}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="오늘의 돌 쌓기"
          className="rounded-full bg-white/80 px-3 py-1">
          <Text className="text-xs font-semibold text-gray-900">눌러서 쌓기</Text>
        </Pressable>
      </View>
    </View>
  );
}
