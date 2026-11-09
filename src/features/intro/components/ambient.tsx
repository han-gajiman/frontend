import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useRef } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// 인트로 2차 연출 (노션 "디자인 개발 요구사항" 온보딩 6. 2차 추가 구현): 구름 흐름, 유성, 빛 궤도, 노을.
// 배경은 한 장짜리 그림이라 구름만 따로 움직일 수 없어서 그림 전체를 아주 느리게 흘립니다.
// 모두 그 장이 보일 때만 움직이고, 기기의 "동작 줄이기" 설정이 켜져 있으면 움직이지 않습니다.

// 배경이 좌우로 아주 천천히 흐름 (min~max px 사이를 period 동안 한 번 왕복)
export function Drift({
  active,
  range,
  period = 20000,
  style,
  children,
}: {
  active: boolean;
  range: [number, number];
  period?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [min, max] = range;
  const x = useSharedValue((min + max) / 2);

  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(x);
      return;
    }
    const half = { duration: period / 2, easing: Easing.inOut(Easing.sin) };
    x.value = withRepeat(withSequence(withTiming(max, half), withTiming(min, half)), -1);
    return () => cancelAnimation(x);
  }, [active, reduced, min, max, period, x]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

type Point = { x: number; y: number };

// 유성: 처음 이 장에 들어왔을 때 한 번만 하늘을 가로지릅니다. (좌표는 디자인 프레임 기준)
export function Meteor({
  active,
  from,
  to,
  delay,
  duration = 1000,
  length = 110,
}: {
  active: boolean;
  from: Point;
  to: Point;
  delay: number;
  duration?: number;
  length?: number;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const played = useRef(false);

  useEffect(() => {
    if (!active || reduced || played.current) return;
    played.current = true;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
  }, [active, reduced, delay, duration, progress]);

  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const animated = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      // 처음 20% 동안 밝아지고 마지막 40% 동안 사라짐, 지나간 뒤에는 안 보임
      opacity: p <= 0 || p >= 1 ? 0 : Math.min(1, p / 0.2, (1 - p) / 0.4),
      transform: [
        { translateX: from.x + (to.x - from.x) * p - length / 2 },
        { translateY: from.y + (to.y - from.y) * p - 1 },
        { rotate: `${angle}rad` },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: length, height: 3 }, animated]}>
      {/* 꼬리(투명) → 머리(흰색). 밝은 하늘에서도 보이게 머리에 빛 번짐 */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,250,235,0.7)', '#ffffff']}
        locations={[0, 0.7, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, borderRadius: 1.5 }}
      />
      <View
        style={{
          position: 'absolute',
          right: -3,
          top: -2.5,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#ffffff',
          shadowColor: '#fff6d8',
          shadowOpacity: 1,
          shadowRadius: 8,
        }}
      />
    </Animated.View>
  );
}

const TRAIL = 6; // 빛 뒤로 따라오는 잔상 개수

// 돌탑 주위를 납작한 타원으로 도는 빛. 뒤쪽(위쪽 반)을 지날 때는 흐려져서 돌탑 뒤로 도는 것처럼 보입니다.
export function LightOrbit({
  active,
  center,
  radius,
  startDelay,
  period = 5000,
}: {
  active: boolean;
  center: Point;
  radius: { x: number; y: number };
  startDelay: number;
  period?: number;
}) {
  const reduced = useReducedMotion();
  const angle = useSharedValue(Math.PI / 2);
  const shown = useSharedValue(0);

  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(angle);
      cancelAnimation(shown);
      shown.value = 0;
      return;
    }
    shown.value = withDelay(startDelay, withTiming(1, { duration: 600 }));
    angle.value = Math.PI / 2;
    angle.value = withDelay(
      startDelay,
      withRepeat(withTiming(Math.PI / 2 + Math.PI * 2, { duration: period, easing: Easing.linear }), -1),
    );
    return () => {
      cancelAnimation(angle);
      cancelAnimation(shown);
    };
  }, [active, reduced, startDelay, period, angle, shown]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0 }}>
      {Array.from({ length: TRAIL }, (_, i) => (
        <OrbitDot key={i} index={i} angle={angle} shown={shown} center={center} radius={radius} />
      ))}
    </View>
  );
}

function OrbitDot({
  index,
  angle,
  shown,
  center,
  radius,
}: {
  index: number;
  angle: ReturnType<typeof useSharedValue<number>>;
  shown: ReturnType<typeof useSharedValue<number>>;
  center: Point;
  radius: { x: number; y: number };
}) {
  const size = 9 - index; // 머리가 가장 크고 잔상은 작아짐
  const animated = useAnimatedStyle(() => {
    const a = angle.value - index * 0.09;
    const depth = (Math.sin(a) + 1) / 2; // 0 = 뒤(위쪽), 1 = 앞(아래쪽)
    return {
      opacity: shown.value * (1 - index / TRAIL) * (0.25 + 0.75 * depth),
      transform: [
        { translateX: center.x + radius.x * Math.cos(a) - size / 2 },
        { translateY: center.y + radius.y * Math.sin(a) - size / 2 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#fffbe8',
          shadowColor: '#fff3c4',
          shadowOpacity: 0.9,
          shadowRadius: 6,
        },
        animated,
      ]}
    />
  );
}

// 노을: 따뜻한 빛이 은은하게 밝아졌다 어두워짐
export function SunsetGlow({
  active,
  colors,
  max = 0.35,
  period = 9000,
  style,
}: {
  active: boolean;
  colors: [string, string, ...string[]];
  max?: number;
  period?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(glow);
      glow.value = 0;
      return;
    }
    const half = { duration: period / 2, easing: Easing.inOut(Easing.sin) };
    glow.value = withRepeat(withSequence(withTiming(max, half), withTiming(0, half)), -1);
    return () => cancelAnimation(glow);
  }, [active, reduced, max, period, glow]);

  const animated = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <Animated.View pointerEvents="none" style={[style, animated]}>
      <LinearGradient colors={colors} style={{ flex: 1 }} />
    </Animated.View>
  );
}
