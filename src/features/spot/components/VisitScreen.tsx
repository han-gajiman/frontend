import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { createVisit } from '../api';
import { DEFAULT_BACKGROUND, spotIllustration } from '../spotIllustrations';
import type { Spot } from '../types';
import { verifyVisit } from '../verifyVisit';

const LOCKED_BLUR = 60; // 방문 전에는 무슨 그림인지 알아볼 수 없을 만큼 흐리게

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
              {!unlocked && (
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
