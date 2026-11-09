import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Layer, StonePageData } from '../pages';
import { boxStyle, DescriptionText, DesignCanvas, LayerImage, TitleText } from './DesignCanvas';
import { Drift, LightOrbit, Meteor } from './ambient';
import { FadeUp, PressScale, Twinkle, useEntrance } from './motion';

const STONE_START = 300; // 제목이 먼저 나타난 뒤 돌이 쌓이기 시작

// 인트로 1·2장: 제목이 나타나고, 돌이 순서대로 쌓인 뒤 별이 반짝입니다. (2장은 맨 아래 돌이 처음부터 놓여 있음)
export function StonePage({
  data,
  active,
  width,
  height,
  index,
  total,
  onNext,
  onSkip,
}: {
  data: StonePageData;
  active: boolean;
  width: number;
  height: number;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { frame } = data;
  const placed = data.placedStones ?? 0;
  const moving = data.stones.length - placed; // 애니메이션으로 쌓이는 돌 개수
  const stonesDone = STONE_START + (moving - 1) * data.stoneInterval + data.stoneDuration;

  return (
    <View style={{ width, height }}>
      <DesignCanvas frame={frame} width={width} height={height}>
        <Drift active={active} range={data.artDrift} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.art} />
        </Drift>
        {data.meteor && <Meteor active={active} from={data.meteor.from} to={data.meteor.to} delay={stonesDone + 400} />}

        <FadeUp active={active} style={StyleSheet.absoluteFill}>
          {data.titleGlow && <LayerImage layer={data.titleGlow} />}
          {data.title.map((line) => (
            <TitleText key={line.top} line={line} frameWidth={frame.width} />
          ))}
        </FadeUp>
        <FadeUp active={active} delay={150} style={StyleSheet.absoluteFill}>
          {data.description.map((line) => (
            <DescriptionText key={line.top} line={line} frameWidth={frame.width} />
          ))}
        </FadeUp>

        <Twinkle active={active} startDelay={stonesDone} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.starGlow} />
        </Twinkle>
        <FadeUp active={active} delay={stonesDone} duration={400} distance={0} style={StyleSheet.absoluteFill}>
          <LayerImage layer={data.star} />
        </FadeUp>

        {data.stones.map((stone, i) =>
          i < placed ? (
            <LayerImage key={i} layer={stone} />
          ) : (
            <Stone
              key={i}
              layer={stone}
              active={active}
              motion={data.stoneMotion}
              delay={STONE_START + (i - placed) * data.stoneInterval}
              duration={data.stoneDuration}
            />
          ),
        )}
        {/* 돌 위에 그려서 앞쪽(아래 반)을 지날 때 돌 앞으로 지나감 */}
        {data.orbit && (
          <LightOrbit active={active} center={data.orbit.center} radius={data.orbit.radius} startDelay={stonesDone + 300} />
        )}
      </DesignCanvas>

      <Pressable
        onPress={onSkip}
        hitSlop={12}
        accessibilityRole="button"
        style={{ position: 'absolute', top: insets.top + 8, right: 34 }}>
        <Text style={{ fontSize: 13, color: '#343354' }}>건너뛰기</Text>
      </Pressable>

      <View
        style={{ position: 'absolute', bottom: insets.bottom + 42, left: 0, right: 0 }}
        className="flex-row justify-center gap-[17.4px]"
        accessibilityLabel={`${total}장 중 ${index + 1}번째`}>
        {Array.from({ length: total }, (_, i) => (
          <Image
            key={i}
            source={
              i === index
                ? require('../../../../assets/intro/dot_active.png')
                : require('../../../../assets/intro/dot_inactive.png')
            }
            style={{ width: 9, height: 9 }}
          />
        ))}
      </View>

      <PressScale
        onPress={onNext}
        accessibilityLabel="다음"
        style={{ position: 'absolute', bottom: insets.bottom + 19, right: 16 }}>
        <View style={{ width: 70, height: 70 }} className="items-center justify-center">
          <Image source={require('../../../../assets/intro/next_button.png')} style={StyleSheet.absoluteFill} />
          <Text style={{ fontSize: 36, fontWeight: '600', color: '#4a4d92', marginTop: -4 }}>→</Text>
        </View>
      </PressScale>
    </View>
  );
}

// 돌 하나. rise는 아래에서 살짝 올라오고, drop은 위에서 내려와 살짝 튕기며 안착합니다. (막장 맨 위 돌도 사용)
export function Stone({
  layer,
  active,
  motion,
  delay,
  duration,
}: {
  layer: Layer;
  active: boolean;
  motion: StonePageData['stoneMotion'];
  delay: number;
  duration: number;
}) {
  const easing = motion === 'drop' ? Easing.out(Easing.back(1.6)) : Easing.out(Easing.cubic);
  const offset = motion === 'drop' ? -70 : 24;
  const progress = useEntrance(active, { delay, duration, easing });
  const animated = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 3),
    transform: [{ translateY: (1 - progress.value) * offset }],
  }));

  return (
    <Animated.View style={[boxStyle(layer), animated]}>
      <Image source={layer.source} style={StyleSheet.absoluteFill} contentFit="contain" />
    </Animated.View>
  );
}
