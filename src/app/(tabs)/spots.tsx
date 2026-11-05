import { useState } from 'react';

import { getSpots } from '@/features/spot/api';
import { SpotExplorer } from '@/features/spot/components/SpotExplorer';
import { VisitScreen } from '@/features/spot/components/VisitScreen';
import type { Spot } from '@/features/spot/types';
import { Button } from '@/shared/components/Button';
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
              <Button label={spot.visited ? '방문 완료 · 일러스트 보기' : '방문 인증'} onPress={() => setVisiting(spot)} />
            )}
          />
        )}
      </AsyncContent>
      {visiting && <VisitScreen spot={visiting} onClose={() => setVisiting(null)} />}
    </Screen>
  );
}
