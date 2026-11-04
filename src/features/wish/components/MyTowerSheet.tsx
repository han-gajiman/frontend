import { Text, View } from 'react-native';

import { CheerList } from '@/features/friend/components/CheerList';
import { BottomSheet } from '@/shared/components/BottomSheet';
import { ErrorText } from '@/shared/components/ErrorText';
import { useSubmit } from '@/shared/hooks/useSubmit';

import { changeVisibility } from '../api';
import type { CurrentWish, Visibility } from '../types';
import { VisibilityPicker } from './VisibilityPicker';

type MyTowerSheetProps = {
  wish: CurrentWish;
  visible: boolean;
  onClose: () => void;
  onChanged: () => void; // 공개 범위가 바뀌면 홈을 다시 불러옵니다.
};

// "내 돌탑" 시트: 소원·실천 목표(읽기 전용, 등록 후 수정·취소 불가), WISH-04 공개 범위, FRIEND-03 받은 응원
export function MyTowerSheet({ wish, visible, onClose, onChanged }: MyTowerSheetProps) {
  const { run, submitting, error } = useSubmit(changeVisibility);

  const handleVisibility = async (visibility: Visibility) => {
    if (visibility === wish.visibility) return;
    const result = await run(wish.wishId, visibility);
    if (result.ok) onChanged();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="내 돌탑">
      <View className="gap-3">
        <Info label="소원" value={wish.content} />
        <Info label="매일 할 일" value={wish.actionGoal} />
      </View>

      <View className="gap-2">
        <Text className="font-semibold text-gray-900">공개 범위</Text>
        <VisibilityPicker value={wish.visibility} onChange={handleVisibility} disabled={submitting} />
        <ErrorText error={error} />
      </View>

      <View className="gap-2">
        <Text className="font-semibold text-gray-900">받은 응원</Text>
        <CheerList wishId={wish.wishId} />
      </View>
    </BottomSheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-base text-gray-900">{value}</Text>
    </View>
  );
}
