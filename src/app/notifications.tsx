import { type Href, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { getNotifications, markNotificationRead } from '@/features/notification/api';
import type { AppNotification } from '@/features/notification/types';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

// 알림을 누르면 이동할 화면. 엽서(POSTCARD)는 보관함이 생기면 연결합니다.
function destinationOf(notification: AppNotification): Href | null {
  switch (notification.type) {
    case 'TOWER_COMPLETED':
    case 'NUDGE':
      return '/'; // 홈 = 돌탑
    case 'CHEER':
      return '/cheers';
    case 'YEAR_REVIEW':
      return `/collection?round=${notification.targetId}`; // targetId = 끝난 회차
    default:
      return null;
  }
}

// NOTI-01 알림함: 최신순, 안 읽은 알림은 점으로 표시. 누르면 읽음 처리 후 관련 화면으로
export default function NotificationsScreen() {
  const state = useApi(getNotifications);

  const open = async (notification: AppNotification) => {
    if (!notification.isRead) {
      // 읽음 처리에 실패해도 화면 이동은 합니다 (다음에 다시 읽음 처리됨)
      await markNotificationRead(notification.id).catch(() => undefined);
    }
    const destination = destinationOf(notification);
    if (!destination) state.reload();
    else if (destination === '/cheers') router.push(destination);
    else router.dismissTo(destination); // 홈·모아보기는 탭이라, 알림함을 닫고 그 탭으로 돌아갑니다.
  };

  return (
    <Screen title="알림" showBack scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(page) => page.content.length === 0}
        empty={<EmptyState title="아직 알림이 없어요" description="응원과 콕 찌르기, 돌탑 완성 소식이 여기에 와요." />}>
        {(page) => (
          <View className="px-6">
            {page.content.map((notification) => (
              <Pressable
                key={notification.id}
                onPress={() => open(notification)}
                className="flex-row items-start gap-3 border-b border-gray-100 py-4">
                <View className={`mt-2 h-2 w-2 rounded-full ${notification.isRead ? 'bg-transparent' : 'bg-red-500'}`} />
                <View className="flex-1 gap-1">
                  <Text className={notification.isRead ? 'text-gray-500' : 'font-semibold text-gray-900'}>
                    {notification.message}
                  </Text>
                  <Text className="text-xs text-gray-400">{formatTime(notification.createdAt)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}

// "10/28 21:05" (보낸 시각을 그대로 보여줄 뿐, 날짜 판단에는 쓰지 않음)
function formatTime(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
