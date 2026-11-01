import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FinalPageData } from '../pages';
import { DescriptionText, DesignCanvas, LayerImage, TitleText } from './DesignCanvas';
import { FadeUp, PressScale, Twinkle } from './motion';
import { Stone } from './StonePage';

const TOP_STONE_DELAY = 700; // 지도·명소가 나타난 뒤 맨 위 돌을 얹음
const TOP_STONE_DURATION = 600;
const TOWER_DONE = TOP_STONE_DELAY + TOP_STONE_DURATION;
const BUTTON_DELAY = TOWER_DONE; // 돌탑 완성 직후 버튼 등장

// 인트로 3장(마지막): 경북 지도와 명소가 나타나고, 놓여 있던 돌 세 개 위에 마지막 돌이 얹힌 뒤
// 별이 빛나고 "내 소원 시작하기" 버튼이 올라옵니다.
export function FinalPage({
  data,
  active,
  width,
  height,
  onStart,
}: {
  data: FinalPageData;
  active: boolean;
  width: number;
  height: number;
  onStart: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { frame } = data;

  return (
    <View style={{ width, height }}>
      <DesignCanvas frame={frame} width={width} height={height}>
        <LinearGradient
          colors={data.gradient.colors}
          locations={data.gradient.locations}
          style={StyleSheet.absoluteFill}
        />
        <LayerImage layer={data.decoration} />

        <FadeUp active={active} delay={150} duration={700} distance={0} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.map} />
          {data.spots.map((spot) => (
            <LayerImage key={spot.label} layer={spot.image} />
          ))}
        </FadeUp>

        <LayerImage layer={data.ground} />
        <LayerImage layer={data.towerBase} />
        <Stone
          layer={data.towerTop}
          active={active}
          motion="drop"
          delay={TOP_STONE_DELAY}
          duration={TOP_STONE_DURATION}
        />

        {/* 돌탑이 완성되면 위쪽 별이 은은하게 빛남 */}
        <Twinkle active={active} startDelay={TOWER_DONE} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.starGlow} />
        </Twinkle>
        <FadeUp active={active} delay={TOWER_DONE} duration={400} distance={0} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.star} />
        </FadeUp>

        <FadeUp active={active} delay={150} duration={700} distance={0} style={StyleSheet.absoluteFill}>
          {data.spots.map((spot) => (
            <Text
              key={spot.label}
              style={{
                position: 'absolute',
                top: spot.labelTop,
                left: spot.labelCenterX - 44,
                width: 88,
                textAlign: 'center',
                fontSize: 12.5,
                lineHeight: 16,
                fontWeight: '700',
                color: '#30355d',
              }}>
              {spot.label}
            </Text>
          ))}
        </FadeUp>

        <FadeUp active={active} style={StyleSheet.absoluteFill}>
          {data.title.map((line) => (
            <TitleText key={line.top} line={line} frameWidth={frame.width} />
          ))}
        </FadeUp>
        <FadeUp active={active} delay={150} style={StyleSheet.absoluteFill}>
          {data.description.map((line) => (
            <DescriptionText key={line.top} line={line} frameWidth={frame.width} />
          ))}
        </FadeUp>
      </DesignCanvas>

      <FadeUp
        active={active}
        delay={BUTTON_DELAY}
        duration={400}
        distance={20}
        style={{ position: 'absolute', left: 21, right: 21, bottom: insets.bottom + 20 }}>
        <PressScale onPress={onStart} accessibilityLabel="내 소원 시작하기">
          <LinearGradient
            colors={['#607ef7', '#8678f4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: 'white' }}>내 소원 시작하기</Text>
          </LinearGradient>
        </PressScale>
      </FadeUp>
    </View>
  );
}
