import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getSpots } from '@/features/spot/api';
import type { Spot } from '@/features/spot/types';
import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

const fetchSpots = () => getSpots();

// SPOT-01 명소 선택 (2/3)
// 🟡 명소 카테고리 기준 미정 → 카테고리 선택 없이 전체 명소에서 고릅니다
export default function SpotSelectScreen() {
  const state = useApi(fetchSpots);
  const draft = useWishDraftStore();
  const [selected, setSelected] = useState<Spot | null>(null);

  const handleNext = () => {
    if (!selected) return;
    draft.setSpot(selected.id, selected.name);
    router.push('/wish/confirm');
  };

  return (
    <Screen
      title="명소 고르기"
      showBack
      scroll={false}
      footer={<Button label="다음" onPress={handleNext} disabled={!selected} />}>
      <AsyncContent
        state={state}
        isEmpty={(spots) => spots.length === 0}
        empty={<EmptyState title="고를 수 있는 명소가 없어요" />}>
        {(spots) => (
          <View className="gap-3 px-6">
            <Text className="text-gray-500">2 / 3 · 소원을 들고 찾아갈 경북 명소를 골라 주세요</Text>
            {spots.map((spot) => {
              const active = selected?.id === spot.id;
              return (
                <Pressable
                  key={spot.id}
                  onPress={() => setSelected(spot)}
                  className={`gap-1 rounded-2xl p-4 ${active ? 'border-2 border-gray-900 bg-white' : 'border-2 border-transparent bg-gray-100'}`}>
                  <Text className="text-xs text-gray-500">{spot.region}</Text>
                  <Text className="text-lg font-bold text-gray-900">{spot.name}</Text>
                  <Text className="text-gray-600">{spot.description}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}
