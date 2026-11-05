import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheerBalloons } from '@/features/friend/components/CheerBalloons';
import { FriendTowersPeek } from '@/features/friend/components/FriendTowersPeek';
import { StoneTower } from '@/features/stone/components/StoneTower';
import { TowerBackground } from '@/features/stone/components/TowerBackground';
import { MyTowerSheet } from '@/features/wish/components/MyTowerSheet';
import type { CurrentWish } from '@/features/wish/types';

import { useGroundHeight } from '../useGroundHeight';
import { useTowerDropZone } from '../useTowerDropZone';
import { HomeHeader } from './HomeHeader';
import { TowerActions } from './TowerActions';
import { TowerProgress } from './TowerProgress';

const TOWER_GROUND = 28; // 땅을 낮춰 응원 풍선이 떠오를 하늘을 넓힙니다.
const TOWER_MAX_SCALE = 1; // 돌탑이 너무 넓어지지 않게 해서 양옆에 풍선 자리를 남깁니다.
const TOWER_WIDTH = 124; // 맨 아래 돌 폭 (풍선이 피하는 폭)

// HOME-01 홈 = 돌탑 화면 (STONE-01 오늘의 돌, STONE-02 돌탑, DEMO-01 시간 이동). 조각을 조합하고 데이터만 내려줍니다.
// 오늘 쌓았는지·30일이 지났는지·저녁 하늘은 모두 서버 응답(stonedToday, status) 기준입니다. 클라이언트 시계 사용 금지.
export function TowerHome({ wish, reload }: { wish: CurrentWish; reload: () => void }) {
  const completed = wish.status === 'COMPLETED';
  const evening = wish.stonedToday && !completed;

  const [sheetOpen, setSheetOpen] = useState(false); // 내 돌탑 시트: 돌탑, 공개 아이콘을 누르면 열림
  const openSheet = () => setSheetOpen(true);

  const { groundHeight, onScreenLayout, onTowerLayout } = useGroundHeight(TOWER_GROUND);
  const { towerRef, measureTower, isOverTower } = useTowerDropZone();

  return (
    <View className="flex-1" onLayout={onScreenLayout}>
      <TowerBackground
        spotId={wish.spot.id}
        visited={wish.spot.visited}
        evening={evening}
        groundHeight={groundHeight}
        bottomScrim
        softened
      />

      {/* 아래쪽은 떠 있는 탭 바가 안전 영역까지 차지하므로 위쪽만 */}
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <HomeHeader visibility={{ isFriends: wish.visibility === 'FRIENDS', onPress: openSheet }}>
            <TowerProgress wish={wish} />
          </HomeHeader>

          <View
            ref={towerRef}
            className="flex-1"
            onLayout={(e) => {
              onTowerLayout(e);
              measureTower();
            }}>
            <StoneTower
              count={wish.stoneCount}
              stonedToday={wish.stonedToday}
              completed={completed}
              inscription={wish.content}
              onPress={openSheet}
              groundHeight={TOWER_GROUND}
              maxScale={TOWER_MAX_SCALE}
            />
            <FriendTowersPeek bottom={TOWER_GROUND - 14} />
            <CheerBalloons wishId={wish.wishId} bottom={TOWER_GROUND} towerWidth={TOWER_WIDTH} />
          </View>

          <TowerActions wish={wish} reload={reload} isOverTower={isOverTower} onDragStart={measureTower} />
        </KeyboardAvoidingView>
      </SafeAreaView>

      <MyTowerSheet wish={wish} visible={sheetOpen} onClose={() => setSheetOpen(false)} onChanged={reload} />
    </View>
  );
}
