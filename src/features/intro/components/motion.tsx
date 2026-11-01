import { type ReactNode, useEffect } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type EasingFunction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// 인트로 애니메이션 공통 부품. 웹은 spring을 지원하지 않아 모두 시간 기반(withTiming)으로 만듭니다.
// 기기의 "동작 줄이기" 설정이 켜져 있으면 애니메이션 없이 최종 모습을 바로 보여줍니다.

type Timing = { delay?: number; duration: number; easing?: EasingFunction };

// active가 되면 0 → 1로 진행하고, 다른 장으로 넘어가면 0으로 되돌려서 다시 들어올 때 또 재생합니다.
export function useEntrance(active: boolean, { delay = 0, duration, easing = Easing.out(Easing.cubic) }: Timing) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    progress.value = reduced ? 1 : withDelay(delay, withTiming(1, { duration, easing }));
  }, [active, reduced, delay, duration, easing, progress]);

  return progress;
}

// 부드럽게 나타나며 살짝 떠오름 (제목·설명·버튼)
export function FadeUp({
  active,
  delay,
  duration = 600,
  distance = 8,
  style,
  children,
}: {
  active: boolean;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const progress = useEntrance(active, { delay, duration });
  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// 반복해서 은은하게 밝아졌다 어두워짐 (별 빛 번짐). startDelay 뒤에 시작합니다.
export function Twinkle({
  active,
  startDelay = 0,
  period = 3000,
  style,
  children,
}: {
  active: boolean;
  startDelay?: number;
  period?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const appear = useEntrance(active, { delay: startDelay, duration: 400 });
  const glow = useSharedValue(1);

  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(glow);
      glow.value = 1;
      return;
    }
    const half = { duration: period / 2, easing: Easing.inOut(Easing.sin) };
    glow.value = withDelay(startDelay, withRepeat(withSequence(withTiming(0.45, half), withTiming(1, half)), -1));
    return () => cancelAnimation(glow);
  }, [active, reduced, startDelay, period, glow]);

  const animated = useAnimatedStyle(() => ({ opacity: appear.value * glow.value }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// 누르면 97%로 살짝 줄었다가 돌아오는 버튼
export function PressScale({
  onPress,
  accessibilityLabel,
  style,
  children,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const to = (value: number) => {
    if (!reduced) scale.set(withTiming(value, { duration: 90 }));
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}>
      <Animated.View style={animated}>{children}</Animated.View>
    </Pressable>
  );
}
