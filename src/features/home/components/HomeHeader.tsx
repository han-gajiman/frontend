import { Ionicons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TITLE_FONT_BOLD } from '@/features/intro/components/DesignCanvas';
import { getNotifications } from '@/features/notification/api';
import { BottomSheet } from '@/shared/components/BottomSheet';
import { useApi } from '@/shared/hooks/useApi';

type IconName = ComponentProps<typeof Ionicons>['name'];

// TODO(하단 탭): 탭이 생기면 ☰ 메뉴를 지웁니다. 그 전까지 친구·명소·모아보기로 가는 임시 입구입니다.
const MENU: { label: string; icon: IconName; href: Href }[] = [
  { label: '명소', icon: 'map-outline', href: '/spots' },
  { label: '친구', icon: 'people-outline', href: '/friends' },
  { label: '돌탑 모아보기', icon: 'albums-outline', href: '/collection' },
];

// 홈 상단: 서비스 이름 + 알림·내 정보 아이콘
export function HomeHeader({ light = false }: { light?: boolean }) {
  // 알림 점: 최근 알림 중 안 읽은 게 있으면 표시 (화면에 돌아올 때마다 다시 확인)
  const notifications = useApi(getNotifications);
  const hasUnread = notifications.data?.content.some((n) => !n.isRead) ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const color = light ? '#ffffff' : '#374151';

  const go = (href: Href) => {
    setMenuOpen(false);
    router.push(href);
  };

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
        <HeaderIcon name="menu-outline" color={color} label="메뉴" onPress={() => setMenuOpen(true)} />
      </View>

      <BottomSheet visible={menuOpen} onClose={() => setMenuOpen(false)} title="메뉴">
        <View className="gap-1">
          {MENU.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => go(item.href)}
              accessibilityRole="link"
              className="flex-row items-center gap-3 py-3">
              <Ionicons name={item.icon} size={22} color="#374151" />
              <Text className="text-base text-gray-900">{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
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
