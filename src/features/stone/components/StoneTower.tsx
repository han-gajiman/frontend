import { type ReactNode, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  BounceInDown,
  cancelAnimation,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { StoneShape, stoneSize } from './StoneShape';
import { GROUND_HEIGHT, TowerBackground } from './TowerBackground';

const MAX_STONES = 30;
const OVERLAP = 5; // 위아래 돌이 겹치는 정도
const TOP_MARGIN = 72; // 탑 위 여백 (완성 배지 자리)

// 돌 30개를 다 쌓았을 때의 높이. 화면 크기에 맞춰 이 높이가 들어가도록 축소합니다.
const FULL_HEIGHT = Array.from({ length: MAX_STONES }, (_, i) => stoneSize(i).height - OVERLAP).reduce(
  (a, b) => a + b,
  OVERLAP,
);

// 새로 쌓은 돌: 위에서 떨어져 튕기며 얹힘 (웹은 spring 미지원이라 bounce 사용)
const DROP = BounceInDown.duration(700);

type StoneTowerProps = {
  count: number;
  stonedToday: boolean;
  completed: boolean;
  backgroundImageUrl: string | null;
};

// STONE-02 돌탑: 아래부터 쌓이는 돌 + 배경 + 30일 완성 연출
export function StoneTower({ count, stonedToday, completed, backgroundImageUrl }: StoneTowerProps) {
  const [areaHeight, setAreaHeight] = useState(0);
  // 화면에 들어왔을 때 이미 있던 돌은 차례로 나타나고, 그 뒤에 쌓은 돌만 떨어지는 효과
  const [initialCount] = useState(count);

  const scale = Math.min(1.3, (areaHeight - GROUND_HEIGHT - TOP_MARGIN) / FULL_HEIGHT);

  return (
    <View
      className="flex-1 overflow-hidden rounded-3xl"
      onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}
      accessible
      accessibilityLabel={`돌탑, 돌 ${count}개${completed ? ', 완성' : ''}`}>
      <TowerBackground imageUrl={backgroundImageUrl} />

      {completed && <CompletedBadge />}

      {areaHeight > 0 && (
        <TowerBody completed={completed}>
          {Array.from({ length: Math.min(count, MAX_STONES) }, (_, i) => (
            <Animated.View
              key={i}
              entering={i >= initialCount ? DROP : FadeIn.delay(i * 30).duration(200)}
              style={{ marginBottom: i === 0 ? 0 : -OVERLAP * scale, alignItems: 'center' }}>
              <StoneShape index={i} scale={scale} isToday={stonedToday && i === count - 1} />
            </Animated.View>
          ))}
        </TowerBody>
      )}

      {count === 0 && (
        <View className="absolute inset-x-0 items-center" style={{ bottom: GROUND_HEIGHT + 24 }}>
          <Text className="text-gray-400">첫 번째 돌을 올려 보세요</Text>
        </View>
      )}
    </View>
  );
}

// 탑 전체. 완성되면 천천히 숨쉬듯 커졌다 작아집니다.
function TowerBody({ completed, children }: { completed: boolean; children: ReactNode }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (completed) {
      pulse.set(withRepeat(withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })), -1));
    } else {
      cancelAnimation(pulse);
      pulse.set(1);
    }
  }, [completed, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));

  // Animated.View에는 NativeWind className이 적용되지 않아 style로 씁니다
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: GROUND_HEIGHT - 14,
          flexDirection: 'column-reverse',
          alignItems: 'center',
          transformOrigin: 'bottom',
        },
        pulseStyle,
      ]}>
      {children}
    </Animated.View>
  );
}

// 🟡 돌 30개 완성 / 일부만 쌓은 경우 연출 구분은 미정 → 지금은 같은 연출
function CompletedBadge() {
  return (
    <Animated.View
      entering={ZoomIn.duration(500)}
      style={{ position: 'absolute', left: 0, right: 0, top: 20, alignItems: 'center' }}>
      <View className="rounded-full bg-amber-100 px-4 py-2">
        <Text className="font-bold text-amber-800">30일 돌탑 완성</Text>
      </View>
    </Animated.View>
  );
}
