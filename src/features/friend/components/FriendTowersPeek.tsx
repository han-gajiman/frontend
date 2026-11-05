import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { MiniTower } from '@/features/stone/components/MiniTower';
import { useApi } from '@/shared/hooks/useApi';
import { useAppSize } from '@/shared/hooks/useAppSize';

import { getFriends } from '../api';

const MAX_FRIENDS = 3;
const SCALE = 0.2; // 멀리 있는 것처럼 작게
const MIN_SCREEN_HEIGHT = 700; // 이보다 작은 화면에서는 내 돌탑 자리를 위해 숨김
// 내 돌탑(가운데)을 피해 양옆 멀리에 둡니다
const POSITIONS = [{ left: 12 }, { right: 12 }, { left: 64 }];

// 홈 돌탑 옆 멀리에 친구 돌탑 2~3개를 작게 보여줍니다. 누르면 친구 돌탑 화면으로.
// 친구 공개 돌탑이 있는 친구만 보여주고, 없거나 불러오는 중·에러면 아무것도 그리지 않습니다. (보조 내용이라 자리를 비워 두지 않음)
export function FriendTowersPeek({ bottom }: { bottom: number }) {
  const { height } = useAppSize();
  const { data } = useApi(getFriends);
  const friends = (data?.content ?? []).filter((f) => f.wish !== null).slice(0, MAX_FRIENDS);

  if (friends.length === 0 || height < MIN_SCREEN_HEIGHT) return null;

  return (
    <>
      {friends.map((friend, i) => (
        <Pressable
          key={friend.friendId}
          onPress={() => router.push(`/friends/${friend.friendId}`)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${friend.nickname}의 돌탑, 돌 ${friend.wish!.stoneCount}개`}
          style={{ position: 'absolute', bottom, opacity: 0.85, alignItems: 'center', ...POSITIONS[i] }}>
          <Text className="mb-1 text-[10px] font-semibold text-white" style={{ textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 3 }}>
            {friend.nickname}
          </Text>
          <MiniTower count={friend.wish!.stoneCount} scale={SCALE} />
        </Pressable>
      ))}
    </>
  );
}
