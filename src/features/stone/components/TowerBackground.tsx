import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { DEFAULT_BACKGROUND, spotIllustration } from '@/features/spot/spotIllustrations';

// 배경 아래쪽 땅 기본 높이. 돌탑은 이 위에 세워집니다.
export const GROUND_HEIGHT = 64;

export type TowerBackgroundProps = {
  spotId: number | null; // null = 명소 없음 (빈 홈)
  visited: boolean;
  evening?: boolean; // 오늘 돌을 쌓았으면 저녁 하늘 (서버의 stonedToday 기준)
  groundHeight?: number;
  bottomScrim?: boolean; // 아래쪽을 어둡게 깔아 그 위 글자·탭이 잘 보이게 (홈)
  softened?: boolean; // 평소에도 저녁 덮개를 옅게 깝니다 (홈, 친구 돌탑)
};

const EVENING: [string, string] = ['#1d1f4d', '#8a5a78']; // 저녁 하늘 덮개
const SOFTENED_OPACITY = 0.3; // 평소 덮개
const EVENING_OPACITY = 0.55; // 오늘 돌을 쌓은 저녁

// 돌탑 배경 (STONE-02): 방문한 명소는 일러스트, 아니면 기본 화면. 오늘 쌓으면 저녁 하늘이 서서히 덮입니다.
// 기본 화면에는 땅이 없어서, 돌탑이 설 자리에 반투명한 땅을 깝니다.
export function TowerBackground({
  spotId,
  visited,
  evening = false,
  groundHeight = GROUND_HEIGHT,
  bottomScrim = false,
  softened = false,
}: TowerBackgroundProps) {
  const illustration = spotIllustration(spotId);
  const showIllustration = illustration !== null && visited;

  const dusk = useSharedValue(evening ? 1 : 0);
  useEffect(() => {
    dusk.set(withTiming(evening ? 1 : 0, { duration: 1200 }));
  }, [evening, dusk]);
  const base = softened ? SOFTENED_OPACITY : 0;
  const duskStyle = useAnimatedStyle(() => ({ opacity: base + dusk.get() * (EVENING_OPACITY - base) }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={showIllustration ? illustration : DEFAULT_BACKGROUND}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="bottom"
      />
      {!showIllustration && (
        <LinearGradient
          colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.12)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: groundHeight }}
        />
      )}

      {bottomScrim && (
        <LinearGradient
          colors={['rgba(27,23,64,0)', 'rgba(27,23,64,0.62)']}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%' }}
        />
      )}

      <Animated.View style={[StyleSheet.absoluteFill, duskStyle]}>
        <LinearGradient colors={EVENING} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}
