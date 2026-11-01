import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { createWish } from '@/features/wish/api';
import { VisibilityPicker } from '@/features/wish/components/VisibilityPicker';
import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { useSubmit } from '@/shared/hooks/useSubmit';

// WISH-03 다짐 확인 & 등록 (3/3). 등록 후에는 수정·취소할 수 없습니다.
export default function ConfirmWishScreen() {
  const draft = useWishDraftStore();
  const [pledged, setPledged] = useState(false);
  const [done, setDone] = useState(false);
  const { run, submitting, error } = useSubmit(createWish);

  // 앞 단계를 거치지 않고 들어온 경우 (예: 웹 새로고침). 등록 직후 draft를 비울 때는 제외
  if (!done && (!draft.content || draft.spotId === null)) return <Redirect href="/wish/new" />;

  const handleSubmit = async () => {
    const result = await run({
      content: draft.content,
      actionGoal: draft.actionGoal,
      spotId: draft.spotId!,
      visibility: draft.visibility,
    });
    if (!result.ok) return;

    setDone(true);
    draft.reset();
    // 등록 흐름 화면을 모두 닫고 홈(= 돌탑)으로 돌아갑니다.
    router.dismissTo('/');
  };

  return (
    <Screen
      title="다짐 확인"
      showBack
      footer={
        <>
          <ErrorText error={error} />
          <Button label="돌탑 시작하기" onPress={handleSubmit} disabled={!pledged} loading={submitting} />
        </>
      }>
      <View className="gap-6">
        <Text className="text-gray-500">3 / 3</Text>

        <View className="gap-4 rounded-2xl bg-gray-100 p-5">
          <Row label="소원" value={draft.content} />
          <Row label="매일 할 일" value={draft.actionGoal} />
          <Row label="명소" value={draft.spotName ?? ''} />
          <Row label="기간" value="오늘부터 30일" />
        </View>

        <View className="gap-2">
          <Text className="font-semibold text-gray-900">공개 범위</Text>
          <VisibilityPicker value={draft.visibility} onChange={draft.setVisibility} />
          <Text className="text-sm text-gray-400">공개 범위는 나중에 홈에서 바꿀 수 있어요.</Text>
        </View>

        <Text className="text-center text-gray-500">등록한 소원은 30일 동안 바꾸거나 취소할 수 없어요.</Text>

        <Pressable onPress={() => setPledged(!pledged)} className="flex-row items-center justify-center gap-3 py-2">
          <View
            className={`h-6 w-6 items-center justify-center rounded-md ${pledged ? 'bg-gray-900' : 'border border-gray-300'}`}>
            {pledged && <Text className="text-xs font-bold text-white">✓</Text>}
          </View>
          <Text className="font-semibold text-gray-900">30일 동안 매일 돌 하나씩 쌓을게요</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base font-semibold text-gray-900">{value}</Text>
    </View>
  );
}
