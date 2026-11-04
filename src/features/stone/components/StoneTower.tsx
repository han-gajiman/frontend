import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { GROUND_HEIGHT, TowerBackground, type TowerBackgroundProps } from './TowerBackground';

const MAX_STONES = 30;
const OVERLAP = 5; // 위아래 돌이 겹치는 정도
const TOP_MARGIN = 72; // 탑 위 여백 (완성 배지 자리)

const MIN_FIT_STONES = 10; // 돌이 적을 때도 이만큼은 들어가는 크기로 (너무 커지지 않게)

// 돌 n개를 쌓았을 때의 높이
const towerHeight = (n: number) =>
  Array.from({ length: n }, (_, i) => stoneSize(i).height - OVERLAP).reduce((a, b) => a + b, OVERLAP);

// 새로 쌓은 돌: 위에서 떨어져 튕기며 얹힘 (웹은 spring 미지원이라 bounce 사용)
const DROP = BounceInDown.duration(700);

type StoneTowerProps = {
  count: number;
  stonedToday: boolean;
  completed: boolean;
  // 배경을 탑 영역 안에 그릴 때만 넘깁니다. 홈처럼 화면 전체에 배경을 깔 때는 생략 (투명)
  background?: TowerBackgroundProps;
  inscription?: string; // 맨 아래 돌에 새길 소원 문구
  onPress?: () => void; // 탑 몸체를 눌렀을 때 (홈: 내 돌탑 시트). 빈 하늘은 눌리지 않습니다.
};

// STONE-02 돌탑: 아래부터 쌓이는 돌 + 배경 + 30일 완성 연출
export function StoneTower({ count, stonedToday, completed, background, inscription, onPress }: StoneTowerProps) {
  const [areaHeight, setAreaHeight] = useState(0);
  // 화면에 들어왔을 때 이미 있던 돌은 차례로 나타나고, 그 뒤에 쌓은 돌만 떨어지는 효과
  const [initialCount] = useState(count);

  // 다음 돌까지 화면에 들어가도록 지금 쌓인 개수에 맞춰 크기를 정합니다. 탑이 높아질수록 돌이 조금씩 작아져 30개째에 꽉 찹니다.
  const fitStones = Math.min(MAX_STONES, Math.max(MIN_FIT_STONES, count + 1));
  const scale = Math.min(1.3, Math.max(0, areaHeight - GROUND_HEIGHT - TOP_MARGIN) / towerHeight(fitStones));
  const label = `돌탑, 돌 ${count}개${completed ? ', 완성' : ''}`;

  return (
    <View
      className={`flex-1 overflow-hidden ${background ? 'rounded-3xl' : ''}`}
      onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}
      accessible={!onPress} // 눌리는 탑이면 아래 버튼이 설명을 맡습니다.
      accessibilityLabel={label}>
      {background && <TowerBackground {...background} />}

      {completed && <CompletedBadge />}

      {areaHeight > 0 && (
        <TowerBody completed={completed}>
          <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            accessibilityLabel={onPress ? `${label}, 내 돌탑 열기` : undefined}
            // 돌이 없어도 누를 자리를 남겨 둡니다.
            style={{ flexDirection: 'column-reverse', alignItems: 'center', minWidth: 140, minHeight: 80 }}>
          {Array.from({ length: Math.min(count, MAX_STONES) }, (_, i) => (
            <Animated.View
              key={i}
              entering={i >= initialCount ? DROP : FadeIn.delay(i * 30).duration(200)}
              style={{ marginBottom: i === 0 ? 0 : -OVERLAP * scale, alignItems: 'center' }}>
              <StoneShape
                index={i}
                scale={scale}
                isToday={stonedToday && i === count - 1}
                label={i === 0 ? inscription : undefined}
              />
            </Animated.View>
          ))}
          </Pressable>
        </TowerBody>
      )}

      {count === 0 && (
        <View className="absolute inset-x-0 items-center" pointerEvents="none" style={{ bottom: GROUND_HEIGHT + 24 }}>
          <Text className="text-gray-500">첫 번째 돌을 올려 보세요</Text>
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
