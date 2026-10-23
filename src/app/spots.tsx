import { useState } from 'react';
import { Text, View } from 'react-native';

import { getSpots } from '@/features/spot/api';
import { SpotMap } from '@/features/spot/components/SpotMap';
import type { Spot } from '@/features/spot/types';
import { Button } from '@/shared/components/Button';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

const fetchSpots = () => getSpots();

// SPOT-02 명소 지도: 명소를 지도에 표시하고, 누르면 정보 카드
export default function SpotsScreen() {
  const state = useApi(fetchSpots);
  const [selected, setSelected] = useState<Spot | null>(null);

  return (
    <Screen title="경북 명소" showBack scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(spots) => spots.length === 0}
        empty={<EmptyState title="아직 등록된 명소가 없어요" />}>
        {(spots) => (
          <View className="flex-1">
            <SpotMap spots={spots} selectedId={selected?.id ?? null} onSelect={setSelected} />

            <View className="gap-3 px-6 pb-4 pt-4">
              {selected ? (
                <>
                  <View className="gap-1">
                    <Text className="text-xs text-gray-500">{selected.region}</Text>
                    <Text className="text-lg font-bold text-gray-900">{selected.name}</Text>
                    <Text className="text-gray-600">{selected.description}</Text>
                  </View>
                  {/* TODO(SPOT-03, P1): 방문 인증 → 위치 동의 확인 → 반경 500m 체크 → 배경 해금 + 엽서 */}
                  <Button label="방문 인증 (준비 중)" onPress={() => undefined} disabled />
                </>
              ) : (
                <Text className="py-4 text-center text-gray-500">명소를 눌러 보세요</Text>
              )}
            </View>
          </View>
        )}
      </AsyncContent>
    </Screen>
  );
}
