import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { getCheers } from '@/features/friend/api';
import { getCurrentWish } from '@/features/wish/api';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// FRIEND-03 내 돌탑에 받은 응원 (진행 중 돌탑 기준)
export default function MyCheersScreen() {
  const wish = useApi(getCurrentWish);

  return (
    <Screen title="받은 응원" showBack scroll={false}>
      <AsyncContent
        state={wish}
        isEmpty={(w) => w === null}
        empty={<EmptyState title="진행 중인 돌탑이 없어요" />}>
        {(w) => <CheerList wishId={w!.wishId} />}
      </AsyncContent>
    </Screen>
  );
}

function CheerList({ wishId }: { wishId: number }) {
  const fetchCheers = useCallback(() => getCheers(wishId), [wishId]);
  const cheers = useApi(fetchCheers);

  return (
    <AsyncContent
      state={cheers}
      isEmpty={(page) => page.content.length === 0}
      empty={<EmptyState title="아직 받은 응원이 없어요" description="친구를 초대하면 응원을 받을 수 있어요." />}>
      {(page) => (
        <View className="gap-2 px-6">
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
