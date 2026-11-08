import { useState } from 'react';
import { Text, View } from 'react-native';

import { getSpots } from '@/features/spot/api';
import { SpotExplorer } from '@/features/spot/components/SpotExplorer';
import { VisitScreen } from '@/features/spot/components/VisitScreen';
import { NewPostcardDialog } from '@/features/postcard/components/NewPostcardDialog';
import type { Postcard } from '@/features/postcard/types';
import type { Spot } from '@/features/spot/types';
import { useVisitVerification } from '@/features/spot/useVisitVerification';
import { Button } from '@/shared/components/Button';
import { ErrorText } from '@/shared/components/ErrorText';
import { Screen } from '@/shared/components/Screen';
import { AsyncContent, EmptyState } from '@/shared/components/ScreenState';
import { useApi } from '@/shared/hooks/useApi';

const fetchSpots = () => getSpots();

// SPOT-02 명소 탭: 지도에서 명소를 눌러 둘러봅니다. 방문한 곳은 별표. 확대 중에만 뒤로 버튼이 있습니다.
export default function SpotsScreen() {
  const state = useApi(fetchSpots);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [visiting, setVisiting] = useState<Spot | null>(null); // 방문 인증 화면을 연 명소

  return (
    <Screen title="경북 명소" showBack={!!selected} onBack={() => setSelected(null)} scroll={false}>
      <AsyncContent
        state={state}
        isEmpty={(spots) => spots.length === 0}
        empty={<EmptyState title="아직 등록된 명소가 없어요" />}>
        {(spots) => (
          <SpotExplorer
            spots={spots}
            selected={selected}
            onSelect={setSelected}
            renderAction={(spot) => (
              <SpotActions
                key={spot.id}
                spot={spot}
                onOpen={() => setVisiting(spot)}
                onVisitedAgain={() => {
                  setSelected({ ...spot, visitedThisTower: true });
                  state.reload();
                }}
              />
            )}
          />
        )}
      </AsyncContent>
      {visiting && (
        <VisitScreen
          spot={visiting}
          onClose={() => setVisiting(null)}
          onVisited={() => {
            // 바로 일러스트를 보여주고, 지도의 별표도 다시 불러와 맞춥니다.
            const visited = { ...visiting, visited: true, visitedThisTower: true };
            setVisiting(visited);
            setSelected(visited);
            state.reload();
          }}
        />
      )}
    </Screen>
  );
}

// 방문한 명소: 일러스트 보기 옆에, 지금 돌탑에서 아직 인증하지 않았으면 "다시 인증하기". 다시 인증하면 새 엽서
function SpotActions({ spot, onOpen, onVisitedAgain }: { spot: Spot; onOpen: () => void; onVisitedAgain: () => void }) {
  const [gift, setGift] = useState<Postcard | null>(null);
  const { verify, busy, notice, error } = useVisitVerification(spot, (visit) => {
    setGift(visit.postcard);
    onVisitedAgain();
  });
  const dialog = gift && <NewPostcardDialog postcard={gift} onClose={() => setGift(null)} />;

  if (!spot.visited) return <Button label="방문 인증" onPress={onOpen} />;
  if (spot.visitedThisTower !== false) {
    return (
      <>
        <Button label="방문 완료 · 일러스트 보기" onPress={onOpen} />
        {dialog}
      </>
    );
  }

  return (
    <View className="gap-2">
      {notice && <Text className="text-center text-sm text-gray-600">{notice}</Text>}
      <ErrorText error={error} />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Button label="방문 완료 · 일러스트" onPress={onOpen} variant="secondary" />
        </View>
        <View className="flex-1">
          <Button label="다시 인증하기" onPress={verify} loading={busy} />
        </View>
      </View>
      {dialog}
    </View>
  );
}
