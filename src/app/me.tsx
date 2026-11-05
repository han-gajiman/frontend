import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { logout } from '@/features/auth/api';
import { signOutSocial } from '@/features/auth/social';
import { useAuthStore } from '@/features/auth/store';
import { deleteAccount, getMe } from '@/features/user/api';
import type { Me } from '@/features/user/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

const PROVIDER_LABEL = { KAKAO: '카카오 계정으로 로그인', GOOGLE: 'Google 계정으로 로그인', LOCAL: '이메일로 로그인' } as const;

// AUTH-04 내 정보 + AUTH-06 탈퇴 + 로그아웃
// TODO(AUTH-04): 푸시 토큰 등록은 알림(NOTI-01) 구현 때 추가
export default function MeScreen() {
  const state = useApi(getMe);

  return (
    <Screen title="내 정보" showBack scroll={false}>
      <AsyncContent state={state}>{(me) => <MeContent me={me} reload={state.reload} />}</AsyncContent>
    </Screen>
  );
}

function MeContent({ me, reload }: { me: Me; reload: () => void }) {
  const { refreshToken, signOut } = useAuthStore();
  const withdraw = useSubmit(deleteAccount);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleLogout = async () => {
    // 서버 폐기에 실패해도 앱에서는 로그아웃
    if (refreshToken) await logout(refreshToken).catch(() => undefined);
    await signOutSocial();
    signOut();
  };

  const handleDelete = async () => {
    const result = await withdraw.run();
    if (!result.ok) return;
    await signOutSocial();
    signOut();
  };

  return (
    <View className="flex-1 justify-between px-6 pb-4">
      <View className="gap-6 pt-2">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-gray-900">{me.nickname}</Text>
          <Text className="text-gray-500">{PROVIDER_LABEL[me.provider]}</Text>
        </View>

        {me.journey && (
          <View className="gap-1 rounded-2xl bg-gray-100 p-4">
            <Text className="text-gray-500">{me.journey.currentRound}회차 진행 중</Text>
            <Text className="text-gray-900">
              {me.journey.startedOn}부터 · {me.journey.reviewAt} 1년 회고
            </Text>
          </View>
        )}

      </View>

      <View className="gap-3">
        <Button label="로그아웃" variant="secondary" onPress={handleLogout} />

        {confirmingDelete ? (
          <View className="gap-3 rounded-2xl border border-red-200 p-4">
            <Text className="text-center font-semibold text-gray-900">정말 탈퇴할까요?</Text>
            <Text className="text-center text-sm text-gray-500">
              돌탑, 엽서, 친구, 응원이 모두 바로 삭제되고 되돌릴 수 없어요.
            </Text>
            <ErrorText error={withdraw.error} />
            <Button label="탈퇴할게요" onPress={handleDelete} loading={withdraw.submitting} />
            <Button label="취소" variant="secondary" onPress={() => setConfirmingDelete(false)} />
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingDelete(true)} className="items-center py-2">
            <Text className="text-sm text-gray-400 underline">회원 탈퇴</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
