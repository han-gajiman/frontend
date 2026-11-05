import type { ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

// 화면 가운데 뜨는 창. 바깥을 누르거나 안드로이드 뒤로 가기로 닫힙니다.
// Modal은 웹의 폰 틀 밖에 그려지므로 너비를 직접 제한합니다.
export function Dialog({ onClose, children }: { onClose: () => void; children: ReactNode }) {
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
            maxHeight: '80%',
            gap: 16,
            padding: 24,
            borderRadius: 24,
            backgroundColor: 'white',
          }}>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
