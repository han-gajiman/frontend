import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { usePendingInviteStore } from '@/features/friend/pendingInviteStore';
import { getCurrentWish } from '@/features/wish/api';
import type { CurrentWish } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// HOME-01 홈: 진행 중 돌탑이 있으면 요약, 없으면 빈 홈
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

  return (
    <Screen scroll={false}>
      <View className="h-12 flex-row items-center justify-between px-6">
        <Text className="text-lg font-bold text-gray-900">한 가지만</Text>
        <View className="flex-row gap-4">
          <HeaderLink label="친구" onPress={() => router.push('/friends')} />
          <HeaderLink label="명소" onPress={() => router.push('/spots')} />
          <HeaderLink label="모아보기" onPress={() => router.push('/collection')} />
          <HeaderLink label="내 정보" onPress={() => router.push('/me')} />
          {/* TODO(NOTI-01): 알림함 진입점 */}
        </View>
      </View>

      <AsyncContent
        state={state}
        isEmpty={(wish) => wish === null}
        empty={
          <EmptyState
            title="아직 쌓고 있는 돌탑이 없어요"
            description="소원 하나를 정하고 30일 동안 매일 돌을 쌓아 보세요."
            actionLabel="새 소원 시작하기"
            onAction={() => router.push('/wish/new')}
          />
        }>
        {(wish) => <TowerSummary wish={wish!} />}
      </AsyncContent>
    </Screen>
  );
}

function TowerSummary({ wish }: { wish: CurrentWish }) {
  const completed = wish.status === 'COMPLETED';

  return (
    <View className="flex-1 justify-between px-6 pb-4">
      <View className="gap-4 pt-6">
        <Text className="text-sm text-gray-500">{wish.spot.name}</Text>
        <Text className="text-2xl font-bold text-gray-900">{wish.content}</Text>
        <Text className="text-gray-600">{wish.actionGoal}</Text>

        <View className="mt-4 flex-row gap-3">
          <Stat value={wish.stoneCount} label="쌓은 돌" />
          <Stat value={wish.daysLeft} label="남은 날" />
        </View>

        <Text className="text-center text-gray-500">
          {completed
            ? '30일이 지났어요. 돌탑을 돌아볼 시간이에요.'
            : wish.stonedToday
              ? '오늘의 돌을 쌓았어요'
              : '오늘의 돌을 아직 쌓지 않았어요'}
        </Text>
      </View>

      {completed ? (
        <Button label="완성 회고하기" onPress={() => router.push('/reflection')} />
      ) : (
        <Button label="돌탑 보러 가기" onPress={() => router.push('/tower')} />
      )}
    </View>
  );
}

function HeaderLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text className="text-gray-500">{label}</Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-gray-100 p-4">
      <Text className="text-3xl font-bold text-gray-900">{value}</Text>
      <Text className="text-gray-500">{label}</Text>
    </View>
  );
}
