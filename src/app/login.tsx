import { Text, View } from 'react-native';

import { DEV_LOGIN_ENABLED, loginForDev, loginWithGoogle, loginWithKakao } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { useSubmit } from '@/shared/hooks/useSubmit';

// AUTH-01 소셜 로그인 (카카오 + Google). 로그인되면 _layout의 guard가 온보딩/홈으로 이동시킵니다.
export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const kakao = useSubmit(loginWithKakao);
  const google = useSubmit(loginWithGoogle);
  const dev = useSubmit(loginForDev);
  const submitting = kakao.submitting || google.submitting || dev.submitting;

  const handleKakao = async () => {
    const result = await kakao.run();
    if (result.ok && result.data) signIn(result.data); // data가 null이면 사용자가 로그인 창을 닫음
  };

  const handleGoogle = async () => {
    const result = await google.run();
    if (result.ok && result.data) signIn(result.data);
  };

  const handleDev = async () => {
    const result = await dev.run();
    if (result.ok) signIn(result.data);
  };

  return (
    <Screen
      scroll={false}
      footer={
        <>
          <ErrorText error={kakao.error ?? google.error ?? dev.error} />
          {DEV_LOGIN_ENABLED && (
            <Button
              label="개발용 로그인 (로컬 서버)"
              variant="secondary"
              onPress={handleDev}
              loading={dev.submitting}
              disabled={submitting}
            />
          )}
          <Button label="카카오로 시작하기" onPress={handleKakao} loading={kakao.submitting} disabled={submitting} />
          <Button
            label="Google로 시작하기"
            variant="secondary"
            onPress={handleGoogle}
            loading={google.submitting}
            disabled={submitting}
          />
        </>
      }>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-4xl font-bold text-gray-900">한 가지만</Text>
        <Text className="text-center text-gray-500">소원 하나, 30일, 매일 돌 하나</Text>
      </View>
    </Screen>
  );
}
