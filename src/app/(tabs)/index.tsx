import { router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { usePendingInviteStore } from '@/features/friend/pendingInviteStore';
import { EmptyHome } from '@/features/home/components/EmptyHome';
import { TowerHome } from '@/features/home/components/TowerHome';
import { towerTheme } from '@/features/home/towerTheme';
import { getCurrentWish } from '@/features/wish/api';
import { AsyncContent } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// HOME-01 홈 = 돌탑 화면: 진행 중 돌탑이 있으면 바로 쌓고, 없으면 빈 홈(허허벌판에서 첫 돌)
// 화면 구성은 features/home/components (TowerHome, EmptyHome)
export default function HomeScreen() {
  const state = useApi(getCurrentWish);
  const pendingInvite = usePendingInviteStore((s) => s.code);
  const clearPendingInvite = usePendingInviteStore((s) => s.clear);

  // 로그인 전에 초대 링크로 들어왔다면, 로그인·온보딩을 마치고 홈에 오는 즉시 초대 화면으로 이어갑니다.
  useEffect(() => {
    if (!pendingInvite) return;
    clearPendingInvite();
    router.push(`/invite/${pendingInvite}`);
  }, [pendingInvite, clearPendingInvite]);

  // 저녁 하늘이면 투명 탭 바의 글자·아이콘도 밝게 (서버 응답 기준)
  const navigation = useNavigation();
  const wish = state.data;
  const evening = !!wish && wish.stonedToday && wish.status !== 'COMPLETED';
  useEffect(() => {
    const { tabActive, tabInactive } = towerTheme(evening);
    navigation.setOptions({ tabBarActiveTintColor: tabActive, tabBarInactiveTintColor: tabInactive });
  }, [navigation, evening]);

  return (
    <View className="flex-1 bg-white">
      <AsyncContent state={state} isEmpty={(wish) => wish === null} empty={<EmptyHome />}>
        {(wish) => <TowerHome key={wish!.wishId} wish={wish!} reload={state.reload} />}
      </AsyncContent>
    </View>
  );
}
