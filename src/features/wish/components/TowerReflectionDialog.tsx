import { ScrollView, Text, View } from 'react-native';

import { StoneLogList } from '@/features/stone/components/StoneLogList';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';

import { RESULT_LABEL } from '../towerLabels';
import type { WishSummary } from '../types';

// 돌탑의 30일 회고. 회고 전(COMPLETED)이면 result가 null입니다.
export function TowerReflectionDialog({ wish, onClose }: { wish: WishSummary; onClose: () => void }) {
  const emptyText = wish.result ? '남긴 회고가 없어요' : '아직 회고 전이에요';

  return (
    <Dialog onClose={onClose}>
      <View className="gap-1">
        <Text className="text-sm text-gray-500">
          30일 회고{wish.result ? ` · ${RESULT_LABEL[wish.result]}` : ''}
        </Text>
        <Text className="text-lg font-bold text-gray-900">{wish.content}</Text>
      </View>
      <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 20 }}>
        <Text className={wish.reflection ? 'text-lg leading-7 text-gray-900' : 'text-gray-500'}>
          {wish.reflection ?? emptyText}
        </Text>
        <StoneLogList wishId={wish.wishId} />
      </ScrollView>
      <Button label="닫기" variant="secondary" onPress={onClose} />
    </Dialog>
  );
}
