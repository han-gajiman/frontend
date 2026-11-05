import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { completeOnboarding } from '@/features/auth/api';
import { getMe } from '@/features/user/api';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

const AGREEMENT_VERSION = '1.0';

// AUTH-02 온보딩: 약관(필수)·개인정보(필수) 동의 + 닉네임. 위치는 방문 인증을 누를 때 기기 권한으로 묻습니다.
export default function OnboardingScreen() {
  const markOnboarded = useAuthStore((s) => s.completeOnboarding);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [nickname, setNickname] = useState('');
  const { run, submitting, error } = useSubmit(completeOnboarding);

  // 이메일로 가입했다면 가입할 때 적은 닉네임을 미리 채워 둡니다. (못 불러와도 직접 입력하면 됨)
  useEffect(() => {
    getMe()
      .then((me) => setNickname((current) => current || me.nickname || ''))
      .catch(() => undefined);
  }, []);

  const allRequired = terms && privacy;
  const canSubmit = allRequired && nickname.trim().length > 0;

  const handleSubmit = async () => {
    const result = await run({
      nickname: nickname.trim(),
      agreements: { terms, privacy },
      agreementVersion: AGREEMENT_VERSION,
    });
    if (result.ok) markOnboarded();
  };

  return (
    <Screen
      title="시작하기 전에"
      footer={
        <>
          <ErrorText error={error} />
          <Button label="시작하기" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
        </>
      }>
      <View className="gap-8">
        <View className="gap-3">
          <Text className="font-semibold text-gray-900">약관 동의</Text>
          {/* TODO(AUTH-02): 약관 전문 보기 링크 */}
          <Check label="[필수] 이용약관 동의" checked={terms} onPress={() => setTerms(!terms)} />
          <Check label="[필수] 개인정보 수집·이용 동의" checked={privacy} onPress={() => setPrivacy(!privacy)} />
        </View>

        <TextField label="닉네임" value={nickname} onChangeText={setNickname} placeholder="닉네임" maxLength={30} />
      </View>
    </Screen>
  );
}

function Check({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 py-1">
      <View
        className={`h-6 w-6 items-center justify-center rounded-md ${checked ? 'bg-gray-900' : 'border border-gray-300'}`}>
        {checked && <Text className="text-xs font-bold text-white">✓</Text>}
      </View>
      <Text className="text-gray-900">{label}</Text>
    </Pressable>
  );
}
