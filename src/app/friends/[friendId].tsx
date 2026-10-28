import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { getCheers, getFriends, nudge, writeCheer } from '@/features/friend/api';
import { CHEER_MAX_LENGTH, type Friend } from '@/features/friend/types';
import { StoneTower } from '@/features/stone/components/StoneTower';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { TextField } from '@/shared/components/TextField';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

// FRIEND-02 친구 돌탑 보기 + FRIEND-03 응원 + FRIEND-04 콕 찌르기
// 친구 한 명을 조회하는 API가 없어 친구 목록에서 찾습니다.
export default function FriendTowerScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const state = useApi(getFriends);

  return (
    <Screen title="친구 돌탑" showBack>
      <AsyncContent
        state={state}
        isEmpty={(page) => !page.content.some((f) => String(f.friendId) === friendId)}
        empty={<EmptyState title="친구를 찾을 수 없어요" />}>
        {(page) => <FriendTower friend={page.content.find((f) => String(f.friendId) === friendId)!} />}
      </AsyncContent>
    </Screen>
  );
}

function FriendTower({ friend }: { friend: Friend }) {
  const { wish } = friend;

  if (!wish) {
    return (
      <View className="gap-2 py-10">
        <Text className="text-center text-xl font-bold text-gray-900">{friend.nickname}</Text>
        <Text className="text-center text-gray-500">돌탑 비공개이거나 진행 중인 돌탑이 없어요.</Text>
      </View>
    );
  }

  return (
    <View className="gap-6">
      <View className="gap-1">
        <Text className="text-sm text-gray-500">
          {friend.nickname} · 돌 {wish.stoneCount}/30
        </Text>
        <Text className="text-xl font-bold text-gray-900">{wish.content}</Text>
      </View>

      <View className="h-72">
        <StoneTower count={wish.stoneCount} stonedToday={wish.stonedToday} completed={false} backgroundImageUrl={null} />
      </View>

      <NudgeButton friendId={friend.friendId} stonedToday={wish.stonedToday} nickname={friend.nickname} />
      <Cheers wishId={wish.wishId} />
    </View>
  );
}

function NudgeButton({ friendId, stonedToday, nickname }: { friendId: number; stonedToday: boolean; nickname: string }) {
  const { run, submitting, error } = useSubmit(nudge);
  const [done, setDone] = useState(false);

  if (stonedToday) {
    return <Text className="text-center text-gray-500">{nickname}님은 오늘의 돌을 쌓았어요</Text>;
  }

  const handleNudge = async () => {
    const result = await run(friendId);
    if (result.ok) setDone(true);
  };

  return (
    <View className="gap-2">
      <ErrorText error={error} />
      {done ? (
        <Text className="text-center font-semibold text-gray-900">콕 찔렀어요! 오늘은 더 찌를 수 없어요</Text>
      ) : (
        <Button label={`${nickname}님 콕 찌르기`} variant="secondary" onPress={handleNudge} loading={submitting} />
      )}
    </View>
  );
}

function Cheers({ wishId }: { wishId: number }) {
  const fetchCheers = useCallback(() => getCheers(wishId), [wishId]);
  const cheers = useApi(fetchCheers);
  const write = useSubmit(writeCheer);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    const result = await write.run(wishId, message.trim());
    if (result.ok) {
      setMessage('');
      cheers.reload();
    }
  };

  return (
    <View className="gap-3">
      <Text className="text-lg font-bold text-gray-900">응원</Text>
      <TextField
        label="응원 한마디"
        value={message}
        onChangeText={setMessage}
        placeholder="오늘도 하나 쌓자!"
        maxLength={CHEER_MAX_LENGTH}
      />
      <ErrorText error={write.error} />
      <Button label="응원 보내기" onPress={handleSend} disabled={message.trim().length === 0} loading={write.submitting} />

      <View className="min-h-24">
        <AsyncContent
          state={cheers}
          isEmpty={(page) => page.content.length === 0}
          empty={<Text className="py-4 text-center text-gray-400">첫 응원을 남겨 보세요</Text>}>
          {(page) => (
            <View className="gap-2">
              {page.content.map((cheer) => (
                <View key={cheer.cheerId} className="gap-1 rounded-xl bg-gray-100 p-3">
                  <Text className="text-sm text-gray-500">{cheer.writerNickname ?? '익명의 소원지기'}</Text>
                  <Text className="text-gray-900">{cheer.message}</Text>
                </View>
              ))}
            </View>
          )}
        </AsyncContent>
      </View>
    </View>
  );
}
