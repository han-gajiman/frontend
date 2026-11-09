import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { useApi } from '@/shared/hooks/useApi';

import { getPostcards } from '../api';
import { STYLE_NAMES, STYLES_PER_SPOT, TOTAL_POSTCARDS, type Postcard } from '../types';
import { PostcardCard } from './PostcardCard';

// 방문 인증으로 새 엽서를 받았을 때. 그 명소에서 몇 장, 전체에서 몇 장 모았는지 함께 보여줍니다.
// onLeave: 우체통으로 갈 때 이 창을 띄운 화면(명소 일러스트 전체 화면 등)도 닫아야 하면 넘겨 주세요.
// 그 화면이 모달이라 닫지 않으면 우체통으로 이동해도 계속 위를 덮고 있습니다.
export function NewPostcardDialog({
  postcard,
  onClose,
  onLeave,
}: {
  postcard: Postcard;
  onClose: () => void;
  onLeave?: () => void;
}) {
  const { data } = useApi(getPostcards);
  const spotCount = data?.filter((p) => p.spotId === postcard.spotId).length;

  return (
    <Dialog onClose={onClose}>
      <View className="items-center gap-1">
        <Text className="text-lg font-bold text-gray-900">새 엽서를 받았어요</Text>
        <Text className="text-center font-semibold text-gray-800">
          {postcard.spotName}
          {data && (
            <Text className="font-normal text-gray-500">
              {'  '}
              {spotCount} of {STYLES_PER_SPOT} · 전체 {data.length} of {TOTAL_POSTCARDS}
            </Text>
          )}
        </Text>
        <Text className="text-xs text-gray-400">{STYLE_NAMES[postcard.style]}</Text>
      </View>
      <View className="items-center">
        <PostcardCard spotId={postcard.spotId} style={postcard.style} width={180} />
      </View>
      <Button
        label="우체통에서 보기"
        onPress={() => {
          onClose();
          onLeave?.();
          router.push('/mailbox?tab=collection');
        }}
      />
      <Button label="닫기" variant="secondary" onPress={onClose} />
    </Dialog>
  );
}
