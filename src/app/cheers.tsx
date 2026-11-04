import { View } from 'react-native';

import { CheerList } from '@/features/friend/components/CheerList';
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
        {(w) => (
          <View className="flex-1 px-6">
            <CheerList wishId={w!.wishId} />
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}
