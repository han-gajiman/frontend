import "../global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { useAuthStore } from "@/features/auth/store";
import { useIntroStore } from "@/features/intro/store";
import { WEB_APP_MAX_WIDTH } from "@/shared/hooks/useAppSize";

// 로그인·온보딩 상태에 따라 접근 가능한 화면을 나눕니다.
// 조건이 바뀌면 자동으로 이동합니다. (인트로 → 로그인 → 온보딩 → 홈)
export default function RootLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const loggedIn = useAuthStore((s) => s.accessToken !== null);
  const onboarded = useAuthStore((s) => s.onboarded);
  const introPassed = useIntroStore((s) => s.passed);

  // 제목용 고운바탕 (assets/fonts: 자주 쓰는 한글 2,350자 + 영문·기호만 남겨 용량을 줄인 파일)
  const [fontsLoaded, fontError] = useFonts({
    GowunBatang: require("../../assets/fonts/GowunBatang_400Regular.ttf"),
    "GowunBatang-Bold": require("../../assets/fonts/GowunBatang_700Bold.ttf"),
  });

  // 기기에 저장된 로그인 상태를 먼저 불러옵니다. (불러오기 전에 화면을 정하면 인트로가 잠깐 보임)
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // 글꼴을 못 불러와도(fontError) 시스템 글꼴로 계속 진행합니다.
  if (!hydrated || !(fontsLoaded || fontError)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebPhoneFrame>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={loggedIn && onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="wish/new" />
          <Stack.Screen name="wish/spot" />
          <Stack.Screen name="wish/confirm" />
          <Stack.Screen name="reflection" />
          <Stack.Screen name="me" />
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

        {/* 로그인 전에는 인트로부터 (로그아웃·탈퇴해도 다시 인트로), 인트로를 넘기면 로그인 */}
        <Stack.Protected guard={!loggedIn && !introPassed}>
          <Stack.Screen name="intro" />
        </Stack.Protected>

        <Stack.Protected guard={!loggedIn && introPassed}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="find-account" />
        </Stack.Protected>
      </Stack>
    </WebPhoneFrame>
  );
}

// 웹에서는 넓은 창에서도 폰 화면처럼 보이게 가운데 폰 너비 영역에만 앱을 그립니다. 폰에서는 그대로.
// (화면 크기가 필요하면 useWindowDimensions 대신 useAppSize를 쓰세요)
function WebPhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return children;
  return (
    <View className="flex-1 items-center bg-[#eeebf5]">
      <View
        className="w-full flex-1 overflow-hidden bg-white"
        style={{ maxWidth: WEB_APP_MAX_WIDTH }}
      >
        {children}
      </View>
    </View>
  );
}
