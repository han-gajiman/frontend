import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// 배경 아래쪽 땅 기본 높이. 돌탑은 이 위에 세워집니다.
export const GROUND_HEIGHT = 64;

export type TowerBackgroundProps = {
  spotId: number | null; // null = 허허벌판 (빈 홈)
  imageUrl: string | null;
  visited: boolean; // false면 흐리고 채도 낮게 (방문 인증하면 원래 색)
  evening?: boolean; // 오늘 돌을 쌓았으면 저녁 하늘 (서버의 stonedToday 기준)
  groundHeight?: number;
};

// TODO(디자인): 명소 풍경 이미지가 나오면 서버의 backgroundImageUrl로 대체됩니다. 그 전까지 명소별 임시 하늘·땅 색
// [하늘 위, 하늘 아래(지평선), 땅]
const SPOT_PALETTES: Record<number, [string, string, string]> = {
  1: ['#c9d8ef', '#f3e6d3', '#b9a88f'], // 팔공산 갓바위: 산 위 새벽빛
  2: ['#cfe3f0', '#e8f0dc', '#9fb08a'], // 문경새재: 숲길
  3: ['#a9d4f0', '#fde5c8', '#8fb6c9'], // 호미곶: 바다 해돋이
  4: ['#d3dcef', '#efe7da', '#a9a08a'], // 동화사
  5: ['#d8d2ec', '#f4e2d6', '#b39f8d'], // 불국사·석굴암
  6: ['#e7cfd8', '#f6dcc2', '#a8987f'], // 부석사: 노을
  7: ['#cfd8e2', '#ece6da', '#9d9a8a'], // 경주 남산: 돌산
  8: ['#b4d7ef', '#fbe0c4', '#93b3c3'], // 영덕 해맞이공원
  9: ['#b9cde6', '#e9e2e0', '#8da5b7'], // 문무대왕릉: 바다
  10: ['#d6e4cf', '#f1ecd9', '#a7a07c'], // 하회마을
};
const FIELD_PALETTE: [string, string, string] = ['#e4e9f1', '#f1eee6', '#cbbfa8']; // 허허벌판
const EVENING: [string, string] = ['#2c2f5e', '#d98d6f']; // 저녁 하늘

// 돌탑 배경: 선택한 명소 풍경 (미방문은 흐리고 채도 낮게) + 오늘 쌓았으면 저녁 하늘이 서서히 덮입니다.
export function TowerBackground({
  spotId,
  imageUrl,
  visited,
  evening = false,
  groundHeight = GROUND_HEIGHT,
}: TowerBackgroundProps) {
  const [skyTop, skyBottom, ground] = (spotId !== null && SPOT_PALETTES[spotId]) || FIELD_PALETTE;

  const dusk = useSharedValue(evening ? 1 : 0);
  useEffect(() => {
    dusk.set(withTiming(evening ? 1 : 0, { duration: 1200 }));
  }, [evening, dusk]);
  const duskStyle = useAnimatedStyle(() => ({ opacity: dusk.get() * 0.75 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={visited ? 0 : 12} />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient colors={[skyTop, skyBottom]} style={{ flex: 1 }} />
          <LinearGradient colors={[ground, shade(ground)]} style={{ height: groundHeight }} />
        </View>
      )}

      {/* 방문 전: 회색 덮개로 채도를 낮춥니다 */}
      {!visited && spotId !== null && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(140,140,150,0.35)' }]} />}

      <Animated.View style={[StyleSheet.absoluteFill, duskStyle]}>
        <LinearGradient colors={EVENING} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

// 땅 아래쪽을 조금 어둡게
function shade(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(c * 0.85);
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 0xff)}, ${f(n & 0xff)})`;
}
