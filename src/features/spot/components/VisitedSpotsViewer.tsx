import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

import { DEFAULT_BACKGROUND, spotIllustration } from '../spotIllustrations';

export type VisitedSpot = { spotId: number; spotName: string; visitedOn: string };

// 다녀온 명소의 일러스트와 방문일을 한 장씩 봅니다. (명소 탭의 일러스트 보기와 같은 모양)
export function VisitedSpotsViewer({ visits, onClose }: { visits: VisitedSpot[]; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const visit = visits[index];
  const move = (step: number) => setIndex((index + step + visits.length) % visits.length);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,0,78,0.85)' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: WEB_APP_MAX_WIDTH, backgroundColor: '#1b1740', overflow: 'hidden' }}>
          <Image
            source={spotIllustration(visit.spotId) ?? DEFAULT_BACKGROUND}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            contentFit="cover"
            contentPosition="bottom"
          />
          <LinearGradient
            colors={['rgba(27,23,64,0)', 'rgba(27,23,64,0.6)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%' }}
          />

          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 1 }}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>

          <View
            className="flex-row items-center gap-3"
            style={{ flex: 1, alignItems: 'flex-end', padding: 24, paddingBottom: insets.bottom + 32 }}>
            {visits.length > 1 && <ViewerArrow icon="chevron-back" label="이전 명소" onPress={() => move(-1)} />}
            <View className="flex-1 items-center gap-1">
              <Text className="text-center text-xl font-bold text-white">{visit.spotName}</Text>
              <Text className="text-center text-base text-white">{visit.visitedOn.replaceAll('-', '.')} 방문</Text>
              {visits.length > 1 && (
                <Text className="text-sm text-white">
                  {index + 1} / {visits.length}
                </Text>
              )}
            </View>
            {visits.length > 1 && <ViewerArrow icon="chevron-forward" label="다음 명소" onPress={() => move(1)} />}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ViewerArrow({
  icon,
  label,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-11 w-11 items-center justify-center rounded-full bg-white/30">
      <Ionicons name={icon} size={22} color="white" />
    </Pressable>
  );
}
