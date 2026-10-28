import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { getFriends } from '@/features/friend/api';
import type { Friend } from '@/features/friend/types';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// FRIEND-02 친구 목록 + 돌탑 요약
export default function FriendsScreen() {
  const state = useApi(getFriends);

  return (
    <Screen
      title="친구"
      showBack
      scroll={false}
      footer={<Button label="친구 초대하기" onPress={() => router.push('/friends/invite')} />}>
      <AsyncContent
        state={state}
        isEmpty={(page) => page.content.length === 0}
        empty={
          <EmptyState title="아직 친구가 없어요" description="초대 링크를 보내 같이 돌탑을 쌓아 보세요." />
        }>
        {(page) => (
          <View className="gap-3 px-6">
            {page.content.map((friend) => (
              <FriendCard key={friend.friendId} friend={friend} />
            ))}
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const { wish } = friend;

  return (
    <Pressable
      onPress={() => router.push(`/friends/${friend.friendId}`)}
      className="gap-1 rounded-2xl bg-gray-100 p-4">
      <Text className="text-lg font-bold text-gray-900">{friend.nickname}</Text>
      {wish ? (
        <>
          <Text className="text-gray-700">{wish.content}</Text>
          <Text className="text-sm text-gray-500">
            돌 {wish.stoneCount}/30 · {wish.stonedToday ? '오늘 쌓았어요' : '오늘 아직이에요'}
          </Text>
        </>
      ) : (
        <Text className="text-sm text-gray-400">돌탑 비공개이거나 진행 중인 돌탑이 없어요</Text>
      )}
    </Pressable>
  );
}
