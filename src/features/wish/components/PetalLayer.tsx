import { Image, type ImageSource } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import { useAppSize } from '@/shared/hooks/useAppSize';

// 피그마 "소원 풍경 · 꽃잎 개별 에셋 6종"
const PETALS: ImageSource[] = [
  require('../../../../assets/petals/petal_01.svg'),
  require('../../../../assets/petals/petal_02.svg'),
  require('../../../../assets/petals/petal_03.svg'),
  require('../../../../assets/petals/petal_04.svg'),
  require('../../../../assets/petals/petal_05.svg'),
  require('../../../../assets/petals/petal_06.svg'),
];

const FADE_IN = 500;
const FADE_OUT = 800;
const between = (min: number, max: number) => min + Math.random() * (max - min);

type Flight = {
  startX: number;
  driftX: number; // 떨어지는 동안 옆으로 가는 거리
  sway: number; // 좌우 흔들림 (±)
  phase: number;
  rotation: number; // 최대 회전 각도
  size: number;
  opacity: number;
  duration: number;
};

// 시작·반복할 때만 새로 정합니다. (매 프레임 무작위 금지)
function newFlight(width: number): Flight {
  const flips = Math.random() < 0.25; // 일부만 크게 뒤집힘
  return {
    startX: between(0, width),
    driftX: between(-40, 40),
    sway: between(15, 25),
    phase: between(0, Math.PI * 2),
    rotation: flips ? between(90, 150) : between(15, 30),
    size: between(14, 24),
    opacity: between(0.6, 0.8),
    duration: between(9000, 12000),
  };
}

// 노션 "소원 돌탑 화면 — 꽃잎 흩날림": 배경은 고정, 꽃잎 6장만 천천히 떨어지며 흔들리고 살짝 돕니다.
// 터치를 막지 않고(pointerEvents none), 화면을 떠나거나 애니메이션 줄이기 설정이면 멈춥니다.
export function PetalLayer() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setActive(true);
      return () => setActive(false);
    }, []),
  );
  if (reduceMotion || !active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PETALS.map((source, i) => (
        <Petal key={i} source={source} startDelay={500 + i * 1400} />
      ))}
    </View>
  );
}

function Petal({ source, startDelay }: { source: ImageSource; startDelay: number }) {
  const { width, height } = useAppSize();
  const [flight, setFlight] = useState(() => newFlight(width));
  const progress = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fly = (f: Flight) => {
      progress.set(0);
      progress.set(withTiming(1, { duration: f.duration, easing: Easing.linear }));
      // 화면 아래로 나가면 새 설정으로 다시 위에서
      timer = setTimeout(() => {
        const next = newFlight(width);
        setFlight(next);
        fly(next);
      }, f.duration);
    };
    timer = setTimeout(() => fly(flight), startDelay);
    return () => {
      clearTimeout(timer);
      cancelAnimation(progress);
    };
    // 처음 한 번만 시작합니다. (flight는 위에서 직접 넘김)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, startDelay, progress]);

  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const elapsed = p * flight.duration;
    const fadeIn = Math.min(1, elapsed / FADE_IN);
    const fadeOut = Math.min(1, (flight.duration - elapsed) / FADE_OUT);
    return {
      opacity: p === 0 ? 0 : flight.opacity * Math.min(fadeIn, fadeOut),
      transform: [
        { translateX: flight.startX + flight.driftX * p + Math.sin(p * Math.PI * 4 + flight.phase) * flight.sway },
        { translateY: -40 + p * (height + 80) },
        { rotate: `${Math.sin(p * Math.PI * 2 + flight.phase) * flight.rotation}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, style]}>
      <Image source={source} style={{ width: flight.size, height: flight.size }} />
    </Animated.View>
  );
}
