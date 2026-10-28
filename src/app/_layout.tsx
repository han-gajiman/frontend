import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store';

// 로그인·온보딩 상태에 따라 접근 가능한 화면을 나눕니다.
// 조건이 바뀌면 자동으로 이동합니다. (로그인 → 온보딩 → 홈)
export default function RootLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const loggedIn = useAuthStore((s) => s.accessToken !== null);
  const onboarded = useAuthStore((s) => s.onboarded);

  // 기기에 저장된 로그인 상태를 먼저 불러옵니다. (불러오기 전에 화면을 정하면 로그인 화면이 잠깐 보임)
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={loggedIn && onboarded}>
        <Stack.Screen name="index" />
        <Stack.Screen name="wish/new" />
        <Stack.Screen name="wish/spot" />
        <Stack.Screen name="wish/confirm" />
        <Stack.Screen name="tower" />
        <Stack.Screen name="reflection" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="spots" />
        <Stack.Screen name="me" />
        <Stack.Screen name="friends/index" />
        <Stack.Screen name="friends/invite" />
        <Stack.Screen name="friends/[friendId]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="cheers" />
      </Stack.Protected>

      {/* 초대 링크는 로그인 전에도 열려야 해서 보호 밖에 둡니다 (화면 안에서 로그인 여부 확인) */}
      <Stack.Screen name="invite/[code]" />

      <Stack.Protected guard={loggedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
