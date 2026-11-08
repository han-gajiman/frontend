import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { ErrorText } from '@/shared/components/ErrorText';
import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { createVisit } from '../api';
import { DEFAULT_BACKGROUND, spotIllustration } from '../spotIllustrations';
import type { Spot } from '../types';
import { verifyVisit } from '../verifyVisit';
import { visitFog } from '../visitFog';

// 피그마 "방문 인증 전" (204:74) 색과 크기
const NAVY = '#332d73';
const CREAM = '#fffdf6';
const FOG_OPACITY = 0.9;
const LOCKED_BLUR = 14; // 피그마 블러 28 (CSS 기준 14px)
const LOCK_TOP = '40.6%'; // 640 높이 화면에서 260

const REVEAL = { duration: 1200, easing: Easing.inOut(Easing.cubic) }; // 인증 성공: 안개가 걷힘
const FLIP = { duration: 500, easing: Easing.inOut(Easing.cubic) };
const FILL = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;
// 앞뒷면 공통: 화면을 채웁니다.
const FACE = { ...FILL, overflow: 'hidden', backfaceVisibility: 'hidden' } as const;
// 흐리게 할 때 가장자리가 비치지 않도록 화면보다 조금 크게 깝니다. (피그마 396×704 / 360×640)
const BLEED = { position: 'absolute', top: '-5%', right: '-5%', bottom: '-5%', left: '-5%' } as const;

const formatDistance = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);

// SPOT-03 방문 인증 화면 (노션 "디자인 개발 요구사항"의 방문 인증 전·후 애니메이션)
// 방문 전: 블러 그림 + 색 안개 + 자물쇠. 인증하면 안개가 걷히며 일러스트가 열리고, 열린 그림은 천천히 숨쉽니다.
// 위치는 기기 안에서만 확인합니다(verifyVisit). 서버에는 인증 결과만 보내고 위치 정보는 보내지 않습니다.
export function VisitScreen({
  spot,
  onClose,
  onVisited,
}: {
  spot: Spot;
  onClose: () => void;
  onVisited: () => void;
}) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const illustration = spotIllustration(spot.id) ?? DEFAULT_BACKGROUND;
  const fogColors = visitFog(spot.id);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string>();
  const submit = useSubmit(createVisit);
  const unlocked = spot.visited;
  // 이미 방문했지만 지금 돌탑에서는 아직 인증하지 않은 명소 → 다시 인증하면 새 엽서
  const canVisitAgain = unlocked && spot.visitedThisTower === false;

  // 카드 뒤집기: 0 = 앞면(일러스트), 180 = 뒷면(이야기)
  const [showStory, setShowStory] = useState(false);
  const flip = useSharedValue(0);
  const flipTo = (story: boolean) => {
    setShowStory(story);
    flip.set(withTiming(story ? 180 : 0, FLIP));
  };
  // 웹은 뒷면 숨김이 글자까지 적용되지 않아서, 90도를 넘는 순간 보이는 면을 직접 바꿉니다.
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.get() < 90 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${flip.get()}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.get() < 90 ? 0 : 1,
    transform: [{ perspective: 1200 }, { rotateY: `${flip.get() - 180}deg` }],
  }));

  // 안개·블러: 처음부터 열린 명소면 없음, 이 화면에서 인증하면 걷힙니다.
  const [openedHere] = useState(!unlocked);
  const fog = useSharedValue(unlocked ? 0 : FOG_OPACITY);
  const blurred = useSharedValue(unlocked ? 0 : 1);
  const zoom = useSharedValue(1);
  useEffect(() => {
    if (!unlocked || !openedHere) return;
    // 자물쇠·문구가 사라진 뒤(0.3초) 안개와 블러가 걷히고, 그림이 103% → 100%로 자리 잡습니다.
    fog.set(withDelay(300, withTiming(0, REVEAL)));
    blurred.set(withDelay(300, withTiming(0, REVEAL)));
    zoom.set(1.03);
    zoom.set(withDelay(300, withTiming(1, REVEAL)));
  }, [unlocked, openedHere, fog, blurred, zoom]);

  // 열린 그림: 풍경이 100% → 102%로 아주 천천히 숨쉬고, 햇빛이 은은하게 바뀝니다.
  const breath = useSharedValue(1);
  const sun = useSharedValue(0);
  useEffect(() => {
    if (!unlocked || reduceMotion) return;
    const slow = { duration: 5000, easing: Easing.inOut(Easing.sin) };
    breath.set(withRepeat(withSequence(withTiming(1.02, slow), withTiming(1, slow)), -1));
    sun.set(withRepeat(withSequence(withTiming(0.08, { duration: 4000 }), withTiming(0, { duration: 4000 })), -1));
  }, [unlocked, reduceMotion, breath, sun]);

  // 안개가 좌우로 아주 천천히 흐름 (잠겨 있을 때만)
  const drift = useSharedValue(0);
  useEffect(() => {
    if (unlocked || reduceMotion) return;
    const slow = { duration: 3500, easing: Easing.inOut(Easing.sin) };
    drift.set(withRepeat(withSequence(withTiming(12, slow), withTiming(-12, slow)), -1, true));
  }, [unlocked, reduceMotion, drift]);

  const imageStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.get() * breath.get() }] }));
  const blurStyle = useAnimatedStyle(() => ({ opacity: blurred.get() }));
  const fogStyle = useAnimatedStyle(() => ({ opacity: fog.get(), transform: [{ translateX: drift.get() }] }));
  const sunStyle = useAnimatedStyle(() => ({ opacity: sun.get() }));

  const handleVerify = async () => {
    setNotice(undefined);
    setChecking(true);
    const check = await verifyVisit(spot);
    setChecking(false);

    if (check.status === 'denied') {
      setNotice('위치 권한이 필요해요. 기기 설정에서 허용한 뒤 다시 시도해 주세요.');
    } else if (check.status === 'unavailable') {
      setNotice('현재 위치를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } else if (check.status === 'outOfRange') {
      setNotice(`명소까지 약 ${formatDistance(check.distanceM)} 남았어요. 명소 가까이에서 다시 시도해 주세요.`);
    } else {
      const result = await submit.run(spot.id);
      if (result.ok) onVisited();
    }
  };
  const busy = checking || submit.submitting;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,0,78,0.85)' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: WEB_APP_MAX_WIDTH, backgroundColor: fogColors.background, overflow: 'hidden' }}>
          <Animated.View pointerEvents={showStory ? 'none' : 'box-none'} style={[FACE, frontStyle]}>
            <Animated.View style={[FILL, imageStyle]}>
              <Image source={illustration} style={FILL} contentFit="cover" contentPosition="bottom" />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[BLEED, blurStyle]}>
              <Image source={illustration} style={FILL} contentFit="cover" contentPosition="bottom" blurRadius={LOCKED_BLUR} />
            </Animated.View>
            <Animated.View pointerEvents="none" style={[BLEED, fogStyle]}>
              <LinearGradient colors={[...fogColors.colors, fogColors.colors[2]]} locations={[0, 0.45, 0.9, 1]} style={{ flex: 1 }} />
            </Animated.View>
            {unlocked && (
              <Animated.View pointerEvents="none" entering={openedHere ? FadeIn.delay(1300).duration(600) : undefined} style={FILL}>
                <Animated.View style={[FILL, sunStyle]}>
                  <LinearGradient colors={['#ffd9a8', 'rgba(255,217,168,0)']} style={{ flex: 1 }} />
                </Animated.View>
                {/* 아래쪽 글자가 잘 보이게 */}
                <LinearGradient
                  colors={['rgba(27,23,64,0)', 'rgba(27,23,64,0.55)']}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' }}
                />
              </Animated.View>
            )}

            {!unlocked && (
              <Animated.View
                exiting={FadeOut.duration(300)}
                style={{ position: 'absolute', top: LOCK_TOP, left: 0, right: 0, alignItems: 'center', gap: 8 }}>
                <Rise delay={200}>
                  <BreathingLock still={reduceMotion} />
                </Rise>
                <Rise delay={200}>
                  <Text style={{ color: CREAM, fontSize: 14, lineHeight: 20, fontWeight: '500' }}>방문 인증 전</Text>
                </Rise>
                {spot.story && (
                  <Rise delay={450}>
                    <StoryLink onPress={() => flipTo(true)} />
                  </Rise>
                )}
              </Animated.View>
            )}
          </Animated.View>

          {/* 카드 뒷면: 명소 이야기. 방문 인증 전에도 읽을 수 있습니다. */}
          <Animated.View
            pointerEvents={showStory ? 'auto' : 'none'}
            accessibilityElementsHidden={!showStory}
            importantForAccessibility={showStory ? 'auto' : 'no-hide-descendants'}
            style={[FACE, backStyle, { backgroundColor: '#2a2358', paddingTop: insets.top + 64, paddingHorizontal: 28 }]}>
            <Text className="text-center text-sm text-white/70">명소 이야기</Text>
            <Text className="mt-2 text-center text-2xl text-white" style={{ fontFamily: TITLE_FONT }}>
              {spot.name}
            </Text>
            <ScrollView style={{ flex: 1, marginTop: 24 }} contentContainerStyle={{ paddingBottom: 16 }}>
              <Text className="text-lg leading-8 text-white" style={{ fontFamily: TITLE_FONT }}>
                {spot.story}
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => flipTo(false)}
              accessibilityRole="button"
              style={{ marginBottom: insets.bottom + 32, marginTop: 12 }}
              className="flex-row items-center justify-center gap-2 self-center rounded-full bg-white/20 px-5 py-3">
              <Ionicons name="image-outline" size={18} color="#ffffff" />
              <Text className="font-semibold text-white">눌러서 돌아가기</Text>
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={{ position: 'absolute', top: insets.top, right: 0, zIndex: 1, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../../../assets/icons/close.svg')} style={{ width: 16, height: 16 }} />
          </Pressable>

          {!showStory && (
            <View
              pointerEvents="box-none"
              style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingBottom: insets.bottom + 32 }}>
              {unlocked ? (
                <Animated.View entering={openedHere ? FadeIn.delay(1300).duration(600) : undefined} style={{ alignItems: 'center', gap: 12 }}>
                  {spot.story && <BlinkingStoryLink still={reduceMotion} onPress={() => flipTo(true)} />}
                  <Text className="text-center text-xl font-bold text-white">{spot.name}</Text>
                  {canVisitAgain && (
                    <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 8 }}>
                      <VerifyNotice notice={notice} />
                      <ErrorText error={submit.error} />
                      <PressScaleButton label="이 장소 다시 인증하기" onPress={handleVerify} loading={busy} light />
                    </View>
                  )}
                </Animated.View>
              ) : (
                <Animated.View exiting={FadeOut.duration(300)} style={{ alignItems: 'center', gap: 24 }}>
                  <View style={{ alignItems: 'center', gap: 10 }}>
                    <Rise delay={350} rise={8}>
                      <Text style={{ color: NAVY, fontSize: 26, lineHeight: 36, fontWeight: '700', textAlign: 'center' }}>{spot.name}</Text>
                    </Rise>
                    <Rise delay={450}>
                      <Text style={{ color: NAVY, fontSize: 16, lineHeight: 23, textAlign: 'center' }}>
                        방문을 인증하면{'\n'}이곳의 풍경 일러스트가 열려요.
                      </Text>
                    </Rise>
                  </View>
                  <Rise delay={550} rise={10} stretch>
                    <View style={{ gap: 8 }}>
                      <VerifyNotice notice={notice} dark />
                      <ErrorText error={submit.error} />
                      <PressScaleButton label="방문 인증하기" onPress={handleVerify} loading={busy} />
                    </View>
                  </Rise>
                </Animated.View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// 화면을 열 때 delay 뒤에 나타나며 rise만큼 아래에서 올라옵니다.
function Rise({ delay, rise = 0, stretch = false, children }: { delay: number; rise?: number; stretch?: boolean; children: ReactNode }) {
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.set(withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })));
  }, [delay, shown]);
  const style = useAnimatedStyle(() => ({
    opacity: shown.get(),
    transform: [{ translateY: (1 - shown.get()) * rise }],
  }));
  return <Animated.View style={[stretch && { alignSelf: 'stretch' }, style]}>{children}</Animated.View>;
}

// 자물쇠: 100% → 104%, 투명도 80% → 100%로 숨쉬듯 (약 2.8초)
function BreathingLock({ still }: { still: boolean }) {
  const breath = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    breath.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [still, breath]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.8 + breath.get() * 0.2,
    transform: [{ scale: 1 + breath.get() * 0.04 }],
  }));
  return (
    <Animated.View style={style}>
      <Image source={require('../../../../assets/icons/lock.svg')} style={{ width: 24, height: 28 }} accessibilityLabel="잠김" />
    </Animated.View>
  );
}

function StoryLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" style={{ marginTop: 12 }}>
      <Text style={{ color: CREAM, fontSize: 13, textDecorationLine: 'underline' }}>눌러서 스토리보기</Text>
    </Pressable>
  );
}

// 열린 그림 위의 희미한 흰 글씨. 천천히 깜빡입니다.
function BlinkingStoryLink({ still, onPress }: { still: boolean; onPress: () => void }) {
  const glow = useSharedValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    glow.set(withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [still, glow]);
  const style = useAnimatedStyle(() => ({ opacity: 0.35 + glow.get() * 0.4 }));
  return (
    <Pressable onPress={onPress} hitSlop={12} accessibilityRole="button" accessibilityLabel="눌러서 스토리보기">
      <Animated.Text style={[{ color: '#ffffff', fontSize: 14 }, style]}>눌러서 스토리보기</Animated.Text>
    </Pressable>
  );
}

function VerifyNotice({ notice, dark = false }: { notice?: string; dark?: boolean }) {
  if (!notice) return null;
  return <Text style={{ color: dark ? NAVY : '#ffffff', fontSize: 13, textAlign: 'center' }}>{notice}</Text>;
}

// 피그마 버튼 (48 높이, 둥글기 12). 누르면 97%로 살짝 눌림
function PressScaleButton({ label, onPress, loading, light = false }: { label: string; onPress: () => void; loading: boolean; light?: boolean }) {
  const pressed = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pressed.get() }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        disabled={loading}
        onPressIn={() => pressed.set(withTiming(0.97, { duration: 100 }))}
        onPressOut={() => pressed.set(withTiming(1, { duration: 150 }))}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading, busy: loading }}
        style={{
          height: 48,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: light ? 'rgba(255,253,246,0.92)' : NAVY,
          opacity: loading ? 0.6 : 1,
        }}>
        <Text style={{ color: light ? NAVY : CREAM, fontSize: 16, lineHeight: 24, fontWeight: '700' }}>
          {loading ? '확인하는 중…' : label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
