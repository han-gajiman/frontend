import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EXAMPLE_WISH, suggestForWish } from '@/features/wish/api';
import { ActionGoalSuggestions, SuggestButton, SuggestError } from '@/features/wish/components/ActionGoalSuggestions';
import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { TextField } from '@/shared/components/TextField';
import { useSubmit } from '@/shared/hooks/useSubmit';

// WISH-01 소원 + 실천 목표 작성 (1/3), WISH-02 AI 추천은 누를 때만 부르고 직접 적어도 됩니다.
export default function NewWishScreen() {
  const draft = useWishDraftStore();
  const [content, setContent] = useState(draft.content);
  const [actionGoal, setActionGoal] = useState(draft.actionGoal);
  const suggest = useSubmit(suggestForWish);
  const latestContent = useRef(content); // 기다리는 사이 소원을 고쳤으면 도착한 추천을 버립니다.

  const canNext = content.trim().length > 0 && actionGoal.trim().length > 0;
  const goals = draft.suggestion?.actionGoals;

  const handleContentChange = (next: string) => {
    setContent(next);
    latestContent.current = next;
    if (draft.suggestion) draft.setSuggestion(null); // 다른 소원의 추천이 남지 않게
  };

  const handleSuggest = async () => {
    const requested = content.trim();
    const result = await suggest.run(requested);
    if (result.ok && latestContent.current.trim() === requested) draft.setSuggestion(result.data);
  };

  const handleNext = () => {
    draft.setWish(content.trim(), actionGoal.trim());
    router.push('/wish/spot');
  };

  return (
    <Screen title="소원 적기" showBack footer={<Button label="다음" onPress={handleNext} disabled={!canNext} />}>
      <View className="gap-6">
        <Text className="text-gray-500">1 / 3</Text>
        <View className="gap-3">
          <TextField
            label="이루고 싶은 소원 하나"
            value={content}
            onChangeText={handleContentChange}
            placeholder="예: 백엔드 개발자로 취업하기"
            maxLength={100}
          />
          {EXAMPLE_WISH && content.length === 0 && (
            <Pressable onPress={() => handleContentChange(EXAMPLE_WISH ?? '')} hitSlop={8} accessibilityRole="button" className="self-start">
              <Text className="text-sm text-gray-500 underline">예시로 채우기: {EXAMPLE_WISH}</Text>
            </Pressable>
          )}
          <SuggestButton
            disabled={content.trim().length === 0}
            loading={suggest.submitting}
            again={draft.suggestion !== null}
            onPress={handleSuggest}
          />
          {suggest.error && !suggest.submitting && <SuggestError error={suggest.error} />}
        </View>
        {draft.suggestion?.supportMessage && (
          <View className="gap-1 rounded-xl bg-violet-50 p-4">
            <Text className="leading-6 text-gray-800">{draft.suggestion.supportMessage}</Text>
          </View>
        )}
        {goals && goals.length > 0 && (
          <View className="gap-1">
            <ActionGoalSuggestions goals={goals} selected={actionGoal} onSelect={setActionGoal} />
            {draft.suggestion?.fallback && <Text className="text-xs text-gray-400">지금은 AI가 바빠서 기본 추천을 보여드려요.</Text>}
          </View>
        )}
        <TextField
          label="매일 할 실천 목표"
          value={actionGoal}
          onChangeText={setActionGoal}
          placeholder="예: 매일 영어 단어 20개 외우기"
          maxLength={100}
        />
      </View>
    </Screen>
  );
}
