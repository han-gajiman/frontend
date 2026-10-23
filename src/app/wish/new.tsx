import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';

// WISH-01 소원 + 실천 목표 작성 (1/3)
export default function NewWishScreen() {
  const draft = useWishDraftStore();
  const [content, setContent] = useState(draft.content);
  const [actionGoal, setActionGoal] = useState(draft.actionGoal);

  const canNext = content.trim().length > 0 && actionGoal.trim().length > 0;

  const handleNext = () => {
    draft.setWish(content.trim(), actionGoal.trim());
    router.push('/wish/spot');
  };

  return (
    <Screen title="소원 적기" showBack footer={<Button label="다음" onPress={handleNext} disabled={!canNext} />}>
      <View className="gap-8">
        <Text className="text-gray-500">1 / 3</Text>
        <TextField
          label="이루고 싶은 소원 하나"
          value={content}
          onChangeText={setContent}
          placeholder="예: 백엔드 개발자로 취업하기"
          maxLength={100}
        />
        <TextField
          label="매일 할 실천 목표"
          value={actionGoal}
          onChangeText={setActionGoal}
          placeholder="예: 매일 영어 단어 20개 외우기"
          maxLength={100}
        />
        {/* TODO(WISH-02, P1): AI 실천 목표 추천 3개 */}
      </View>
    </Screen>
  );
}
