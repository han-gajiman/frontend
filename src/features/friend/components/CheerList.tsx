import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

import { getCheers } from '../api';

// FRIEND-03 돌탑에 받은 응원 목록 (받은 응원 화면, 내 돌탑 시트)
export function CheerList({ wishId }: { wishId: number }) {
  const fetchCheers = useCallback(() => getCheers(wishId), [wishId]);
  const cheers = useApi(fetchCheers);

  return (
    <AsyncContent
      state={cheers}
      isEmpty={(page) => page.content.length === 0}
      empty={<EmptyState title="아직 받은 응원이 없어요" description="친구를 초대하면 응원을 받을 수 있어요." />}>
      {(page) => (
        <View className="gap-2">
          {page.content.map((cheer) => (
            <View key={cheer.cheerId} className="gap-1 rounded-xl bg-gray-100 p-4">
              <Text className="text-sm text-gray-500">{cheer.writerNickname ?? '익명의 소원지기'}</Text>
              <Text className="text-base text-gray-900">{cheer.message}</Text>
            </View>
          ))}
        </View>
      )}
    </AsyncContent>
  );
}
