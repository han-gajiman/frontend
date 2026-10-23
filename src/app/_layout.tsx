import '../global.css';

import { Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/store';

// 로그인·온보딩 상태에 따라 접근 가능한 화면을 나눕니다.
// 조건이 바뀌면 자동으로 이동합니다. (로그인 → 온보딩 → 홈)
export default function RootLayout() {
  const loggedIn = useAuthStore((s) => s.accessToken !== null);
  const onboarded = useAuthStore((s) => s.onboarded);

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
      </Stack.Protected>

      <Stack.Protected guard={loggedIn && !onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
