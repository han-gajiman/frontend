import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TITLE_FONT } from '@/features/intro/components/DesignCanvas';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { createVisit } from '../api';
import { DEFAULT_BACKGROUND, spotIllustration } from '../spotIllustrations';
import type { Spot } from '../types';
import { verifyVisit } from '../verifyVisit';

const LOCKED_BLUR = 60; // 방문 전에는 무슨 그림인지 알아볼 수 없을 만큼 흐리게

const FLIP = { duration: 500, easing: Easing.inOut(Easing.cubic) };
// 앞뒷면 공통: 화면을 채웁니다.
const FACE = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', backfaceVisibility: 'hidden' } as const;

const formatDistance = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);

// SPOT-03 방문 인증 화면: 방문 전에는 일러스트를 알아볼 수 없게 가리고, 인증하면 걷어 냅니다.
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
  const illustration = spotIllustration(spot.id) ?? DEFAULT_BACKGROUND;
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string>();
  const submit = useSubmit(createVisit);
  const unlocked = spot.visited;
  const [showStory, setShowStory] = useState(false);
  const flip = useSharedValue(0); // 0 = 앞면(일러스트), 180 = 뒷면(이야기)
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

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,0,78,0.85)' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: WEB_APP_MAX_WIDTH, backgroundColor: '#1b1740', overflow: 'hidden' }}>
          <Animated.View pointerEvents={showStory ? 'none' : 'auto'} style={[FACE, frontStyle]}>
            <Image
              source={illustration}
              // 흐리게 할 때 가장자리가 비치지 않도록 화면보다 조금 크게 깝니다.
              style={
                unlocked
                  ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }
                  : { position: 'absolute', top: -120, right: -120, bottom: -120, left: -120 }
              }
              contentFit="cover"
              contentPosition="bottom"
              blurRadius={unlocked ? 0 : LOCKED_BLUR}
            />
            {!unlocked && (
              <View
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(27,23,64,0.35)' }}
              />
            )}
            {spot.story && (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Pressable
                  onPress={() => flipTo(true)}
                  accessibilityRole="button"
                  className="flex-row items-center gap-2 rounded-full bg-black/35 px-5 py-3">
                  <Ionicons name="book-outline" size={18} color="#ffffff" />
                  <Text className="font-semibold text-white">눌러서 스토리보기</Text>
                </Pressable>
              </View>
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
              style={{ marginBottom: unlocked ? insets.bottom + 32 : insets.bottom + 104, marginTop: 12 }}
              className="flex-row items-center justify-center gap-2 self-center rounded-full bg-white/20 px-5 py-3">
              <Ionicons name="image-outline" size={18} color="#ffffff" />
              <Text className="font-semibold text-white">눌러서 돌아가기</Text>
            </Pressable>
          </Animated.View>

          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 1 }}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>

          <View pointerEvents="box-none" style={{ flex: 1, justifyContent: 'flex-end', gap: 16, padding: 24, paddingBottom: insets.bottom + 32 }}>
            <View className="items-center gap-2">
              {!showStory && <Text className="text-center text-xl font-bold text-white">{spot.name}</Text>}
              {!unlocked && !showStory && (
                <Text className="text-center text-base text-white">
                  방문 시 명소의 풍경을 담은{'\n'}한정 일러스트가 해제됩니다.
                </Text>
              )}
            </View>
            {!unlocked && (
              <View className="gap-3">
                {notice && <Text className="text-center text-sm text-white">{notice}</Text>}
                <ErrorText error={submit.error} />
                <Button label="방문인증하기" onPress={handleVerify} loading={checking || submit.submitting} />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
