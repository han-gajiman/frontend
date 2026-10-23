import { Text, View } from 'react-native';

import { loginWithKakao } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { useSubmit } from '@/shared/hooks/useSubmit';

// AUTH-01 소셜 로그인. 로그인되면 _layout의 guard가 온보딩/홈으로 이동시킵니다.
export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const { run, submitting, error } = useSubmit(loginWithKakao);

  const handleKakao = async () => {
    // TODO(AUTH-01): 카카오 SDK로 받은 토큰 전달 (목 모드에서는 아무 값이나 됨)
    const result = await run('kakao-sdk-token');
    if (result.ok) signIn(result.data);
  };

  return (
    <Screen
      scroll={false}
      footer={
        <>
          <ErrorText error={error} />
          <Button label="카카오로 시작하기" onPress={handleKakao} loading={submitting} />
          {/* 🟡 Apple 로그인 범위 미정 (iOS 앱스토어 배포 여부에 따라 결정) */}
        </>
      }>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-4xl font-bold text-gray-900">한 가지만</Text>
        <Text className="text-center text-gray-500">소원 하나, 30일, 매일 돌 하나</Text>
      </View>
    </Screen>
  );
}
