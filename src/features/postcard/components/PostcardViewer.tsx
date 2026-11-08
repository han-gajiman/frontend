import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { useAppSize, WEB_APP_MAX_WIDTH } from '@/shared/hooks/useAppSize';

import { STYLE_NAMES } from '../types';
import { type LetterText, POSTCARD_RATIO, PostcardCard } from './PostcardCard';
import { SavePostcardButton } from './SavePostcardButton';

const BOTTOM_AREA = 210; // 이름·버튼 자리

// 엽서 크게 보기 (명소 일러스트처럼 전체 화면). 누르면 뒤집히고, 원본(글 없이 앞뒷면 한 장)을 저장할 수 있습니다.
export function PostcardViewer({
  spotId,
  spotName,
  style,
  letter,
  onSend,
  onClose,
}: {
  spotId: number;
  spotName: string;
  style: number;
  letter?: LetterText;
  onSend?: () => void; // 내 엽서함에서 열었을 때 "이 엽서 보내기"
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useAppSize();
  const cardWidth = Math.min(width - 40, ((height - insets.top - insets.bottom - BOTTOM_AREA - 56) * POSTCARD_RATIO));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,0,78,0.85)' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: WEB_APP_MAX_WIDTH, backgroundColor: '#221d4a' }}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={{ position: 'absolute', top: insets.top, right: 0, zIndex: 1, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Image source={require('../../../../assets/icons/close.svg')} style={{ width: 16, height: 16 }} />
          </Pressable>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}>
            <PostcardCard spotId={spotId} style={style} letter={letter} width={cardWidth} startOnBack={!!letter} />
            <View className="items-center gap-0.5">
              <Text className="text-lg font-bold text-white">{spotName}</Text>
              <Text className="text-sm text-white/70">{STYLE_NAMES[style]} · 눌러서 뒤집기</Text>
            </View>
            <View style={{ alignSelf: 'stretch', gap: 8 }}>
              {onSend && <Button label="이 엽서 보내기" onPress={onSend} />}
              <SavePostcardButton spotId={spotId} style={style} spotName={spotName} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
