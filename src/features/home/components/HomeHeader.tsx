import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TITLE_FONT_BOLD } from '@/features/intro/components/DesignCanvas';
import { getNotifications } from '@/features/notification/api';
import { useApi } from '@/shared/hooks/useApi';

type IconName = ComponentProps<typeof Ionicons>['name'];

// 홈 상단: 서비스 이름 + 알림·내 정보 아이콘
export function HomeHeader({ light = false }: { light?: boolean }) {
  // 알림 점: 최근 알림 중 안 읽은 게 있으면 표시 (화면에 돌아올 때마다 다시 확인)
  const notifications = useApi(getNotifications);
  const hasUnread = notifications.data?.content.some((n) => !n.isRead) ?? false;
  const color = light ? '#ffffff' : '#374151';

  return (
    <View className="h-12 flex-row items-center justify-between px-6">
      <Text style={{ fontFamily: TITLE_FONT_BOLD }} className={`text-lg ${light ? 'text-white' : 'text-gray-900'}`}>
        한 가지만
      </Text>
      <View className="flex-row items-center gap-4">
        <HeaderIcon
          name="notifications-outline"
          color={color}
          label={hasUnread ? '알림, 새 알림 있음' : '알림'}
          dot={hasUnread}
          onPress={() => router.push('/notifications')}
        />
        <HeaderIcon name="person-circle-outline" color={color} label="내 정보" onPress={() => router.push('/me')} />
      </View>
    </View>
  );
}

function HeaderIcon({
  name,
  color,
  label,
  onPress,
  dot = false,
}: {
  name: IconName;
  color: string;
  label: string;
  onPress: () => void;
  dot?: boolean;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={name} size={24} color={color} />
      {dot && <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />}
    </Pressable>
  );
}
