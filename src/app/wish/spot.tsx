import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getSpots } from '@/features/spot/api';
import { SpotExplorer } from '@/features/spot/components/SpotExplorer';
import type { Spot } from '@/features/spot/types';
import { useWishDraftStore } from '@/features/wish/draftStore';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

const fetchSpots = () => getSpots();

// SPOT-01 명소 선택 (2/3): 지도에서 둘러보고 "이 명소로 정하기". 뒤로는 확대 중이면 전체 지도로, 아니면 소원 적기로.
// 🟡 명소 카테고리 기준 미정 → 전체 명소에서 고릅니다
export default function SpotSelectScreen() {
  const state = useApi(fetchSpots);
  const draft = useWishDraftStore();
  const [selected, setSelected] = useState<Spot | null>(null);

  const recommended = draft.suggestion?.spot ?? null;

  const handleChoose = (spot: Spot) => {
    draft.setSpot(spot.id, spot.name);
    router.push('/wish/confirm');
  };

  return (
    <Screen
      title="명소 고르기"
      showBack
      onBack={selected ? () => setSelected(null) : undefined}
      scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(spots) => spots.length === 0}
        empty={<EmptyState title="고를 수 있는 명소가 없어요" />}>
        {(spots) => (
          <View className="flex-1">
            <Text className="px-6 pb-3 text-gray-500">2 / 3 · 소원을 들고 찾아갈 경북 명소를 골라 주세요</Text>
            {/* WISH-02 AI 추천 명소: 누르면 지도가 그 명소로 확대되고, 정하는 건 "이 명소로 정하기"로 합니다. */}
            {recommended && !selected && (
              <Pressable
                onPress={() => setSelected(spots.find((spot) => spot.id === recommended.spotId) ?? null)}
                accessibilityRole="button"
                className="mx-6 mb-3 flex-row items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3">
                <Ionicons name="sparkles" size={18} color="#6d4fc2" />
                <View className="flex-1 gap-0.5">
                  <Text className="font-semibold text-gray-900">AI 추천 · {recommended.spotName}</Text>
                  <Text className="text-sm text-gray-600">{recommended.reason}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#6d4fc2" />
              </Pressable>
            )}
            <SpotExplorer
              spots={spots}
              selected={selected}
              onSelect={setSelected}
              renderAction={(spot) => <Button label="이 명소로 정하기" onPress={() => handleChoose(spot)} />}
            />
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}
