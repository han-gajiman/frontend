import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { TITLE_FONT_BOLD } from '@/features/intro/components/DesignCanvas';
import { getNotifications } from '@/features/notification/api';
import { useApi } from '@/shared/hooks/useApi';

// 홈 상단: 서비스 이름 + 메뉴 링크
// 🟡 하단 탭(홈/명소/친구/내 정보) + 알림 종 아이콘으로 바꿀지는 팀 결정 대기. 그 전까지 텍스트 링크 유지
export function HomeHeader({ light = false }: { light?: boolean }) {
  // 알림 점: 최근 알림 중 안 읽은 게 있으면 표시 (화면에 돌아올 때마다 다시 확인)
  const notifications = useApi(getNotifications);
  const hasUnread = notifications.data?.content.some((n) => !n.isRead) ?? false;

  return (
    <View className="h-12 flex-row items-center justify-between px-6">
      <Text style={{ fontFamily: TITLE_FONT_BOLD }} className={`text-lg ${light ? 'text-white' : 'text-gray-900'}`}>
        한 가지만
      </Text>
      <View className="flex-row gap-3">
        <HeaderLink label="알림" light={light} onPress={() => router.push('/notifications')} dot={hasUnread} />
        <HeaderLink label="친구" light={light} onPress={() => router.push('/friends')} />
        <HeaderLink label="명소" light={light} onPress={() => router.push('/spots')} />
        <HeaderLink label="모아보기" light={light} onPress={() => router.push('/collection')} />
        <HeaderLink label="내 정보" light={light} onPress={() => router.push('/me')} />
      </View>
    </View>
  );
}

function HeaderLink({
  label,
  onPress,
  light,
  dot = false,
}: {
  label: string;
  onPress: () => void;
  light: boolean;
  dot?: boolean;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityLabel={dot ? `${label}, 새 알림 있음` : label}>
      <Text className={light ? 'text-white/80' : 'text-gray-600'}>{label}</Text>
      {dot && <View className="absolute -right-1.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
    </Pressable>
  );
}
