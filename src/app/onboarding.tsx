import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { completeOnboarding } from '@/features/auth/api';
import { getMe } from '@/features/user/api';
import { useAuthStore } from '@/features/auth/store';
import { LEGAL_VERSION, PRIVACY_SUMMARY } from '@/features/legal/content';
import { LegalTable } from '@/features/legal/components/LegalBody';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

// 약관·처리방침 내용이 바뀌면 features/legal/content.ts의 LEGAL_VERSION을 올립니다 (서버에 동의 버전으로 저장)
const AGREEMENT_VERSION = LEGAL_VERSION;

// AUTH-02 온보딩: 만 14세 확인(필수)·약관(필수)·개인정보(필수) + 닉네임. 위치는 방문 인증을 누를 때 기기 권한으로 묻습니다.
export default function OnboardingScreen() {
  const markOnboarded = useAuthStore((s) => s.completeOnboarding);
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [nickname, setNickname] = useState('');
  const { run, submitting, error } = useSubmit(completeOnboarding);

  // 이메일로 가입했다면 가입할 때 적은 닉네임을 미리 채워 둡니다. (못 불러와도 직접 입력하면 됨)
  useEffect(() => {
    getMe()
      .then((me) => setNickname((current) => current || me.nickname || ''))
      .catch(() => undefined);
  }, []);

  const allRequired = age && terms && privacy;
  const canSubmit = allRequired && nickname.trim().length > 0;

  const toggleAll = () => {
    const next = !allRequired;
    setAge(next);
    setTerms(next);
    setPrivacy(next);
  };

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
          <Check label="전체 동의" checked={allRequired} onPress={toggleAll} bold />
          <View className="h-px bg-gray-100" />
          <Check label="[필수] 만 14세 이상입니다" checked={age} onPress={() => setAge(!age)} />
          {!age && (terms || privacy) && (
            <Text className="-mt-1 ml-9 text-[13px] text-red-500">한 가지만은 만 14세 이상만 가입할 수 있어요.</Text>
          )}
          <Check
            label="[필수] 이용약관 동의"
            checked={terms}
            onPress={() => setTerms(!terms)}
            onView={() => router.push('/legal/terms')}
          />
          <Check
            label="[필수] 개인정보 수집·이용 동의"
            checked={privacy}
            onPress={() => setPrivacy(!privacy)}
            onView={() => router.push('/legal/privacy')}
          />
          <Pressable onPress={() => setShowSummary(!showSummary)} hitSlop={6} accessibilityRole="button" className="ml-9">
            <Text className="text-[13px] text-gray-500 underline">
              {showSummary ? '수집·이용 안내 접기' : '수집·이용 안내 펼치기'}
            </Text>
          </Pressable>
          {showSummary && <PrivacySummary />}
        </View>

        <TextField label="닉네임" value={nickname} onChangeText={setNickname} placeholder="닉네임" maxLength={30} />
      </View>
    </Screen>
  );
}

function PrivacySummary() {
  return (
    <View className="gap-2">
      <Text className="text-[14px] font-semibold text-gray-900">개인정보 수집·이용 안내 (요약)</Text>
      <LegalTable rows={PRIVACY_SUMMARY.table} />
      {PRIVACY_SUMMARY.notes.map((note) => (
        <Text key={note.label} className="text-[13px] leading-[20px] text-gray-700">
          <Text className="font-semibold text-gray-900">{note.label}: </Text>
          {note.text}
        </Text>
      ))}
    </View>
  );
}

function Check({
  label,
  checked,
  onPress,
  onView,
  bold = false,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  onView?: () => void;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={onPress}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        className="flex-1 flex-row items-center gap-3 py-1">
        <View
          className={`h-6 w-6 items-center justify-center rounded-md ${checked ? 'bg-gray-900' : 'border border-gray-300'}`}>
          {checked && <Text className="text-xs font-bold text-white">✓</Text>}
        </View>
        <Text className={`flex-1 text-gray-900 ${bold ? 'font-bold' : ''}`}>{label}</Text>
      </Pressable>
      {onView && (
        <Pressable onPress={onView} hitSlop={8} accessibilityRole="link" accessibilityLabel={`${label} 보기`}>
          <Text className="pl-3 text-[13px] text-gray-500 underline">보기</Text>
        </Pressable>
      )}
    </View>
  );
}
