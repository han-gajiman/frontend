import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { towerTheme } from '@/features/home/towerTheme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_BAR_CONTENT_HEIGHT = 56;
const TAB_BAR_BORDER = 1; // 명소·친구·모아보기의 위쪽 선. 그만큼 키워서 탭을 옮겨도 아이콘과 글자가 움직이지 않게 합니다.

function tabIcon(name: IconName) {
  // 탭 바는 위 screenOptions의 문자열 색을 넘겨줍니다.
  return function TabIcon({ color, size }: { color: unknown; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };
}

// 하단 탭: 홈 · 명소 · 친구 · 모아보기. 홈 탭의 탭 바만 배경 위에 투명하게 떠 있습니다.
// 저녁 하늘일 때 탭 색은 홈 화면이 setOptions로 바꿉니다. 떠 있는 탭 바에 가리지 않도록 홈은 useBottomTabBarHeight로 여백을 줍니다.
export default function TabsLayout() {
  const { tabActive, tabInactive } = towerTheme(false);
  const insets = useSafeAreaInsets();
  const height = TAB_BAR_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabActive,
        tabBarInactiveTintColor: tabInactive,
        tabBarHideOnKeyboard: true, // 안드로이드에서 키보드 위로 탭 바가 따라 올라와 입력칸을 가리지 않게
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14 }, // 줄 높이를 넉넉히 줘서 글자가 잘리지 않게
        tabBarStyle: { height: height + TAB_BAR_BORDER, borderTopWidth: TAB_BAR_BORDER },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: tabIcon('home-outline'),
          tabBarStyle: {
            position: 'absolute',
            height,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Tabs.Screen name="spots" options={{ title: '명소', tabBarIcon: tabIcon('map-outline') }} />
      <Tabs.Screen name="friends" options={{ title: '친구', tabBarIcon: tabIcon('people-outline') }} />
      <Tabs.Screen name="collection" options={{ title: '모아보기', tabBarIcon: tabIcon('albums-outline') }} />
    </Tabs>
  );
}
