import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { getNotifications } from '@/features/notification/api';
import { useApi } from '@/shared/hooks/useApi';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ICON_COLOR = '#ffffff'; // 배경 위쪽은 언제나 어두운 하늘

// 홈 상단: 왼쪽에 진행 정보, 오른쪽에 알림 · 공개 범위 · 내 정보 아이콘
export function HomeHeader({
  children,
  visibility,
}: {
  children?: ReactNode; // 진행 정보 (돌탑이 없으면 비어 있음)
  visibility?: { isFriends: boolean; onPress: () => void }; // 공개 범위 아이콘 (누르면 내 돌탑 시트)
}) {
  // 알림 점: 최근 알림 중 안 읽은 게 있으면 표시 (화면에 돌아올 때마다 다시 확인)
  const notifications = useApi(getNotifications);
  const hasUnread = notifications.data?.content.some((n) => !n.isRead) ?? false;

  return (
    <View className="flex-row items-start justify-between px-6 pt-2">
      <View className="flex-1 pr-3">{children}</View>
      <View className="flex-row items-center gap-4">
        <HeaderIcon
          name="notifications-outline"
          label={hasUnread ? '알림, 새 알림 있음' : '알림'}
          dot={hasUnread}
          onPress={() => router.push('/notifications')}
        />
        {visibility && (
          <HeaderIcon
            name={visibility.isFriends ? 'people-outline' : 'lock-closed-outline'}
            label={`공개 범위: ${visibility.isFriends ? '친구 공개' : '나만 보기'}, 내 돌탑 열기`}
            onPress={visibility.onPress}
          />
        )}
        <HeaderIcon name="person-circle-outline" label="내 정보" onPress={() => router.push('/me')} />
      </View>
    </View>
  );
}

function HeaderIcon({
  name,
  label,
  onPress,
  dot = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  dot?: boolean;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={name} size={24} color={ICON_COLOR} />
      {dot && <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />}
    </Pressable>
  );
}
