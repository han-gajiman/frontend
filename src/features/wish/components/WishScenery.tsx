import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

// 피그마 "소원 풍경" (모아보기 배경, 788×1997). 위에 벚꽃 가지, 아래에 바위와 꽃이 있고 가운데는 분홍 안개입니다.
const SOURCE = require('../../../../assets/backgrounds/wish-scenery.jpg');
const RATIO = 1997 / 788;

// 그림 높이 기준 비율. 화면이 그림보다 짧으면 이 구간만 덜어 내서 위아래 그림이 모두 보이게 합니다.
const TOP_SLACK = 0.05; // 벚꽃 가지 위의 빈 하늘 (잘라도 되는 부분)
const FOG_START = 0.66; // 산 아래 안개 (거의 같은 색)
const FOG_END = 0.85; // 아래 바위·꽃이 시작하기 전
const FADE = 48; // 이어 붙이는 곳을 흐리게 겹치는 높이(px)
const FADE_STEPS = 16; // 3px 띠 16개 (띠끼리 겹치면 줄이 보여서 정수 픽셀로 딱 붙입니다)
const MIN_SQUASH = 0.8; // 그래도 모자라면 세로로 이만큼까지만 줄입니다

export function WishScenery() {
  const [size, setSize] = useState<{ width: number; height: number }>();

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      {size && <Layers width={size.width} height={size.height} />}
    </View>
  );
}

function Layers({ width, height }: { width: number; height: number }) {
  const natural = width * RATIO;
  // 화면에 다 들어가면 위에 맞춰 한 장으로
  if (height >= natural) {
    return <Image source={SOURCE} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />;
  }

  // 덜어 낼 수 있는 곳(위 빈 하늘 + 안개 - 겹침)으로 모자라면 세로로 살짝 줄입니다.
  const removable = 1 - TOP_SLACK - (FOG_END - FOG_START);
  const imageHeight = Math.max(Math.min(natural, (height - FADE) / removable), natural * MIN_SQUASH);
  const extra = imageHeight - height; // 화면보다 긴 만큼
  const cut = Math.max(0, Math.min(extra - TOP_SLACK * imageHeight, (FOG_END - FOG_START) * imageHeight - FADE));
  const topCrop = extra - cut; // 나머지는 위쪽에서 (MIN_SQUASH에 걸리면 가지 위 하늘을 더 자름)
  const fadeTop = Math.round(FOG_START * imageHeight - topCrop); // 위 그림이 흐려지기 시작하는 화면 위치

  // 화면 y에서부터 h만큼 위 그림을 보여 주는 띠
  const slice = (y: number, h: number, opacity: number) => (
    <View key={y} style={{ position: 'absolute', top: y, left: 0, width, height: h, overflow: 'hidden', opacity }}>
      <Image source={SOURCE} style={{ position: 'absolute', top: -(y + topCrop), left: 0, width, height: imageHeight }} contentFit="fill" />
    </View>
  );
  const step = FADE / FADE_STEPS;

  return (
    <>
      {/* 아래 그림: 바닥에 맞춤 */}
      <Image source={SOURCE} style={{ position: 'absolute', left: 0, bottom: 0, width, height: imageHeight }} contentFit="fill" />
      {/* 위 그림: 안개 구간에서 띠마다 조금씩 흐려지며 아래 그림과 이어집니다 */}
      {slice(0, fadeTop, 1)}
      {Array.from({ length: FADE_STEPS }, (_, i) => slice(fadeTop + i * step, step, 1 -(i + 0.5) / FADE_STEPS))}
    </>
  );
}
