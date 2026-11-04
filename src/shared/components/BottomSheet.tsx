import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

const DURATION = 240;
const OFFSCREEN = 600; // 닫혔을 때 시트가 내려가 있는 거리

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// 아래에서 올라오는 시트. 라이브러리 없이 Modal + Reanimated 시간 기반 애니메이션으로 만듭니다.
// 웹에서는 Modal이 앱 영역 밖에 그려지므로 폭을 앱 최대 너비로 제한합니다. 내용은 열려 있을 때만 그립니다.
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(visible ? 1 : 0, { duration: DURATION, easing: Easing.out(Easing.cubic) }));
    if (visible) return;
    // 닫히는 애니메이션이 끝난 뒤 내림
    const timer = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(timer);
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * OFFSCREEN }],
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(16,0,78,0.35)' },
            backdropStyle,
          ]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="닫기" />
        </Animated.View>

        <Animated.View
          style={[
            {
              alignSelf: 'center',
              width: '100%',
              maxWidth: WEB_APP_MAX_WIDTH,
              maxHeight: '80%',
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: insets.bottom + 16,
            },
            sheetStyle,
          ]}>
          <View className="flex-row items-center justify-between px-6 pb-2 pt-5">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="닫기">
              <Ionicons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="gap-6 px-6 pb-2 pt-2" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
