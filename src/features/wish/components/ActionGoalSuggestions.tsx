import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import type { ApiError } from '@/api/client';
import { ErrorText } from '@/shared/components/ErrorText';

const ACCENT = '#6d4fc2';
export const WISH_SUGGEST_LIMIT = 10;

// WISH-02 "AI에게 추천받기" 버튼. 소원을 적어야 누를 수 있습니다.
export function SuggestButton({
  disabled,
  loading,
  again,
  remaining,
  onPress,
}: {
  disabled: boolean;
  loading: boolean;
  again: boolean; // 이미 추천을 받았으면 "다시 추천받기"
  remaining: number | null; // 오늘 남은 횟수 (아직 모르면 null)
  onPress: () => void;
}) {
  const usedUp = remaining === 0;
  const inactive = disabled || loading || usedUp;
  const count = remaining === null ? `하루 ${WISH_SUGGEST_LIMIT}번` : `남은 ${remaining}/${WISH_SUGGEST_LIMIT}`;
  const label = loading
    ? '추천을 고르는 중…'
    : usedUp
      ? '오늘 추천을 다 썼어요'
      : `${again ? '다시 추천받기' : 'AI에게 추천받기'} (${count})`;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-xl bg-violet-50 ${inactive && !loading ? 'opacity-40' : ''}`}>
      {loading ? <ActivityIndicator size="small" color={ACCENT} /> : <Ionicons name="sparkles" size={16} color={ACCENT} />}
      <Text className="font-semibold" style={{ color: ACCENT }}>
        {label}
      </Text>
    </Pressable>
  );
}

// 추천받은 실천 목표 후보. 누르면 입력칸에 채워지고, 그대로 고칠 수 있습니다.
export function ActionGoalSuggestions({
  goals,
  selected,
  onSelect,
}: {
  goals: string[];
  selected: string;
  onSelect: (goal: string) => void;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm text-gray-500">눌러서 고르고, 원하는 대로 고쳐 보세요.</Text>
      {goals.map((goal) => {
        const active = goal === selected.trim();
        return (
          <Pressable
            key={goal}
            onPress={() => onSelect(goal)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`flex-row items-center gap-2 rounded-xl border px-4 py-3 ${active ? 'border-violet-500 bg-violet-50' : 'border-gray-200 bg-white'}`}>
            <Text className="flex-1 text-gray-900">{goal}</Text>
            {active && <Ionicons name="checkmark" size={18} color={ACCENT} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// 추천 실패: 직접 적어도 등록에는 문제가 없다고 알려 줍니다.
export function SuggestError({ error }: { error: ApiError }) {
  return (
    <View className="gap-1">
      <ErrorText error={error} />
      <Text className="text-center text-sm text-gray-500">실천 목표는 직접 적어도 괜찮아요.</Text>
    </View>
  );
}
