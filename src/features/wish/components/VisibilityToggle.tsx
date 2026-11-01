import { Pressable, Text, View } from 'react-native';

import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { changeVisibility } from '../api';
import type { CurrentWish } from '../types';

// WISH-04 공개 범위 변경: 한 번 누르면 친구 공개 ↔ 나만 보기
export function VisibilityToggle({
  wish,
  onChanged,
  light = false,
}: {
  wish: CurrentWish;
  onChanged: () => void;
  light?: boolean; // 어두운 배경(저녁 하늘) 위에서는 밝은 글자
}) {
  const { run, submitting, error } = useSubmit(changeVisibility);
  const isFriends = wish.visibility === 'FRIENDS';

  const toggle = async () => {
    const result = await run(wish.wishId, isFriends ? 'PRIVATE' : 'FRIENDS');
    if (result.ok) onChanged();
  };

  return (
    <View className="gap-1">
      <Pressable onPress={toggle} disabled={submitting} hitSlop={8}>
        <Text className={`text-sm underline ${light ? 'text-white/80' : 'text-gray-600'}`}>
          {submitting ? '바꾸는 중…' : isFriends ? '친구에게 공개 중' : '나만 보는 중'}
        </Text>
      </Pressable>
      <ErrorText error={error} />
    </View>
  );
}
