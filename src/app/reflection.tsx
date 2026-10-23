import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getCurrentWish, submitReflection } from '@/features/wish/api';
import type { CurrentWish, WishResult } from '@/features/wish/types';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { TextField } from '@/shared/components/TextField';
import { useApi } from '@/shared/hooks/useApi';
import { useSubmit } from '@/shared/hooks/useSubmit';

// TOWER-02 완성 회고: "이 소원, 이루었나요?" + 한 줄 회고 → 새 소원 또는 나중에
// 🟡 돌 30개 완성 / 일부만 쌓은 경우 연출 구분은 미정
export default function ReflectionScreen() {
  const state = useApi(getCurrentWish);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Screen scroll={false}>
        <EmptyState
          title="돌탑을 모아보기에 담았어요"
          description="새 소원으로 다시 시작해 볼까요?"
          actionLabel="새 소원 시작하기"
          onAction={() => {
            router.dismissAll();
            router.push('/wish/new');
          }}
        />
        <View className="px-6 pb-4">
          <Button label="나중에 할게요" variant="secondary" onPress={() => router.dismissAll()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="완성 회고" showBack scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(wish) => wish === null || wish.status !== 'COMPLETED'}
        empty={
          <EmptyState title="회고할 돌탑이 없어요" actionLabel="홈으로" onAction={() => router.dismissAll()} />
        }>
        {(wish) => <ReflectionForm wish={wish!} onSubmitted={() => setSubmitted(true)} />}
      </AsyncContent>
    </Screen>
  );
}

function ReflectionForm({ wish, onSubmitted }: { wish: CurrentWish; onSubmitted: () => void }) {
  const [result, setResult] = useState<WishResult | null>(null);
  const [reflection, setReflection] = useState('');
  const { run, submitting, error } = useSubmit(submitReflection);

  const handleSubmit = async () => {
    if (!result) return;
    const res = await run(wish.wishId, { result, reflection: reflection.trim() });
    if (res.ok) onSubmitted();
  };

  return (
    <View className="flex-1 justify-between px-6 pb-4">
      <View className="gap-6 pt-4">
        <View className="gap-1">
          <Text className="text-gray-500">30일 동안 돌 {wish.stoneCount}개를 쌓았어요</Text>
          <Text className="text-2xl font-bold text-gray-900">{wish.content}</Text>
        </View>

        <Text className="text-lg font-semibold text-gray-900">이 소원, 이루었나요?</Text>
        <View className="flex-row gap-3">
          <Choice label="이루었어요" active={result === 'ACHIEVED'} onPress={() => setResult('ACHIEVED')} />
          <Choice label="아직이에요" active={result === 'NOT_ACHIEVED'} onPress={() => setResult('NOT_ACHIEVED')} />
        </View>

        <TextField
          label="한 줄 회고"
          value={reflection}
          onChangeText={setReflection}
          placeholder="30일을 돌아보며 한 줄 남겨 주세요"
          maxLength={200}
          multiline
        />
      </View>

      <View className="gap-2">
        <ErrorText error={error} />
        <Button label="회고 남기기" onPress={handleSubmit} disabled={!result} loading={submitting} />
      </View>
    </View>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-14 flex-1 items-center justify-center rounded-2xl ${active ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Text className={`font-semibold ${active ? 'text-white' : 'text-gray-900'}`}>{label}</Text>
    </Pressable>
  );
}
