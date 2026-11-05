import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { useApi } from '@/shared/hooks/useApi';
import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

import { getCheers } from '../api';
import type { Cheer } from '../types';

const MAX_BALLOONS = 5; // 최근 응원 몇 개만 (전체 목록은 내 돌탑 시트)
const MAX_CHARS = 28; // 풍선에 보여줄 글자 수. 응원은 최대 100자라 나머지는 ...으로 줄이고, 풍선을 누르면 전체를 보여줍니다.
const FIRST_DELAY = 900; // 홈이 보인 뒤 첫 풍선까지
const NEXT_DELAY = 500; // 터진 뒤 다음 풍선까지
const RESUME_DELAY = 900; // 전체 메시지를 닫은 뒤 터질 때까지
const POP_MS = 320;
const SIDE_MARGIN = 10;
const BALLOON_COLOR = 'rgba(255,255,255,0.6)'; // 배경이 살짝 비치는 흰색
const MIN_WIDTH = 96;
const BALLOON_ROOM = 120; // 풍선 높이만큼 위쪽 여백을 남겨, 다 떠올라도 영역 밖으로 나가지 않게
const BURST_ANGLES = [0, 60, 120, 180, 240, 300];

const writerOf = (cheer: Cheer) => cheer.writerNickname ?? '익명의 소원지기';

// 이모지 등이 잘리지 않게 글자 단위로 자릅니다.
function shorten(message: string) {
  const chars = Array.from(message);
  return chars.length > MAX_CHARS ? `${chars.slice(0, MAX_CHARS).join('').trimEnd()}...` : message;
}

// 땅에서 천천히 떠올라 터지기까지: 기본 5초 + 글자당 80ms
const floatTime = (text: string) => 5000 + text.length * 80;

// FRIEND-03 받은 응원이 돌탑 옆에서 풍선으로 하나씩 떠올랐다가 터집니다. 홈에 들어올 때마다 한 번씩.
// 풍선만 누를 수 있고(전체 메시지 보기) 나머지 영역의 터치는 그대로 통과합니다. 불러오는 중·에러·응원 없음이면 그리지 않습니다.
export function CheerBalloons({
  wishId,
  bottom,
  towerWidth,
}: {
  wishId: number;
  bottom: number; // 땅 위 어디에서 떠오르기 시작할지
  towerWidth: number; // 돌탑이 차지하는 폭. 풍선은 그 옆 빈 공간에 뜹니다.
}) {
  const fetchCheers = useCallback(() => getCheers(wishId), [wishId]);
  const { data } = useApi(fetchCheers);
  const cheers = data?.content.slice(0, MAX_BALLOONS) ?? [];
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [turn, setTurn] = useState({ run: 0, index: -1 }); // index -1 = 첫 풍선 대기
  const [opened, setOpened] = useState<Cheer | null>(null); // 전체 메시지를 보는 중인 응원

  // 화면에 돌아올 때마다 처음부터. 다른 화면에 가면 멈춥니다. (index -2 = 멈춤)
  useFocusEffect(
    useCallback(() => {
      setTurn((t) => ({ run: t.run + 1, index: -1 }));
      return () => setTurn((t) => ({ run: t.run + 1, index: -2 }));
    }, []),
  );

  const count = cheers.length;
  useEffect(() => {
    if (turn.index !== -1 || count === 0) return;
    const timer = setTimeout(() => setTurn((t) => ({ ...t, index: 0 })), FIRST_DELAY);
    return () => clearTimeout(timer);
  }, [turn, count]);

  const cheer = turn.index >= 0 ? cheers[turn.index] : undefined;
  const sideWidth = Math.max(MIN_WIDTH, (area.width - towerWidth) / 2 - SIDE_MARGIN * 2);

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => setArea(e.nativeEvent.layout)}
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      {cheer && area.width > 0 && (
        <Balloon
          key={`${turn.run}-${cheer.cheerId}`}
          cheer={cheer}
          left={turn.index % 2 === 0} // 왼쪽·오른쪽 번갈아
          width={sideWidth}
          bottom={bottom}
          rise={Math.max(40, area.height - bottom - BALLOON_ROOM)}
          paused={opened?.cheerId === cheer.cheerId}
          onPress={() => setOpened(cheer)}
          onDone={() => setTurn((t) => ({ ...t, index: t.index + 1 }))}
        />
      )}
      {opened && <CheerDialog cheer={opened} onClose={() => setOpened(null)} />}
    </View>
  );
}

function Balloon({
  cheer,
  left,
  width,
  bottom,
  rise,
  paused,
  onPress,
  onDone,
}: {
  cheer: Cheer;
  left: boolean;
  width: number;
  bottom: number;
  rise: number;
  paused: boolean; // 전체 메시지를 보는 동안에는 터지지 않습니다.
  onPress: () => void;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(reduced ? 1 : 0.8);
  const burst = useSharedValue(0);
  const text = shorten(cheer.message);
  const showMs = floatTime(text);

  // 떠오르기는 처음 한 번만. 땅에서 시작해 터질 때까지 천천히 올라갑니다.
  useEffect(() => {
    if (!reduced) y.set(withTiming(1, { duration: showMs, easing: Easing.out(Easing.quad) }));
    opacity.set(withTiming(1, { duration: 300 }));
    scale.set(withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.6)) }));
  }, [reduced, showMs, y, opacity, scale]);

  // 터지기까지 남은 시간. 전체 메시지를 닫으면 조금 뒤에 터집니다.
  const wasPaused = useRef(false);
  useEffect(() => {
    if (paused) {
      wasPaused.current = true;
      return;
    }
    const wait = wasPaused.current ? RESUME_DELAY : showMs;
    const pop = setTimeout(() => {
      if (!reduced) {
        scale.set(withTiming(1.2, { duration: POP_MS / 2 }));
        burst.set(withTiming(1, { duration: POP_MS, easing: Easing.out(Easing.cubic) }));
      }
      opacity.set(withTiming(0, { duration: POP_MS / 2 }));
    }, wait);
    const done = setTimeout(onDone, wait + POP_MS + NEXT_DELAY);
    return () => {
      clearTimeout(pop);
      clearTimeout(done);
    };
    // onDone은 렌더마다 새로 만들어지지만 하는 일은 같습니다. 다시 걸면 타이머가 처음부터 시작됩니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const riseStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -y.get() * rise }] }));
  // 터지는 점이 같이 사라지지 않도록, 흐려지고 커지는 건 풍선만
  const bubbleStyle = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        { position: 'absolute', bottom, width, alignItems: 'center' },
        left ? { left: SIDE_MARGIN } : { right: SIDE_MARGIN },
        riseStyle,
      ]}>
      <Animated.View style={[{ width: '100%', alignItems: 'center' }, bubbleStyle]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${writerOf(cheer)}의 응원, 전체 보기`}
          style={{ width: '100%' }}>
          <View
            style={[
              {
                gap: 2,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: BALLOON_COLOR,
              },
              Platform.OS === 'web' && ({ backdropFilter: 'blur(6px)' } as object),
            ]}>
            <Text numberOfLines={1} className="text-[11px] text-gray-600">
              {writerOf(cheer)}
            </Text>
            <Text className="text-[13px] leading-[18px] text-gray-900">{text}</Text>
          </View>
        </Pressable>
      </Animated.View>
      {!reduced && BURST_ANGLES.map((angle) => <BurstDot key={angle} angle={angle} burst={burst} />)}
    </Animated.View>
  );
}

// 풍선을 눌렀을 때 전체 메시지 (최대 100자)
function CheerDialog({ cheer, onClose }: { cheer: Cheer; onClose: () => void }) {
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(16,0,78,0.45)' }}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <Animated.View
          entering={ZoomIn.duration(220)}
          style={{
            width: '100%',
            maxWidth: WEB_APP_MAX_WIDTH - 48,
            maxHeight: '70%',
            gap: 16,
            padding: 24,
            borderRadius: 24,
            backgroundColor: 'white',
          }}>
          <Text className="text-sm text-gray-500">{writerOf(cheer)}</Text>
          <ScrollView>
            <Text className="text-xl leading-8 text-gray-900">{cheer.message}</Text>
          </ScrollView>
          <Pressable onPress={onClose} accessibilityRole="button" className="items-center rounded-2xl bg-gray-100 py-3">
            <Text className="font-semibold text-gray-900">닫기</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// 터질 때 사방으로 튀는 작은 점
function BurstDot({ angle, burst }: { angle: number; burst: SharedValue<number> }) {
  const rad = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      opacity: b > 0 ? 1 - b : 0,
      transform: [{ translateX: Math.cos(rad) * b * 56 }, { translateY: Math.sin(rad) * b * 56 }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: 7,
          height: 7,
          borderRadius: 4,
          backgroundColor: '#f2b84b',
        },
        style,
      ]}
    />
  );
}
