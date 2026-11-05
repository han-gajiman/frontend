import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

import { DEFAULT_BACKGROUND, spotIllustration } from '../spotIllustrations';
import type { Spot } from '../types';

const LOCKED_BLUR = 60; // 방문 전에는 무슨 그림인지 알아볼 수 없을 만큼 흐리게

// SPOT-03 방문 인증 화면: 방문 전에는 일러스트를 알아볼 수 없게 뿌옇게 가리고, 방문한 곳은 원래대로 보여줍니다.
// TODO(SPOT-03): 앱에서 반경 안인지 계산해 인증 결과만 서버로 보냅니다. 그 전까지 "방문인증하기"는 막아 둡니다.
export function VisitScreen({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const illustration = spotIllustration(spot.id) ?? DEFAULT_BACKGROUND;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,0,78,0.85)' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: WEB_APP_MAX_WIDTH, backgroundColor: '#1b1740', overflow: 'hidden' }}>
          <Image
            source={illustration}
            // 흐리게 할 때 가장자리가 비치지 않도록 화면보다 조금 크게 깝니다.
            style={
              spot.visited
                ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }
                : { position: 'absolute', top: -120, right: -120, bottom: -120, left: -120 }
            }
            contentFit="cover"
            contentPosition="bottom"
            blurRadius={spot.visited ? 0 : LOCKED_BLUR}
          />
          {!spot.visited && (
            <View
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(27,23,64,0.35)' }}
            />
          )}

          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 1 }}>
            <Ionicons name="close" size={28} color="#ffffff" />
          </Pressable>

          <View style={{ flex: 1, justifyContent: 'flex-end', gap: 16, padding: 24, paddingBottom: insets.bottom + 32 }}>
            <View className="items-center gap-2">
              <Text className="text-center text-xl font-bold text-white">{spot.name}</Text>
              {!spot.visited && (
                <Text className="text-center text-base text-white">방문 시 한정 일러스트가 해제됩니다.</Text>
              )}
            </View>
            {!spot.visited && <Button label="방문인증하기" onPress={() => undefined} disabled />}
          </View>
        </View>
      </View>
    </Modal>
  );
}
