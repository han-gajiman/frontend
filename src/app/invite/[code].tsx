import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { acceptInvite } from '@/features/friend/api';
import { usePendingInviteStore } from '@/features/friend/pendingInviteStore';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { useSubmit } from '@/shared/hooks/useSubmit';

// FRIEND-01 초대 링크로 앱이 열린 경우 (/invite/{code}). 로그인 여부와 상관없이 열리는 화면입니다.
// 로그인·온보딩 전이면 코드를 기억해 두고 로그인으로 보내고, 홈에 도착하면 다시 이 화면으로 돌아옵니다.
export default function InviteLinkScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const ready = useAuthStore((s) => s.accessToken !== null && s.onboarded);
  const setPending = usePendingInviteStore((s) => s.setCode);

  useEffect(() => {
    if (!ready && code) setPending(code);
  }, [ready, code, setPending]);

  if (!ready) return <Redirect href="/" />;
  return <AcceptInvite code={code} />;
}

function AcceptInvite({ code }: { code: string }) {
  const { run, submitting, error } = useSubmit(acceptInvite);
  const [friendName, setFriendName] = useState<string | null>(null);

  const handleAccept = async () => {
    const result = await run(code);
    if (result.ok) setFriendName(result.data.nickname);
  };

  return (
    <Screen
      scroll={false}
      footer={
        friendName ? (
          <Button label="친구 목록 보기" onPress={() => router.replace('/friends')} />
        ) : (
          <>
            <ErrorText error={error} />
            <Button label="초대 수락하기" onPress={handleAccept} loading={submitting} />
            <Button label="나중에 할게요" variant="secondary" onPress={() => router.replace('/')} />
          </>
        )
      }>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-2xl font-bold text-gray-900">
          {friendName ? `${friendName}님과 친구가 됐어요!` : '친구 초대를 받았어요'}
        </Text>
        <Text className="text-center text-gray-500">
          {friendName ? '서로의 돌탑을 보고 응원할 수 있어요.' : '수락하면 서로의 돌탑을 보고 응원할 수 있어요.'}
        </Text>
      </View>
    </Screen>
  );
}
