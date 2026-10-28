import { router } from 'expo-router';
import { useState } from 'react';
import { Share, Text, View } from 'react-native';

import { acceptInvite, createInvite } from '@/features/friend/api';
import type { Invite } from '@/features/friend/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

// FRIEND-01 초대 링크 만들기·공유 + 초대 코드로 친구 추가
// 🟡 초대 링크 도메인이 정해지기 전까지는 코드 입력으로도 수락할 수 있게 둡니다.
export default function InviteScreen() {
  const create = useSubmit(createInvite);
  const accept = useSubmit(acceptInvite);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [code, setCode] = useState('');
  const [accepted, setAccepted] = useState<string | null>(null);

  const handleCreate = async () => {
    const result = await create.run();
    if (result.ok) setInvite(result.data);
  };

  const handleShare = async () => {
    if (!invite) return;
    try {
      await Share.share({ message: `한 가지만에서 같이 돌탑을 쌓아요! ${invite.inviteUrl}` });
    } catch {
      // 공유를 지원하지 않는 환경(일부 웹 브라우저)에서는 화면의 링크를 직접 복사합니다.
    }
  };

  const handleAccept = async () => {
    const result = await accept.run(code.trim());
    if (result.ok) {
      setAccepted(result.data.nickname);
      setCode('');
    }
  };

  return (
    <Screen title="친구 초대" showBack>
      <View className="gap-10">
        <View className="gap-3">
          <Text className="text-lg font-bold text-gray-900">초대 링크 보내기</Text>
          <Text className="text-gray-500">링크는 7일 동안 여러 친구가 쓸 수 있어요.</Text>
          {invite ? (
            <View className="gap-3 rounded-2xl bg-gray-100 p-4">
              <Text selectable className="text-gray-900">
                {invite.inviteUrl}
              </Text>
              <Text className="text-sm text-gray-500">
                초대 코드 {invite.inviteCode} · {invite.expiresAt.slice(0, 10)}까지
              </Text>
              <Button label="공유하기" onPress={handleShare} />
            </View>
          ) : (
            <Button label="초대 링크 만들기" onPress={handleCreate} loading={create.submitting} />
          )}
          <ErrorText error={create.error} />
        </View>

        <View className="gap-3">
          <Text className="text-lg font-bold text-gray-900">초대 코드로 친구 추가</Text>
          <TextField label="초대 코드" value={code} onChangeText={setCode} placeholder="8자리 코드" maxLength={20} />
          <ErrorText error={accept.error} />
          {accepted && (
            <Text className="text-center font-semibold text-gray-900">{accepted}님과 친구가 됐어요!</Text>
          )}
          <Button
            label="친구 추가"
            variant="secondary"
            onPress={handleAccept}
            disabled={code.trim().length === 0}
            loading={accept.submitting}
          />
          {accepted && <Button label="친구 목록 보기" onPress={() => router.back()} />}
        </View>
      </View>
    </Screen>
  );
}
